/**
 * EnneaFlow Questions Database
 * Portiert von EnneaFlow's questions.js
 * 
 * 10 Basis-Fragen für wissenschaftlich fundierte Enneagramm-Typ-Erkennung
 */

export interface EnneagramAnswer {
  text: string;
  types: number[]; // Enneagramm-Typen 1-9
}

export interface EnneagramQuestion {
  id: number;
  text: string;
  answers: EnneagramAnswer[];
}

/**
 * 10 Basis-Fragen für alle Nutzer
 * Diese Fragen werden von Luna natürlich im Gespräch gestellt
 */
export const ENNEAGRAM_BASE_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 1,
    text: "Wie gehst du typischerweise mit Stress um?",
    answers: [
      { text: "Ich werde sehr aktiv und versuche, alles zu kontrollieren", types: [8, 1, 3] },
      { text: "Ich ziehe mich zurück und suche Ruhe", types: [5, 9, 4] },
      { text: "Ich suche Unterstützung bei anderen", types: [2, 6, 7] }
    ]
  },
  {
    id: 2,
    text: "Was motiviert dich am meisten in Beziehungen?",
    answers: [
      { text: "Anderen zu helfen und gebraucht zu werden", types: [2, 1] },
      { text: "Ehrlichkeit und tiefe Verbindungen", types: [4, 8, 5] },
      { text: "Harmonie und Frieden zu bewahren", types: [9, 6] },
      { text: "Spaß zu haben und neue Erfahrungen zu teilen", types: [7, 3] }
    ]
  },
  {
    id: 3,
    text: "Wie reagierst du auf Kritik?",
    answers: [
      { text: "Ich nehme sie ernst und arbeite an Verbesserungen", types: [1, 6] },
      { text: "Ich fühle mich verletzt und ziehe mich zurück", types: [4, 5] },
      { text: "Ich rechtfertige mich oder greife an", types: [8, 3] },
      { text: "Ich versuche die Situation zu glätten", types: [2, 9, 7] }
    ]
  },
  {
    id: 4,
    text: "Was beschreibt deinen Umgang mit Regeln am besten?",
    answers: [
      { text: "Regeln sind wichtig und sollten befolgt werden", types: [1, 6] },
      { text: "Regeln sind Richtlinien, können aber gebrochen werden", types: [7, 8, 3] },
      { text: "Ich mag keine starren Regeln und bevorzuge Flexibilität", types: [4, 5] },
      { text: "Regeln sind okay, solange sie keinen Konflikt verursachen", types: [9, 2] }
    ]
  },
  {
    id: 5,
    text: "Wie würdest du dein Verhältnis zu Emotionen beschreiben?",
    answers: [
      { text: "Ich erlebe Emotionen sehr intensiv", types: [4, 8] },
      { text: "Ich versuche Emotionen zu kontrollieren oder zu verstecken", types: [1, 5, 3] },
      { text: "Ich teile meine Emotionen gerne mit anderen", types: [2, 7] },
      { text: "Ich vermeide starke Emotionen, sie machen mich unruhig", types: [9, 6] }
    ]
  },
  {
    id: 6,
    text: "Was ist dein größter Antrieb im Leben?",
    answers: [
      { text: "Erfolg und Anerkennung zu erlangen", types: [3, 8] },
      { text: "Sicherheit und Stabilität zu finden", types: [6, 1] },
      { text: "Authentisch zu sein und verstanden zu werden", types: [4, 5] },
      { text: "Anderen zu helfen und geliebt zu werden", types: [2, 9] },
      { text: "Neue Erfahrungen zu sammeln und frei zu sein", types: [7] }
    ]
  },
  {
    id: 7,
    text: "Wie verhältst du dich in Konfliktsituationen?",
    answers: [
      { text: "Ich gehe direkt auf den Konflikt zu", types: [8, 1] },
      { text: "Ich vermeide Konflikte so gut es geht", types: [9, 2] },
      { text: "Ich analysiere die Situation aus der Distanz", types: [5, 6] },
      { text: "Ich versuche eine kreative Lösung zu finden", types: [7, 4, 3] }
    ]
  },
  {
    id: 8,
    text: "Was beschreibt deine Arbeitsweise am besten?",
    answers: [
      { text: "Perfektionistisch und detailorientiert", types: [1, 5] },
      { text: "Effizient und zielorientiert", types: [3, 8] },
      { text: "Kreativ und inspirationsgetrieben", types: [4, 7] },
      { text: "Kooperativ und hilfsbereit", types: [2, 6] },
      { text: "Entspannt und im eigenen Tempo", types: [9] }
    ]
  },
  {
    id: 9,
    text: "Welche Eigenschaft schätzt du an dir selbst am meisten?",
    answers: [
      { text: "Meine Zuverlässigkeit und Integrität", types: [1, 6] },
      { text: "Meine Fähigkeit, anderen zu helfen", types: [2] },
      { text: "Meine Effizienz und meinen Erfolg", types: [3] },
      { text: "Meine Kreativität und Tiefe", types: [4, 5] },
      { text: "Meine Optimismus und Vielseitigkeit", types: [7] },
      { text: "Meine Stärke und Direktheit", types: [8] },
      { text: "Meine Gelassenheit und Friedfertigkeit", types: [9] }
    ]
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
      { text: "Eingeschränkt oder in Schmerz gefangen zu sein", types: [7] },
      { text: "Verletzt oder kontrolliert zu werden", types: [8] },
      { text: "Verbindung und Harmonie zu verlieren", types: [9] }
    ]
  }
];

