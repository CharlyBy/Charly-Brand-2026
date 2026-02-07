import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { openLunaChat } from "@/const";
import SEO from "@/components/SEO";

export default function FAQ() {
  const faqs = [
    {
      question: "Was ist Luna und wie funktioniert sie?",
      answer:
        "Luna ist meine KI-Assistentin, die dir hilft, dein Thema zu klären und den passenden nächsten Schritt zu finden. Sie stellt dir ein paar Fragen (5-10 Minuten), erkennt deinen Persönlichkeitstyp und empfiehlt dir, ob eine personalisierte Trance oder ein persönliches Gespräch mit mir sinnvoller ist. Das Gespräch ist komplett kostenlos und anonym möglich.",
    },
    {
      question: "Ist das Gespräch mit Luna wirklich kostenlos?",
      answer:
        "Ja, absolut. Das Gespräch mit Luna ist komplett kostenlos und unverbindlich. Du musst dich nicht anmelden und kannst anonym bleiben. Nur wenn du dich für eine Trance (29€) oder ein persönliches Gespräch entscheidest, fallen Kosten an.",
    },
    {
      question: "Was ist eine personalisierte Trance?",
      answer:
        "Eine personalisierte Trance ist eine individuell auf dich zugeschnittene Hypnose-Session, die ich basierend auf deinem Luna-Gespräch erstelle. Sie eignet sich für leichte Themen wie Stress, Ängste, Schlafprobleme oder Raucherentwöhnung. Du erhältst eine Audio-Datei (MP3), die du unbegrenzt nutzen kannst. Kosten: 29€ einmalig.",
    },
    {
      question: "Für welche Themen ist die Trance geeignet?",
      answer:
        "Die Trance eignet sich für leichte bis mittelschwere Themen wie Stressabbau, leichte Ängste (z.B. Prüfungsangst, Flugangst), Schlafprobleme, Selbstwert-Stärkung, Raucherentwöhnung oder Gewichtsreduktion. Für tiefere Themen wie Depressionen, Traumata oder schwere Angststörungen empfehle ich ein persönliches Gespräch.",
    },
    {
      question: "Wie läuft ein persönliches Gespräch ab?",
      answer:
        "Wir starten mit einem kostenlosen Erstgespräch (15 Minuten), in dem wir klären, ob die Chemie stimmt und wie ich dir helfen kann. Danach vereinbaren wir reguläre Sitzungen (60 Minuten, 129€). Diese können vor Ort oder online (Video) stattfinden. Ich arbeite mit Hypnose, systemischer Therapie und dem Enneagramm.",
    },
    {
      question: "Ist das Erstgespräch wirklich kostenlos?",
      answer:
        "Ja, das Erstgespräch (15 Minuten) ist komplett kostenlos. Es dient dazu, dass wir uns kennenlernen und schauen, ob wir gut zusammenarbeiten können. Erst wenn du dich für eine reguläre Sitzung entscheidest, fallen Kosten an (129€ pro Stunde).",
    },
    {
      question: "Werden die Kosten von der Krankenkasse übernommen?",
      answer:
        "Als Heilpraktiker für Psychotherapie rechne ich nicht direkt mit den gesetzlichen Krankenkassen ab. Einige private Krankenversicherungen oder Zusatzversicherungen übernehmen die Kosten teilweise oder vollständig. Bitte kläre das vorab mit deiner Versicherung. Ich stelle dir eine Rechnung aus, die du einreichen kannst.",
    },
    {
      question: "Wie sicher sind meine Daten?",
      answer:
        "Deine Daten sind bei mir sicher. Alle Gespräche mit Luna werden verschlüsselt übertragen und nach 30 Tagen automatisch gelöscht. Du kannst das Gespräch auch komplett anonym führen (ohne E-Mail). Wenn du eine Trance kaufst oder einen Termin buchst, benötige ich deine E-Mail – aber auch diese wird DSGVO-konform gespeichert und nicht weitergegeben.",
    },
    {
      question: "Was passiert, wenn Luna ein Notfall-Thema erkennt?",
      answer:
        "Wenn Luna erkennt, dass es dir sehr schlecht geht (z.B. Suizidgedanken), zeigt sie dir sofort Notfall-Kontakte (Telefonseelsorge, Notarzt) und informiert mich. Ich melde mich dann so schnell wie möglich bei dir. Deine Sicherheit hat oberste Priorität.",
    },
    {
      question: "Kann ich die Trance mehrmals anhören?",
      answer:
        "Ja, absolut! Die Trance ist eine MP3-Datei, die du nach dem Kauf unbegrenzt oft anhören kannst. Viele Menschen hören sie täglich oder mehrmals pro Woche, um die Wirkung zu verstärken.",
    },
    {
      question: "Wie lange dauert eine Therapie-Sitzung?",
      answer:
        "Eine reguläre Sitzung dauert 60 Minuten. Je nach Thema und Bedarf können wir auch längere Sitzungen (90 oder 120 Minuten) vereinbaren. Das Erstgespräch dauert 15 Minuten und ist kostenlos.",
    },
    {
      question: "Kann ich auch online Termine wahrnehmen?",
      answer:
        "Ja, ich biete sowohl Vor-Ort-Termine als auch Online-Sitzungen per Video an. Beides ist gleichermaßen wirksam – du entscheidest, was für dich besser passt.",
    },
  ];

  return (
    <>
      <SEO
        title="FAQ"
        description="Häufig gestellte Fragen zur Psychotherapie, Hypnose und therapeutischen Begleitung bei Charly Brand. Antworten zu Ablauf, Kosten, Online-Terminen und mehr."
      />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Häufig gestellte Fragen
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hier findest du Antworten auf die wichtigsten Fragen zu Luna, der
              personalisierten Trance und den persönlichen Sitzungen.
            </p>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-20">
          <div className="container max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Noch Fragen?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Wenn deine Frage hier nicht beantwortet wurde, sprich einfach mit
                Luna oder kontaktiere mich direkt.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2" onClick={openLunaChat}>
                  <MessageCircle className="h-5 w-5" />
                  Mit Luna sprechen
                </Button>
                <Button size="lg" variant="outline">
                  Kontakt aufnehmen
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
