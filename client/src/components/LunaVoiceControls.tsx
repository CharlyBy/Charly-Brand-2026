/**
 * LunaVoiceControls - Sprach-Steuerungselemente für den Luna Chat
 * 
 * Enthält:
 * - Mikrofon-Button (Speech-to-Text)
 * - Lautsprecher-Toggle (Text-to-Speech)
 * - Lautstärkeregler
 * - Visuelle Wellenform-Animation
 * - Barrierefreie Bedienung
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Square } from "lucide-react";
import { toast } from "sonner";
import VoiceConsentDialog from "./VoiceConsentDialog";
import {
  hasVoiceConsent,
  setVoiceConsent,
  isSpeechRecognitionSupported,
  isTTSSupported,
  startSpeechRecognition,
  stopSpeechRecognition,
  speakText,
  stopTTS,
  isTTSSpeaking,
  getTTSEnabled,
  setTTSEnabled,
  getTTSVolume,
  setTTSVolume,
  generateWaveformBars,
} from "@/lib/luna-voice";

interface LunaVoiceControlsProps {
  /** Callback wenn Spracherkennung Text liefert */
  onTranscript: (text: string) => void;
  /** Ob der Chat gerade auf Antwort wartet */
  isLoading: boolean;
  /** Ob der Nutzer gerade tippt */
  isInputFocused: boolean;
  /** Letzter Text von Luna zum Vorlesen */
  lastLunaMessage?: string;
  /** Ob ein neuer Luna-Text zum Vorlesen bereitsteht */
  hasNewLunaMessage: boolean;
  /** Callback wenn TTS abgespielt wird */
  onTTSStateChange?: (isSpeaking: boolean) => void;
}

