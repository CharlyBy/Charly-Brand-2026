import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Baby, Heart, Cloud, Zap, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { LEMNISCUS_BOOKING_URL } from "@/const";
import { trackAppointmentClick } from "@/lib/analytics";
import SEO from "@/components/SEO";

export default function Psychotherapie() {
  return (
    <>
      <SEO
        title="Psychotherapie | Heilpraktiker für Psychotherapie"
        description="Heilpraktiker für Psychotherapie Charly Brand - Professionelle Behandlung von Ängsten, Phobien, Depressionen, Traumata und chronischen Schmerzen. Hypnose und Innere-Kind-Arbeit für nachhaltige Veränderung."
      />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container text-center">
            <p className="text-primary font-semibold mb-2 uppercase tracking-wide">
              HEILKUNDE
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Psychotherapie
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professionelle therapeutische Begleitung bei psychischen Belastungen und Erkrankungen
            </p>
          </div>
        </section>

        {/* Leistungen Grid */}
        <section className="py-20">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Innere-Kind-Arbeit */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Baby className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-2">
                        EMPFOHLEN
                      </span>
                      <h3 className="text-2xl font-bold">Innere-Kind-Arbeit</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4 font-medium">
                    Integration alter emotionaler Verletzungen
                  </p>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      Das innere Kind repräsentiert die Summe aller Erfahrungen, Gefühle und Prägungen aus unserer Kindheit. Oft tragen wir unverarbeitete emotionale Verletzungen mit uns, die unser heutiges Leben beeinflussen – in Beziehungen, im Selbstwertgefühl und in unserer Fähigkeit, Nähe zuzulassen.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      In der Inneren-Kind-Arbeit begeben wir uns auf eine achtsame Reise zu diesen frühen Erfahrungen. Durch gezielte Hypnose und therapeutische Gespräche lernen Sie, Ihr inneres Kind wahrzunehmen, seine Bedürfnisse zu verstehen und alte Verletzungen therapeutisch aufzuarbeiten.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ängste & Phobien */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Ängste & Phobien</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4 font-medium">
                    Befreiung von belastenden Ängsten
                  </p>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      Ängste und Phobien können das Leben massiv einschränken – sei es die Angst vor sozialen Situationen, vor Höhen, Enge oder vor bestimmten Tieren. Oft wissen Betroffene rational, dass die Angst unbegründet ist, doch das Gefühl lässt sich nicht einfach „wegdenken".
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Hypnose ist eine der effektivsten Methoden zur Behandlung von Ängsten und Phobien. Im entspannten Zustand der Trance können wir direkt mit dem Unbewussten arbeiten, alte Verknüpfungen lösen und neue, hilfreiche Reaktionsmuster etablieren.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Depressionen & Traumata */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Cloud className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Depressionen & Traumata</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4 font-medium">
                    Sanfte Bearbeitung depressiver Verstimmungen
                  </p>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      Depressionen und traumatische Erlebnisse können das Leben in eine dunkle Phase tauchen. Oft fühlt es sich an, als wäre man in einem Tunnel gefangen, aus dem es keinen Ausweg gibt.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      In der Therapie arbeiten wir gemeinsam daran, die Ursachen zu verstehen und neue Perspektiven zu entwickeln. Durch Hypnose, systemische Ansätze und achtsame Gesprächsführung finden wir Wege aus der Dunkelheit zurück ins Licht.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Schmerzlinderung */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Schmerzlinderung</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4 font-medium">
                    Hypnotische Schmerztherapie
                  </p>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      Chronische Schmerzen können das Leben zur Qual machen. Oft sind sie nicht nur körperlich, sondern auch psychosomatisch bedingt – das heißt, sie entstehen durch eine Wechselwirkung zwischen Körper und Psyche.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Hypnose ist eine anerkannte Methode zur Schmerzlinderung. Im Trancezustand können wir die Schmerzwahrnehmung beeinflussen und neue Strategien zur Schmerzbewältigung entwickeln.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <h2 className="text-3xl font-bold mb-4">Bereit für den ersten Schritt?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Vereinbaren Sie ein kostenloses Erstgespräch (15 Min) oder buchen Sie direkt eine Therapiesitzung.
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
          </div>
        </section>

        {/* Hinweis */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="bg-background rounded-lg p-6 border border-border">
              <h3 className="font-semibold text-lg mb-3">Wichtiger Hinweis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Die psychotherapeutische Behandlung bei Krankheitswert (wie z.B. schweren klinischen Depressionen oder Psychosen) erfolgt im Rahmen meiner Tätigkeit als Heilpraktiker für Psychotherapie. Bei Bedarf wechseln wir nach Absprache den Rahmen.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
