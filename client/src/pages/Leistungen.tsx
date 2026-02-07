import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle, Sparkles, Heart, Clock, Euro, Baby, Cloud, Cigarette, Scale, Zap, Infinity } from "lucide-react";
import { LEMNISCUS_BOOKING_URL, openLunaChat } from "@/const";
import { trackAppointmentClick } from "@/lib/analytics";
import SEO from "@/components/SEO";

export default function Leistungen() {
  return (
    <>
      <SEO
        title="Leistungen"
        description="Drei Wege zu Ihrer Transformation: Kostenloser KI-Chat mit Luna, personalisierte Hypnose-Audios (29€) oder persönliche Therapie (129€/Std). Finden Sie den passenden Einstieg."
      />
      <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Meine Leistungen
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Drei Wege, die zu deinem Thema passen – vom kostenlosen KI-Chat bis
            zur persönlichen Therapie-Sitzung.
          </p>
        </div>
      </section>

      {/* 3-Stufen-Modell */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Stufe 1: Luna Chat */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center text-2xl">
                  1. Kostenloser KI-Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    Kostenlos
                  </div>
                  <p className="text-sm text-muted-foreground">
                    5-10 Minuten
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Gespräch mit Luna, meiner KI-Assistentin
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Persönlichkeitstyp-Erkennung
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Themen-Klärung & Intensitäts-Check
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Empfehlung für den passenden nächsten Schritt
                    </span>
                  </li>
                </ul>

                <Button className="w-full" size="lg" onClick={openLunaChat}>
                  Jetzt starten
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Anonym möglich, keine Anmeldung erforderlich
                </p>
              </CardContent>
            </Card>

            {/* Stufe 2: Personalisierte Trance */}
            <Card className="border-2 border-secondary/20">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-center text-2xl">
                  2. Personalisierte Trance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-secondary mb-2">
                    29€
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Einmalig, Audio-Datei
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Individuell auf dich zugeschnittene Hypnose
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Für leichte Themen (Stress, Ängste, Raucherentwöhnung)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Basierend auf deinem Luna-Gespräch
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Download als MP3, unbegrenzt nutzbar
                    </span>
                  </li>
                </ul>

                <Button className="w-full" variant="outline" size="lg">
                  Mehr erfahren
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Zahlung per Stripe, sofortiger Download
                </p>
              </CardContent>
            </Card>

            {/* Stufe 3: Persönliche Sitzung */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center text-2xl">
                  3. Persönliche Sitzung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    129€
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pro Stunde (60 Min)
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Kostenloses Erstgespräch (15 Min)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Für tiefere, komplexe Themen
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Hypnose, systemische Therapie, Persönlichkeitsanalyse
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Persönlich vor Ort oder online (Video)
                    </span>
                  </li>
                </ul>

                <a href={LEMNISCUS_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={trackAppointmentClick} className="w-full">
                  <Button className="w-full" size="lg">
                    Termin buchen
                  </Button>
                </a>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Terminbuchung über Lemniscus
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wie funktioniert's */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            So funktioniert's
          </h2>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Starte mit Luna
                </h3>
                <p className="text-muted-foreground">
                  Sprich mit meiner KI-Assistentin Luna. Sie stellt dir ein paar
                  Fragen, um dein Thema und deine Persönlichkeit zu verstehen.
                  Das Gespräch dauert 5-10 Minuten und ist komplett kostenlos.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Erhalte eine Empfehlung
                </h3>
                <p className="text-muted-foreground">
                  Luna analysiert dein Thema und empfiehlt dir den passenden
                  nächsten Schritt: Eine personalisierte Trance (29€) für
                  leichte Themen oder ein persönliches Gespräch mit mir für
                  tiefere Anliegen.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Wähle deinen Weg
                </h3>
                <p className="text-muted-foreground">
                  Du entscheidest, welchen Weg du gehen möchtest. Ob Trance,
                  Erstgespräch oder einfach nur das Luna-Gespräch – du hast die
                  Kontrolle. Keine Verpflichtungen, keine Abos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Therapeutisches Leistungsspektrum */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold mb-2 uppercase tracking-wide">THERAPEUTISCHES LEISTUNGSSPEKTRUM</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Wobei ich Ihnen helfen kann
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Spezialisierte therapeutische Begleitung für Ihre individuellen Herausforderungen
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {/* Innere-Kind-Arbeit */}
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Baby className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      EMPFOHLEN
                    </span>
                    <h3 className="text-2xl font-bold mb-2">Innere-Kind-Arbeit</h3>
                    <p className="text-lg text-muted-foreground mb-4 font-medium">Integration alter emotionaler Verletzungen</p>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Das innere Kind repräsentiert die Summe aller Erfahrungen, Gefühle und Prägungen aus unserer Kindheit. Oft tragen wir unverarbeitete emotionale Verletzungen mit uns, die unser heutiges Leben beeinflussen – in Beziehungen, im Selbstwertgefühl und in unserer Fähigkeit, Nähe zuzulassen.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        In der Inneren-Kind-Arbeit begeben wir uns auf eine achtsame Reise zu diesen frühen Erfahrungen. Durch gezielte Hypnose und therapeutische Gespräche lernen Sie, Ihr inneres Kind wahrzunehmen, seine Bedürfnisse zu verstehen und alte Verletzungen therapeutisch aufzuarbeiten.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Diese Arbeit ermöglicht es Ihnen, sich von belastenden Mustern zu befreien und eine liebevolle Beziehung zu sich selbst aufzubauen. Sie lernen, sich selbst das zu geben, was Sie damals vielleicht vermisst haben: Verständnis, Geborgenheit und bedingungslose Liebe.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ängste & Phobien */}
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Ängste & Phobien</h3>
                    <p className="text-lg text-muted-foreground mb-4 font-medium">Befreiung von belastenden Ängsten</p>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Ängste und Phobien können das Leben erheblich einschränken. Ob Flugangst, Höhenangst, soziale Ängste oder Panikattacken – diese Reaktionen entstehen oft unbewusst und entziehen sich der rationalen Kontrolle.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Hypnosetherapie ist eine der wirksamsten Methoden zur Behandlung von Ängsten und Phobien. Im hypnotischen Zustand haben wir direkten Zugang zu den unbewussten Mustern, die diese Ängste aufrechterhalten.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Gemeinsam arbeiten wir daran, die Ursachen Ihrer Ängste zu verstehen und neue, hilfreiche Reaktionsmuster zu etablieren. Viele Klienten berichten bereits nach wenigen Sitzungen von einer deutlichen Verbesserung.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depressionen & Traumata */}
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Cloud className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Depressionen & Traumata</h3>
                    <p className="text-lg text-muted-foreground mb-4 font-medium">Sanfte Bearbeitung traumatischer Erlebnisse</p>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Depressive Verstimmungen und traumatische Erlebnisse können das Leben verdunkeln und uns von uns selbst entfremden. Therapeutische Begleitung kann Ihnen helfen, wieder Licht zu sehen.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        In der Arbeit mit Depressionen und Traumata nutze ich eine Kombination aus systemischer Therapie, Hypnose und achtsamkeitsbasierten Ansätzen. Traumata werden behutsam und in Ihrem Tempo bearbeitet.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Bei depressiven Verstimmungen arbeiten wir daran, negative Denkmuster zu erkennen und zu verändern, Ihre Ressourcen zu aktivieren und neue Perspektiven zu entwickeln.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raucherentwöhnung */}
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Cigarette className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Raucherentwöhnung</h3>
                    <p className="text-lg text-muted-foreground mb-4 font-medium">Nachhaltige Befreiung vom Rauchen</p>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Der Wunsch, mit dem Rauchen aufzuhören, ist oft da – doch die Umsetzung fällt schwer. Hypnose ist eine der effektivsten Methoden zur Raucherentwöhnung, weil sie direkt im Unbewussten ansetzt.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        In der hypnotischen Trance lösen wir die alten Verknüpfungen und etablieren neue, gesunde Muster. Viele Klienten berichten, dass sie nach der Hypnosesitzung kein Verlangen mehr nach Zigaretten verspüren. Ziel ist eine sanfte Unterstützung während der Entwöhnungsphase.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gewichtsreduktion */}
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Scale className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Gewichtsreduktion</h3>
                    <p className="text-lg text-muted-foreground mb-4 font-medium">Gesunde Gewichtsabnahme durch Verhaltensänderung</p>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Gewichtsprobleme sind selten nur eine Frage der Ernährung oder Bewegung. Oft spielen emotionale Faktoren, unbewusste Essensmuster und tief verwurzelte Überzeugungen eine entscheidende Rolle.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Hypnose zur Gewichtsreduktion arbeitet auf einer tieferen Ebene. Ziel ist es, Ihr natürliches Hunger- und Sättigungsgefühl wiederherzustellen und eine dauerhafte Veränderung Ihrer Beziehung zum Essen zu erreichen.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schmerzlinderung */}
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Schmerzlinderung</h3>
                    <p className="text-lg text-muted-foreground mb-4 font-medium">Hypnotische Schmerztherapie</p>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Chronische Schmerzen können das Leben zur Qual machen. Hypnose ist eine wissenschaftlich anerkannte Methode zur Schmerzlinderung. Im hypnotischen Zustand kann die Schmerzwahrnehmung direkt beeinflusst werden.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Durch gezielte Suggestionen und Visualisierungen können Schmerzen gelindert, die Schmerztoleranz erhöht und die Lebensqualität verbessert werden. Besonders wirksam ist Hypnose bei psychosomatischen Schmerzen.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rückführung */}
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Rückführung</h3>
                    <p className="text-lg text-muted-foreground mb-4 font-medium">Therapeutische Rückführungen</p>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Rückführungen sind eine tiefgreifende Methode, um Zugang zu unbewussten Erinnerungen und Erfahrungen zu bekommen, die unser heutiges Leben beeinflussen. In der hypnotischen Trance können wir zu früheren Lebensphasen zurückkehren.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Rückführungen eignen sich besonders zur Bearbeitung tief liegender Muster, unerklärlicher Ängste oder wiederkehrender Beziehungsprobleme. Diese Arbeit erfordert Vertrauen und Offenheit.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dualseelen-Partnerschaften */}
            <Card className="border-l-4 border-l-secondary hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Infinity className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      SPEZIALISIERT
                    </span>
                    <h3 className="text-2xl font-bold mb-2">Dualseelen-Partnerschaften</h3>
                    <p className="text-lg text-muted-foreground mb-4 font-medium">Expertise in intensiven Seelenverbindungen</p>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Dualseelen- oder Zwillingsseelen-Beziehungen gehören zu den intensivsten und transformativsten Erfahrungen, die ein Mensch machen kann. Diese Verbindungen sind geprägt von tiefer Anziehung, aber auch von Herausforderungen, die an die Substanz gehen.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        In der Begleitung von Dualseelen-Beziehungen bringe ich nicht nur therapeutische Expertise mit, sondern auch ein tiefes Verständnis für die spirituellen und energetischen Dimensionen dieser Verbindungen.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Ob Sie sich in der Phase der Trennung, der Annäherung oder der Integration befinden – ich helfe Ihnen, Ihren eigenen Weg zu finden, zu heilen und zu wachsen.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Bereit für den ersten Schritt?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Starte jetzt mit einem kostenlosen Gespräch mit Luna.
            </p>
            <Button size="lg" className="gap-2" onClick={openLunaChat}>
              <MessageCircle className="h-5 w-5" />
              Mit Luna sprechen
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
