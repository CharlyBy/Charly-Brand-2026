/**
 * Luna Premium Subscription Page
 * Allows users to subscribe to Luna Premium for unlimited conversations
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Premium() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const createCheckoutMutation = trpc.subscription.createCheckoutSession.useMutation();

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error("Bitte gib deine Email-Adresse ein");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Bitte gib eine gültige Email-Adresse ein");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createCheckoutMutation.mutateAsync({ email });
      
      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error("Fehler beim Erstellen der Checkout-Session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Fehler beim Starten des Zahlungsvorgangs. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="container py-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Luna Premium</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Unbegrenzte Gespräche mit deiner digitalen Begleiterin
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Pricing Card */}
          <Card className="p-8 border-2 border-primary">
            <div className="mb-6">
              <div className="text-5xl font-bold text-primary mb-2">€9,90</div>
              <div className="text-muted-foreground">pro Monat</div>
              <div className="text-sm text-muted-foreground mt-1">
                Jederzeit kündbar
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <Input
                type="email"
                placeholder="Deine Email-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                disabled={isLoading}
                className="text-base"
              />
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={isLoading || !email.trim()}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Wird geladen...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Jetzt upgraden
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Sichere Zahlung über Stripe. Keine versteckten Kosten.
            </p>
          </Card>

          {/* Features Card */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Was du bekommst:</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Unbegrenzte Gespräche</div>
                  <div className="text-sm text-muted-foreground">
                    Führe so viele Gespräche mit Luna, wie du möchtest
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Gesprächsverlauf speichern</div>
                  <div className="text-sm text-muted-foreground">
                    Greife jederzeit auf deine früheren Gespräche zu
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Wöchentliche Check-ins</div>
                  <div className="text-sm text-muted-foreground">
                    Luna erinnert dich an deine persönlichen Ziele
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Fortschritts-Tracking</div>
                  <div className="text-sm text-muted-foreground">
                    Verfolge deine Entwicklung über die Zeit
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Personalisierte Übungen</div>
                  <div className="text-sm text-muted-foreground">
                    Erhalte maßgeschneiderte Empfehlungen für dein Wachstum
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Prioritäts-Support</div>
                  <div className="text-sm text-muted-foreground">
                    Schnellere Antworten auf deine Fragen
                  </div>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Häufige Fragen</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Kann ich jederzeit kündigen?</h3>
              <p className="text-sm text-muted-foreground">
                Ja, du kannst dein Abo jederzeit kündigen. Es läuft dann bis zum Ende des bezahlten Zeitraums weiter.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Wie funktioniert die Zahlung?</h3>
              <p className="text-sm text-muted-foreground">
                Die Zahlung erfolgt sicher über Stripe. Du wirst monatlich automatisch belastet, bis du kündigst.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Ersetzt Luna eine echte Therapie?</h3>
              <p className="text-sm text-muted-foreground">
                Nein, Luna ist eine digitale Begleiterin für Selbstreflexion und persönliches Wachstum. 
                Bei ernsthaften psychischen Problemen empfehlen wir professionelle Hilfe.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Was passiert mit meinen Daten?</h3>
              <p className="text-sm text-muted-foreground">
                Deine Gespräche werden vertraulich behandelt und verschlüsselt gespeichert. 
                Wir geben keine Daten an Dritte weiter.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
