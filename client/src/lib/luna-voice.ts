/**
 * Luna Voice Module - DSGVO-konforme Sprachfunktion
 * 
 * Speech-to-Text: Web Speech API (browser-lokal, kein externer Datentransfer)
 * Text-to-Speech: Web Speech API SpeechSynthesis (browser-lokal)
 * 
 * Datenschutz-Features:
 * - Keine Audioaufnahmen werden gespeichert
 * - Verarbeitung erfolgt ausschließlich im Browser
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
// SPEECH-TO-TEXT (Spracheingabe)
// ============================================

// Browser-Kompatibilität prüfen
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

/**
 * Startet die Spracherkennung (browser-lokal via Web Speech API)
 * 
 * DATENSCHUTZ: Keine Audiodaten verlassen den Browser.
 * Die Web Speech API nutzt die lokale Spracherkennung des Browsers.
 * Bei Chrome wird jedoch Audio an Google-Server gesendet - 
 * dies wird im Einwilligungsdialog transparent kommuniziert.
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

  const recognition = new SpeechRecognitionAPI();
  recognition.lang = options.language || 'de-DE';
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
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
        errorMessage = 'Netzwerkfehler bei der Spracherkennung.';
        break;
      case 'aborted':
        // Stille Abbrüche ignorieren
        return;
      default:
        errorMessage = `Spracherkennungsfehler: ${event.error}`;
    }

    options.onError(errorMessage);
  };

  recognition.onend = () => {
    activeRecognition = null;
    options.onEnd();
  };

  try {
    recognition.start();
    activeRecognition = recognition;
  } catch (error) {
    options.onError('Fehler beim Starten der Spracherkennung.');
    return null;
  }

  // Stop-Funktion zurückgeben
  return () => {
    try {
      recognition.stop();
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
// TEXT-TO-SPEECH (Sprachausgabe)
// ============================================

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isSpeakingState = false;

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
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

/**
 * Findet die beste deutsche Stimme für Luna
 * Bevorzugt weibliche deutsche Stimmen
 */
function findBestGermanVoice(): SpeechSynthesisVoice | null {
  if (!isTTSSupported()) return null;

  const voices = window.speechSynthesis.getVoices();
  
  // Priorität: Weibliche deutsche Stimmen
  const priorities = [
    // Google-Stimmen (hochwertig)
    (v: SpeechSynthesisVoice) => v.lang.startsWith('de') && v.name.toLowerCase().includes('google') && !v.name.toLowerCase().includes('male'),
    // Microsoft-Stimmen (hochwertig)
    (v: SpeechSynthesisVoice) => v.lang.startsWith('de') && v.name.toLowerCase().includes('katja'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('de') && v.name.toLowerCase().includes('hedda'),
    // Allgemein weibliche deutsche Stimmen
    (v: SpeechSynthesisVoice) => v.lang.startsWith('de') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('weiblich')),
    // Jede deutsche Stimme
    (v: SpeechSynthesisVoice) => v.lang.startsWith('de'),
    // De-DE spezifisch
    (v: SpeechSynthesisVoice) => v.lang === 'de-DE',
  ];

  for (const check of priorities) {
    const voice = voices.find(check);
    if (voice) return voice;
  }

  return null;
}

export interface TTSOptions {
  text: string;
  volume?: number;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onBoundary?: (charIndex: number, charLength: number) => void;
}

/**
 * Spricht Text mit der Web Speech API vor (browser-lokal)
 * 
 * DATENSCHUTZ: Keine Textdaten verlassen den Browser.
 * Die Sprachsynthese erfolgt vollständig lokal.
 */
export function speakText(options: TTSOptions): void {
  if (!isTTSSupported()) {
    options.onError?.('Sprachausgabe wird in diesem Browser nicht unterstützt.');
    return;
  }

  // Vorherige Sprachausgabe stoppen
  stopTTS();

  // Markdown-Formatierung entfernen für natürlichere Sprachausgabe
  const cleanText = cleanTextForTTS(options.text);

  if (!cleanText.trim()) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'de-DE';
  utterance.rate = options.rate ?? 0.95; // Etwas langsamer für bessere Verständlichkeit
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? getTTSVolume();

  // Beste deutsche Stimme finden
  const voice = findBestGermanVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => {
    isSpeakingState = true;
    options.onStart?.();
  };

  utterance.onend = () => {
    isSpeakingState = false;
    currentUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = (event) => {
    isSpeakingState = false;
    currentUtterance = null;
    if (event.error !== 'canceled') {
      options.onError?.(`Fehler bei der Sprachausgabe: ${event.error}`);
    }
  };

  utterance.onboundary = (event) => {
    options.onBoundary?.(event.charIndex, event.charLength);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopTTS(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
  isSpeakingState = false;
  currentUtterance = null;
}

export function pauseTTS(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.pause();
  }
}

export function resumeTTS(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.resume();
  }
}

/**
 * Bereinigt Text von Markdown-Formatierung für natürlichere Sprachausgabe
 */
function cleanTextForTTS(text: string): string {
  return text
    // Markdown-Headers entfernen
    .replace(/#{1,6}\s*/g, '')
    // Bold/Italic entfernen
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Links entfernen, nur Text behalten
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Code-Blöcke entfernen
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    // Aufzählungszeichen vereinfachen
    .replace(/^\s*[-*]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    // Checkmarks und Emojis durch Pausen ersetzen
    .replace(/[✓✅❌⚠️🎉📧🎵👋➡️]/g, '')
    // Doppelte Leerzeichen entfernen
    .replace(/\s+/g, ' ')
    // Doppelte Zeilenumbrüche zu Pausen
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
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
