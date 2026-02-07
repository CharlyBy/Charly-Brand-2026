import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, Loader2, Mail } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { trackLunaChatOpened } from "@/lib/analytics";
import LunaVoiceControls from "./LunaVoiceControls";

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
  const [isOpen, setIsOpen] = useState(context === "review");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "luna",
      content:
        context === "review"
          ? "Hallo! Ich bin Luna, Charlys digitale Assistentin. 👋\n\nIch helfe dir gerne dabei, deine Bewertung für Charly zu formulieren!\n\nWas hast du bisher geschrieben oder was möchtest du in deiner Bewertung ausdrücken?"
          : "Hallo! Ich bin Luna, Charlys digitale Assistentin. 👋\n\nIch bin hier, um dir zu helfen, dein Thema zu verstehen und den passenden nächsten Schritt zu finden.\n\nWie geht es dir heute?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);

  // Scroll to the start of the latest message
  const scrollToLatestMessage = () => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    // Only scroll to latest message if it's from Luna (not user messages)
    if (messages.length > 0 && messages[messages.length - 1].sender === 'luna') {
      scrollToLatestMessage();
    }
  }, [messages]);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      trackLunaChatOpened();
    };
    window.addEventListener('openLunaChat', handleOpenChat);
    return () => window.removeEventListener('openLunaChat', handleOpenChat);
  }, []);

  const chatMutation = trpc.luna.chat.useMutation();
  const sendPDFMutation = trpc.luna.sendAnalysisPDF.useMutation();
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [showPDFPrompt, setShowPDFPrompt] = useState(false);
  const [pdfEmailInput, setPDFEmailInput] = useState("");
  const [pdfNameInput, setPDFNameInput] = useState("");
  const [lastAnalysisText, setLastAnalysisText] = useState<string | undefined>();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Voice functionality state
  const [isRecording, setIsRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const transcribeMutation = trpc.luna.transcribeVoice.useMutation();

  // Voice handlers
  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Start recording
    if (!isAudioRecordingSupported()) {
      toast.error('Audioaufnahme wird in diesem Browser nicht unterstützt.');
      return;
    }

    setIsRecording(true);
    
    try {
      const recorder = await startAudioRecording(
        async (audioBlob: Blob) => {
          // Upload audio to get URL
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');
          
          try {
            // Upload to storage (using fetch to /api/upload endpoint)
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!uploadResponse.ok) {
              throw new Error('Upload failed');
            }
            
            const { url } = await uploadResponse.json();
            
            // Transcribe audio
            const result = await transcribeMutation.mutateAsync({ audioUrl: url });
            
            if (result.success) {
              setInputValue(result.transcript);
              toast.success('Sprache erkannt!');
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error('Fehler bei der Spracherkennung. Bitte versuche es erneut.');
          }
          
          setIsRecording(false);
        },
        (error: string) => {
          toast.error(error);
          setIsRecording(false);
        }
      );
      
      mediaRecorderRef.current = recorder;
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Fehler beim Starten der Aufnahme.');
      setIsRecording(false);
    }
  };

  // Stop currently playing audio
  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
  };

  // Speak text using OpenAI TTS (simple REST endpoint)
  const speakText = async (text: string) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }

      // Use simple fetch-based TTS
      await speakTextSimple(text);
    } catch (error) {
      console.error('[TTS] Error:', error);
      throw error;
    }
  };

  const toggleAutoSpeak = () => {
    if (autoSpeak) {
      stopSpeaking();
    }
    setAutoSpeak(!autoSpeak);
  };

  // Auto-speak Luna's responses when autoSpeak is enabled
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'luna' && !isTyping) {
        // Use OpenAI TTS with shimmer voice
        speakText(lastMessage.content).catch((error: any) => {
          console.error('TTS error:', error);
          toast.error('Fehler beim Abspielen der Stimme.');
        });
      }
    }
  }, [messages, autoSpeak, isTyping, speakText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Ensure typing indicator is visible for at least 800ms
    const startTime = Date.now();

    try {
      const response = await chatMutation.mutateAsync({
        conversationId,
        message: messageToSend,
        context,
      });

      // Calculate remaining time to show typing indicator
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      // Wait for remaining time before showing response
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setConversationId(response.conversationId);

      const lunaResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "luna",
        content: response.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, lunaResponse]);

      // Check if this is a personality analysis (save for later PDF generation)
      const hasKindheit = response.message.includes('KINDHEIT');
      const hasStaerken = response.message.includes('STÄRKEN');
      
      if (hasKindheit || hasStaerken) {
        // This is a personality analysis - save it
        setLastAnalysisText(response.message);
      }
      
      // Check if Luna mentions PDF download (after analysis is complete)
      const mentionsPDFDownload = (
        response.message.includes('PDF') && 
        (response.message.includes('herunterladen') || 
         response.message.includes('Download') ||
         response.message.includes('fertig'))
      );
      
      // Extract email and name from conversation (look in last 10 messages)
      const emailMatch = messages.slice(-10).find(m => m.sender === 'user' && m.content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/));
      const nameMatch = messages.slice(-10).find(m => m.sender === 'user' && m.content.match(/[A-ZÄÖÜ][a-zäöüß]+/));
      
      // Trigger PDF download if:
      // 1. Luna mentions PDF download
      // 2. We have the analysis text
      // 3. We have email and name from the conversation
      if (mentionsPDFDownload && lastAnalysisText && emailMatch && nameMatch) {
        // Automatically generate and download PDF
        const email = emailMatch.content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)![0];
        const name = nameMatch.content.match(/[A-ZÄÖÜ][a-zäöüß]+/)![0];
        
        console.log('[PDF-Trigger] Detected PDF download trigger:', { email, name, hasAnalysis: !!lastAnalysisText });
        
        setTimeout(() => {
          handleGeneratePDF(email, name);
        }, 1500);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Check if it's a conversation limit error
      if (error?.message === 'CONVERSATION_LIMIT_REACHED') {
        setShowUpgradeDialog(true);
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
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGeneratePDF = async (email: string, name: string) => {
    if (!lastAnalysisText || !conversationId) {
      return;
    }

    try {
      // Generate PDF (backend will notify owner with user's email)
      const result = await sendPDFMutation.mutateAsync({
        conversationId,
        userEmail: email,
        userName: name,
        analysisText: lastAnalysisText,
      });

      // Download PDF automatically
      if (result.pdfBase64) {
        const byteCharacters = atob(result.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName || 'Persönlichkeitsanalyse.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      // Add confirmation message
      const downloadMessage: Message = {
        id: Date.now().toString(),
        sender: "luna",
        content: "✅ Perfekt! Deine Persönlichkeitsanalyse wurde heruntergeladen. Du findest sie in deinem Download-Ordner.\n\nWenn du tiefer an deinen Themen arbeiten möchtest, empfehle ich dir ein persönliches Gespräch mit Charly. Das Erstgespräch (15 Minuten) ist kostenlos!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, downloadMessage]);
    } catch (error) {
      console.error("PDF generation error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: "luna",
        content: "Entschuldigung, beim Erstellen der PDF gab es einen Fehler. Bitte versuche es später erneut.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
          aria-label="Chat mit Luna öffnen"
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
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="Chat schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  ref={index === messages.length - 1 && message.sender === 'luna' ? latestMessageRef : null}
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

              {/* PDF Email Prompt - REMOVED, now using automatic PDF download */}
              {false && showPDFPrompt && lastAnalysisText && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-card border-2 border-primary rounded-2xl px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-sm">Möchtest du die Analyse per Email erhalten?</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ich kann dir deine vollständige Persönlichkeitsanalyse als PDF per Email zusenden.
                    </p>
                    <div className="space-y-2 mb-3">
                      <Input
                        type="text"
                        placeholder="Dein Name"
                        value={pdfNameInput}
                        onChange={(e) => setPDFNameInput(e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        type="email"
                        placeholder="Deine Email-Adresse"
                        value={pdfEmailInput}
                        onChange={(e) => setPDFEmailInput(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {}}
                        disabled={!pdfEmailInput.trim() || !pdfNameInput.trim() || sendPDFMutation.isPending}
                        size="sm"
                        className="flex-1"
                      >
                        {sendPDFMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Wird gesendet...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            PDF zusenden
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowPDFPrompt(false)}
                        variant="outline"
                        size="sm"
                      >
                        Nein, danke
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border bg-background">
              {/* Voice Status Animations */}
              <LunaVoiceControls
                onTranscript={(text) => {
                  setInputValue(text);
                  // Auto-send nach Spracherkennung
                  setTimeout(() => {
                    if (text.trim()) {
                      setInputValue('');
                      const userMessage: Message = {
                        id: Date.now().toString(),
                        sender: "user",
                        content: text.trim(),
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, userMessage]);
                      setIsTyping(true);
                      chatMutation.mutateAsync({
                        conversationId,
                        message: text.trim(),
                        context,
                      }).then((response) => {
                        setConversationId(response.conversationId);
                        const lunaResponse: Message = {
                          id: (Date.now() + 1).toString(),
                          sender: "luna",
                          content: response.message,
                          timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, lunaResponse]);
                      }).catch((error: any) => {
                        if (error?.message === 'CONVERSATION_LIMIT_REACHED') {
                          setShowUpgradeDialog(true);
                          return;
                        }
                        const errorMessage: Message = {
                          id: (Date.now() + 1).toString(),
                          sender: "luna",
                          content: "Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.",
                          timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, errorMessage]);
                      }).finally(() => {
                        setIsTyping(false);
                      });
                    }
                  }, 100);
                }}
                textToSpeak={
                  messages.length > 0 && messages[messages.length - 1].sender === 'luna' && !isTyping
                    ? messages[messages.length - 1].content
                    : undefined
                }
                isTyping={isTyping}
                disabled={isTyping}
              />
              
              <div className="p-4 pt-2">
                <div className="flex gap-2 items-center">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
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
                  <a href="/datenschutz" className="underline hover:text-primary" target="_blank">Datenschutz</a>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onUpgradeToPremium={() => {
          // Redirect to premium checkout page
          window.location.href = '/premium';
        }}
      />
    </>
  );
}
