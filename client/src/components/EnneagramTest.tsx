import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AnalysisDisplay from "./AnalysisDisplay";
import { generateAnalysisPDF } from "@/lib/generateAnalysisPDF";

// Import questions from backend (we'll fetch them via tRPC)
// For now, hardcode the 20 questions with proper format

interface Answer {
  text: string;
  types: number[];
}

interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

// 20 Enneagram questions matching backend format
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Wie gehst du typischerweise mit Stress um?",
    answers: [
      { text: "Ich werde sehr aktiv und versuche, alles zu kontrollieren", types: [8, 1, 3] },
      { text: "Ich ziehe mich zurück und suche Ruhe", types: [5, 9, 4] },
      { text: "Ich suche Unterstützung bei anderen", types: [2, 6, 7] },
    ],
  },
  {
    id: 2,
    text: "Was motiviert dich am meisten in Beziehungen?",
    answers: [
      { text: "Anderen zu helfen und gebraucht zu werden", types: [2, 1] },
      { text: "Ehrlichkeit und tiefe Verbindungen", types: [4, 8, 5] },
      { text: "Harmonie und Frieden zu bewahren", types: [9, 6] },
      { text: "Spaß zu haben und neue Erfahrungen zu teilen", types: [7, 3] },
    ],
  },
  {
    id: 3,
    text: "Wie reagierst du auf Kritik?",
    answers: [
      { text: "Ich nehme sie ernst und arbeite an Verbesserungen", types: [1, 6] },
      { text: "Ich fühle mich verletzt und ziehe mich zurück", types: [4, 5] },
      { text: "Ich rechtfertige mich oder greife an", types: [8, 3] },
      { text: "Ich versuche die Situation zu glätten", types: [2, 9, 7] },
    ],
  },
  {
    id: 4,
    text: "Was beschreibt deinen Umgang mit Regeln am besten?",
    answers: [
      { text: "Regeln sind wichtig und sollten befolgt werden", types: [1, 6] },
      { text: "Regeln sind Richtlinien, können aber gebrochen werden", types: [7, 8, 3] },
      { text: "Ich mag keine starren Regeln und bevorzuge Flexibilität", types: [4, 5] },
      { text: "Regeln sind okay, solange sie keinen Konflikt verursachen", types: [9, 2] },
    ],
  },
  {
    id: 5,
    text: "Wie würdest du dein Verhältnis zu Emotionen beschreiben?",
    answers: [
      { text: "Ich erlebe Emotionen sehr intensiv", types: [4, 8] },
      { text: "Ich versuche Emotionen zu kontrollieren oder zu verstecken", types: [1, 5, 3] },
      { text: "Ich teile meine Emotionen gerne mit anderen", types: [2, 7] },
      { text: "Ich vermeide starke Emotionen, sie machen mich unruhig", types: [9, 6] },
    ],
  },
  {
    id: 6,
    text: "Was ist dein größter Antrieb im Leben?",
    answers: [
      { text: "Erfolg und Anerkennung zu erlangen", types: [3, 8] },
      { text: "Sicherheit und Stabilität zu finden", types: [6, 1] },
      { text: "Authentisch zu sein und verstanden zu werden", types: [4, 5] },
      { text: "Anderen zu helfen und geliebt zu werden", types: [2, 9] },
      { text: "Neue Erfahrungen zu sammeln und Spaß zu haben", types: [7] },
    ],
  },
  {
    id: 7,
    text: "Wie verhältst du dich in Konfliktsituationen?",
    answers: [
      { text: "Ich gehe sie direkt an und konfrontiere", types: [8, 1] },
      { text: "Ich vermeide sie und ziehe mich zurück", types: [9, 2] },
      { text: "Ich analysiere sie aus der Distanz", types: [5, 6] },
      { text: "Ich suche nach kreativen Lösungen", types: [7, 4, 3] },
    ],
  },
  {
    id: 8,
    text: "Was beschreibt deine Arbeitsweise am besten?",
    answers: [
      { text: "Perfektionistisch und detailorientiert", types: [1, 5] },
      { text: "Effizient und zielorientiert", types: [3, 8] },
      { text: "Kreativ und inspirationsgetrieben", types: [4, 7] },
      { text: "Kooperativ und hilfsbereit", types: [2, 6] },
      { text: "Entspannt und in meinem eigenen Tempo", types: [9] },
    ],
  },
  {
    id: 9,
    text: "Welche Eigenschaft schätzt du an dir selbst am meisten?",
    answers: [
      { text: "Zuverlässigkeit und Integrität", types: [1, 6] },
      { text: "Meine Fähigkeit, anderen zu helfen", types: [2] },
      { text: "Effizienz und Erfolg", types: [3] },
      { text: "Kreativität und Tiefe", types: [4, 5] },
      { text: "Optimismus und Vielseitigkeit", types: [7] },
      { text: "Stärke und Direktheit", types: [8] },
      { text: "Gelassenheit und Friedfertigkeit", types: [9] },
    ],
  },
  {
    id: 10,
    text: "Was ist deine größte Angst?",
    answers: [
      { text: "Fehlerhaft oder korrupt zu sein", types: [1] },
      { text: "Nicht geliebt oder gebraucht zu werden", types: [2] },
      { text: "Wertlos oder erfolglos zu sein", types: [3] },
      { text: "Keine Identität oder Bedeutung zu haben", types: [4] },
      { text: "Inkompetent oder hilflos zu sein", types: [5] },
      { text: "Ohne Unterstützung oder Orientierung zu sein", types: [6] },
      { text: "Eingeschränkt zu sein oder Schmerz zu erleiden", types: [7] },
      { text: "Verletzt oder kontrolliert zu werden", types: [8] },
      { text: "Verbindung oder Harmonie zu verlieren", types: [9] },
    ],
  },
  {
    id: 11,
    text: "Wie gehst du mit Fehlern um, die du gemacht hast?",
    answers: [
      { text: "Ich analysiere sie gründlich und lerne daraus", types: [1, 5] },
      { text: "Ich fühle mich schuldig und versuche es besser zu machen", types: [2, 6] },
      { text: "Ich akzeptiere sie und gehe weiter", types: [9, 7] },
      { text: "Ich versuche sie zu vertuschen oder zu rechtfertigen", types: [3, 8] },
    ],
  },
  {
    id: 12,
    text: "Was bedeutet Verantwortung für dich?",
    answers: [
      { text: "Eine Pflicht, die ich sehr ernst nehme", types: [1, 6] },
      { text: "Eine Chance, anderen zu helfen", types: [2] },
      { text: "Eine Last, die ich tragen muss", types: [4, 9] },
      { text: "Etwas, das ich gerne übernehme", types: [3, 8] },
    ],
  },
  {
    id: 13,
    text: "Wie triffst du wichtige Entscheidungen?",
    answers: [
      { text: "Ich wäge alle Optionen rational ab", types: [5, 1] },
      { text: "Ich höre auf mein Bauchgefühl", types: [8, 4] },
      { text: "Ich frage andere um Rat", types: [2, 6] },
      { text: "Ich vermeide Entscheidungen, wenn möglich", types: [9, 7] },
    ],
  },
  {
    id: 14,
    text: "Was ist dir in sozialen Situationen am wichtigsten?",
    answers: [
      { text: "Einen guten Eindruck zu machen", types: [3, 2] },
      { text: "Authentisch zu sein", types: [4, 8] },
      { text: "Anderen zu helfen und sie zu unterstützen", types: [2, 6] },
      { text: "Spaß zu haben und neue Leute kennenzulernen", types: [7, 3] },
    ],
  },
  {
    id: 15,
    text: "Wie gehst du mit deinen eigenen Bedürfnissen um?",
    answers: [
      { text: "Ich stelle sie oft zurück, um anderen zu helfen", types: [2, 9] },
      { text: "Ich achte darauf, dass sie erfüllt werden", types: [8, 3] },
      { text: "Ich bin mir meiner Bedürfnisse oft nicht bewusst", types: [9, 6] },
      { text: "Ich kämpfe dafür, dass sie erfüllt werden", types: [8, 1] },
    ],
  },
  {
    id: 16,
    text: "Was motiviert dich, morgens aufzustehen?",
    answers: [
      { text: "Meine Ziele und Ambitionen", types: [3, 8] },
      { text: "Die Menschen, die ich liebe", types: [2, 9] },
      { text: "Neue Möglichkeiten und Abenteuer", types: [7, 4] },
      { text: "Meine Pflichten und Verantwortungen", types: [1, 6] },
    ],
  },
  {
    id: 17,
    text: "Wie gehst du mit intensiven Gefühlen um?",
    answers: [
      { text: "Ich lasse sie zu und durchlebe sie", types: [4, 8] },
      { text: "Ich versuche sie zu kontrollieren oder zu unterdrücken", types: [1, 5] },
      { text: "Ich teile sie mit vertrauten Menschen", types: [2, 6] },
      { text: "Ich lenke mich ab", types: [7, 9, 3] },
    ],
  },
  {
    id: 18,
    text: "Was bedeutet Privatsphäre für dich?",
    answers: [
      { text: "Sehr wichtig – ich brauche viel Zeit für mich", types: [5, 4] },
      { text: "Wichtig, aber ich teile gerne mit engen Freunden", types: [6, 1] },
      { text: "Nicht so wichtig – ich bin gerne mit anderen zusammen", types: [2, 7, 3] },
    ],
  },
  {
    id: 19,
    text: "Wie würdest du deine Denkweise beschreiben?",
    answers: [
      { text: "Analytisch und systematisch", types: [5, 1] },
      { text: "Kreativ und assoziativ", types: [4, 7] },
      { text: "Praktisch und lösungsorientiert", types: [3, 8] },
      { text: "Intuitiv und gefühlsbetont", types: [2, 6, 9] },
    ],
  },
  {
    id: 20,
    text: "Wie gehst du mit Langeweile um?",
    answers: [
      { text: "Ich suche nach neuen Aktivitäten und Abenteuern", types: [7, 3] },
      { text: "Ich nutze die Zeit zur Reflexion", types: [5, 4] },
      { text: "Ich fühle mich unwohl und versuche sie zu vermeiden", types: [6, 8] },
      { text: "Ich genieße die Ruhe", types: [9, 1] },
    ],
  },
];