/**
 * Typ-Beschreibungen für Persönlichkeitsanalyse
 */
export const ENNEAGRAM_TYPE_NAMES: Record<number, string> = {
  1: "Der Perfektionist",
  2: "Der Helfer",
  3: "Der Erfolgsmensch",
  4: "Der Individualist",
  5: "Der Beobachter",
  6: "Der Loyale",
  7: "Der Enthusiast",
  8: "Der Herausforderer",
  9: "Der Friedensstifter"
};

/**
 * Flügel-Kombinationen
 */
export const ENNEAGRAM_WINGS: Record<number, string[]> = {
  1: ["1w9", "1w2"],
  2: ["2w1", "2w3"],
  3: ["3w2", "3w4"],
  4: ["4w3", "4w5"],
  5: ["5w4", "5w6"],
  6: ["6w5", "6w7"],
  7: ["7w6", "7w8"],
  8: ["8w7", "8w9"],
  9: ["9w8", "9w1"]
};

/**
 * ADAPTIVE FRAGEN (10 zusätzliche Fragen)
 * Werden nach Zwischenanalyse basierend auf Top-Typen ausgewählt
 * 
 * Struktur: Typ-Gruppen mit spezifischen Vertiefungsfragen
 */

export interface AdaptiveQuestionGroup {
  types: number[]; // Für welche Typen ist diese Frage relevant
  questions: EnneagramQuestion[];
}

/**
 * Adaptive Fragen-Pool: 30+ Fragen gruppiert nach Typ-Clustern
 * System wählt 10 relevanteste Fragen basierend auf Zwischenanalyse
 */
