import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { LEMNISCUS_BOOKING_URL, openLunaChat } from "@/const";
import { trackAppointmentClick, trackContactFormSubmit } from "@/lib/analytics";

export default function Kontakt() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFormMutation = trpc.contact.submitForm.useMutation({
    onSuccess: () => {
      trackContactFormSubmit();
      toast.success("Nachricht gesendet! Ich melde mich bald bei dir.");
      setFormData({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Senden. Bitte versuche es erneut.");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    submitFormMutation.mutate(formData);
  };

  return (
    <>
      <SEO
        title="Kontakt"
        description="Kontaktieren Sie Charly Brand - Heilpraktiker für Psychotherapie in Polling. Telefon: 0179 2012051, WhatsApp verfügbar. Kostenlose Erstgespräche online."
      />
      <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Kontakt</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Du hast Fragen oder möchtest direkt einen Termin vereinbaren? Ich
            freue mich auf deine Nachricht.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Mit Luna sprechen</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Starte ein kostenloses Gespräch mit meiner KI-Assistentin.
                </p>
                <Button className="w-full">Jetzt starten</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Termin buchen</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Buche direkt ein kostenloses Erstgespräch (15 Min).
                </p>
                <a href={LEMNISCUS_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={trackAppointmentClick} className="w-full">
                  <Button variant="outline" className="w-full">
                    Zur Terminbuchung
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">E-Mail schreiben</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Nutze das Kontaktformular unten für deine Nachricht.
                </p>
                <Button variant="outline" className="w-full" onClick={openLunaChat}>
                  Mit Luna starten
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form & Info */}
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Schreib mir</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Dein Name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="deine@email.de"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Nachricht</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Deine Nachricht an mich..."
                    rows={6}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Wird gesendet..." : "Nachricht senden"}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Kontaktinformationen</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Charly Brand</h3>
                  <p className="text-muted-foreground">
                    Heilpraktiker für Psychotherapie
                  </p>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">E-Mail</p>
                      <a
                        href="mailto:kontakt@charlybrand.de"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        kontakt@charlybrand.de
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Praxis</p>
                      <p className="text-muted-foreground">
                        Online-Sitzungen per Video
                        <br />
                        oder vor Ort nach Vereinbarung
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold mb-3">Sprechzeiten</h3>
                  <p className="text-muted-foreground text-sm">
                    Termine nach Vereinbarung
                    <br />
                    Montag - Freitag: 9:00 - 18:00 Uhr
                    <br />
                    Samstag: Nach Absprache
                  </p>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold mb-3">Notfall</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Bei akuten Krisen wende dich bitte an:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>
                      <strong>Telefonseelsorge:</strong>{" "}
                      <a
                        href="tel:08001110111"
                        className="text-primary hover:underline"
                      >
                        0800 111 0 111
                      </a>
                    </li>
                    <li>
                      <strong>Notarzt:</strong>{" "}
                      <a
                        href="tel:112"
                        className="text-primary hover:underline"
                      >
                        112
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
