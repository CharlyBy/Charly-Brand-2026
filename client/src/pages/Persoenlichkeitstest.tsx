import { useState } from "react";
import { CheckCircle, MessageCircle, Clock, Shield, Sparkles, Heart, Brain, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { openLunaChat } from "@/const";
import { trackPersonalityTestCTA, trackLunaChatOpenedFrom } from "@/lib/analytics";
import EnneagramTest from "@/components/EnneagramTest";

export default function Persoenlichkeitstest() {
  const [showTest, setShowTest] = useState(false);

  if (showTest) {
    return (
      <div className="min-h-screen">
        <EnneagramTest onComplete={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Kostenloser Persönlichkeitstest
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Entdecke deine wahre Persönlichkeit
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Ein tiefgründiger Test, der dir hilft, dich selbst besser zu verstehen – 
              deine Stärken, Herausforderungen und deinen einzigartigen Weg zur persönlichen Entwicklung.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto"
                onClick={() => {
                  trackPersonalityTestCTA("hero");
                  setShowTest(true);
                }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Test jetzt starten
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 h-auto"
                onClick={() => {
                  trackLunaChatOpenedFrom("Personality Test Hero");
                  openLunaChat();
                }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Mit Luna chatten
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Ca. 20 Minuten</span>
                <span className="mx-2">•</span>
                <Shield className="w-4 h-4" />
                <span>100% vertraulich</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Was ist das Enneagramm? */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Was ist das Enneagramm?
              </h2>
              <p className="text-lg text-muted-foreground">
                Ein bewährtes System zur Persönlichkeitsentwicklung
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                Das Enneagramm ist eines der tiefgründigsten Persönlichkeitsmodelle der Welt. 
                Es beschreibt neun grundlegende Persönlichkeitstypen, die jeweils einzigartige 
                Motivationen, Ängste und Verhaltensmuster haben.
              </p>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                Anders als oberflächliche Tests geht das Enneagramm in die Tiefe: Es zeigt dir 
                nicht nur, <strong>wie</strong> du dich verhältst, sondern vor allem <strong>warum</strong> – 
                welche unbewussten Muster dein Leben steuern und wie du sie transformieren kannst.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                Dieses Wissen ist der Schlüssel zu echter Veränderung: Du erkennst deine blinden 
                Flecken, verstehst deine Beziehungen besser und findest deinen individuellen Weg 
                zu mehr Freiheit und Erfüllung.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wie funktioniert der Test? */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Wie funktioniert der Test?
              </h2>
              <p className="text-lg text-muted-foreground">
                Wähle zwischen zwei Optionen – je nach deinem Zeitbudget
              </p>
            </div>

            {/* Two Test Options */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Luna Chat Option */}
              <Card className="p-8 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Luna-Chat</h3>
                    <p className="text-sm text-muted-foreground">Schnelle Ersteinschätzung</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">10 Fragen im Gespräch</p>
                      <p className="text-xs text-muted-foreground">Ca. 10 Minuten</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Natürliches Gespräch</p>
                      <p className="text-xs text-muted-foreground">Luna passt sich deinen Antworten an</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Kurze Analyse</p>
                      <p className="text-xs text-muted-foreground">3-4 Sätze Ersteinschätzung + Hinweis auf vertieften Test</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    trackLunaChatOpenedFrom("Personality Test Comparison");
                    openLunaChat();
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mit Luna chatten
                </Button>
              </Card>

              {/* Full Test Option */}
              <Card className="p-8 border-2 border-primary hover:border-primary transition-colors bg-primary/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Vollständiger Test</h3>
                    <p className="text-sm text-muted-foreground">Detaillierte Analyse</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">20 Fragen strukturiert</p>
                      <p className="text-xs text-muted-foreground">Ca. 15-20 Minuten</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Interaktiver Fragebogen</p>
                      <p className="text-xs text-muted-foreground">Mit Fortschrittsbalken und Übersicht</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Ausführliche Analyse</p>
                      <p className="text-xs text-muted-foreground">Typ-Bestimmung mit Confidence-Score + PDF per E-Mail</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => {
                    trackPersonalityTestCTA("middle");
                    setShowTest(true);
                  }}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Test jetzt starten
                </Button>
              </Card>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Welche Option ist die richtige für dich?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Luna-Chat</strong> ist perfekt, wenn du wenig Zeit hast und eine schnelle Ersteinschätzung möchtest. 
                    Der <strong>vollständige Test</strong> bietet dir eine präzisere Analyse mit höherer Zuverlässigkeit. 
                    Beide Optionen sind kostenlos und vertraulich.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Was erfährst du? */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Was erfährst du über dich?
              </h2>
              <p className="text-lg text-muted-foreground">
                Eine umfassende Analyse deiner Persönlichkeit
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Dein Persönlichkeitstyp</h3>
                    <p className="text-sm text-muted-foreground">
                      Einer von 9 Typen mit detaillierter Beschreibung deiner Kernmotivationen
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Deine Kindheitsprägung</h3>
                    <p className="text-sm text-muted-foreground">
                      Wie frühe Erfahrungen deine heutige Persönlichkeit geformt haben
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Deine Stärken</h3>
                    <p className="text-sm text-muted-foreground">
                      Welche besonderen Fähigkeiten und Talente in dir stecken
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Deine Herausforderungen</h3>
                    <p className="text-sm text-muted-foreground">
                      Welche Muster dich einschränken und wie du sie überwinden kannst
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Dein Beziehungsverhalten</h3>
                    <p className="text-sm text-muted-foreground">
                      Wie du in Beziehungen agierst und was du brauchst, um glücklich zu sein
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Konkrete Entwicklungstipps</h3>
                    <p className="text-sm text-muted-foreground">
                      Praktische Schritte für dein persönliches Wachstum
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Warum dieser Test? */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Warum dieser Test anders ist
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Wissenschaftlich fundiert</h3>
                <p className="text-muted-foreground text-sm">
                  Basiert auf dem bewährten Enneagramm-System mit 20 präzisen Fragen
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Natürliches Gespräch</h3>
                <p className="text-muted-foreground text-sm">
                  Keine starren Fragebögen – Luna passt sich deinen Antworten an
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">100% vertraulich</h3>
                <p className="text-muted-foreground text-sm">
                  Deine Antworten sind geschützt und werden nur für deine Analyse verwendet
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Bereit, dich selbst besser zu verstehen?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Starte jetzt dein kostenloses Gespräch mit Luna und erhalte deine 
              persönliche Analyse – vertraulich, präzise und wissenschaftlich fundiert.
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
              onClick={() => {
                trackPersonalityTestCTA("footer");
                trackLunaChatOpenedFrom("Personality Test Footer");
                openLunaChat();
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Jetzt kostenlos mit Luna sprechen
            </Button>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>20 Minuten</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Kostenlos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Sofort verfügbar</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
