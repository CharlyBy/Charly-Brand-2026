import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Infinity, Clock, Scale, Cigarette, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { LEMNISCUS_BOOKING_URL } from "@/const";
import { trackAppointmentClick } from "@/lib/analytics";
import SEO from "@/components/SEO";

export default function Coaching() {
  return (
    <>
      <SEO
        title="Coaching & Beratung | Psychologische Beratung"
        description="Psychologische Beratung und Coaching für Persönlichkeitsentwicklung - Dualseelen-Begleitung, Rückführungen, Rauchentwöhnung mit Hypnose, Gewichtsreduktion. Spirituelle Wegbegleitung und Lebenshilfe."
      />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-secondary/5 to-primary/5">
          <div className="container text-center">
            <p className="text-secondary font-semibold mb-2 uppercase tracking-wide">
              LEBENSHILFE & SPIRITUALITÄT
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Coaching & Beratung
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Psychologische Beratung und Coaching für Persönlichkeitsentwicklung und spirituelle Wegbegleitung
            </p>
          </div>
        </section>

        {/* Leistungen Grid */}
        <section className="py-20">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Dualseelen-Partnerschaften */}
              <Card className="hover:shadow-lg transition-shadow border-2 border-secondary/20">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Infinity className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <span className="inline-block bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 rounded-full mb-2">
                        SPEZIALISIERT
                      </span>
                      <h3 className="text-2xl font-bold">Dualseelen-Partnerschaften</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4 font-medium">
                    Begleitung intensiver Seelenverbindungen
                  </p>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      Expertise in der Begleitung intensiver Seelenverbindungen und Zwillingsseelen-Beziehungen. Diese besonderen Begegnungen können das Leben auf den Kopf stellen und erfordern eine einfühlsame Begleitung.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      In diesem Bereich verlassen wir den klinischen Kontext und widmen uns Ihrer spirituellen und persönlichen Weiterentwicklung.
                    </p>
                    <Link href="/dualseelen">
                      <Button variant="outline" className="w-full mt-4 gap-2">
                        Mehr erfahren
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Rückführung */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Rückführung</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4 font-medium">
                    Bearbeitung tief liegender Muster
                  </p>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      Rückführungen zur Bearbeitung tief liegender Muster und Blockaden. Manchmal liegen die Ursachen für heutige Themen in früheren Lebensphasen oder – je nach Weltbild – in früheren Leben.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      In der hypnotischen Trance können wir diese Ebenen erforschen und transformieren. Diese Arbeit dient der Persönlichkeitsentwicklung und Selbsterfahrung.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Raucherentwöhnung */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Cigarette className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Raucherentwöhnung</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4 font-medium">
                    Nachhaltige Befreiung vom Rauchen
                  </p>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      Der Wunsch, mit dem Rauchen aufzuhören, ist oft da – doch die Umsetzung fällt schwer. Hypnose ist eine der effektivsten Methoden zur Raucherentwöhnung, weil sie direkt im Unbewussten ansetzt.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      In der hypnotischen Trance lösen wir die alten Verknüpfungen und etablieren neue, gesunde Muster. Viele Klienten berichten, dass sie nach der Hypnosesitzung kein Verlangen mehr nach Zigaretten verspüren. Ziel ist eine sanfte Unterstützung während der Entwöhnungsphase.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Gewichtsreduktion */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Scale className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Gewichtsreduktion</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4 font-medium">
                    Gesunde Gewichtsabnahme
                  </p>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      Gesunde Gewichtsabnahme durch Veränderung unbewusster Essensmuster. Oft sind es nicht mangelnde Disziplin oder fehlendes Wissen, die uns am Abnehmen hindern, sondern tief verankerte emotionale Muster.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      In der Hypnose können wir diese Muster aufdecken und verändern. Wir arbeiten daran, ein neues, gesundes Verhältnis zum Essen zu entwickeln – ohne Verzicht, sondern mit Freude und Genuss.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <h2 className="text-3xl font-bold mb-4">Bereit für Ihre persönliche Weiterentwicklung?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
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
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="bg-background rounded-lg p-6 border border-border">
              <h3 className="font-semibold text-lg mb-3">Hinweis zur Einordnung dieses Angebots</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Die Begleitung bei Dualseelen-Prozessen, Rückführungen und spirituellen Krisen versteht sich als <strong>psychologische Beratung und Coaching (Lebenshilfe)</strong>. Sie dient der Persönlichkeitsentwicklung und Selbsterfahrung.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sie ersetzt keine Psychotherapie bei Krankheitswert (wie z.B. schweren klinischen Depressionen oder Psychosen). Sollten wir im Gespräch feststellen, dass eine therapeutische Behandlung notwendig ist, wechseln wir nach Absprache den Rahmen in meine Tätigkeit als Heilpraktiker für Psychotherapie.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
