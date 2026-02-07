import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Cookie, Settings } from "lucide-react";
import { Link } from "wouter";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    localStorage.setItem("analytics-consent", "true");
    setShowBanner(false);
    // Reload to activate Google Analytics
    window.location.reload();
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookie-consent", "essential");
    localStorage.setItem("analytics-consent", "false");
    setShowBanner(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("cookie-consent", analyticsEnabled ? "all" : "essential");
    localStorage.setItem("analytics-consent", analyticsEnabled.toString());
    setShowBanner(false);
    setShowSettings(false);
    // Reload to activate/deactivate Google Analytics
    window.location.reload();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <Card className="w-full max-w-2xl pointer-events-auto shadow-2xl border-2">
        <CardContent className="pt-6">
          {!showSettings ? (
            <>
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    Wir respektieren deine Privatsphäre
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Diese Website verwendet Cookies, um dir die bestmögliche Erfahrung zu bieten. 
                    Wir nutzen Google Analytics, um zu verstehen, wie Besucher unsere Website nutzen. 
                    Du kannst selbst entscheiden, welche Cookies du zulassen möchtest.
                  </p>
                  <Link href="/datenschutz">
                    <span className="text-sm text-primary hover:underline cursor-pointer inline-block mt-2">
                      Mehr in unserer Datenschutzerklärung →
                    </span>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  className="flex-1"
                  size="lg"
                >
                  Alle akzeptieren
                </Button>
                <Button 
                  onClick={handleRejectAll}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Nur notwendige
                </Button>
                <Button 
                  onClick={() => setShowSettings(true)}
                  variant="ghost"
                  size="lg"
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Einstellungen
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Cookie-Einstellungen</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Notwendige Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Erforderlich für die Grundfunktionen der Website (z.B. Session-Management).
                    </p>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Immer aktiv
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Analyse-Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Helfen uns zu verstehen, wie Besucher unsere Website nutzen (Google Analytics).
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleSaveSettings}
                  className="flex-1"
                  size="lg"
                >
                  Auswahl speichern
                </Button>
                <Button 
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Abbrechen
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
