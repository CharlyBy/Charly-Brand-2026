/**
 * Upgrade Dialog Component
 * Shows when free users reach their 3-conversation limit
 * Offers 3 options: Premium Abo, Free Consultation, or Paid Session
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Calendar, Video, Sparkles } from "lucide-react";
import { LEMNISCUS_BOOKING_URL } from "@/const";

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  onUpgradeToPremium: () => void;
}

export function UpgradeDialog({ open, onClose, onUpgradeToPremium }: UpgradeDialogProps) {
  const handleBookFreeConsultation = () => {
    window.open(LEMNISCUS_BOOKING_URL, '_blank');
    onClose();
  };

  const handleBookPaidSession = () => {
    window.open(LEMNISCUS_BOOKING_URL, '_blank');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Du hast dein Gesprächslimit erreicht</DialogTitle>
          <DialogDescription className="text-base">
            Du hast bereits 3 kostenlose Gespräche mit Luna geführt. 
            Wähle eine der folgenden Optionen, um fortzufahren:
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {/* Option 1: Luna Premium Abo */}
          <Card className="p-6 border-2 border-primary hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Luna Premium</h3>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary">€9,90</div>
                <div className="text-sm text-muted-foreground">pro Monat</div>
              </div>

              <ul className="space-y-2 mb-6 flex-grow">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Unbegrenzte Gespräche mit Luna</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Gesprächsverlauf speichern</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Wöchentliche Check-ins</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Fortschritts-Tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Personalisierte Übungen</span>
                </li>
              </ul>

              <Button 
                onClick={onUpgradeToPremium}
                className="w-full"
                size="lg"
              >
                Jetzt upgraden
              </Button>
            </div>
          </Card>

          {/* Option 2: Kostenloses Erstgespräch */}
          <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Erstgespräch</h3>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold">Kostenlos</div>
                <div className="text-sm text-muted-foreground">15 Minuten</div>
              </div>

              <ul className="space-y-2 mb-6 flex-grow">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Persönliches Kennenlernen</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Klärung deiner Anliegen</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Unverbindlich & kostenlos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Online oder in Praxis</span>
                </li>
              </ul>

              <Button 
                onClick={handleBookFreeConsultation}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Termin buchen
              </Button>
            </div>
          </Card>

          {/* Option 3: Bezahlte Sitzung */}
          <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Einzelsitzung</h3>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold">€129</div>
                <div className="text-sm text-muted-foreground">pro Stunde</div>
              </div>

              <ul className="space-y-2 mb-6 flex-grow">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Intensive Einzeltherapie</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Hypnose & systemische Therapie</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Persönlichkeitsanalyse</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Langfristige Begleitung</span>
                </li>
              </ul>

              <Button 
                onClick={handleBookPaidSession}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Termin buchen
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Alle Optionen können jederzeit genutzt werden. Keine versteckten Kosten.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
