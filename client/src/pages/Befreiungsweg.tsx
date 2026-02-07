import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Eye, Heart, Lightbulb, Zap, Star, ArrowLeft } from "lucide-react";

export default function Befreiungsweg() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container">
          <Link href="/">
            <Button variant="ghost" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Startseite
            </Button>
          </Link>
          
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary font-semibold mb-4 uppercase tracking-wider">MEIN ANSATZ</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Der Befreiungsweg
            </h1>
            <p className="text-lg text-muted-foreground">
              Ein ganzheitlicher 5-Ebenen-Prozess zur Transformation und persönlichen Freiheit. 
              Jede Ebene baut auf der vorherigen auf und führt dich Schritt für Schritt zu mehr Klarheit, 
              Selbstverständnis und innerer Freiheit.
            </p>
          </div>
        </div>
      </section>

      {/* Ebenen im Detail */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="space-y-16">
            {/* Ebene 1 - Wahrnehmung */}
            <div className="scroll-mt-20">
              <Card className="relative overflow-hidden border-l-4 border-l-primary">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Eye className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-primary font-semibold mb-2">EBENE 1</div>
                      <h2 className="text-3xl font-bold mb-3">Wahrnehmung</h2>
                      <p className="text-xl text-muted-foreground">
                        Wo stehst du gerade?
                      </p>
                    </div>
                    <div className="text-7xl font-bold text-primary/10 ml-auto">01</div>
                  </div>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Der erste Schritt auf dem Befreiungsweg ist die <strong>bewusste Wahrnehmung</strong> deiner 
                      aktuellen Situation. Wir erfassen gemeinsam, wo du gerade stehst – auf allen Ebenen deines Seins.
                    </p>
                    <p>
                      <strong>Mental:</strong> Welche Gedanken beschäftigen dich? Welche Überzeugungen prägen dein Denken?
                    </p>
                    <p>
                      <strong>Emotional:</strong> Welche Gefühle begleiten dich im Alltag? Was bewegt dich wirklich?
                    </p>
                    <p>
                      <strong>Physiologisch:</strong> Wie geht es deinem Körper? Wo zeigen sich Verspannungen oder Beschwerden?
                    </p>
                    <p>
                      Diese ganzheitliche Bestandsaufnahme schafft die Grundlage für alle weiteren Schritte. 
                      Nur wenn wir wissen, wo du stehst, können wir den richtigen Weg für dich finden.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ebene 2 - Bedürfnisse */}
            <div className="scroll-mt-20">
              <Card className="relative overflow-hidden border-l-4 border-l-primary">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-primary font-semibold mb-2">EBENE 2</div>
                      <h2 className="text-3xl font-bold mb-3">Bedürfnisse</h2>
                      <p className="text-xl text-muted-foreground">
                        Was brauchst du wirklich?
                      </p>
                    </div>
                    <div className="text-7xl font-bold text-primary/10 ml-auto">02</div>
                  </div>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Auf der zweiten Ebene geht es darum, deine <strong>wahren Bedürfnisse</strong> zu erkennen und 
                      zu verstehen. Oft sind uns unsere tiefsten Bedürfnisse gar nicht bewusst – sie werden überdeckt 
                      von Erwartungen, Gewohnheiten oder Ängsten.
                    </p>
                    <p>
                      <strong>In Beziehungen:</strong> Was brauchst du, um dich verbunden und sicher zu fühlen? 
                      Welche Beziehungsmuster prägen dein Leben?
                    </p>
                    <p>
                      <strong>Für deine Sicherheit:</strong> Was gibt dir Halt und Orientierung? Wo suchst du nach 
                      Sicherheit – und wo findest du sie wirklich?
                    </p>
                    <p>
                      <strong>Für deine Entwicklung:</strong> Was brauchst du, um zu wachsen und dich zu entfalten?
                    </p>
                    <p>
                      Wenn wir deine Bedürfnisse klar benennen können, entsteht Klarheit über das, was dir wirklich 
                      wichtig ist. Diese Klarheit ist der Schlüssel zu authentischen Entscheidungen.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ebene 3 - Bewusstsein */}
            <div className="scroll-mt-20">
              <Card className="relative overflow-hidden border-l-4 border-l-primary">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Lightbulb className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-primary font-semibold mb-2">EBENE 3</div>
                      <h2 className="text-3xl font-bold mb-3">Bewusstsein</h2>
                      <p className="text-xl text-muted-foreground">
                        Erkenne deine Muster
                      </p>
                    </div>
                    <div className="text-7xl font-bold text-primary/10 ml-auto">03</div>
                  </div>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Die dritte Ebene ist die Ebene der <strong>Erkenntnis</strong>. Hier geht es darum, die 
                      Zusammenhänge zu verstehen: Welche Muster bestimmen dein Leben? Welche Werte leiten dich? 
                      Und wo liegen die Wurzeln deiner aktuellen Herausforderungen?
                    </p>
                    <p>
                      <strong>Deine Muster:</strong> Wir alle haben wiederkehrende Verhaltens- und Denkmuster, 
                      die uns prägen. Manche dienen uns, andere halten uns gefangen. Hier schauen wir genau hin.
                    </p>
                    <p>
                      <strong>Deine Werte:</strong> Was ist dir wirklich wichtig? Welche Werte leiten dein Handeln – 
                      bewusst oder unbewusst?
                    </p>
                    <p>
                      <strong>Deine Defizite:</strong> Wo fehlt etwas in deinem Leben? Welche Bedürfnisse wurden 
                      vielleicht nie erfüllt? Diese Lücken zu erkennen, ist der erste Schritt zur Heilung.
                    </p>
                    <p>
                      Bewusstsein schafft Freiheit. Wenn du verstehst, warum du so handelst, wie du handelst, 
                      kannst du bewusst neue Wege wählen.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ebene 4 - Handlung */}
            <div className="scroll-mt-20">
              <Card className="relative overflow-hidden border-l-4 border-l-primary">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-primary font-semibold mb-2">EBENE 4</div>
                      <h2 className="text-3xl font-bold mb-3">Handlung</h2>
                      <p className="text-xl text-muted-foreground">
                        Finde den richtigen Weg
                      </p>
                    </div>
                    <div className="text-7xl font-bold text-primary/10 ml-auto">04</div>
                  </div>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Jetzt wird es <strong>konkret</strong>. Auf der vierten Ebene geht es um die Umsetzung – 
                      um das aktive Gestalten deines Weges. Erkenntnis allein reicht nicht; sie muss in Handlung 
                      münden, um Veränderung zu bewirken.
                    </p>
                    <p>
                      <strong>Seminare:</strong> Gezieltes Lernen in der Gruppe, um neue Perspektiven zu gewinnen 
                      und Werkzeuge für deinen Alltag zu erlernen.
                    </p>
                    <p>
                      <strong>Coaching:</strong> Individuelle Begleitung bei konkreten Herausforderungen und 
                      Entscheidungen. Hier entwickeln wir gemeinsam Strategien für deine spezifische Situation.
                    </p>
                    <p>
                      <strong>Therapie:</strong> Tiefgehende Arbeit an den Wurzeln deiner Themen. Hier geht es 
                      um Heilung, Integration und nachhaltige Transformation.
                    </p>
                    <p>
                      Welcher Weg für dich der richtige ist, entscheiden wir gemeinsam – basierend auf deiner 
                      Situation, deinen Bedürfnissen und deinen Zielen. Manchmal ist es eine Kombination aus 
                      mehreren Ansätzen.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ebene 5 - Entfaltung */}
            <div className="scroll-mt-20">
              <Card className="relative overflow-hidden border-l-4 border-l-secondary">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="h-16 w-16 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Star className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm text-secondary font-semibold mb-2">EBENE 5</div>
                      <h2 className="text-3xl font-bold mb-3">Entfaltung</h2>
                      <p className="text-xl text-muted-foreground">
                        Lebe dein Potenzial
                      </p>
                    </div>
                    <div className="text-7xl font-bold text-secondary/10 ml-auto">05</div>
                  </div>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Die fünfte Ebene ist die Ebene der <strong>Integration und Entfaltung</strong>. Hier kommen 
                      alle vorherigen Ebenen zusammen: Wahrnehmung, Bedürfnisse, Bewusstsein und Handlung verschmelzen 
                      zu einem stimmigen Ganzen.
                    </p>
                    <p>
                      <strong>Du lebst dein Potenzial:</strong> Du erkennst deine Stärken und Gaben und setzt sie 
                      bewusst ein. Du weißt, wer du bist und was du willst.
                    </p>
                    <p>
                      <strong>Du gehst deinen eigenen Weg:</strong> Du orientierst dich nicht mehr an den Erwartungen 
                      anderer, sondern folgst deiner inneren Wahrheit. Du triffst Entscheidungen aus deiner Mitte heraus.
                    </p>
                    <p>
                      <strong>Du bist frei:</strong> Frei von alten Mustern, die dich eingeschränkt haben. Frei, 
                      dein Leben nach deinen eigenen Werten zu gestalten. Frei, authentisch zu sein.
                    </p>
                    <p>
                      Diese Ebene ist kein Endzustand, sondern ein fortlaufender Prozess. Entfaltung bedeutet, 
                      immer wieder neu zu wachsen, zu lernen und sich weiterzuentwickeln – in Verbindung mit dir 
                      selbst und der Welt um dich herum.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bereit für deinen Weg?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Lass uns gemeinsam herausfinden, wo du gerade stehst und welcher Schritt 
            für dich der richtige ist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="outline">
                Zurück zur Startseite
              </Button>
            </Link>
            <Link href="/kontakt">
              <Button size="lg">
                Jetzt Kontakt aufnehmen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
