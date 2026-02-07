/**
 * Premium Subscription Success Page
 * Shown after successful Stripe checkout
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { openLunaChat } from "@/const";

export default function PremiumSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <CheckCircle className="h-20 w-20 text-green-500" />
            <Sparkles className="h-8 w-8 text-primary absolute -top-2 -right-2" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Willkommen bei Luna Premium! 🎉</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Dein Abo wurde erfolgreich aktiviert. Du kannst jetzt unbegrenzt mit Luna sprechen 
          und alle Premium-Features nutzen.
        </p>

        <div className="space-y-4">
          <Button
            onClick={openLunaChat}
            size="lg"
            className="w-full"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Mit Luna sprechen
          </Button>

          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              Zur Startseite
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Du erhältst in Kürze eine Bestätigungs-Email von Stripe mit allen Details zu deinem Abo.
          </p>
        </div>
      </Card>
    </div>
  );
}
