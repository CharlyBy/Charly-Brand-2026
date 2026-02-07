/**
 * LunaVoiceControls - Sprach-Steuerungselemente für den Luna Chat
 * 
 * Zwei Modi:
 * 1. Schreibmodus (Standard): Textfeld + Send-Button
 * 2. Sprachmodus: Mikrofon-Button, Luna antwortet per Stimme
 * 
 * Features:
 * - Toggle zwischen Schreib/Sprach-Modus via Button
 * - Speech-to-Text via Web Speech API (browser-lokal)
 * - Text-to-Speech via Server (Gemini TTS Sulafat / OpenAI Fallback)
 * - Wellenform-Animation während Aufnahme/Sprechen
 * - DSGVO-Einwilligungsdialog beim ersten Wechsel in Sprachmodus
 * - Gesprochenes wird als Text im Chat angezeigt
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Square, Keyboard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  hasVoiceConsent,
  isSpeechRecognitionSupported,
  isTTSSupported,
  startSpeechRecognition,
  stopSpeechRecognition,
  speakText,
  stopTTS,
  isTTSSpeaking,
  generateWaveformBars,
} from "@/lib/luna-voice";

export type VoiceMode = "text" | "voice";

interface LunaVoiceControlsProps {
  /** Aktueller Modus */
  mode: VoiceMode;
  /** Callback zum Moduswechsel */
  onModeChange: (mode: VoiceMode) => void;
  /** Callback wenn Spracherkennung Text liefert (final) */
  onTranscript: (text: string) => void;
  /** Text den Luna vorlesen soll (im Sprachmodus) */
  textToSpeak?: string;
  /** Ob der Chat gerade auf Antwort wartet */
  isTyping: boolean;
  /** Ob die Controls deaktiviert sein sollen */
  disabled?: boolean;
  /** Callback wenn der Consent-Dialog benötigt wird */
  onConsentNeeded: () => void;
}