export const ADAPTIVE_QUESTION_GROUPS: AdaptiveQuestionGroup[] = [
  // Gruppe 1: Perfektionisten & Loyale (Typen 1, 6)
  {
    types: [1, 6],
    questions: [
      {
        id: 11,
        text: "Wie gehst du mit Fehlern um, die du gemacht hast?",
        answers: [
          { text: "Ich kritisiere mich selbst sehr stark", types: [1] },
          { text: "Ich suche Rat bei vertrauenswürdigen Personen", types: [6] },
          { text: "Ich akzeptiere sie und gehe weiter", types: [9, 7] },
          { text: "Ich analysiere, was schief gelaufen ist", types: [5] }
        ]
      },
      {
        id: 12,
        text: "Was bedeutet Verantwortung für dich?",
        answers: [
          { text: "Alles richtig und perfekt zu machen", types: [1] },
          { text: "Zuverlässig für andere da zu sein", types: [6, 2] },
          { text: "Meine Ziele zu erreichen", types: [3, 8] },
          { text: "Meinen eigenen Weg zu gehen", types: [4, 5] }
        ]
      },
      {
        id: 13,
        text: "Wie triffst du wichtige Entscheidungen?",
        answers: [
          { text: "Ich wäge alle Vor- und Nachteile ab", types: [1, 5] },
          { text: "Ich hole mir Rat von Menschen, denen ich vertraue", types: [6, 2] },
          { text: "Ich folge meinem Bauchgefühl", types: [8, 7] },
          { text: "Ich vermeide Entscheidungen so lange wie möglich", types: [9] }
        ]
      }
    ]
  },

  // Gruppe 2: Helfer & Erfolgsmensch (Typen 2, 3)
  {
    types: [2, 3],
    questions: [
      {
        id: 14,
        text: "Was ist dir in sozialen Situationen am wichtigsten?",
        answers: [
          { text: "Dass andere mich mögen und schätzen", types: [2] },
          { text: "Dass ich einen guten Eindruck mache", types: [3] },
          { text: "Dass ich authentisch sein kann", types: [4] },
          { text: "Dass ich mich wohlfühle", types: [9, 7] }
        ]
      },
      {
        id: 15,
        text: "Wie gehst du mit deinen eigenen Bedürfnissen um?",
        answers: [
          { text: "Ich stelle die Bedürfnisse anderer oft über meine eigenen", types: [2, 9] },
          { text: "Ich fokussiere mich auf meine Ziele", types: [3, 8] },
          { text: "Ich nehme mir Zeit, um meine Bedürfnisse zu verstehen", types: [4, 5] },
          { text: "Ich versuche, ein Gleichgewicht zu finden", types: [6, 1] }
        ]
      },
      {
        id: 16,
        text: "Was motiviert dich, morgens aufzustehen?",
        answers: [
          { text: "Anderen zu helfen und für sie da zu sein", types: [2] },
          { text: "Meine Ziele zu erreichen und erfolgreich zu sein", types: [3, 8] },
          { text: "Neue Erfahrungen und Abenteuer", types: [7] },
          { text: "Meine Arbeit gut zu machen", types: [1, 6] }
        ]
      }
    ]
  },

  // Gruppe 3: Individualist & Beobachter (Typen 4, 5)
  {
    types: [4, 5],
    questions: [
      {
        id: 17,
        text: "Wie gehst du mit intensiven Gefühlen um?",
        answers: [
          { text: "Ich tauche tief in sie ein und verarbeite sie kreativ", types: [4] },
          { text: "Ich ziehe mich zurück und analysiere sie", types: [5] },
          { text: "Ich lenke mich ab oder suche positive Erlebnisse", types: [7, 3] },
          { text: "Ich teile sie mit nahestehenden Menschen", types: [2, 6] }
        ]
      },
      {
        id: 18,
        text: "Was bedeutet Privatsphäre für dich?",
        answers: [
          { text: "Ein geschützter Raum für meine innere Welt", types: [4] },
          { text: "Essentiell - ich brauche viel Zeit für mich allein", types: [5] },
          { text: "Wichtig, aber ich teile gerne mit engen Freunden", types: [6, 2] },
          { text: "Nicht so wichtig - ich bin gerne unter Menschen", types: [7, 3] }
        ]
      },
      {
        id: 19,
        text: "Wie würdest du deine Denkweise beschreiben?",
        answers: [
          { text: "Tiefgründig und emotional", types: [4] },
          { text: "Analytisch und systematisch", types: [5, 1] },
          { text: "Praktisch und zielorientiert", types: [3, 8] },
          { text: "Optimistisch und kreativ", types: [7] }
        ]
      }
    ]
  },

  // Gruppe 4: Enthusiast & Herausforderer (Typen 7, 8)
  {
    types: [7, 8],
    questions: [
      {
        id: 20,
        text: "Wie gehst du mit Langeweile um?",
        answers: [
          { text: "Ich suche sofort nach neuen Aktivitäten oder Ablenkungen", types: [7] },
          { text: "Ich nutze die Zeit für Projekte oder Herausforderungen", types: [8, 3] },
          { text: "Ich genieße die Ruhe und entspanne", types: [9] },
          { text: "Ich nutze sie für Reflexion oder Lernen", types: [5, 4] }
        ]
      },
      {
        id: 21,
        text: "Was ist deine Haltung zu Autorität?",
        answers: [
          { text: "Ich hinterfrage Autorität und teste Grenzen", types: [8, 7] },
          { text: "Ich respektiere Autorität, wenn sie verdient ist", types: [1, 6] },
          { text: "Ich vermeide Konflikte mit Autoritätspersonen", types: [9, 2] },
          { text: "Ich bin gleichgültig gegenüber Autorität", types: [5, 4] }
        ]
      },
      {
        id: 22,
        text: "Wie zeigst du deine Stärke?",
        answers: [
          { text: "Durch Durchsetzungsvermögen und Kontrolle", types: [8] },
          { text: "Durch Optimismus und Energie", types: [7, 3] },
          { text: "Durch Beständigkeit und Zuverlässigkeit", types: [1, 6] },
          { text: "Ich zeige meine Stärke nicht offen", types: [5, 9] }
        ]
      }
    ]
  },

  // Gruppe 5: Friedensstifter (Typ 9)
  {
    types: [9],
    questions: [
      {
        id: 23,
        text: "Wie gehst du mit Meinungsverschiedenheiten um?",
        answers: [
          { text: "Ich versuche alle Perspektiven zu verstehen und zu vermitteln", types: [9] },
          { text: "Ich vertrete meine Meinung klar und direkt", types: [8, 1] },
          { text: "Ich ziehe mich zurück, wenn es zu intensiv wird", types: [5, 4] },
          { text: "Ich suche nach Kompromissen", types: [6, 2] }
        ]
      },
      {
        id: 24,
        text: "Was fällt dir am schwersten?",
        answers: [
          { text: "Prioritäten zu setzen und Entscheidungen zu treffen", types: [9] },
          { text: "Meine eigenen Bedürfnisse zu erkennen", types: [2, 9] },
          { text: "Fehler zu akzeptieren", types: [1, 3] },
          { text: "Mich auf eine Sache zu fokussieren", types: [7] }
        ]
      },
      {
        id: 25,
        text: "Wie würden andere deine Präsenz beschreiben?",
        answers: [
          { text: "Beruhigend und ausgleichend", types: [9] },
          { text: "Energetisch und inspirierend", types: [7, 3] },
          { text: "Stark und selbstbewusst", types: [8] },
          { text: "Fürsorglich und unterstützend", types: [2, 6] }
        ]
      }
    ]
  },

  // Gruppe 6: Gemischte Vertiefungsfragen (alle Typen)
  {
    types: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    questions: [
      {
        id: 26,
        text: "Was ist dein größter innerer Konflikt?",
        answers: [
          { text: "Zwischen meinen hohen Standards und der Realität", types: [1] },
          { text: "Zwischen dem Helfen anderer und meinen eigenen Bedürfnissen", types: [2] },
          { text: "Zwischen Authentizität und dem Wunsch nach Erfolg", types: [3, 4] },
          { text: "Zwischen Rückzug und Verbindung", types: [5, 9] },
          { text: "Zwischen Sicherheit und Freiheit", types: [6, 7] },
          { text: "Zwischen Kontrolle und Vertrauen", types: [8] }
        ]
      },
      {
        id: 27,
        text: "Wie reagierst du auf Veränderungen?",
        answers: [
          { text: "Ich plane sorgfältig und bereite mich vor", types: [1, 6] },
          { text: "Ich bin aufgeregt und sehe Möglichkeiten", types: [7, 3] },
          { text: "Ich bin vorsichtig und brauche Zeit zum Anpassen", types: [5, 9] },
          { text: "Ich gehe direkt voran und nehme die Herausforderung an", types: [8] }
        ]
      },
      {
        id: 28,
        text: "Was gibt dir am meisten Energie?",
        answers: [
          { text: "Dinge richtig und gut zu machen", types: [1] },
          { text: "Anderen zu helfen und Verbindung zu spüren", types: [2, 9] },
          { text: "Erfolge zu feiern und Ziele zu erreichen", types: [3, 8] },
          { text: "Kreative Selbstentfaltung", types: [4, 7] },
          { text: "Wissen zu erwerben und zu verstehen", types: [5] },
          { text: "Sicherheit und Zugehörigkeit", types: [6] }
        ]
      },
      {
        id: 29,
        text: "Wie gehst du mit Unsicherheit um?",
        answers: [
          { text: "Ich versuche alles zu kontrollieren und zu planen", types: [1, 6] },
          { text: "Ich suche Unterstützung bei anderen", types: [2, 6] },
          { text: "Ich lenke mich ab oder fokussiere mich auf Positives", types: [7, 3] },
          { text: "Ich ziehe mich zurück und beobachte", types: [5, 9] },
          { text: "Ich konfrontiere sie direkt", types: [8] }
        ]
      },
      {
        id: 30,
        text: "Was ist deine größte Stärke in Beziehungen?",
        answers: [
          { text: "Meine Zuverlässigkeit und Integrität", types: [1, 6] },
          { text: "Meine Fürsorge und Empathie", types: [2, 9] },
          { text: "Meine Motivation und Inspiration", types: [3, 7] },
          { text: "Meine Tiefe und Authentizität", types: [4] },
          { text: "Meine Ruhe und Objektivität", types: [5] },
          { text: "Meine Ehrlichkeit und Stärke", types: [8] }
        ]
      }
    ]
  }
];

