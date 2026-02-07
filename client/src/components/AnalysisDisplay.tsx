import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Baby, 
  Sparkles, 
  AlertCircle, 
  Heart, 
  TrendingUp,
  Download,
  Mail,
  CheckCircle
} from "lucide-react";

interface AnalysisSection {
  title: string;
  content: string;
}

interface AnalysisData {
  description: string;
  childhood_patterns: string;
  strengths: string;
  challenges: string;
  relationships: string;
  development_tips: string;
}

interface AnalysisDisplayProps {
  primaryType: number;
  wing: number | null;
  confidence: number;
  analysisData: AnalysisData;
  userName?: string;
  onDownloadPDF?: () => void;
  onRestart?: () => void;
}

const SECTION_ICONS = {
  description: User,
  childhood_patterns: Baby,
  strengths: Sparkles,
  challenges: AlertCircle,
  relationships: Heart,
  development_tips: TrendingUp,
};

const SECTION_TITLES = {
  description: "Dein Persönlichkeitstyp",
  childhood_patterns: "Kindheitsprägung",
  strengths: "Deine Stärken",
  challenges: "Deine Herausforderungen",
  relationships: "Beziehungsverhalten",
  development_tips: "Entwicklungstipps",
};

export default function AnalysisDisplay({
  primaryType,
  wing,
  confidence,
  analysisData,
  userName,
  onDownloadPDF,
  onRestart,
}: AnalysisDisplayProps) {
  const sections: Array<keyof AnalysisData> = [
    "description",
    "childhood_patterns",
    "strengths",
    "challenges",
    "relationships",
    "development_tips",
  ];

  // Format markdown-style bold text
  const formatText = (text: string) => {
    // Replace **text** with <strong>text</strong>
    return text.split(/(\*\*[^*]+\*\*)/).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">
                {userName ? `${userName}, deine` : "Deine"} Persönlichkeitsanalyse
              </h1>
              <p className="text-muted-foreground mt-1">
                Basierend auf dem Enneagramm-Modell
              </p>
            </div>
          </div>

          {/* Type Badge */}
          <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Dein Typ</div>
              <div className="text-2xl font-bold">
                Typ {primaryType}
                {wing && ` mit Flügel ${wing}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Genauigkeit</div>
              <div className="text-2xl font-bold text-primary">
                {(confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Sections */}
      <div className="space-y-6 mb-8">
        {sections.map((sectionKey) => {
          const Icon = SECTION_ICONS[sectionKey];
          const title = SECTION_TITLES[sectionKey];
          const content = analysisData[sectionKey];

          if (!content) return null;

          return (
            <Card key={sectionKey}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold flex-1">{title}</h2>
                </div>
                <div className="prose prose-lg max-w-none text-foreground">
                  <p className="whitespace-pre-line leading-relaxed">
                    {formatText(content)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Box */}
      <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Hinweis:</strong> Diese Analyse wurde speziell für dich erstellt und
            berücksichtigt deine individuellen Antworten. Das Enneagramm ist ein bewährtes
            Persönlichkeitsmodell, das dir helfen kann, dich selbst besser zu verstehen und
            gezielt an deiner persönlichen Entwicklung zu arbeiten.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        {onDownloadPDF && (
          <Button onClick={onDownloadPDF} size="lg" className="gap-2">
            <Download className="w-4 h-4" />
            PDF herunterladen
          </Button>
        )}
        {onRestart && (
          <Button onClick={onRestart} size="lg" variant="outline">
            Test erneut durchführen
          </Button>
        )}
      </div>

      {/* Print-friendly styling */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
