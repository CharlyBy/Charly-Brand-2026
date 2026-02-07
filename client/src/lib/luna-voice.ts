/**
 * Luna Voice Module - DSGVO-konforme Sprachfunktion
 * 
 * Speech-to-Text: Web Speech API (browser-lokal via Chrome/Edge)
 * Text-to-Speech: Server-seitig via Gemini TTS (Sulafat-Stimme) 
 *                 mit OpenAI-Fallback (shimmer)
 * 
 * OPTIMIERUNG: Satz-Chunking + parallele Audio-Generierung
 * → Erster Satz startet in ~1-3s statt 5-10s fuer den ganzen Text
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

export function startSpeechRecognition(options: SpeechRecognitionOptions): (() => void) | null {
  if (!isSpeechRecognitionSupported()) {
    options.onError('Spracherkennung wird in diesem Browser nicht unterstützt. Bitte verwende Chrome, Edge oder Safari.');
    return null;
  }

  if (!hasVoiceConsent()) {
    options.onError('CONSENT_REQUIRED');
    return null;
  }

  if (activeRecognition) {
    try { activeRecognition.abort(); } catch (e) { /* ignore */ }
  }

  sttRetryCount = 0;

  function createRecognition(): any {
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = options.language || 'de-DE';
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      sttRetryCount = 0;
      options.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      options.onResult(transcript, isFinal);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'network' && sttRetryCount < MAX_STT_RETRIES) {
        sttRetryCount++;
        console.warn(`[STT] Netzwerkfehler, Versuch ${sttRetryCount}/${MAX_STT_RETRIES}...`);
        setTimeout(() => {
          try {
            const r = createRecognition();
            r.start();
            activeRecognition = r;
          } catch {
            options.onError('Spracherkennung konnte nicht gestartet werden. Pruefe deine Internetverbindung.');
          }
        }, 500);
        return;
      }

      const msgs: Record<string, string> = {
        'not-allowed': 'Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.',
        'no-speech': 'Keine Sprache erkannt. Bitte sprich deutlich.',
        'audio-capture': 'Kein Mikrofon gefunden. Bitte pruefe deine Geraeteeinstellungen.',
        'network': 'Netzwerkfehler bei der Spracherkennung. Die Spracherkennung benoetigt eine Internetverbindung. Bitte pruefe deine Verbindung.',
        'service-not-allowed': 'Spracherkennung ist in diesem Browser deaktiviert.',
        'aborted': '',
      };

      const msg = msgs[event.error];
      if (msg === '') return; // aborted → ignore
      options.onError(msg || `Spracherkennungsfehler: ${event.error}`);
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
  } catch {
    options.onError('Fehler beim Starten der Spracherkennung.');
    return null;
  }

  return () => {
    try { activeRecognition?.stop(); } catch { /* ignore */ }
  };
}

export function stopSpeechRecognition(): void {
  if (activeRecognition) {
    try { activeRecognition.stop(); } catch { /* ignore */ }
    activeRecognition = null;
  }
}

// ============================================
// TEXT-TO-SPEECH – Satz-Streaming Pipeline
// ============================================
// 
// Ablauf fuer optimale Latenz:
// 1. Text an /api/tts/stream senden
// 2. Server splittet in Saetze, generiert alle parallel
// 3. Client empfaengt SSE-Events: info → audio → audio → ... → done
// 4. Audio-Chunks werden in einer Warteschlange gesammelt
// 5. Sobald Chunk 0 da → sofort abspielen, dann Chunk 1, 2, ...
//
// Ergebnis: User hoert den ersten Satz nach ~1-3s statt ~5-10s

let audioQueue: Array<{ url: string; index: number }> = [];
let currentAudio: HTMLAudioElement | null = null;
let currentPlayIndex = 0;
let isSpeakingState = false;
let ttsAborted = false;
let ttsAvailable: boolean | null = null;

export async function checkTTSAvailability(): Promise<boolean> {
  if (ttsAvailable !== null) return ttsAvailable;
  try {
    const r = await fetch('/api/tts/status');
    if (r.ok) {
      const d = await r.json();
      ttsAvailable = d.available === true;
    } else {
      ttsAvailable = false;
    }
  } catch {
    ttsAvailable = false;
  }
  return ttsAvailable;
}

