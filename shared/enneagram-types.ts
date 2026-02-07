/**
 * Enneagramm-Typ Beschreibungen und Metadaten
 * Für visuelle Darstellung im Admin-Panel
 */

export interface EnneagramType {
  number: number;
  name: string;
  subtitle: string;
  color: string;
  icon: string;
  coreMotivation: string;
  strengths: string[];
  challenges: string[];
  wings: {
    [key: string]: string; // z.B. "w2": "mit Helfer-Flügel"
  };
}

export const ENNEAGRAM_TYPES: Record<number, EnneagramType> = {
  1: {
    number: 1,
    name: "Der Perfektionist",
    subtitle: "Der Reformer",
    color: "oklch(0.55 0.2 20)", // Rot-Orange
    icon: "⚖️",
    coreMotivation: "Richtig und gut sein, Fehler vermeiden",
    strengths: [
      "Hohe ethische Standards",
      "Verantwortungsbewusst und zuverlässig",
      "Detailorientiert und organisiert"
    ],
    challenges: [
      "Selbstkritik und innerer Kritiker",
      "Perfektionismus kann lähmend wirken",
      "Schwierigkeiten, Fehler zu akzeptieren"
    ],
    wings: {
      w9: "mit Friedensstifter-Flügel (gelassener, diplomatischer)",
      w2: "mit Helfer-Flügel (wärmer, beziehungsorientierter)"
    }
  },
  2: {
    number: 2,
    name: "Der Helfer",
    subtitle: "Der Gebende",
    color: "oklch(0.6 0.15 140)", // Grün
    icon: "❤️",
    coreMotivation: "Geliebt und gebraucht werden",
    strengths: [
      "Empathisch und fürsorglich",
      "Großzügig und hilfsbereit",
      "Beziehungsorientiert"
    ],
    challenges: [
      "Eigene Bedürfnisse vernachlässigen",
      "Erwartung von Dankbarkeit",
      "Schwierigkeiten, Nein zu sagen"
    ],
    wings: {
      w1: "mit Perfektionisten-Flügel (prinzipientreuer, selbstkritischer)",
      w3: "mit Erfolgsmensch-Flügel (ehrgeiziger, imageorientierter)"
    }
  },
  3: {
    number: 3,
    name: "Der Erfolgsmensch",
    subtitle: "Der Macher",
    color: "oklch(0.65 0.2 60)", // Gelb-Gold
    icon: "🏆",
    coreMotivation: "Erfolgreich und wertvoll sein",
    strengths: [
      "Zielorientiert und effizient",
      "Motiviert und energiegeladen",
      "Anpassungsfähig und charismatisch"
    ],
    challenges: [
      "Identifikation mit Erfolg und Image",
      "Schwierigkeiten mit echten Gefühlen",
      "Workaholic-Tendenzen"
    ],
    wings: {
      w2: "mit Helfer-Flügel (beziehungsorientierter, charmanter)",
      w4: "mit Individualist-Flügel (kreativer, introspektiver)"
    }
  },
  4: {
    number: 4,
    name: "Der Individualist",
    subtitle: "Der Romantiker",
    color: "oklch(0.5 0.2 280)", // Violett
    icon: "🎨",
    coreMotivation: "Einzigartig und authentisch sein",
    strengths: [
      "Kreativ und ausdrucksstark",
      "Tiefgründig und introspektiv",
      "Empathisch für Leid anderer"
    ],
    challenges: [
      "Melancholie und Sehnsucht",
      "Gefühl des Andersseins",
      "Emotionale Intensität"
    ],
    wings: {
      w3: "mit Erfolgsmensch-Flügel (ehrgeiziger, extravertierter)",
      w5: "mit Beobachter-Flügel (zurückgezogener, intellektueller)"
    }
  },
  5: {
    number: 5,
    name: "Der Beobachter",
    subtitle: "Der Forscher",
    color: "oklch(0.45 0.15 240)", // Dunkelblau
    icon: "🔍",
    coreMotivation: "Kompetent und wissend sein",
    strengths: [
      "Analytisch und objektiv",
      "Unabhängig und selbstgenügsam",
      "Tiefes Verständnis komplexer Themen"
    ],
    challenges: [
      "Emotionale Distanz",
      "Rückzug und Isolation",
      "Schwierigkeiten mit Handlung"
    ],
    wings: {
      w4: "mit Individualist-Flügel (kreativer, emotionaler)",
      w6: "mit Loyalist-Flügel (vorsichtiger, beziehungsorientierter)"
    }
  },
  6: {
    number: 6,
    name: "Der Loyalist",
    subtitle: "Der Skeptiker",
    color: "oklch(0.55 0.15 200)", // Blau
    icon: "🛡️",
    coreMotivation: "Sicherheit und Unterstützung haben",
    strengths: [
      "Loyal und verantwortungsbewusst",
      "Vorausschauend und vorsichtig",
      "Teamorientiert"
    ],
    challenges: [
      "Angst und Sorgen",
      "Misstrauen gegenüber Autorität",
      "Schwierigkeiten mit Entscheidungen"
    ],
    wings: {
      w5: "mit Beobachter-Flügel (analytischer, zurückgezogener)",
      w7: "mit Enthusiast-Flügel (optimistischer, abenteuerlicher)"
    }
  },
  7: {
    number: 7,
    name: "Der Enthusiast",
    subtitle: "Der Optimist",
    color: "oklch(0.7 0.2 90)", // Helles Gelb
    icon: "✨",
    coreMotivation: "Glücklich und erfüllt sein",
    strengths: [
      "Optimistisch und enthusiastisch",
      "Vielseitig und spontan",
      "Kreativ und ideenreich"
    ],
    challenges: [
      "Vermeidung von Schmerz",
      "Impulsivität und Unruhe",
      "Schwierigkeiten mit Verpflichtungen"
    ],
    wings: {
      w6: "mit Loyalist-Flügel (verantwortungsbewusster, loyaler)",
      w8: "mit Herausforderer-Flügel (durchsetzungsstärker, direkter)"
    }
  },
  8: {
    number: 8,
    name: "Der Herausforderer",
    subtitle: "Der Boss",
    color: "oklch(0.4 0.2 10)", // Dunkelrot
    icon: "💪",
    coreMotivation: "Stark und unabhängig sein",
    strengths: [
      "Durchsetzungsstark und entschlossen",
      "Beschützend und gerecht",
      "Selbstbewusst und direkt"
    ],
    challenges: [
      "Kontrollbedürfnis",
      "Schwierigkeiten mit Verletzlichkeit",
      "Konfrontativ"
    ],
    wings: {
      w7: "mit Enthusiast-Flügel (lebhafter, geselliger)",
      w9: "mit Friedensstifter-Flügel (gelassener, diplomatischer)"
    }
  },
  9: {
    number: 9,
    name: "Der Friedensstifter",
    subtitle: "Der Vermittler",
    color: "oklch(0.6 0.1 160)", // Mintgrün
    icon: "☮️",
    coreMotivation: "Harmonie und inneren Frieden bewahren",
    strengths: [
      "Friedliebend und harmonisierend",
      "Empathisch und akzeptierend",
      "Geduldig und ausgeglichen"
    ],
    challenges: [
      "Vermeidung von Konflikten",
      "Eigene Bedürfnisse vernachlässigen",
      "Trägheit und Prokrastination"
    ],
    wings: {
      w8: "mit Herausforderer-Flügel (durchsetzungsstärker, direkter)",
      w1: "mit Perfektionisten-Flügel (prinzipientreuer, kritischer)"
    }
  }
};

