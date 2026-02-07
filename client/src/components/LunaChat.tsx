import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, Loader2, Mail, Mic, Keyboard, Shield, Volume2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { trackLunaChatOpened } from "@/lib/analytics";
import LunaVoiceControls, { type VoiceMode } from "./LunaVoiceControls";
import VoiceConsentDialog from "./VoiceConsentDialog";
import { hasVoiceConsent, setVoiceConsent, isSpeechRecognitionSupported } from "@/lib/luna-voice";

interface Message {
  id: string;
  sender: "luna" | "user";
  content: string;
  timestamp: Date;
}

interface LunaChatProps {
  context?: "default" | "review";
}

export default function LunaChat({ context = "default" }: LunaChatProps = {}) {
  // ============================================
  // STATE
  // ============================================
  const [isOpen, setIsOpen] = useState(context === "review");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "luna",
      content:
        context === "review"
          ? "Hallo! Ich bin Luna, Charlys digitale Assistentin. \ud83d\udc4b\n\nIch helfe dir gerne dabei, deine Bewertung fuer Charly zu formulieren!\n\nWas hast du bisher geschrieben oder was moechtest du in deiner Bewertung ausdruecken?"
          : "Hallo! Ich bin Luna, Charlys digitale Assistentin. \ud83d\udc4b\n\nIch bin hier, um dir zu helfen, dein Thema zu verstehen und den passenden naechsten Schritt zu finden.\n\nWie geht es dir heute?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Voice-Modus: "text" (Standard) oder "voice"
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("text");
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [consentHintShown, setConsentHintShown] = useState(false);

  // PDF-Funktionalitaet
  const [lastAnalysisText, setLastAnalysisText] = useState<string | undefined>();

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // tRPC Mutations
  const chatMutation = trpc.luna.chat.useMutation();
  const sendPDFMutation = trpc.luna.sendAnalysisPDF.useMutation();

  // ============================================
  // SCROLL
  // ============================================
  const scrollToLatestMessage = () => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === "luna") {
      scrollToLatestMessage();
    }
  }, [messages]);

  // ============================================
  // EVENTS
  // ============================================
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      trackLunaChatOpened();
    };
    window.addEventListener("openLunaChat", handleOpenChat);
    return () => window.removeEventListener("openLunaChat", handleOpenChat);
  }, []);

  // ============================================
  // NACHRICHTEN SENDEN (Kern-Logik)
  // ============================================
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || chatMutation.isPending) return;

      // User-Nachricht anzeigen
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        content: messageText.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      const startTime = Date.now();

      try {
        const response = await chatMutation.mutateAsync({
          conversationId,
          message: messageText.trim(),
          context,
          voiceMode: voiceMode === "voice",
        });

        // Minimale Typing-Anzeige (800ms)
        const elapsed = Date.now() - startTime;
        if (elapsed < 800) {
          await new Promise((r) => setTimeout(r, 800 - elapsed));
        }

        setConversationId(response.conversationId);

        const lunaResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: "luna",
          content: response.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, lunaResponse]);

        // PDF-Erkennung
        if (response.message.includes("KINDHEIT") || response.message.includes("STAERKEN")) {
          setLastAnalysisText(response.message);
        }

        // Auto-PDF-Download
        const mentionsPDF =
          response.message.includes("PDF") &&
          (response.message.includes("herunterladen") ||
            response.message.includes("Download") ||
            response.message.includes("fertig"));

        if (mentionsPDF && lastAnalysisText) {
          const recentMsgs = messages.slice(-10);
          const emailMatch = recentMsgs.find((m) =>
            m.sender === "user" &&
            m.content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
          );
          const nameMatch = recentMsgs.find((m) =>
            m.sender === "user" && m.content.match(/[A-ZAEOEUE][a-zaeoeueß]+/)
          );

          if (emailMatch && nameMatch) {
            const email = emailMatch.content.match(
              /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
            )![0];
            const name = nameMatch.content.match(/[A-ZAEOEUE][a-zaeoeueß]+/)![0];
            setTimeout(() => handleGeneratePDF(email, name), 1500);
          }
        }
      } catch (error: any) {
        if (error?.message === "CONVERSATION_LIMIT_REACHED") {
          setShowUpgradeDialog(true);
          setIsTyping(false);
          return;
        }

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "luna",
          content: "Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [conversationId, context, chatMutation, lastAnalysisText, messages]
  );

  // ============================================
  // INPUT-HANDLER
  // ============================================
  const handleSend = () => sendMessage(inputValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ============================================
  // VOICE-MODUS HANDLER
  // ============================================

  // Wenn STT Text liefert → als Nachricht senden
  const handleVoiceTranscript = useCallback(
    (text: string) => {
      if (text.trim()) {
        sendMessage(text.trim());
      }
    },
    [sendMessage]
  );

  // Modus-Wechsel
  const handleModeChange = useCallback((newMode: VoiceMode) => {
    setVoiceMode(newMode);

    if (newMode === "voice") {
      toast.success("Sprachmodus aktiviert", { duration: 2000 });
    }
  }, []);

  // Consent-Dialog: Wenn User den Sprachmodus will, aber noch keine Einwilligung hat
  const handleConsentNeeded = useCallback(() => {
    setShowConsentDialog(true);
  }, []);

  const handleConsentAccept = useCallback(() => {
    setVoiceConsent(true);
    setShowConsentDialog(false);
    setVoiceMode("voice");

    // Dezenter Hinweis im Chat (statt Popup)
    if (!consentHintShown) {
      setConsentHintShown(true);
      const hintMessage: Message = {
        id: `hint-${Date.now()}`,
        sender: "luna",
        content:
          "\ud83d\udd0a Sprachmodus aktiviert! Du kannst jetzt mit mir sprechen.\n\n" +
          "\ud83d\udee1\ufe0f *Datenschutz:* Die Spracherkennung laeuft ueber deinen Browser. " +
          "Es werden keine Audioaufnahmen gespeichert. " +
          "Du kannst jederzeit zum Textmodus zurueckwechseln.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, hintMessage]);
    }
  }, [consentHintShown]);

  const handleConsentDecline = useCallback(() => {
    setVoiceConsent(false);
    setShowConsentDialog(false);
  }, []);

  // Moduswechsel-Button im Textmodus (Mikrofon-Icon neben Send)
  const handleTextModeToggle = useCallback(() => {
    if (!hasVoiceConsent()) {
      setShowConsentDialog(true);
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      toast.error(
        "Spracherkennung wird in diesem Browser nicht unterstuetzt. Bitte verwende Chrome, Edge oder Safari.",
        { duration: 5000 }
      );
      return;
    }
    setVoiceMode("voice");
  }, []);

  // ============================================
  // PDF GENERATION
  // ============================================
  const handleGeneratePDF = async (email: string, name: string) => {
    if (!lastAnalysisText || !conversationId) return;

    try {
      const result = await sendPDFMutation.mutateAsync({
        conversationId,
        userEmail: email,
        userName: name,
        analysisText: lastAnalysisText,
      });

      if (result.pdfBase64) {
        const byteCharacters = atob(result.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.fileName || "Persoenlichkeitsanalyse.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      const downloadMsg: Message = {
        id: Date.now().toString(),
        sender: "luna",
        content:
          "\u2705 Perfekt! Deine Persoenlichkeitsanalyse wurde heruntergeladen.\n\n" +
          "Wenn du tiefer an deinen Themen arbeiten moechtest, empfehle ich dir ein persoenliches Gespraech mit Charly. " +
          "Das Erstgespraech (15 Minuten) ist kostenlos!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, downloadMsg]);
    } catch (error) {
      console.error("PDF generation error:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        sender: "luna",
        content: "Entschuldigung, beim Erstellen der PDF gab es einen Fehler. Bitte versuche es spaeter erneut.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // ============================================
  // Letzter Luna-Text (fuer TTS im Sprachmodus)
  // ============================================
  const lastLunaText =
    messages.length > 0 && messages[messages.length - 1].sender === "luna" && !isTyping
      ? messages[messages.length - 1].content
      : undefined;

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
          aria-label="Chat mit Luna oeffnen"
        >
          <div className="relative">
            <img
              src="/images/luna.jpeg"
              alt="Luna"
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-secondary rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="absolute -top-12 right-0 bg-foreground text-background px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Mit Luna sprechen
          </div>
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md">
          <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="/images/luna.jpeg"
                    alt="Luna"
                    className="h-12 w-12 rounded-full object-cover border-2 border-white"
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Luna</h3>
                  <p className="text-xs text-white/80">
                    KI-Assistentin · Kein Ersatz fuer Therapie
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Modus-Anzeige im Header */}
                {voiceMode === "voice" && (
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1 mr-1">
                    <Volume2 className="h-3 w-3 text-white" />
                    <span className="text-xs text-white">Sprache</span>
                  </div>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Chat schliessen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  ref={
                    index === messages.length - 1 && message.sender === "luna"
                      ? latestMessageRef
                      : null
                  }
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    <Streamdown className="text-sm leading-relaxed">
                      {message.content}
                    </Streamdown>
                    <p
                      className={`text-xs mt-2 ${
                        message.sender === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Luna denkt nach...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input-Bereich */}
            <div className="border-t border-border bg-background">
              {/* Voice Controls (im Sprachmodus) */}
              <LunaVoiceControls
                mode={voiceMode}
                onModeChange={handleModeChange}
                onTranscript={handleVoiceTranscript}
                textToSpeak={lastLunaText}
                isTyping={isTyping}
                disabled={isTyping}
                onConsentNeeded={handleConsentNeeded}
              />

              {/* Text-Input (im Schreibmodus) */}
              {voiceMode === "text" && (
                <div className="p-4">
                  <div className="flex gap-2 items-center">
                    {/* Mikrofon-Button zum Wechsel in Sprachmodus */}
                    {isSpeechRecognitionSupported() && (
                      <Button
                        onClick={handleTextModeToggle}
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-10 w-10"
                        title="Zum Sprachmodus wechseln"
                        aria-label="Zum Sprachmodus wechseln"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    )}

                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Schreib Luna eine Nachricht..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isTyping}
                      size="icon"
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Luna ist eine KI-Assistentin und ersetzt keine therapeutische Beratung.{" "}
                    <a
                      href="/datenschutz"
                      className="underline hover:text-primary"
                      target="_blank"
                    >
                      Datenschutz
                    </a>
                  </p>
                </div>
              )}

              {/* Dezenter Datenschutzhinweis im Sprachmodus */}
              {voiceMode === "voice" && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground text-center">
                    Luna ist eine KI-Assistentin und ersetzt keine therapeutische Beratung.{" "}
                    <a
                      href="/datenschutz"
                      className="underline hover:text-primary"
                      target="_blank"
                    >
                      Datenschutz
                    </a>
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Consent Dialog */}
      <VoiceConsentDialog
        open={showConsentDialog}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onUpgradeToPremium={() => {
          window.location.href = "/premium";
        }}
      />
    </>
  );
}