export function isTTSSupported(): boolean { return true; }
export function isTTSSpeaking(): boolean { return isSpeakingState; }

export function getTTSEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(VOICE_TTS_ENABLED_KEY) === 'true';
}
export function setTTSEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VOICE_TTS_ENABLED_KEY, enabled.toString());
  if (!enabled) stopTTS();
}

export function getTTSVolume(): number {
  if (typeof window === 'undefined') return 0.8;
  const v = parseFloat(localStorage.getItem(VOICE_TTS_VOLUME_KEY) || '0.8');
  return isNaN(v) ? 0.8 : Math.min(1, Math.max(0, v));
}
export function setTTSVolume(vol: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VOICE_TTS_VOLUME_KEY, Math.min(1, Math.max(0, vol)).toString());
}

export interface TTSOptions {
  text: string;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  /** Wird aufgerufen wenn der erste Audio-Chunk bereit ist (Latenz-Indikator) */
  onFirstChunkReady?: () => void;
}

/**
 * Spielt Text ueber Satz-Chunking-Pipeline ab.
 * 
 * Fuer kurze Texte (1 Satz): Direkter /api/tts Aufruf
 * Fuer laengere Texte: /api/tts/stream mit SSE + Audio-Warteschlange
 */
export async function speakText(options: TTSOptions): Promise<void> {
  stopTTS();

  const text = options.text?.trim();
  if (!text) {
    options.onEnd?.();
    return;
  }

  ttsAborted = false;
  audioQueue = [];
  currentPlayIndex = 0;

  // Kurze Texte (1 Satz, <100 Zeichen): Direkter Aufruf (einfacher)
  const isShort = text.length < 100 && !text.includes('. ') && !text.includes('! ') && !text.includes('? ');
  
  if (isShort) {
    await speakDirect(options, text);
  } else {
    await speakStreaming(options, text);
  }
}

/** Direkter TTS fuer kurze Texte */
async function speakDirect(options: TTSOptions, text: string): Promise<void> {
  try {
    isSpeakingState = true;
    options.onStart?.();

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (ttsAborted) return;

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `TTS-Fehler (${response.status})`);
    }

    const blob = await response.blob();
    if (blob.size === 0) throw new Error('Leere Audio-Antwort');

    const url = URL.createObjectURL(blob);
    await playAudioUrl(url, options.volume);
    URL.revokeObjectURL(url);

    if (!ttsAborted) {
      cleanupTTS();
      options.onEnd?.();
    }
  } catch (error: any) {
    cleanupTTS();
    if (!ttsAborted) {
      options.onError?.(error?.message || 'TTS-Fehler');
    }
  }
}

