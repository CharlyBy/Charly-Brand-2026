/**
 * EnneaFlow Smart Analysis Algorithm
 * Portiert von EnneaFlow's smart-analysis.js
 * 
 * Intelligentes Scoring-System mit Gewichtung, Pattern-Erkennung und Confidence-Score
 * ERWEITERT: Zwischenanalyse für adaptive Fragen (20-Fragen-System)
 */

import { ENNEAGRAM_TYPE_NAMES, ENNEAGRAM_WINGS, type EnneagramAnswer } from "./enneagram-questions";

export interface UserAnswer {
  questionId: number;
  selectedAnswer: EnneagramAnswer;
  answerIndex: number;
}

export interface TypeScore {
  raw: number;
  weighted: number;
  consistency: number;
  patterns: Pattern[];
}

export interface Pattern {
  type: string;
  strength: number;
  questionIndex: number;
}

export interface AnalysisResult {
  primaryType: number;
  wing: string | null;
  confidence: number;
  typeScores: Record<number, number>;
  detailedScores: Record<number, TypeScore>;
  explanation: string;
}

/**
 * Zwischenanalyse-Ergebnis nach 10 Basis-Fragen
 * Wird verwendet um adaptive Fragen auszuwählen
 */
export interface IntermediateAnalysis {
  topTypes: number[]; // Top 2-3 Typen
  typeScores: Record<number, number>;
  confidence: number;
}

export class EnneagramAnalyzer {
  private confidenceThreshold = 0.6; // Mindest-Confidence für Typ-Bestimmung
  private wingThreshold = 0.35; // Schwelle für Wing-Erkennung

  /**
   * NEUE METHODE: Zwischenanalyse nach 10 Basis-Fragen
   * Gibt Top 2-3 Typen zurück für adaptive Fragen-Auswahl
   */
  analyzeIntermediate(answers: UserAnswer[]): IntermediateAnalysis {
    const detailedScores = this.calculateDetailedScores(answers);
    const normalizedScores = this.normalizeScores(detailedScores);
    
    // Sortiere Typen nach Score
    const sortedTypes = Object.entries(normalizedScores)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => parseInt(type));

    // Top 2-3 Typen (mindestens 30% des höchsten Scores)
    const topScore = normalizedScores[sortedTypes[0]];
    const threshold = topScore * 0.3;
    const topTypes = sortedTypes.filter(type => normalizedScores[type] >= threshold).slice(0, 3);

    // Berechne vorläufige Confidence
    const primaryType = sortedTypes[0];
    const confidence = this.calculateConfidence(primaryType, normalizedScores, detailedScores);

