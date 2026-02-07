/**
 * Hypnosis Script Generator
 * Generates personalized hypnosis scripts based on Enneagramm type and main topic
 */

import { invokeLLM } from "./_core/llm";

export interface TranceScriptParams {
  enneagramType: string;
  mainTopic: string;
  firstName?: string;
  duration?: number; // Target duration in minutes (default: 7)
}

/**
 * Generate a personalized hypnosis script
 * Returns a structured script with introduction, deepening, main part, and return
 */
export async function generateTranceScript(params: TranceScriptParams): Promise<string> {
  const { enneagramType, mainTopic, firstName, duration = 7 } = params;
  
  const systemPrompt = `Du bist ein erfahrener Hypnotherapeut und Heilpraktiker für Psychotherapie. 
Deine Aufgabe ist es, personalisierte Hypnose-Skripte zu erstellen, die auf den individuellen Persönlichkeitstyp und das Hauptthema des Klienten abgestimmt sind.

**WICHTIGE REGELN:**
1. Das Skript MUSS exakt ${duration} Minuten dauern (ca. ${duration * 150} Wörter bei normalem Sprechtempo)
2. Verwende eine warme, beruhigende, vertrauensvolle Sprache
3. Sprich den Klienten mit "du" an${firstName ? ` und verwende den Namen "${firstName}"` : ""}
4. Keine Platzhalter wie [Name] - verwende den echten Namen oder lass ihn weg
5. Keine Meta-Kommentare oder Anweisungen - nur das gesprochene Skript
6. Verwende NIEMALS die Begriffe "Enneagramm" oder "Typ X"

**STRUKTUR (4 Teile):**

1. **EINLEITUNG (20%)** - Begrüßung, Entspannung, Vertrauen aufbauen
   - Beginne mit einer warmen Begrüßung
   - Lade ein, es sich bequem zu machen
   - Erste Atemübungen zur Entspannung
   - Schaffe einen sicheren Raum

2. **VERTIEFUNG (25%)** - Progressive Entspannung, Trance-Induktion
   - Körperwahrnehmung von Kopf bis Fuß
   - Vertiefte Atemübungen
   - Zählen oder Treppen-Metapher
   - Vertiefung der Trance

3. **HAUPTTEIL (40%)** - Persönlichkeitstyp-spezifische Arbeit am Hauptthema
   - Arbeite DIREKT mit dem Hauptthema: "${mainTopic}"
   - Berücksichtige die Persönlichkeitsstruktur: "${enneagramType}"
   - Nutze passende Metaphern und Bilder
   - Positive Suggestionen und Ressourcen-Aktivierung
   - Transformation und Heilung

4. **RÜCKFÜHRUNG (15%)** - Sanfte Rückkehr ins Hier und Jetzt
   - Langsames Zurückkommen
   - Körperwahrnehmung wieder aktivieren
   - Positive Energie mitnehmen
   - Sanftes Öffnen der Augen

**PERSÖNLICHKEITSTYP-SPEZIFISCHE ANPASSUNGEN:**

Berücksichtige die Kernmuster und Bedürfnisse des Persönlichkeitstyps "${enneagramType}":
- Welche inneren Konflikte sind typisch?
- Welche Ressourcen und Stärken hat dieser Typ?
- Welche Metaphern und Bilder sprechen diesen Typ besonders an?
- Welche Suggestionen sind hilfreich für Transformation?

**WICHTIG:**
- Schreibe NUR das gesprochene Skript
- Keine Überschriften oder Strukturmarkierungen im Output
- Fließender Text ohne Absätze zwischen den Teilen
- Natürliche Übergänge zwischen den Abschnitten
- Professionelle Hypnose-Sprache (Pacing, Leading, Suggestionen)`;

  const userPrompt = `Erstelle ein ${duration}-minütiges Hypnose-Skript für:
- Persönlichkeitstyp: ${enneagramType}
- Hauptthema: ${mainTopic}
${firstName ? `- Vorname: ${firstName}` : ""}

Das Skript soll genau ${duration * 150} Wörter umfassen und alle 4 Strukturteile (Einleitung, Vertiefung, Hauptteil, Rückführung) nahtlos integrieren.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content || typeof content !== 'string') {
      throw new Error("Invalid response from LLM");
    }
    
    const script = content.trim();
    
    if (script.length < 500) {
      throw new Error("Generated script is too short");
    }

    return script;
  } catch (error) {
    console.error("[Trance Script Generation Error]", error);
    throw new Error("Failed to generate hypnosis script");
  }
}

/**
 * Estimate audio duration from script length
 * Assumes slow, calm speech rate of ~100 words per minute for hypnosis
 */
export function estimateAudioDuration(script: string): number {
  const wordCount = script.split(/\s+/).length;
  const durationMinutes = wordCount / 100; // Slow hypnosis speech rate
  return Math.round(durationMinutes * 60); // Return seconds
}