export default function LunaVoiceControls({
  onTranscript,
  isLoading,
  isInputFocused,
  lastLunaMessage,
  hasNewLunaMessage,
  onTTSStateChange,
}: LunaVoiceControlsProps) {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [ttsEnabled, setTtsEnabledState] = useState(getTTSEnabled());
  const [ttsVolume, setTtsVolumeState] = useState(getTTSVolume());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1]);
  
  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const waveformIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Auto-Speak neue Luna-Nachrichten
  useEffect(() => {
    if (ttsEnabled && hasNewLunaMessage && lastLunaMessage && !isLoading) {
      handleSpeak(lastLunaMessage);
    }
  }, [hasNewLunaMessage, lastLunaMessage, ttsEnabled, isLoading]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      stopTTS();
    };
  }, []);

  // ============================================
  // SPEECH-TO-TEXT Handler
  // ============================================

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      // Aufnahme stoppen
      stopSpeechRecognition();
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
        stopRecognitionRef.current = null;
      }
      setIsRecording(false);
      setInterimTranscript("");
      return;
    }

    // Prüfe Einwilligung
    if (!hasVoiceConsent()) {
      setShowConsentDialog(true);
      return;
    }

    // Prüfe Browser-Unterstützung
    if (!isSpeechRecognitionSupported()) {
      toast.error(
        "Spracherkennung wird in diesem Browser nicht unterstützt. Bitte verwende Chrome, Edge oder Safari.",
        { duration: 5000 }
      );
      return;
    }

    // TTS stoppen falls aktiv
    if (isTTSSpeaking()) {
      stopTTS();
      setIsSpeaking(false);
    }

    // Spracherkennung starten
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
          setShowConsentDialog(true);
          return;
        }
        if (!error.includes("no-speech")) {
          toast.error(error, { duration: 4000 });
        }
        setIsRecording(false);
        setInterimTranscript("");
      },
    });

    stopRecognitionRef.current = stopFn;
  }, [isRecording, onTranscript]);

  // ============================================
  // TEXT-TO-SPEECH Handler
  // ============================================

  const handleSpeak = useCallback((text: string) => {
    if (!isTTSSupported()) {
      toast.error("Sprachausgabe wird in diesem Browser nicht unterstützt.");
      return;
    }

    speakText({
      text,
      volume: ttsVolume,
      onStart: () => {
        setIsSpeaking(true);
        onTTSStateChange?.(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        onTTSStateChange?.(false);
      },
      onError: (error) => {
        setIsSpeaking(false);
        onTTSStateChange?.(false);
        console.error("[TTS]", error);
      },
    });
  }, [ttsVolume, onTTSStateChange]);

  const handleStopSpeaking = useCallback(() => {
    stopTTS();
    setIsSpeaking(false);
    onTTSStateChange?.(false);
  }, [onTTSStateChange]);

  const handleToggleTTS = useCallback(() => {
    const newState = !ttsEnabled;
    setTtsEnabledState(newState);
    setTTSEnabled(newState);
    
    if (!newState && isSpeaking) {
      handleStopSpeaking();
    }
    
    toast.success(
      newState ? "Luna-Stimme aktiviert" : "Luna-Stimme deaktiviert",
      { duration: 2000 }
    );
  }, [ttsEnabled, isSpeaking, handleStopSpeaking]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setTtsVolumeState(vol);
    setTTSVolume(vol);
  }, []);

  // ============================================
  // CONSENT Handler
  // ============================================

  const handleConsentAccept = useCallback(() => {
    setVoiceConsent(true);
    setShowConsentDialog(false);
    toast.success("Sprachfunktion aktiviert!", { duration: 2000 });
    
    // Direkt Spracherkennung starten nach Einwilligung
    setTimeout(() => handleMicClick(), 300);
  }, [handleMicClick]);

  const handleConsentDecline = useCallback(() => {
    setVoiceConsent(false);
    setShowConsentDialog(false);
  }, []);

  // ============================================
  // RENDER
  // ============================================

  const voiceSupported = isSpeechRecognitionSupported();
  const ttsSupported = isTTSSupported();

  // Keine Voice-Steuerung anzeigen, wenn beides nicht unterstützt wird
  if (!voiceSupported && !ttsSupported) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Wellenform-Animation (sichtbar wenn aktiv) */}
        {(isRecording || isSpeaking) && (
          <div 
            className="flex items-end gap-[2px] h-5 mr-1"
            role="status"
            aria-label={isRecording ? "Spracherkennung aktiv" : "Luna spricht"}
          >
            {waveformBars.map((height, i) => (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-all duration-150 ${
                  isRecording ? "bg-red-500" : "bg-primary"
                }`}
                style={{ height: `${height * 20}px` }}
              />
            ))}
          </div>
        )}

        {/* Mikrofon-Button */}
        {voiceSupported && (
          <Button
            onClick={handleMicClick}
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            className={`shrink-0 h-8 w-8 ${isRecording ? "animate-pulse" : ""}`}
            title={isRecording ? "Aufnahme stoppen" : "Spracheingabe starten"}
            aria-label={isRecording ? "Aufnahme stoppen" : "Spracheingabe starten"}
            aria-pressed={isRecording}
            disabled={isLoading}
          >
            {isRecording ? (
              <Square className="h-3.5 w-3.5" />
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
          </Button>
        )}

        {/* TTS-Toggle-Button */}
        {ttsSupported && (
          <div className="relative">
            <Button
              onClick={handleToggleTTS}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowVolumeSlider(!showVolumeSlider);
              }}
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              title={ttsEnabled ? "Luna-Stimme deaktivieren (Rechtsklick: Lautstärke)" : "Luna-Stimme aktivieren"}
              aria-label={ttsEnabled ? "Luna-Stimme deaktivieren" : "Luna-Stimme aktivieren"}
              aria-pressed={ttsEnabled}
            >
              {ttsEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-primary" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* Lautstärke-Slider (Popup) */}
            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-2 bg-background border rounded-lg shadow-lg p-3 w-36 z-10">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Lautstärke: {Math.round(ttsVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ttsVolume}
                  onChange={handleVolumeChange}
                  className="w-full accent-primary"
                  aria-label="Lautstärke der Sprachausgabe"
                />
                <button
                  onClick={() => setShowVolumeSlider(false)}
                  className="text-xs text-muted-foreground hover:text-foreground mt-1"
                >
                  Schließen
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stop-Button wenn Luna spricht */}
        {isSpeaking && (
          <Button
            onClick={handleStopSpeaking}
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            title="Vorlesen stoppen"
            aria-label="Vorlesen stoppen"
          >
            <Square className="h-3.5 w-3.5 text-red-500" />
          </Button>
        )}
      </div>

      {/* Interims-Transkript anzeigen */}
      {interimTranscript && (
        <div className="text-xs text-muted-foreground italic px-2 py-1 bg-muted/30 rounded animate-pulse">
          {interimTranscript}...
        </div>
      )}

      {/* Consent-Dialog */}
      <VoiceConsentDialog
        open={showConsentDialog}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </>
  );
}