    return {
      topTypes,
      typeScores: normalizedScores,
      confidence
    };
  }

  /**
   * Analysiert User-Antworten und bestimmt Enneagramm-Typ
   * Funktioniert mit 10 oder 20 Fragen
   */
  analyze(answers: UserAnswer[]): AnalysisResult {
    const detailedScores = this.calculateDetailedScores(answers);
    const normalizedScores = this.normalizeScores(detailedScores);
    const primaryType = this.determinePrimaryType(normalizedScores);
    const wing = this.determineWing(primaryType, normalizedScores);
    const confidence = this.calculateConfidence(primaryType, normalizedScores, detailedScores);

    return {
      primaryType,
      wing,
      confidence,
      typeScores: normalizedScores,
      detailedScores,
      explanation: this.generateExplanation(primaryType, wing, confidence, normalizedScores)
    };
  }

  /**
   * Berechnet detaillierte Scores mit Gewichtung und Pattern-Erkennung
   */
  private calculateDetailedScores(answers: UserAnswer[]): Record<number, TypeScore> {
    const typeScores: Record<number, TypeScore> = {};

    // Initialisiere Scores für alle 9 Typen
    for (let i = 1; i <= 9; i++) {
      typeScores[i] = {
        raw: 0,
        weighted: 0,
        consistency: 0,
        patterns: []
      };
    }

    // Analysiere jede Antwort mit Kontext
    answers.forEach((answer, index) => {
      const questionWeight = this.getQuestionWeight(index, answer, answers.length);
      const contextMultiplier = this.getContextMultiplier(answer, answers, index);

      answer.selectedAnswer.types.forEach(type => {
        typeScores[type].raw += 1;
        typeScores[type].weighted += questionWeight * contextMultiplier;

        // Pattern-Erkennung
        const pattern = this.identifyPattern(type, answer.selectedAnswer, index);
        if (pattern) {
          typeScores[type].patterns.push(pattern);
        }
      });
    });

    // Berechne Konsistenz-Scores
    Object.keys(typeScores).forEach(typeStr => {
      const type = parseInt(typeStr);
      typeScores[type].consistency = this.calculateConsistency(
        typeScores[type].patterns,
        type
      );
    });

    return typeScores;
  }

  /**
   * Intelligente Gewichtung basierend auf Fragentyp und Position
   * ERWEITERT: Berücksichtigt ob 10 oder 20 Fragen
   */
  private getQuestionWeight(index: number, answer: UserAnswer, totalQuestions: number): number {
    const baseWeight = 1.0;

    // Frühe Fragen haben höhere Gewichtung für Grundtendenz
    let positionMultiplier = 1.0;
    if (totalQuestions <= 10) {
      // Bei 10 Fragen: Erste 3 Fragen wichtiger
      positionMultiplier = index < 3 ? 1.2 : 1.0;
    } else {
      // Bei 20 Fragen: Erste 3 UND adaptive Fragen (11-20) wichtiger
      if (index < 3) {
        positionMultiplier = 1.2;
      } else if (index >= 10) {
        // Adaptive Fragen haben höhere Gewichtung (1.3x)
        positionMultiplier = 1.3;
      }
    }

    // Fragen mit weniger Antwortoptionen sind präziser
    const precisionMultiplier = Math.max(0.8, 2.0 / answer.selectedAnswer.types.length);

    return baseWeight * positionMultiplier * precisionMultiplier;
  }

  /**
   * Kontext-Multiplikator basierend auf Antwort-Mustern
   */
  private getContextMultiplier(
    currentAnswer: UserAnswer,
    allAnswers: UserAnswer[],
    currentIndex: number
  ): number {
    let multiplier = 1.0;

    // Konsistenz-Bonus: Wenn vorherige Antworten ähnliche Typen zeigen
    if (currentIndex > 2) {
      const recentAnswers = allAnswers.slice(Math.max(0, currentIndex - 3), currentIndex);
      const consistencyBonus = this.calculateRecentConsistency(currentAnswer, recentAnswers);
      multiplier += consistencyBonus * 0.2;
    }

    return multiplier;
  }

  /**
   * Berechnet Konsistenz der letzten Antworten
   */
  private calculateRecentConsistency(
    currentAnswer: UserAnswer,
    recentAnswers: UserAnswer[]
  ): number {
    const currentTypes = new Set(currentAnswer.selectedAnswer.types);
    let matchCount = 0;

    recentAnswers.forEach(answer => {
      const overlap = answer.selectedAnswer.types.filter(type => currentTypes.has(type));
      matchCount += overlap.length;
    });

    return Math.min(1.0, matchCount / (recentAnswers.length * 2));
  }

  /**
   * Pattern-Erkennung für spezifische Verhaltensweisen
   */
  private identifyPattern(type: number, answer: EnneagramAnswer, questionIndex: number): Pattern | null {
    const patterns: Record<number, string[]> = {
      1: ['perfectionism', 'control', 'criticism'],
      2: ['helping', 'people-pleasing', 'self-neglect'],
      3: ['achievement', 'image', 'efficiency'],
      4: ['uniqueness', 'emotion', 'melancholy'],
      5: ['withdrawal', 'analysis', 'independence'],
      6: ['security', 'loyalty', 'anxiety'],
      7: ['enthusiasm', 'avoidance', 'variety'],
      8: ['power', 'justice', 'confrontation'],
      9: ['harmony', 'avoidance', 'merging']
    };

    const answerText = answer.text.toLowerCase();
    const typePatterns = patterns[type] || [];

    for (const pattern of typePatterns) {
      if (this.matchesPattern(answerText, pattern)) {
        return {
          type: pattern,
          strength: this.calculatePatternStrength(answerText, pattern),
          questionIndex
        };
      }
    }

    return null;
  }

  /**
   * Pattern-Matching Logik
   */
  private matchesPattern(text: string, pattern: string): boolean {
    const patternKeywords: Record<string, string[]> = {
      'perfectionism': ['perfekt', 'richtig', 'fehler', 'standard', 'qualität', 'detailorientiert'],
      'helping': ['helfen', 'unterstützen', 'fürsorge', 'andere', 'gebraucht'],
      'achievement': ['erfolg', 'ziel', 'leistung', 'erreichen', 'effizient'],
      'control': ['kontroll', 'ordnung', 'regel', 'disziplin', 'aktiv'],
      'emotion': ['gefühl', 'emotion', 'tief', 'intensiv', 'verletzt'],
      'security': ['sicherheit', 'vertrauen', 'schutz', 'stabilität', 'orientierung'],
      'harmony': ['harmonie', 'frieden', 'konflikt vermeiden', 'ausgeglichen', 'gelassenheit'],
      'withdrawal': ['zurückziehen', 'ruhe', 'distanz', 'analysieren'],
      'variety': ['neu', 'erfahrung', 'spaß', 'frei', 'vielseitig']
    };

    const keywords = patternKeywords[pattern] || [];
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Berechnet Pattern-Stärke
   */
  private calculatePatternStrength(text: string, pattern: string): number {
    // Vereinfachte Stärke-Berechnung basierend auf Keyword-Dichte
    return 0.7; // Konstante Stärke für erkannte Patterns
  }

  /**
   * Berechnet Konsistenz-Score für einen Typ
   */
  private calculateConsistency(patterns: Pattern[], type: number): number {
    if (patterns.length === 0) return 0;

    const avgStrength = patterns.reduce((sum, p) => sum + p.strength, 0) / patterns.length;
    const diversityBonus = Math.min(1.0, patterns.length / 3);

    return avgStrength * 0.7 + diversityBonus * 0.3;
  }

  /**
   * Normalisiert Scores auf 0-1 Skala
   */
  private normalizeScores(detailedScores: Record<number, TypeScore>): Record<number, number> {
    const normalized: Record<number, number> = {};
    const maxWeighted = Math.max(...Object.values(detailedScores).map(s => s.weighted));

    if (maxWeighted === 0) {
      // Fallback: Gleichverteilung
      for (let i = 1; i <= 9; i++) {
        normalized[i] = 1 / 9;
      }
      return normalized;
    }

    Object.keys(detailedScores).forEach(typeStr => {
      const type = parseInt(typeStr);
      const score = detailedScores[type];
      normalized[type] = (score.weighted / maxWeighted) * 0.7 + score.consistency * 0.3;
    });

    return normalized;
  }

  /**
   * Bestimmt primären Typ
   */
  private determinePrimaryType(normalizedScores: Record<number, number>): number {
    let maxScore = 0;
    let primaryType = 1;

    Object.entries(normalizedScores).forEach(([typeStr, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryType = parseInt(typeStr);
      }
    });

    return primaryType;
  }

  /**
   * Bestimmt Flügel (Wing)
   */
  private determineWing(primaryType: number, normalizedScores: Record<number, number>): string | null {
    const possibleWings = ENNEAGRAM_WINGS[primaryType];
    if (!possibleWings) return null;

    // Nachbar-Typen prüfen
    const leftWing = primaryType === 1 ? 9 : primaryType - 1;
    const rightWing = primaryType === 9 ? 1 : primaryType + 1;

    const leftScore = normalizedScores[leftWing] || 0;
    const rightScore = normalizedScores[rightWing] || 0;

    // Wing nur wenn Schwelle überschritten
    if (leftScore < this.wingThreshold && rightScore < this.wingThreshold) {
      return null;
    }

    // Wähle stärkeren Wing
    if (leftScore > rightScore) {
      return `${primaryType}w${leftWing}`;
    } else {
      return `${primaryType}w${rightWing}`;
    }
  }

  /**
   * Berechnet Confidence-Score
   */
  private calculateConfidence(
    primaryType: number,
    normalizedScores: Record<number, number>,
    detailedScores: Record<number, TypeScore>
  ): number {
    const primaryScore = normalizedScores[primaryType];
    const secondHighest = this.getSecondHighestScore(normalizedScores, primaryType);
    const separation = primaryScore - secondHighest;

    // Confidence basiert auf:
    // 1. Absolute Stärke des primären Typs (40%)
    // 2. Trennung zum zweitstärksten Typ (40%)
    // 3. Konsistenz der Patterns (20%)
    const consistencyScore = detailedScores[primaryType].consistency;

    const confidence = primaryScore * 0.4 + separation * 0.4 + consistencyScore * 0.2;

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Findet zweithöchsten Score
   */
  private getSecondHighestScore(scores: Record<number, number>, excludeType: number): number {
    let secondHighest = 0;

    Object.entries(scores).forEach(([typeStr, score]) => {
      const type = parseInt(typeStr);
      if (type !== excludeType && score > secondHighest) {
        secondHighest = score;
      }
    });

    return secondHighest;
  }

  /**
   * Generiert Erklärung für Analyse-Ergebnis
   */
  private generateExplanation(
    primaryType: number,
    wing: string | null,
    confidence: number,
    scores: Record<number, number>
  ): string {
    const typeName = ENNEAGRAM_TYPE_NAMES[primaryType];
    const confidencePercent = Math.round(confidence * 100);

    let explanation = `Basierend auf den Antworten wurde **${typeName}** als primärer Enneagramm-Typ identifiziert`;

    if (wing) {
      explanation += ` mit Flügel **${wing}**`;
    }

    explanation += ` (Confidence: ${confidencePercent}%).`;

    // Top 3 Typen erwähnen
    const sortedTypes = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (sortedTypes.length > 1) {
      explanation += `\n\nWeitere starke Tendenzen: `;
      const otherTypes = sortedTypes
        .slice(1)
        .map(([type, score]) => `${ENNEAGRAM_TYPE_NAMES[parseInt(type)]} (${Math.round(score * 100)}%)`)
        .join(', ');
      explanation += otherTypes;
    }

    return explanation;
  }
}
