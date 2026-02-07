/**
 * LLM-Prompt für personalisierte Enneagramm-Analyse
 * 
 * Generiert eine individuelle, detaillierte Analyse basierend auf:
 * - Enneagramm-Typ
 * - Flügel
 * - Confidence-Score
 * - User-Antworten
 */

import type { UserAnswer } from "./enneagram-analyzer";
import type { EnneagramQuestion } from "./enneagram-questions";

export interface AnalysisInput {
  primaryType: number;
  wing: string | null;
  confidence: number;
  userName: string;
  userAnswers: UserAnswer[];
  questions: EnneagramQuestion[];
}

export interface DetailedAnalysis {
  typeTitle: string; // z.B. "Der Friedensstifter mit innerer Stärke (9w8)"
  description: string; // 3-4 Absätze persönliche Beschreibung
  childhood: string; // Kindheit-Muster
  strengths: string; // Stärken (spezifisch für User)
  challenges: string; // Herausforderungen
  relationships: string; // Beziehungen
  developmentTip: string; // Entwicklungstipp
}

/**
 * Typ-Namen für Enneagramm-Typen
 */
const TYPE_NAMES: Record<number, string> = {
  1: "Der Perfektionist",
  2: "Der Helfer",
  3: "Der Erfolgsmensch",
  4: "Der Individualist",
  5: "Der Beobachter",
  6: "Der Loyale",
  7: "Der Enthusiast",
  8: "Der Herausforderer",
  9: "Der Friedensstifter",
};

/**
 * Erstellt den LLM-Prompt für die personalisierte Analyse
 */
export function createAnalysisPrompt(input: AnalysisInput): string {
  const { primaryType, wing, confidence, userName, userAnswers, questions } = input;
  
  const typeName = TYPE_NAMES[primaryType] || `Typ ${primaryType}`;
  const wingText = wing ? ` mit Flügel ${wing}` : "";
  
  // User-Antworten formatieren für Kontext
  const answersContext = userAnswers
    .map((answer, index) => {
      const question = questions[answer.questionId];
      if (!question) return "";
      
      return `Frage ${index + 1}: ${question.text}
Antwort: ${answer.selectedAnswer.text}`;
    })
    .join("\n\n");

  return `Du bist ein erfahrener Enneagramm-Experte und Psychotherapeut. Erstelle eine **persönliche, einfühlsame und tiefgründige** Enneagramm-Analyse für ${userName}.

## ANALYSE-KONTEXT

**Ermittelter Typ:** ${typeName}${wingText} (Typ ${primaryType}${wing ? ` mit Flügel ${wing}` : ""})
**Confidence:** ${(confidence * 100).toFixed(0)}%

**User-Antworten:**
${answersContext}

---

## AUFGABE

Erstelle eine **individuelle, personalisierte Analyse** basierend auf den konkreten Antworten von ${userName}. Die Analyse soll sich **nicht generisch** anfühlen, sondern **spezifisch auf die Antworten** eingehen.

**Wichtig:**
- Verwende "du" (persönliche Ansprache)
- Beziehe dich auf konkrete Antworten aus dem Test
- Schreibe empathisch, wertschätzend und ermutigend
- Vermeide Klischees und Verallgemeinerungen
- Nutze die Flügel-Information für Nuancen
- Bei niedriger Confidence (<70%): Formuliere vorsichtiger ("könnte", "möglicherweise")

---

## STRUKTUR (JSON-Format)

Gib die Analyse als **valides JSON** zurück mit folgenden Feldern:

\`\`\`json
{
  "typeTitle": "Titel mit Flügel, z.B. 'Der Friedensstifter mit innerer Stärke (9w8)'",
  "description": "3-4 Absätze persönliche Typ-Beschreibung. Erkläre die Kernmotivationen, Ängste und Verhaltensmuster. Beziehe dich auf konkrete Antworten aus dem Test.",
  "childhood": "2-3 Absätze über typische Kindheitsmuster dieses Typs. Wie könnten frühe Erfahrungen die Persönlichkeit geprägt haben?",
  "strengths": "2-3 Absätze über die herausragendsten Stärken. Sei spezifisch und ermutigend. Nutze **Fettschrift** für Schlüsselwörter.",
  "challenges": "2-3 Absätze über die größten Herausforderungen. Sei ehrlich aber wertschätzend. Nutze **Fettschrift** für Schlüsselwörter.",
  "relationships": "2-3 Absätze über Beziehungsmuster. Wie verhält sich dieser Typ in Partnerschaften? Was braucht er/sie?",
  "developmentTip": "2-3 Absätze mit konkreten, umsetzbaren Entwicklungstipps. Was ist der wichtigste nächste Schritt?"
}
\`\`\`

**Formatierung:**
- Nutze **Fettschrift** (mit **) für wichtige Begriffe
- Schreibe in klaren, verständlichen Sätzen
- Jede Sektion sollte 2-4 Absätze haben
- Gesamtlänge: ca. 1500-2000 Wörter

---

Erstelle jetzt die personalisierte Analyse für ${userName} als valides JSON:`;
}

/**
 * Parst die LLM-Antwort und extrahiert die strukturierte Analyse
 */
export function parseAnalysisResponse(response: string): DetailedAnalysis {
  try {
    // Versuche JSON zu extrahieren (falls in Markdown Code-Block)
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;
    
    const parsed = JSON.parse(jsonString);
    
    return {
      typeTitle: parsed.typeTitle || "",
      description: parsed.description || "",
      childhood: parsed.childhood || "",
      strengths: parsed.strengths || "",
      challenges: parsed.challenges || "",
      relationships: parsed.relationships || "",
      developmentTip: parsed.developmentTip || "",
    };
  } catch (error) {
    console.error("Failed to parse LLM analysis response:", error);
    throw new Error("Konnte Analyse nicht parsen. Bitte versuche es erneut.");
  }
}