interface EnneagramTestProps {
  onComplete?: () => void;
}

export default function EnneagramTest({ onComplete }: EnneagramTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    questionId: number;
    selectedAnswer: Answer;
    answerIndex: number;
  }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [name, setName] = useState("");
  const [generatedAnalysis, setGeneratedAnalysis] = useState<any>(null);

  const analyzeMutation = trpc.luna.analyzeEnneagram.useMutation();
  const generateMutation = trpc.luna.generateAndSendAnalysis.useMutation();

  const progress = (answers.length / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[currentQuestion];

  // Check if current question is already answered
  const currentAnswer = answers.find((a) => a.questionId === currentQ.id);

  const handleAnswer = (answerIndex: number) => {
    const selectedAnswer = currentQ.answers[answerIndex];

    // Update or add answer
    const newAnswers = answers.filter((a) => a.questionId !== currentQ.id);
    newAnswers.push({
      questionId: currentQ.id,
      selectedAnswer,
      answerIndex,
    });
    setAnswers(newAnswers);

    // Auto-advance to next question
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.length < QUESTIONS.length) {
      toast.error("Bitte beantworte alle Fragen");
      return;
    }

    try {
      const result = await analyzeMutation.mutateAsync({
        conversationId: `web_test_${Date.now()}`,
        answers: answers.sort((a, b) => a.questionId - b.questionId),
      });

      console.log("[Enneagram Test] Analysis result:", result);
      setShowResults(true);
      
      // Automatically generate full analysis
      toast.info("Generiere deine personalisierte Analyse...");
      
      // Generate analysis without email (userEmail is optional)
      const analysisResult = await generateMutation.mutateAsync({
        conversationId: `web_test_${Date.now()}`,
        primaryType: result.primaryType,
        wing: result.wing,
        confidence: result.confidence,
        userName: name || "Besucher",
        answers,
      });

      console.log("[Enneagram Test] Generated analysis:", analysisResult);
      
      if (analysisResult.analysis) {
        setGeneratedAnalysis(analysisResult.analysis);
        setShowAnalysis(true);
        toast.success("Deine Analyse ist fertig!");
      }
      
      onComplete?.();
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Fehler bei der Analyse. Bitte versuche es erneut.");
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowAnalysis(false);
    setName("");
    setGeneratedAnalysis(null);
  };

  const handleDownloadPDF = () => {
    if (!generatedAnalysis || !analyzeMutation.data) {
      toast.error("Keine Analyse zum Herunterladen verf\u00fcgbar");
      return;
    }

    try {
      const result = analyzeMutation.data;
      generateAnalysisPDF({
        userName: name || "Besucher",
        primaryType: result.primaryType,
        wing: result.wing ? parseInt(result.wing) : null,
        confidence: result.confidence,
        analysis: generatedAnalysis,
      });
      toast.success("PDF wird heruntergeladen...");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Fehler beim Erstellen des PDFs");
    }
  };

  // Show full analysis
  if (showAnalysis && generatedAnalysis && analyzeMutation.data) {
    const result = analyzeMutation.data;

    return (
      <AnalysisDisplay
        primaryType={result.primaryType}
        wing={result.wing ? parseInt(result.wing) : null}
        confidence={result.confidence}
        analysisData={generatedAnalysis}
        userName={name || undefined}
        onDownloadPDF={handleDownloadPDF}
        onRestart={handleRestart}
      />
    );
  }

  // Show basic results (while generating analysis)
  if (showResults && analyzeMutation.data) {
    const result = analyzeMutation.data;

    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <h2 className="text-2xl font-bold">Generiere deine Analyse...</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Typ {result.primaryType}
                  {result.wing && ` mit Flügel ${result.wing}`}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Confidence:</span>
                  <Progress value={result.confidence * 100} className="w-32 h-2" />
                  <span>{(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ⏳ Bitte warte einen Moment, während wir deine personalisierte Analyse erstellen...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show questionnaire
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardContent className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Frage {answers.length} von {QUESTIONS.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">{currentQ.text}</h2>

            <div className="space-y-3">
              {currentQ.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary hover:bg-primary/5 ${
                    currentAnswer?.answerIndex === index
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  {answer.text}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Button>

            {answers.length === QUESTIONS.length ? (
              <Button onClick={handleSubmit} disabled={analyzeMutation.isPending}>
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  "Analyse starten"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentQuestion >= QUESTIONS.length - 1}
              >
                Weiter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
