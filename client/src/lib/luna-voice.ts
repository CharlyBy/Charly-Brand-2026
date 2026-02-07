/**
 * Luna Voice Module - DSGVO-konforme Sprachfunktion
 * 
 * Speech-to-Text: Web Speech API (browser-lokal via Chrome/Edge)
 * Text-to-Speech: Server-seitig via Gemini TTS (Sulafat-Stimme) 
 *                 mit OpenAI-Fallback (shimmer)
 * 
 * Datenschutz-Features:
 * - Keine Audioaufnahmen werden gespeichert
 * - STT: Browser-lokal (Chrome sendet an Google – wird im Consent kommuniziert)
 * - TTS: Server-generiert, Audio wird nur abgespielt, nicht gespeichert
 * - Einwilligungsdialog vor erster Mikrofonnutzung
 * - Einwilligungsstatus in localStorage persistiert
 * - Jederzeit widerrufbar
 */

// ============================================
// CONSENT MANAGEMENT
// ============================================

const VOICE_CONSENT_KEY = 'luna-voice-consent';
const VOICE_TTS_ENABLED_KEY = 'luna-tts-enabled';
const VOICE_TTS_VOLUME_KEY = 'luna-tts-volume';

export function hasVoiceConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(VOICE_CONSENT_KEY) === 'granted';
}

export function setVoiceConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VOICE_CONSENT_KEY, granted ? 'granted' : 'denied');
}

export function revokeVoiceConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VOICE_CONSENT_KEY);
  localStorage.removeItem(VOICE_TTS_ENABLED_KEY);
  localStorage.removeItem(VOICE_TTS_VOLUME_KEY);
}

// ============================================
// SPEECH-TO-TEXT (Spracheingabe) – Browser Web Speech API
// ============================================

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function isSpeechRecognitionSupported(): boolean {
  return !!SpeechRecognitionAPI;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult: (transcript: string, isFinal: boolean) => void;
  onEnd: () => void;
  onError: (error: string) => void;
  onStart?: () => void;
}

let activeRecognition: any = null;
let sttRetryCount = 0;
const MAX_STT_RETRIES = 2;

/**
 * Startet die Spracherkennung (browser-lokal via Web Speech API)
 * 
 * DATENSCHUTZ: Bei Chrome werden Audio-Daten an Google gesendet.
 * Dies wird im Einwilligungsdialog transparent kommuniziert.
 * 
 * Netzwerkfehler werden automatisch 2x wiederholt.
 */
export function startSpeechRecognition(options: SpeechRecognitionOptions): (() => void) | null {
  if (!isSpeechRecognitionSupported()) {
    options.onError('Spracherkennung wird in diesem Browser nicht unterstützt. Bitte verwende Chrome, Edge oder Safari.');
    return null;
  }

  if (!hasVoiceConsent()) {
    options.onError('CONSENT_REQUIRED');
    return null;
  }

  // Vorherige Erkennung stoppen
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch (e) {
      // Ignore
    }
  }

  sttRetryCount = 0;

  function createRecognition(): any {
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = options.language || 'de-DE';
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      sttRetryCount = 0; // Reset bei erfolgreichem Start
      options.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        if (result.isFinal) {
          isFinal = true;
        }
      }

      options.onResult(transcript, isFinal);
    };

    recognition.onerror = (event: any) => {
      // Netzwerkfehler: automatisch wiederholen
      if (event.error === 'network' && sttRetryCount < MAX_STT_RETRIES) {
        sttRetryCount++;
        console.warn(`[STT] Netzwerkfehler, Wiederholungsversuch ${sttRetryCount}/${MAX_STT_RETRIES}...`);
        
        // Kurz warten und neu versuchen
        setTimeout(() => {
          try {
            const newRecognition = createRecognition();
            newRecognition.start();
            activeRecognition = newRecognition;
          } catch (retryError) {
            options.onError('Spracherkennung konnte nicht gestartet werden. Bitte pruefe deine Internetverbindung.');
          }
        }, 500);
        return;
      }

      let errorMessage = 'Fehler bei der Spracherkennung.';

      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.';
          break;
        case 'no-speech':
          errorMessage = 'Keine Sprache erkannt. Bitte sprich deutlich.';
          break;
        case 'audio-capture':
          errorMessage = 'Kein Mikrofon gefunden. Bitte überprüfe deine Geräteeinstellungen.';
          break;
        case 'network':
          errorMessage = 'Netzwerkfehler bei der Spracherkennung. Die Spracherkennung benötigt eine Internetverbindung (Chrome/Edge). Bitte pruefe deine Verbindung und versuche es erneut.';
          break;
        case 'aborted':
          // Stille Abbrüche ignorieren
          return;
        case 'service-not-allowed':
          errorMessage = 'Spracherkennung ist in diesem Browser deaktiviert. Bitte aktiviere sie in den Einstellungen.';
          break;
        default:
          errorMessage = `Spracherkennungsfehler: ${event.error}`;
      }

      options.onError(errorMessage);
    };

    recognition.onend = () => {
      activeRecognition = null;
      options.onEnd();
    };

    return recognition;
  }

  try {
    const recognition = createRecognition();
    recognition.start();
    activeRecognition = recognition;
  } catch (error) {
    options.onError('Fehler beim Starten der Spracherkennung. Bitte versuche es erneut.');
    return null;
  }

  // Stop-Funktion zurückgeben
  return () => {
    try {
      if (activeRecognition) {
        activeRecognition.stop();
      }
    } catch (e) {
      // Ignore
    }
  };
}

