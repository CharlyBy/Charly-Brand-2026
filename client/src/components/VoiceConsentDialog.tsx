/**
 * VoiceConsentDialog - DSGVO-konformer Einwilligungsdialog
 * 
 * Wird VOR der ersten Mikrofonnutzung angezeigt.
 * Informiert transparent über:
 * - Aktivierung des Mikrofons
 * - Art der Datenverarbeitung
 * - Keine Speicherung von Audioaufnahmen
 * - Verweis auf Datenschutzerklärung
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Shield, Info, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface VoiceConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function VoiceConsentDialog({ open, onAccept, onDecline }: VoiceConsentDialogProps) {
  const [consentChecked, setConsentChecked] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background border-2 border-primary/20 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Sprachfunktion aktivieren</h3>
            <p className="text-sm text-muted-foreground">
              Datenschutzhinweis zur Mikrofonnutzung
            </p>
          </div>
        </div>

        {/* Info-Bereich */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Mikrofon:</strong> Dein Mikrofon wird aktiviert, um deine Sprache in Text umzuwandeln.
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Verarbeitung:</strong> Die Spracherkennung erfolgt über die Web Speech API deines Browsers. 
              Bei Nutzung von Chrome werden Audiodaten an Google-Server zur Verarbeitung gesendet.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Keine Speicherung:</strong> Es werden keine Audioaufnahmen gespeichert - 
              weder auf deinem Geraet noch auf unseren Servern. Die Verarbeitung erfolgt in Echtzeit.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Sprachausgabe:</strong> Luna kann dir optional Antworten vorlesen. 
              Dies geschieht vollstaendig in deinem Browser ohne externe Datenuebertragung.
            </p>
          </div>
        </div>

        {/* Consent-Checkbox */}
        <label className="flex items-start gap-3 mb-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Ich bin einverstanden, dass mein Mikrofon fuer die Spracherkennung aktiviert wird. 
            Ich habe die{" "}
            <Link href="/datenschutz">
              <span className="text-primary hover:underline inline-flex items-center gap-1">
                Datenschutzerklaerung
                <ExternalLink className="h-3 w-3" />
              </span>
            </Link>{" "}
            zur Kenntnis genommen.
          </span>
        </label>

        {/* Hinweis */}
        <div className="flex items-start gap-2 mb-5 text-xs text-muted-foreground bg-primary/5 rounded-lg p-3">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Du kannst die Einwilligung jederzeit in den Datenschutzeinstellungen widerrufen. 
            Die Sprachfunktion kann auch ohne Einwilligung als Texteingabe genutzt werden.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onAccept}
            disabled={!consentChecked}
            className="flex-1 gap-2"
            size="lg"
          >
            <Mic className="h-4 w-4" />
            Aktivieren
          </Button>
          <Button
            onClick={onDecline}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Nein, danke
          </Button>
        </div>
      </div>
    </div>
  );
}
