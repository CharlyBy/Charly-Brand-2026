import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Heart, Brain, Sparkles, MessageCircle, Eye, Lightbulb, Zap, Star, Baby, Cloud, Cigarette, Scale, Clock, Infinity } from "lucide-react";
import { LEMNISCUS_BOOKING_URL, openLunaChat } from "@/const";
import { trackAppointmentClick, trackLunaChatOpenedFrom } from "@/lib/analytics";
import { useEffect, useRef, useState } from "react";
import SEO, { StructuredData, localBusinessSchema, personSchema } from "@/components/SEO";

// Befreiungsweg Card Component with Scroll Animation
interface BefreiungswegCardProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
  isLast?: boolean;
}

function BefreiungswegCard({ number, title, description, icon, delay, isLast }: BefreiungswegCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-6 flex items-start gap-4">
          {/* Icon */}
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
            isLast ? 'bg-secondary/10' : 'bg-primary/10'
          }`}>
            <div className={isLast ? 'text-secondary' : 'text-primary'}>
              {icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {/* Number */}
          <div className={`text-6xl font-bold opacity-20 absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none ${
            isLast ? 'text-secondary' : 'text-primary'
          }`}>
            {number}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SEO
        description="Professionelle Psychotherapie in Polling bei Weilheim. Hypnose, systemische Therapie und Persönlichkeitsanalyse für mehr Selbstverständnis und innere Freiheit. Online und vor Ort."
      />
      <StructuredData data={localBusinessSchema} />
      <StructuredData data={personSchema} />
      
      <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/labyrinth.jpg)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 text-center">
          <p className="text-primary font-semibold mb-4 text-lg">
            Wegbereiter & Wegbegleiter
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Dein Weg zu innerer Klarheit
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Psychotherapie, die dich versteht. Hypnose, die dich bewegt.
            Begleitung, die dich stärkt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => {
                trackLunaChatOpenedFrom("Home Footer CTA");
                openLunaChat();
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Jetzt mit Luna sprechen
            </Button>
            <a href={LEMNISCUS_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={trackAppointmentClick}>
              <Button size="lg" className="gap-2">
                Persönlichen Termin buchen
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Über Charly Teaser */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/images/charly.png"
                alt="Charly Brand"
                className="rounded-2xl shadow-lg w-full max-w-md mx-auto"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Über Charly Brand
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Als Heilpraktiker für Psychotherapie begleite ich Menschen auf
                ihrem Weg zu mehr Selbstverständnis und innerer Freiheit. Mit
                Hypnose, systemischer Therapie und tiefgehender Persönlichkeitsanalyse
                finden wir gemeinsam Lösungen, die zu dir passen.
              </p>
              <Link href="/ueber-charly">
                <Button variant="outline" className="gap-2">
                  Mehr über mich
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Leistungsspektrum Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-2 uppercase tracking-wide">LEISTUNGSSPEKTRUM</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Wobei ich Ihnen helfen kann
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Spezialisierte therapeutische Begleitung für Ihre Herausforderungen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Innere-Kind-Arbeit */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    EMPFOHLEN
                  </span>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Baby className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Innere-Kind-Arbeit</h3>
                <p className="text-muted-foreground text-sm">
                  Integration alter emotionaler Verletzungen durch achtsame Innere-Kind-Arbeit und Selbstliebe.
                </p>
              </CardContent>
            </Card>

            {/* Ängste & Phobien */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Ängste & Phobien</h3>
                <p className="text-muted-foreground text-sm">
                  Befreiung von belastenden Ängsten, Panikattacken und Phobien durch gezielte Hypnosetherapie.
                </p>
              </CardContent>
            </Card>

            {/* Depressionen & Traumata */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Depressionen & Traumata</h3>
                <p className="text-muted-foreground text-sm">
                  Sanfte Bearbeitung depressiver Verstimmungen und traumatischer Erlebnisse mit bewährten Methoden.
                </p>
              </CardContent>
            </Card>

            {/* Raucherentwöhnung */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Cigarette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Raucherentwöhnung</h3>
                <p className="text-muted-foreground text-sm">
                  Nachhaltige Befreiung vom Rauchen durch Hypnose – sanfte Unterstützung während der Entwöhnungsphase.
                </p>
              </CardContent>
            </Card>

            {/* Gewichtsreduktion */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Gewichtsreduktion</h3>
                <p className="text-muted-foreground text-sm">
                  Gesunde Gewichtsabnahme durch Veränderung unbewusster Essensmuster.
                </p>
              </CardContent>
            </Card>

            {/* Schmerzlinderung */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Schmerzlinderung</h3>
                <p className="text-muted-foreground text-sm">
                  Hypnotische Schmerztherapie bei chronischen Beschwerden und psychosomatischen Schmerzen.
                </p>
              </CardContent>
            </Card>

            {/* Rückführung */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Rückführung</h3>
                <p className="text-muted-foreground text-sm">
                  Therapeutische Rückführungen zur Bearbeitung tief liegender Muster und Blockaden.
                </p>
              </CardContent>
            </Card>

            {/* Dualseelen-Partnerschaften */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4">
                  <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    SPEZIALISIERT
                  </span>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Infinity className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Dualseelen-Partnerschaften</h3>
                <p className="text-muted-foreground text-sm">
                  Expertise in der Begleitung intensiver Seelenverbindungen und Zwillingsseelen-Beziehungen.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/leistungen">
              <Button size="lg" className="gap-2">
                Alle Leistungen entdecken
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview - 3 Schritte zur Veränderung */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-2 uppercase tracking-wide">Ihr Weg zu mir</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              In 3 Schritten zur Veränderung
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Wählen Sie den passenden Einstieg für Ihre persönliche Reise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Schritt 1: KI-Assistent */}
            <Card className="border-2 hover:border-primary/50 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                STUFE 1
              </div>
              <CardContent className="pt-8 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  KI-Assistent
                </h3>
                <div className="text-3xl font-bold text-primary mb-6">
                  Kostenlos
                </div>
                <ul className="text-left space-y-3 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Persönlichkeitsanalyse erhalten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Themen klären</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Erste Orientierung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Niedrigschwelliger Einstieg</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    trackLunaChatOpenedFrom("Home Befreiungsweg");
                    openLunaChat();
                  }}
                >
                  Mit Luna starten
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Perfekt für den ersten Kontakt
                </p>
              </CardContent>
            </Card>

            {/* Schritt 2: Personalisierte Trance */}
            <Card className="border-2 border-primary hover:border-primary transition-all relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                COMING SOON
              </div>
              <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                STUFE 2
              </div>
              <CardContent className="pt-8 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Personalisierte Trance
                </h3>
                <div className="text-3xl font-bold text-primary mb-6">
                  29€
                </div>
                <ul className="text-left space-y-3 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Individuell auf Sie abgestimmt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Professionelle Hypnose-Audio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Sofort verfügbar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Unbegrenzt nutzbar</span>
                  </li>
                </ul>
                <Link href="/leistungen">
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant="default"
                  >
                    Mehr erfahren
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  Ideal für erste tiefe Erfahrungen
                </p>
              </CardContent>
            </Card>

            {/* Schritt 3: Persönliche Arbeit */}
            <Card className="border-2 hover:border-primary/50 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                STUFE 3
              </div>
              <CardContent className="pt-8 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Persönliche Arbeit
                </h3>
                <div className="text-3xl font-bold text-primary mb-6">
                  129€<span className="text-sm font-normal">/Stunde</span>
                </div>
                <ul className="text-left space-y-3 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Erstgespräch kostenlos (15 Min)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Einzeltherapie individuell</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Online oder in Praxis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Persönlichkeitsanalyse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Langfristige Begleitung</span>
                  </li>
                </ul>
                <a href={LEMNISCUS_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={trackAppointmentClick}>
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant="outline"
                  >
                    Termin vereinbaren
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-3">
                  Für nachhaltige Transformation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Befreiungsweg Teaser - New Card Design */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold mb-2 uppercase tracking-wider">MEIN ANSATZ</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Der Befreiungsweg
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ein ganzheitlicher 5-Ebenen-Prozess zur Transformation und
              persönlichen Freiheit
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Ebene 1 - Wahrnehmung */}
            <BefreiungswegCard
              number="01"
              title="Wahrnehmung"
              description="Wo stehst du gerade? Mental, emotional, physiologisch – wir erfassen deine aktuelle Situation."
              icon={<Eye className="h-6 w-6" />}
              delay={0}
            />

            {/* Ebene 2 - Bedürfnisse */}
            <BefreiungswegCard
              number="02"
              title="Bedürfnisse"
              description="Was brauchst du wirklich? Besonders in Beziehungen und für deine persönliche Sicherheit."
              icon={<Heart className="h-6 w-6" />}
              delay={100}
            />

            {/* Ebene 3 - Bewusstsein */}
            <BefreiungswegCard
              number="03"
              title="Bewusstsein"
              description="Erkenne deine Muster und Werte. Verstehe, was dich wirklich antreibt und wo Defizite liegen."
              icon={<Lightbulb className="h-6 w-6" />}
              delay={200}
            />

            {/* Ebene 4 - Handlung */}
            <BefreiungswegCard
              number="04"
              title="Handlung"
              description="Jetzt wird es konkret: Seminare, Coaching, Therapie – wir finden den richtigen Weg für dich."
              icon={<Zap className="h-6 w-6" />}
              delay={300}
            />

            {/* Ebene 5 - Entfaltung */}
            <BefreiungswegCard
              number="05"
              title="Entfaltung"
              description="Integration aller Ebenen. Du lebst dein Potenzial und gehst deinen eigenen Weg."
              icon={<Star className="h-6 w-6" />}
              delay={400}
              isLast
            />
          </div>

          <div className="text-center mt-12">
            <Link href="/befreiungsweg">
              <Button variant="outline" size="lg">
                Mehr über den Befreiungsweg
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Luna CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              <img
                src="/images/luna.jpeg"
                alt="Luna"
                className="h-24 w-24 rounded-full mx-auto shadow-lg"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lerne Luna kennen
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Luna ist meine digitale Assistentin. Sie führt dich durch ein
              kurzes Gespräch, um zu verstehen, was dich bewegt – und empfiehlt
              dir den passenden nächsten Schritt.
            </p>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => {
                trackLunaChatOpenedFrom("Home Hero");
                openLunaChat();
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Kostenlos mit Luna sprechen
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
