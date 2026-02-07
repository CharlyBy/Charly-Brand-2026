/**
 * Premium Subscription Cancel Page
 * Shown when user cancels Stripe checkout
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, Calendar, Video } from "lucide-react";
import { Link } from "wouter";
import { LEMNISCUS_BOOKING_URL } from "@/const";

export default function PremiumCancel() {
  const handleBookConsultation = () => {
    window.open(LEMNISCUS_BOOKING_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="h-20 w-20 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Zahlung abgebrochen</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Kein Problem! Du kannst jederzeit zurückkommen, wenn du bereit bist.
        </p>

        <div className="space-y-4 mb-8">
          <Link href="/premium">
            <Button size="lg" className="w-full">
              Zurück zur Premium-Seite
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              Zur Startseite
            </Button>
          </Link>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Oder buche ein persönliches Gespräch:</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <Calendar className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Kostenloses Erstgespräch</h3>
              <p className="text-sm text-muted-foreground mb-4">
                15 Minuten persönliches Kennenlernen
              </p>
              <Button
                onClick={handleBookConsultation}
                variant="outline"
                className="w-full"
              >
                Termin buchen
              </Button>
            </Card>

            <Card className="p-6">
              <Video className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Einzelsitzung</h3>
              <p className="text-sm text-muted-foreground mb-4">
                €129/Stunde intensive Therapie
              </p>
              <Button
                onClick={handleBookConsultation}
                variant="outline"
                className="w-full"
              >
                Termin buchen
              </Button>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}
