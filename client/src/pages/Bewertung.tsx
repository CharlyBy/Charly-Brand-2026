import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Star, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import LunaChat from "../components/LunaChat";

export default function Bewertung() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymityLevel, setAnonymityLevel] = useState<"full" | "first_initial" | "initials" | "anonymous">("first_initial");
  const [submitted, setSubmitted] = useState(false);
  const [showLunaChat, setShowLunaChat] = useState(false);

  const submitMutation = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Bewertung eingereicht!", {
        description: "Vielen Dank für dein Feedback. Ich werde es prüfen und dann freigeben.",
        duration: 8000,
      });
    },
    onError: (error) => {
      toast.error("Fehler", {
        description: error.message || "Bewertung konnte nicht gesendet werden.",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Sternebewertung fehlt", {
        description: "Bitte wähle eine Bewertung von 1-5 Sternen.",
        duration: 3000,
      });
      return;
    }

    submitMutation.mutate({
      rating,
      text: text.trim() || undefined,
      name,
      email,
      anonymityLevel,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Vielen Dank!</CardTitle>
            <CardDescription className="text-base">
              Deine Bewertung wurde erfolgreich eingereicht. Ich werde sie prüfen und dann auf der Website veröffentlichen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full"
            >
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Deine Bewertung
          </h1>
          <p className="text-lg text-gray-600">
            Dein Feedback hilft anderen Menschen, den Mut zu fassen, ihre Themen anzugehen.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bewertung abgeben</CardTitle>
            <CardDescription>
              Alle Felder außer "Deine Erfahrung" sind Pflichtfelder. Deine E-Mail-Adresse wird nicht veröffentlicht.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div>
                <Label>Sternebewertung *</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none focus:ring-2 focus:ring-violet-500 rounded"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {rating === 5 && "Hervorragend! ⭐"}
                    {rating === 4 && "Sehr gut! 👍"}
                    {rating === 3 && "Gut 🙂"}
                    {rating === 2 && "Okay"}
                    {rating === 1 && "Verbesserungswürdig"}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <Label htmlFor="text">Deine Erfahrung (optional)</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Was hat dir besonders geholfen? Was hat sich verändert?"
                  maxLength={500}
                  rows={5}
                  className="mt-2"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    {text.length}/500 Zeichen
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLunaChat(true)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Luna um Hilfe bitten
                  </Button>
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Dein Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Max Mustermann"
                  required
                  maxLength={100}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  <strong>Nur für interne Zwecke.</strong> Wird nicht auf der Website angezeigt.
                </p>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Deine E-Mail-Adresse *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@beispiel.de"
                  required
                  maxLength={255}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Wird nicht veröffentlicht. Dient zur Verhinderung von Spam.
                </p>
              </div>

              {/* Anonymity Level */}
              <div>
                <Label>Wie soll dein Kommentar öffentlich signiert sein? *</Label>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  Du hast die Auswahl zwischen:
                </p>
                <RadioGroup
                  value={anonymityLevel}
                  onValueChange={(value: "full" | "first_initial" | "initials" | "anonymous") =>
                    setAnonymityLevel(value)
                  }
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="full" id="full" className="mt-1" />
                    <Label htmlFor="full" className="flex-1 cursor-pointer">
                      <div className="font-medium">Vollständiger Name</div>
                      <div className="text-sm text-gray-500">Vorschau: "Max Mustermann"</div>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="first_initial" id="first_initial" className="mt-1" />
                    <Label htmlFor="first_initial" className="flex-1 cursor-pointer">
                      <div className="font-medium">Vorname + Nachname-Initial</div>
                      <div className="text-sm text-gray-500">Vorschau: "Max M."</div>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="initials" id="initials" className="mt-1" />
                    <Label htmlFor="initials" className="flex-1 cursor-pointer">
                      <div className="font-medium">Nur Initialen</div>
                      <div className="text-sm text-gray-500">Vorschau: "M. M."</div>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="anonymous" id="anonymous" className="mt-1" />
                    <Label htmlFor="anonymous" className="flex-1 cursor-pointer">
                      <div className="font-medium">Anonym</div>
                      <div className="text-sm text-gray-500">Vorschau: "Anonymer Klient"</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Wird gesendet..." : "Bewertung absenden"}
                </Button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Mit dem Absenden bestätigst du, dass deine Bewertung auf der Website veröffentlicht werden darf.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Luna Chat für Bewertungshilfe */}
      {showLunaChat && <LunaChat context="review" />}
    </div>
  );
}
