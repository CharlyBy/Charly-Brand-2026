import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GraduationCap, Heart, Users, Lightbulb } from "lucide-react";
import { LEMNISCUS_BOOKING_URL, openLunaChat } from "@/const";
import { trackAppointmentClick } from "@/lib/analytics";

export default function UeberCharly() {
  return (
    <>
      <SEO
        title="Über Charly"
        description="Lernen Sie Charly Brand kennen - Heilpraktiker für Psychotherapie mit Spezialisierung auf Hypnose, systemische Therapie und Persönlichkeitsanalyse. Empathische Begleitung auf Ihrem Weg zu innerer Freiheit."
      />
      <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Über Charly Brand
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Mein Name ist Charly Brand, und ich bin Heilpraktiker für
                Psychotherapie. Seit vielen Jahren begleite ich Menschen auf
                ihrem Weg zu mehr Selbstverständnis, innerer Freiheit und
                Lebensfreude.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Meine Arbeit basiert auf Empathie, Respekt und dem festen
                Glauben daran, dass jeder Mensch die Ressourcen in sich trägt,
                um sein Leben positiv zu gestalten.
              </p>
              <a href={LEMNISCUS_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={trackAppointmentClick}>
                <Button size="lg" className="gap-2">
                  Persönlichen Termin vereinbaren
                </Button>
              </a>
            </div>
            <div>
              <img
                src="/images/charly.png"
                alt="Charly Brand"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophie */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Meine Philosophie
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Therapie ist für mich kein standardisierter Prozess, sondern eine
              individuelle Reise. Ich arbeite mit verschiedenen Methoden, um
              genau das zu finden, was zu dir und deinem Thema passt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Empathie</h3>
                <p className="text-muted-foreground">
                  Ich begegne dir auf Augenhöhe, ohne Bewertung. Deine
                  Geschichte ist einzigartig, und ich höre dir zu – wirklich zu.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lösungsorientiert</h3>
                <p className="text-muted-foreground">
                  Wir schauen nicht nur auf Probleme, sondern vor allem auf
                  Ressourcen und Möglichkeiten. Was kannst du schon? Was
                  funktioniert?
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Systemisch</h3>
                <p className="text-muted-foreground">
                  Menschen leben in Beziehungen. Ich schaue auf das große Ganze
                  und verstehe deine Themen im Kontext deines Lebens.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fundiert</h3>
                <p className="text-muted-foreground">
                  Meine Arbeit basiert auf wissenschaftlich anerkannten Methoden
                  wie Hypnose, systemischer Therapie und tiefgehender Persönlichkeitsanalyse.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Befreiungsweg */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-2">MEIN ANSATZ</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Der Befreiungsweg
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Ein ganzheitlicher 5-Ebenen-Prozess zur Transformation und
              persönlichen Freiheit. Jeder Schritt baut auf dem vorherigen auf
              und führt dich zu mehr Klarheit, Selbstverständnis und Entfaltung.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Ebene 1: Wahrnehmung */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">01</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">Wahrnehmung</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Wo stehst du gerade? Mental, emotional, physiologisch – wir
                      erfassen deine aktuelle Situation. Durch gezielte
                      Persönlichkeitsanalyse verstehen wir deine Muster, Motivationen
                      und blinden Flecken.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ebene 2: Bedürfnisse */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">02</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">Bedürfnisse</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Was brauchst du wirklich? Bewusstsein in Beziehungen und für
                      deine persönliche Sicherheit. Wir schauen auf deine
                      Grundbedürfnisse und achten besonders auf Autonomie und
                      Beziehungsfähigkeit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ebene 3: Bewusstsein */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">03</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">Bewusstsein</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Erkenne deine Muster und Werte. Verstehe, was dich wirklich
                      antreibt und wo Defizite liegen. Wir arbeiten mit deinen Werten
                      und schauen auf die Balance zwischen Autonomie und Beziehung.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ebene 4: Handlung */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">04</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">Handlung</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Jetzt wird es konkret: Seminare, Coaching, Therapie – wir
                      finden den richtigen Weg für dich. Gemeinsam entwickeln wir
                      Lösungen, die zu deinem Thema und deiner Persönlichkeit passen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ebene 5: Entfaltung */}
            <Card className="border-2 border-secondary/30">
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-secondary">05</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">Entfaltung</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Integration aller Ebenen. Du lebst dein volles Potenzial,
                      befreist dich aus alten Programmen und hebst das
                      Notfall-Programm auf. Hier entfaltest du dich wirklich.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Methoden */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Meine Methoden
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">
                  Hypnose & Trance
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Hypnose ist ein kraftvolles Werkzeug, um Zugang zu deinem
                  Unbewussten zu finden. In Trance können wir alte Muster
                  auflösen, neue Perspektiven entwickeln und Ressourcen
                  aktivieren, die dir im Alltag helfen.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">
                  Systemische Therapie
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Deine Themen entstehen nicht im luftleeren Raum. Systemische
                  Therapie hilft dir zu verstehen, wie Beziehungen,
                  Familienmuster und soziale Kontexte dein Leben beeinflussen –
                  und wie du diese Dynamiken verändern kannst.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">
                  Persönlichkeitsanalyse
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ich arbeite mit einem tiefgehenden Persönlichkeitsmodell, das dir
                  hilft, deine Muster, Motivationen und blinden Flecken zu
                  erkennen. Es ist ein Kompass für deine persönliche Entwicklung und
                  zeigt dir, wie du dein volles Potenzial entfalten kannst.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Lass uns sprechen
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Du bist neugierig geworden? Starte mit einem kostenlosen Gespräch
              mit Luna oder buche direkt ein Erstgespräch mit mir.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={openLunaChat}>Mit Luna sprechen</Button>
              <a href={LEMNISCUS_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={trackAppointmentClick}>
                <Button size="lg" variant="outline">
                  Termin buchen
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