/**
 * Hilfsfunktion: Typ-Nummer aus String extrahieren (z.B. "3w2" → 3)
 */
export function parseEnneagramType(typeString: string | null): number | null {
  if (!typeString) return null;
  const match = typeString.match(/^(\d)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Hilfsfunktion: Flügel aus String extrahieren (z.B. "3w2" → "w2")
 */
export function parseWing(typeString: string | null): string | null {
  if (!typeString) return null;
  const match = typeString.match(/w(\d)/);
  return match ? `w${match[1]}` : null;
}

/**
 * Hilfsfunktion: Vollständige Typ-Beschreibung mit Flügel
 */
export function getTypeDescription(typeString: string | null): string {
  const typeNum = parseEnneagramType(typeString);
  const wing = parseWing(typeString);
  
  if (!typeNum || !ENNEAGRAM_TYPES[typeNum]) {
    return "Typ noch nicht erkannt";
  }
  
  const type = ENNEAGRAM_TYPES[typeNum];
  let description = `Typ ${typeNum} - ${type.name}`;
  
  if (wing && type.wings[wing]) {
    description += ` ${type.wings[wing]}`;
  }
  
  return description;
}

/**
 * Hilfsfunktion: Confidence-Score in Prozent
 */
export function getConfidencePercentage(confidence: number | null): number {
  if (confidence === null || confidence === undefined) return 0;
  return Math.round(confidence * 100);
}

/**
 * Hilfsfunktion: Confidence-Level Text
 */
export function getConfidenceLevel(confidence: number | null): string {
  const percentage = getConfidencePercentage(confidence);
  
  if (percentage >= 80) return "Sehr hoch";
  if (percentage >= 60) return "Hoch";
  if (percentage >= 40) return "Mittel";
  if (percentage >= 20) return "Niedrig";
  return "Sehr niedrig";
}

/**
 * Hilfsfunktion: Confidence-Farbe für Progress Bar
 */
export function getConfidenceColor(confidence: number | null): string {
  const percentage = getConfidencePercentage(confidence);
  
  if (percentage >= 80) return "oklch(0.6 0.2 140)"; // Grün
  if (percentage >= 60) return "oklch(0.65 0.2 110)"; // Gelb-Grün
  if (percentage >= 40) return "oklch(0.7 0.2 80)"; // Gelb
  if (percentage >= 20) return "oklch(0.65 0.2 40)"; // Orange
  return "oklch(0.55 0.2 20)"; // Rot
}
