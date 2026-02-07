/**
 * Luna Voice Consent Dialog
 * 
 * DSGVO-konformer Einwilligungsdialog fuer die Sprachfunktion.
 * Wird beim ersten Klick auf den Mikrofon- oder Lautsprecher-Button angezeigt.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Volume2, Shield, X } from "lucide-react";
import { Link } from "wouter";

interface LunaVoiceConsentProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export default function LunaVoiceConsent({ isOpen, onAccept, onReject }: LunaVoiceConsentProps) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardContent className="pt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Sprachfunktion aktivieren</h3>
            </div>
            <button
              onClick={onReject}
              className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
              aria-label="Schliessen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Beschreibung */}
          <div className="space-y-3 mb-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Luna bietet dir zwei Sprachfunktionen:
            </p>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Mic className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Spracheingabe</p>
                <p className="text-xs text-muted-foreground">
                  Dein Mikrofon wird aktiviert. Die Spracherkennung erfolgt 
                  <strong> direkt in deinem Browser</strong> (Web Speech API) – 
                  es werden <strong>keine Audioaufnahmen gespeichert</strong> oder 
                  an externe Server gesendet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Volume2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Sprachausgabe</p>
                <p className="text-xs text-muted-foreground">
                  Luna kann dir ihre Antworten vorlesen. Dies geschieht 
                  <strong> lokal in deinem Browser</strong> (Speech Synthesis) – 
                  ohne externe Datenübertragung.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Datenschutzhinweis:</strong> Bei der Nutzung der Web Speech API kann 
                je nach Browser eine Verbindung zum Sprachdienst des Browser-Herstellers 
                aufgebaut werden (z.B. Google bei Chrome). Wir haben darauf keinen Einfluss. 
                Fuer maximalen Datenschutz empfehlen wir die Nutzung in Firefox oder Safari.
              </p>
            </div>
          </div>

          {/* Einwilligungs-Checkbox */}
          <label className="flex items-start gap-3 mb-5 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground leading-relaxed">
              Ich stimme der Nutzung der Sprachfunktion zu und habe die{" "}
              <Link href="/datenschutz">
                <span className="text-primary hover:underline cursor-pointer">
                  Datenschutzerklaerung
                </span>
              </Link>{" "}
              zur Kenntnis genommen. Ich kann diese Einwilligung jederzeit widerrufen.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAccept}
              disabled={!accepted}
              className="flex-1"
            >
              Aktivieren
            </Button>
            <Button
              onClick={onReject}
              variant="outline"
              className="flex-1"
            >
              Ablehnen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