export function stopSpeechRecognition(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      // Ignore
    }
    activeRecognition = null;
  }
}

// ============================================
// TEXT-TO-SPEECH (Sprachausgabe) – Server-seitig via Gemini/OpenAI
// ============================================

let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
let isSpeakingState = false;
let ttsAvailable: boolean | null = null; // null = noch nicht geprüft

/**
 * Prüft ob der Server TTS unterstützt (API-Key konfiguriert)
 * Ergebnis wird gecached.
 */
export async function checkTTSAvailability(): Promise<boolean> {
  if (ttsAvailable !== null) return ttsAvailable;

  try {
    const response = await fetch('/api/tts/status');
    if (response.ok) {
      const data = await response.json();
      ttsAvailable = data.available === true;
    } else {
      ttsAvailable = false;
    }
  } catch {
    ttsAvailable = false;
  }

  return ttsAvailable;
}

export function isTTSSupported(): boolean {
  // Immer true – wird vom Server bereitgestellt, nicht vom Browser
  return true;
}

export function isTTSSpeaking(): boolean {
  return isSpeakingState;
}

// TTS-Einstellungen aus localStorage
export function getTTSEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(VOICE_TTS_ENABLED_KEY) === 'true';
}

export function setTTSEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VOICE_TTS_ENABLED_KEY, enabled.toString());
  if (!enabled) {
    stopTTS();
  }
}

export function getTTSVolume(): number {
  if (typeof window === 'undefined') return 0.8;
  const vol = parseFloat(localStorage.getItem(VOICE_TTS_VOLUME_KEY) || '0.8');
  return isNaN(vol) ? 0.8 : Math.min(1, Math.max(0, vol));
}

export function setTTSVolume(volume: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VOICE_TTS_VOLUME_KEY, Math.min(1, Math.max(0, volume)).toString());
}

export interface TTSOptions {
  text: string;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * Spricht Text über den Server-TTS-Endpoint vor.
 * 
 * Ablauf:
 * 1. Text wird an /api/tts gesendet
 * 2. Server generiert Audio via Gemini TTS (Sulafat) oder OpenAI (Fallback)
 * 3. Audio wird als Blob empfangen und über <audio> abgespielt
 * 
 * DATENSCHUTZ: Text wird serverseitig verarbeitet, Audio nicht gespeichert.
 * Object-URL wird nach Abspielen sofort revoked.
 */
export async function speakText(options: TTSOptions): Promise<void> {
  // Vorherige Sprachausgabe stoppen
  stopTTS();

  const text = options.text?.trim();
  if (!text) {
    options.onEnd?.();
    return;
  }

  try {
    isSpeakingState = true;
    options.onStart?.();

    // Server-TTS aufrufen
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `TTS-Fehler (${response.status})`);
    }

    // Audio-Blob erstellen
    const contentType = response.headers.get('Content-Type') || 'audio/wav';
    const audioBlob = await response.blob();
    
    if (audioBlob.size === 0) {
      throw new Error('Leere Audio-Antwort vom Server');
    }

    // Object-URL erstellen
    const audioUrl = URL.createObjectURL(audioBlob);
    currentAudioUrl = audioUrl;

    // Audio abspielen
    const audio = new Audio(audioUrl);
    audio.volume = options.volume ?? getTTSVolume();
    currentAudio = audio;

    audio.onended = () => {
      cleanup();
      options.onEnd?.();
    };

    audio.onerror = (e) => {
      cleanup();
      options.onError?.('Fehler beim Abspielen der Sprachausgabe.');
    };

    await audio.play();

  } catch (error: any) {
    isSpeakingState = false;
    currentAudio = null;
    
    // URL aufräumen
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = null;
    }

    const message = error?.message || 'Unbekannter Fehler bei der Sprachausgabe';
    console.error('[TTS Client]', message);
    options.onError?.(message);
  }
}

function cleanup(): void {
  isSpeakingState = false;
  currentAudio = null;
  
  // Object-URL freigeben (DSGVO: keine Audio-Daten im Speicher behalten)
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}

export function stopTTS(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      // Ignore
    }
  }
  cleanup();
}

export function pauseTTS(): void {
  if (currentAudio && isSpeakingState) {
    try {
      currentAudio.pause();
    } catch (e) {
      // Ignore
    }
  }
}

export function resumeTTS(): void {
  if (currentAudio && isSpeakingState) {
    try {
      currentAudio.play();
    } catch (e) {
      // Ignore
    }
  }
}

// ============================================
// VOICE-WAVEFORM-ANIMATION (visuelles Feedback)
// ============================================

export interface WaveformState {
  isActive: boolean;
  bars: number[];
}

/**
 * Generiert animierte Balken für die visuelle Wellenform
 * Simuliert Audio-Aktivität für visuelles Feedback
 */
export function generateWaveformBars(isActive: boolean): number[] {
  if (!isActive) return [0.1, 0.1, 0.1, 0.1, 0.1];
  
  return Array.from({ length: 5 }, () => 
    0.2 + Math.random() * 0.8
  );
}