/**
 * Hilfsfunktion: Wählt die 10 relevantesten adaptiven Fragen
 * basierend auf den Top-Typen aus der Zwischenanalyse
 */
export function selectAdaptiveQuestions(topTypes: number[]): EnneagramQuestion[] {
  const selectedQuestions: EnneagramQuestion[] = [];
  const usedQuestionIds = new Set<number>();

  // Priorität 1: Fragen für die Top 2-3 Typen
  for (const group of ADAPTIVE_QUESTION_GROUPS) {
    // Prüfe ob diese Gruppe für einen der Top-Typen relevant ist
    const isRelevant = group.types.some(type => topTypes.includes(type));
    
    if (isRelevant) {
      for (const question of group.questions) {
        if (!usedQuestionIds.has(question.id) && selectedQuestions.length < 10) {
          selectedQuestions.push(question);
          usedQuestionIds.add(question.id);
        }
      }
    }
  }

  // Falls noch nicht 10 Fragen: Fülle mit gemischten Fragen auf
  if (selectedQuestions.length < 10) {
    const mixedGroup = ADAPTIVE_QUESTION_GROUPS.find(g => g.types.length === 9);
    if (mixedGroup) {
      for (const question of mixedGroup.questions) {
        if (!usedQuestionIds.has(question.id) && selectedQuestions.length < 10) {
          selectedQuestions.push(question);
          usedQuestionIds.add(question.id);
        }
      }
    }
  }

  return selectedQuestions;
}
