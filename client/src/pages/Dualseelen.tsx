import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Infinity, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { LEMNISCUS_BOOKING_URL } from "@/const";
import { trackAppointmentClick } from "@/lib/analytics";
import SEO from "@/components/SEO";

export default function Dualseelen() {
  return (
    <>
      <SEO
        title="Dualseelen & Seelenverbindungen | Psychologische Beratung"
        description="Dualseelen-Begleitung und Coaching für intensive Seelenverbindungen - Mustererkennung, emotionale Stabilität, Auflösung von Abhängigkeiten. Spirituelle Beratung und Lebenshilfe ohne medizinischen Kontext."
      />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-primary/5 to-background" />
          
          {/* Content */}
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Infinity className="h-4 w-4" />
                SPEZIALISIERUNG
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Dualseelen & intensive Seelenverbindungen
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Begleitung durch den Sturm – für Klarheit, Halt und inneres Wachstum
              </p>
            </div>
          </div>
        </section>

        {/* Emotionaler Hook */}
        <section className="py-20">
          <div className="container max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Es gibt Begegnungen, die unser Leben von einer Sekunde auf die andere auf den Kopf stellen. Wenn du das Gefühl hast, deinem <strong>"Spiegel"</strong> begegnet zu sein, erlebst du wahrscheinlich die intensivste Zeit deines Lebens: Ein Wechselbad aus tiefer Verbundenheit und schmerzhafter Zurückweisung, aus höchster Euphorie und tiefster Verzweiflung.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mt-6">
                Oft stößt man im klassischen Umfeld auf Unverständnis. <em>"Lass ihn/sie doch einfach los"</em>, heißt es dann. Doch wer diese Dynamik kennt, weiß: Es ist nicht "einfach".
              </p>
            </div>
          </div>
        </section>

        {/* Der Ansatz */}
        <section className="py-20 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Heart className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">Der Ansatz</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  In diesem speziellen Bereich meiner Arbeit verlassen wir den klassischen, klinisch-therapeutischen Rahmen. Hier arbeite ich mit dir nicht an der <strong>"Behandlung einer Störung"</strong>, sondern wir nutzen diese intensive Erfahrung als <strong>Katalysator für deine persönliche und spirituelle Weiterentwicklung</strong>.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground mt-6">
                  Als dein Wegbegleiter helfe ich dir, die Dynamik zwischen "Loslasser" und "Gefühlsklärer" zu verstehen, aus der Opferrolle auszusteigen und den Fokus wieder auf die wichtigste Person in deinem Leben zu richten: <strong>Dich selbst</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Was wir gemeinsam erarbeiten */}
        <section className="py-20">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Was wir gemeinsam erarbeiten</h2>
              <p className="text-lg text-muted-foreground">
                Die Coaching-Ziele für deine persönliche Transformation
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Mustererkennung */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Mustererkennung</h3>
                      <p className="text-muted-foreground">
                        Warum triggert dich dieser Mensch so sehr? Welche alten Wunden werden berührt?
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emotionale Stabilität */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Emotionale Stabilität</h3>
                      <p className="text-muted-foreground">
                        Werkzeuge, um in den Phasen des Rückzugs oder der Trennung nicht den Boden unter den Füßen zu verlieren
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Auflösung von Abhängigkeiten */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Infinity className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Auflösung von Abhängigkeiten</h3>
                      <p className="text-muted-foreground">
                        Der Weg von der bedürftigen Anhaftung hin zu einer freien, bedingungslosen Liebe (und Selbstliebe)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sinnfindung */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Sinnfindung</h3>
                      <p className="text-muted-foreground">
                        Verstehen, welche Lernaufgabe hinter dieser Begegnung für deine Seele steckt
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="bg-background rounded-lg p-8 border-2 border-secondary/20">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Infinity className="h-5 w-5 text-secondary" />
                Hinweis zur Einordnung dieses Angebots
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Die Begleitung bei Dualseelen-Prozessen und spirituellen Krisen versteht sich als <strong>psychologische Beratung und Coaching (Lebenshilfe)</strong>. Sie dient der Persönlichkeitsentwicklung und Selbsterfahrung.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sie ersetzt keine Psychotherapie bei Krankheitswert (wie z.B. schweren klinischen Depressionen oder Psychosen). Sollten wir im Gespräch feststellen, dass eine therapeutische Behandlung notwendig ist, wechseln wir nach Absprache den Rahmen in meine Tätigkeit als Heilpraktiker für Psychotherapie.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Bereit für den ersten Schritt?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Vereinbaren Sie ein kostenloses Erstgespräch (15 Min) oder buchen Sie direkt eine Beratungssitzung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={LEMNISCUS_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={trackAppointmentClick}>
                <Button size="lg" className="gap-2">
                  Termin vereinbaren
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <Link href="/kontakt">
                <Button size="lg" variant="outline">
                  Kontakt aufnehmen
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