/** Streaming-TTS mit Satz-Chunking */
async function speakStreaming(options: TTSOptions, text: string): Promise<void> {
  try {
    isSpeakingState = true;
    // Hinweis: onStart wird noch NICHT aufgerufen – erst wenn der erste Audio-Chunk da ist

    const response = await fetch('/api/tts/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (ttsAborted) return;

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `TTS-Stream-Fehler (${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Streaming nicht unterstuetzt');

    const decoder = new TextDecoder();
    let buffer = '';
    let firstChunkReceived = false;
    let totalChunks = 1;
    let receivedChunks = 0;

    while (true) {
      if (ttsAborted) { reader.cancel(); break; }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE-Events parsen (data: {...}\n\n)
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Letztes Fragment behalten

      for (const eventStr of events) {
        if (ttsAborted) break;

        const dataLine = eventStr.trim();
        if (!dataLine.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(dataLine.slice(6));

          if (data.type === 'info') {
            totalChunks = data.totalChunks || 1;
          
          } else if (data.type === 'audio') {
            receivedChunks++;

            // Base64 → Blob → Object URL
            const byteChars = atob(data.audio);
            const bytes = new Uint8Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
              bytes[i] = byteChars.charCodeAt(i);
            }
            const mimeType = data.format === 'wav' ? 'audio/wav' : 'audio/mpeg';
            const blob = new Blob([bytes], { type: mimeType });
            const url = URL.createObjectURL(blob);

            audioQueue.push({ url, index: data.index });

            // Erster Chunk: Sofort abspielen starten!
            if (!firstChunkReceived) {
              firstChunkReceived = true;
              options.onFirstChunkReady?.();
              options.onStart?.();
              playNextInQueue(options);
            }

          } else if (data.type === 'skip') {
            receivedChunks++;
            // Uebersprungener Satz – einfach weiter
          
          } else if (data.type === 'done') {
            // Alle Chunks empfangen
          
          } else if (data.type === 'error') {
            throw new Error(data.message || 'TTS-Stream-Fehler');
          }
        } catch (parseError) {
          // JSON-Parse-Fehler bei einzelnem Event ignorieren
          if ((parseError as Error)?.message?.includes('TTS')) throw parseError;
        }
      }
    }

    // Falls kein Audio empfangen wurde
    if (!firstChunkReceived && !ttsAborted) {
      throw new Error('Keine Audio-Daten empfangen');
    }

  } catch (error: any) {
    cleanupTTS();
    if (!ttsAborted) {
      options.onError?.(error?.message || 'TTS-Stream-Fehler');
    }
  }
}

/** Spielt den naechsten Audio-Chunk aus der Warteschlange */
function playNextInQueue(options: TTSOptions): void {
  if (ttsAborted) {
    cleanupTTS();
    return;
  }

  // Suche den naechsten Chunk der Reihe nach
  const nextChunk = audioQueue.find(c => c.index === currentPlayIndex);
  
  if (!nextChunk) {
    // Chunk noch nicht da – warte kurz und versuche erneut
    // (kommt vor wenn Chunk 2 vor Chunk 1 fertig wird)
    if (audioQueue.some(c => c.index > currentPlayIndex) || isSpeakingState) {
      setTimeout(() => playNextInQueue(options), 100);
    } else {
      // Keine weiteren Chunks → fertig
      cleanupTTS();
      options.onEnd?.();
    }
    return;
  }

  // Chunk abspielen
  const audio = new Audio(nextChunk.url);
  audio.volume = options.volume ?? getTTSVolume();
  currentAudio = audio;

  audio.onended = () => {
    // URL freigeben
    URL.revokeObjectURL(nextChunk.url);
    audioQueue = audioQueue.filter(c => c.index !== currentPlayIndex);
    
    currentPlayIndex++;
    currentAudio = null;

    // Naechsten Chunk abspielen oder fertig
    if (audioQueue.length > 0 || isSpeakingState) {
      playNextInQueue(options);
    } else {
      cleanupTTS();
      options.onEnd?.();
    }
  };

  audio.onerror = () => {
    URL.revokeObjectURL(nextChunk.url);
    audioQueue = audioQueue.filter(c => c.index !== currentPlayIndex);
    currentPlayIndex++;
    currentAudio = null;
    // Bei Fehler: naechsten Chunk versuchen
    playNextInQueue(options);
  };

  audio.play().catch(() => {
    // Autoplay blockiert? Naechsten versuchen
    currentPlayIndex++;
    currentAudio = null;
    playNextInQueue(options);
  });
}

function playAudioUrl(url: string, volume?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.volume = volume ?? getTTSVolume();
    currentAudio = audio;

    audio.onended = () => { currentAudio = null; resolve(); };
    audio.onerror = () => { currentAudio = null; reject(new Error('Audio-Wiedergabe fehlgeschlagen')); };
    audio.play().catch(reject);
  });
}

function cleanupTTS(): void {
  isSpeakingState = false;
  currentAudio = null;
  
  // Alle verbleibenden Object-URLs freigeben
  for (const chunk of audioQueue) {
    try { URL.revokeObjectURL(chunk.url); } catch { /* ignore */ }
  }
  audioQueue = [];
  currentPlayIndex = 0;
}

export function stopTTS(): void {
  ttsAborted = true;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch { /* ignore */ }
  }
  cleanupTTS();
}

export function pauseTTS(): void {
  if (currentAudio && isSpeakingState) {
    try { currentAudio.pause(); } catch { /* ignore */ }
  }
}

export function resumeTTS(): void {
  if (currentAudio && isSpeakingState) {
    try { currentAudio.play(); } catch { /* ignore */ }
  }
}

// ============================================
// WELLENFORM-ANIMATION
// ============================================

export interface WaveformState {
  isActive: boolean;
  bars: number[];
}

export function generateWaveformBars(isActive: boolean): number[] {
  if (!isActive) return [0.1, 0.1, 0.1, 0.1, 0.1];
  return Array.from({ length: 5 }, () => 0.2 + Math.random() * 0.8);
}