export default function LunaVoiceControls({
  mode,
  onModeChange,
  onTranscript,
  textToSpeak,
  isTyping,
  disabled = false,
  onConsentNeeded,
}: LunaVoiceControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [waveformBars, setWaveformBars] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1]);

  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const waveformIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSpokenTextRef = useRef<string>("");

  // Wellenform-Animation
  useEffect(() => {
    if (isRecording || isSpeaking) {
      waveformIntervalRef.current = setInterval(() => {
        setWaveformBars(generateWaveformBars(true));
      }, 150);
    } else {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
      setWaveformBars([0.1, 0.1, 0.1, 0.1, 0.1]);
    }
    return () => {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
    };
  }, [isRecording, isSpeaking]);

  // Auto-Speak Luna-Nachrichten im Sprachmodus (Server-TTS)
  useEffect(() => {
    if (
      mode === "voice" &&
      textToSpeak &&
      !isTyping &&
      textToSpeak !== lastSpokenTextRef.current
    ) {
      lastSpokenTextRef.current = textToSpeak;
      handleSpeak(textToSpeak);
    }
  }, [textToSpeak, mode, isTyping]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      stopTTS();
    };
  }, []);

  // Wenn Modus wechselt: laufende Aufnahme/TTS stoppen
  useEffect(() => {
    if (mode === "text") {
      if (isRecording) {
        stopSpeechRecognition();
        setIsRecording(false);
        setInterimTranscript("");
      }
      if (isSpeaking || isLoadingTTS) {
        stopTTS();
        setIsSpeaking(false);
        setIsLoadingTTS(false);
      }
    }
  }, [mode]);

  // ============================================
  // MODUS-WECHSEL
  // ============================================

  const handleToggleMode = useCallback(() => {
    if (mode === "text") {
      // Wechsel zu Sprachmodus
      if (!hasVoiceConsent()) {
        onConsentNeeded();
        return;
      }
      if (!isSpeechRecognitionSupported()) {
        toast.error(
          "Spracherkennung wird in diesem Browser nicht unterstützt. Bitte verwende Chrome, Edge oder Safari.",
          { duration: 5000 }
        );
        return;
      }
      onModeChange("voice");
    } else {
      // Wechsel zu Textmodus
      if (isRecording) {
        stopSpeechRecognition();
        setIsRecording(false);
        setInterimTranscript("");
      }
      if (isSpeaking || isLoadingTTS) {
        stopTTS();
        setIsSpeaking(false);
        setIsLoadingTTS(false);
      }
      onModeChange("text");
    }
  }, [mode, isRecording, isSpeaking, isLoadingTTS, onModeChange, onConsentNeeded]);

  // ============================================
  // SPEECH-TO-TEXT
  // ============================================

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      stopSpeechRecognition();
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
        stopRecognitionRef.current = null;
      }
      setIsRecording(false);
      setInterimTranscript("");
      return;
    }

    // TTS stoppen falls aktiv
    if (isTTSSpeaking()) {
      stopTTS();
      setIsSpeaking(false);
      setIsLoadingTTS(false);
    }

    const stopFn = startSpeechRecognition({
      language: "de-DE",
      continuous: false,
      interimResults: true,
      onStart: () => {
        setIsRecording(true);
        setInterimTranscript("");
      },
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          onTranscript(transcript);
          setInterimTranscript("");
          setIsRecording(false);
        } else {
          setInterimTranscript(transcript);
        }
      },
      onEnd: () => {
        setIsRecording(false);
        setInterimTranscript("");
        stopRecognitionRef.current = null;
      },
      onError: (error) => {
        if (error === "CONSENT_REQUIRED") {
          onConsentNeeded();
          return;
        }
        // Stille "no-speech" Fehler nicht anzeigen
        if (!error.includes("no-speech") && !error.includes("Keine Sprache")) {
          toast.error(error, { duration: 6000 });
        }
        setIsRecording(false);
        setInterimTranscript("");
      },
    });

    stopRecognitionRef.current = stopFn;
  }, [isRecording, onTranscript, onConsentNeeded]);

  // ============================================
  // TEXT-TO-SPEECH (Server-seitig)
  // ============================================

  const handleSpeak = useCallback(async (text: string) => {
    setIsLoadingTTS(true);

    await speakText({
      text,
      onFirstChunkReady: () => {
        // Erster Audio-Chunk ist da → Lade-Animation stoppen
        setIsLoadingTTS(false);
      },
      onStart: () => {
        setIsLoadingTTS(false);
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsLoadingTTS(false);
      },
      onError: (error) => {
        setIsSpeaking(false);
        setIsLoadingTTS(false);
        console.error("[TTS]", error);
        if (!error.includes('abort') && !error.includes('cancel')) {
          toast.error("Sprachausgabe konnte nicht gestartet werden.", { duration: 4000 });
        }
      },
    });
  }, []);

  const handleStopSpeaking = useCallback(() => {
    stopTTS();
    setIsSpeaking(false);
    setIsLoadingTTS(false);
  }, []);

  // ============================================
  // RENDER
  // ============================================

  const voiceSupported = isSpeechRecognitionSupported();

  // Keine Voice-Steuerung wenn STT nicht unterstützt
  if (!voiceSupported) return null;

  return (
    <div className="flex flex-col">
      {/* Sprachmodus-Bereich: Aufnahme-UI */}
      {mode === "voice" && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-center gap-3">
            {/* Zurück zum Textmodus */}
            <Button
              onClick={handleToggleMode}
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9"
              title="Zum Schreibmodus wechseln"
              aria-label="Zum Schreibmodus wechseln"
            >
              <Keyboard className="h-4 w-4" />
            </Button>

            {/* Wellenform-Animation */}
            {(isRecording || isSpeaking) && (
              <div
                className="flex items-end gap-[3px] h-6"
                role="status"
                aria-label={isRecording ? "Aufnahme laeuft" : "Luna spricht"}
              >
                {waveformBars.map((height, i) => (
                  <div
                    key={i}
                    className={`w-[3px] rounded-full transition-all duration-150 ${
                      isRecording ? "bg-red-500" : "bg-primary"
                    }`}
                    style={{ height: `${height * 24}px` }}
                  />
                ))}
              </div>
            )}

            {/* Lade-Animation wenn TTS generiert wird */}
            {isLoadingTTS && !isSpeaking && (
              <div className="flex items-center gap-1 h-6">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}

            {/* Hauptaktions-Button: Mikrofon */}
            <Button
              onClick={handleMicClick}
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              className={`shrink-0 h-12 w-12 rounded-full ${
                isRecording ? "animate-pulse shadow-lg shadow-red-500/30" : ""
              }`}
              title={isRecording ? "Aufnahme stoppen" : "Sprechen"}
              aria-label={isRecording ? "Aufnahme stoppen" : "Sprechen"}
              disabled={disabled || isTyping || isLoadingTTS}
            >
              {isRecording ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Wellenform rechts (Symmetrie) */}
            {(isRecording || isSpeaking) && (
              <div className="flex items-end gap-[3px] h-6">
                {waveformBars.map((height, i) => (
                  <div
                    key={`r-${i}`}
                    className={`w-[3px] rounded-full transition-all duration-150 ${
                      isRecording ? "bg-red-500" : "bg-primary"
                    }`}
                    style={{ height: `${waveformBars[4 - i] * 24}px` }}
                  />
                ))}
              </div>
            )}

            {/* Stop-Button wenn Luna spricht oder TTS lädt */}
            {(isSpeaking || isLoadingTTS) ? (
              <Button
                onClick={handleStopSpeaking}
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9"
                title="Vorlesen stoppen"
                aria-label="Vorlesen stoppen"
              >
                <VolumeX className="h-4 w-4 text-red-500" />
              </Button>
            ) : (
              <div className="w-9" /> // Platzhalter für Symmetrie
            )}
          </div>

          {/* Status-Text */}
          <p className="text-xs text-center mt-2 text-muted-foreground">
            {isRecording
              ? "Ich hoere zu..."
              : isLoadingTTS
              ? "Luna bereitet ihre Stimme vor..."
              : isSpeaking
              ? "Luna spricht..."
              : isTyping
              ? "Luna denkt nach..."
              : "Tippe auf das Mikrofon zum Sprechen"}
          </p>

          {/* Interims-Transkript */}
          {interimTranscript && (
            <div className="text-sm text-center text-muted-foreground italic mt-1 px-4 py-1.5 bg-muted/30 rounded-lg mx-4">
              &bdquo;{interimTranscript}...&ldquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
