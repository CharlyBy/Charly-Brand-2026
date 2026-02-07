// Strukturierte Daten für "Die Weisheit des Körpers" Slide-Präsentation
// Basierend auf dem NotebookLM-Dokument von Gerald Hüther

export interface Slide {
  id: number;
  type: 'title' | 'comparison' | 'concept' | 'glossary' | 'casestudy' | 'process' | 'practice';
  title: string;
  subtitle?: string;
  content: string | ComparisonContent | GlossaryContent | CaseStudyContent | ProcessContent | PracticeContent;
  insight?: string;
  color?: 'green' | 'violet' | 'orange' | 'red';
}

export interface ComparisonContent {
  left: {
    title: string;
    icon: string;
    color: string;
    points: string[];
  };
  right: {
    title: string;
    icon: string;
    color: string;
    points: string[];
  };
  conclusion: string;
}

export interface GlossaryContent {
  items: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface CaseStudyContent {
  cases: Array<{
    name: string;
    subtitle: string;
    symptom: string;
    cause: string;
    solution: string;
  }>;
}

export interface ProcessContent {
  steps: Array<{
    level: number;
    title: string;
    color: string;
    description: string;
    reaction: string;
  }>;
  conclusion: string;
}

export interface PracticeContent {
  steps: Array<{
    number: number;
    title: string;
    icon: string;
    description: string;
    hint?: string;
  }>;
}

export const slides: Slide[] = [
  // Slide 1: Titelseite
  {
    id: 1,
    type: 'title',
    title: 'Der stille Ruf deines Körpers',
    subtitle: 'Eine neurobiologische Reise zurück zu dir selbst. Basierend auf den Erkenntnissen von Gerald Hüther.',
    content: 'Dein Körper spricht permanent zu dir. Er nutzt Signale, Symptome und Schmerzen. Doch in der modernen Welt haben wir verlernt, diese Sprache zu verstehen. Dies ist keine medizinische Anleitung, sondern eine Einladung: Verstehe die Biologie deiner Seele.',
  },

  // Slide 2: Müdigkeit Vergleich
  {
    id: 2,
    type: 'comparison',
    title: 'Müdigkeit ist nicht gleich Müdigkeit',
    content: {
      left: {
        title: 'Physische Müdigkeit',
        icon: '🔋',
        color: 'green',
        points: [
          'Ursache: Sport, Arbeit, Bewegung',
          'Lösung: Schlaf, Ruhe, Erholung',
          'Resultat: Energie kehrt zurück',
        ],
      },
      right: {
        title: 'Seelenmüdigkeit',
        icon: '⚡',
        color: 'orange',
        points: [
          'Ursache: Leben gegen die eigene Wahrheit',
          'Unterdrückung von Gefühlen',
          'Tragen von Masken',
          'Warnsignal: Du kannst 10 Stunden schlafen oder zwei Wochen Urlaub machen und wachst trotzdem erschöpft auf',
        ],
      },
      conclusion: 'Diese Müdigkeit ist nicht körperlich. Sie ist ein Hilfeschrei deines tiefsten Selbst.',
    } as ComparisonContent,
  },

  // Slide 3: Körper-Geist-Einheit
  {
    id: 3,
    type: 'concept',
    title: 'Das Ende der künstlichen Trennung',
    subtitle: 'Körper und Geist sind keine getrennten Entitäten. Sie sind ein System. Eine Einheit.',
    content: 'Seit Descartes dominiert der "Kartesianische Dualismus" das westliche Denken: Körper als Maschine, Geist als getrennt. Doch die Realität ist: Was im Körper geschieht, geschieht im Geist – und umgekehrt. Angst wird zu Herzrasen. Trauer wird zu einer schweren Brust. Freude wird zu körperlicher Leichtigkeit.',
    insight: 'Wenn du deinen Körper ignorierst, ignorierst du deine Seele.',
    color: 'violet',
  },

  // Slide 4: Vagusnerv
  {
    id: 4,
    type: 'concept',
    title: 'Die Neurobiologie der Verbindung: Der Vagusnerv',
    content: '80% der Vagusfasern sind afferent – sie senden Signale vom Körper zum Gehirn, nicht umgekehrt. Dein Körper informiert dein Gehirn (insbesondere die Insula) konstant über deinen wahren Zustand. Die Konsequenz: Dein Körper weiß oft vor deinem Verstand, was du brauchst. Deine Gefühle entstehen zuerst im Körper, dann im Kopf.',
    color: 'green',
  },

  // Slide 5: Somatisierung
  {
    id: 5,
    type: 'concept',
    title: 'Somatisierung: Wenn Worte fehlen',
    content: 'Oft fehlen uns die Worte für Not, Schmerz oder Überforderung (Alexithymie). Wenn die Psyche schweigt, übernimmt der Körper die Kommunikation. Seelische Belastung wird zu körperlichem Symptom. Beispiel Burnout: Eine Person kann nicht sagen "Ich brauche eine Pause", weil sie es als Schwäche empfindet. Also sagt der Körper "Stopp" durch einen Zusammenbruch.',
    insight: 'Symptome sind keine Feinde. Sie sind ein Schutzmechanismus und ein verzweifelter Ruf nach Veränderung.',
    color: 'orange',
  },

  // Slide 6: Eskalationsleiter
  {
    id: 6,
    type: 'process',
    title: 'Die Eskalationsleiter: Vom Flüstern zum Schreien',
    content: {
      steps: [
        {
          level: 1,
          title: 'Das Flüstern',
          color: 'green',
          description: 'Leichte Müdigkeit, Verspannung, Unbehagen',
          reaction: 'Oft ignoriert',
        },
        {
          level: 2,
          title: 'Das Sprechen',
          color: 'orange',
          description: 'Chronische Schmerzen, Reizdarm, Schlaflosigkeit',
          reaction: 'Schmerzmittel, Kaffee, "Durchhalten"',
        },
        {
          level: 3,
          title: 'Das Schreien',
          color: 'red',
          description: 'Herzinfarkt, Depression, Zusammenbruch',
          reaction: 'Die Botschaft: "Stopp. Ändere dein Leben. Jetzt."',
        },
      ],
      conclusion: 'Warte nicht, bis dein Körper schreit. Heilung ist einfacher, wenn du auf das Flüstern hörst.',
    } as ProcessContent,
  },

  // Slide 7: Glossar der Schmerzen
  {
    id: 7,
    type: 'glossary',
    title: 'Ein Glossar der Schmerzen',
    content: {
      items: [
        {
          icon: '🧠',
          title: 'Kopf (Migräne)',
          description: 'Überforderung. Zu viel Denken, Planen und Sorgen. Die Seele ruft nach Ruhe vom Verstand.',
        },
        {
          icon: '🦴',
          title: 'Rücken/Nacken',
          description: 'Last und Verantwortung. "Ich kann nicht mehr tragen." Mangelnde Unterstützung.',
        },
        {
          icon: '🫀',
          title: 'Magen/Darm',
          description: 'Unverdaute Emotionen. Angst und Kontrolle. Etwas im Leben ist "schwer zu schlucken".',
        },
        {
          icon: '🌸',
          title: 'Haut',
          description: 'Grenzen und Schutz. Die Barriere zwischen dir und der Welt ist verletzt.',
        },
        {
          icon: '❤️',
          title: 'Herz',
          description: 'Trauer und Verlust. Unterdrückte Liebe oder Verbindung.',
        },
      ],
    } as GlossaryContent,
  },

  // Slide 8: Fallstudien
  {
    id: 8,
    type: 'casestudy',
    title: 'Fallstudien: Wenn die Seele den Körper stoppt',
    content: {
      cases: [
        {
          name: 'Der Manager (Martin)',
          subtitle: 'Die Last',
          symptom: 'Chronische Rückenschmerzen',
          cause: 'Trug die Verantwortung für alle, fühlte sich einsam',
          solution: 'Grenzen setzen, Verantwortung abgeben. Der Rücken heilte, als die Lebenslast sank.',
        },
        {
          name: 'Die Anwältin (Claudia)',
          subtitle: 'Der Funktionsmodus',
          symptom: 'Panikattacken',
          cause: 'Arbeitete 70 Stunden, ignorierte frühe Signale',
          solution: 'Erkannte, dass ihr Körper sie vor einem Leben rettete, das sie tötete.',
        },
        {
          name: 'Die Perfektionistin (Elena)',
          subtitle: 'Der Schutz',
          symptom: 'Schwere Ekzeme',
          cause: 'Innere Kritik, keine Grenzen',
          solution: 'Selbstakzeptanz und Schutz des eigenen Raums.',
        },
      ],
    } as CaseStudyContent,
  },

  // Slide 9: Paradigmenwechsel
  {
    id: 9,
    type: 'comparison',
    title: 'Der Paradigmenwechsel: Vom Kampf zur Kooperation',
    content: {
      left: {
        title: 'Körper als Maschine',
        icon: '⚙️',
        color: 'gray',
        points: [
          'Reparatur beim Arzt (Mechaniker) wenn defekt',
        ],
      },
      right: {
        title: 'Körper als Partner',
        icon: '🤝',
        color: 'green',
        points: [
          'Dein weisester Berater und Freund',
        ],
      },
      conclusion: 'Dein Körper ist nicht gegen dich. Er versucht, dich zu retten. Heilung bedeutet nicht immer, dass Symptome sofort verschwinden. Heilung bedeutet, wieder in eine richtige Beziehung mit deinem Körper zu treten. Hören, Antworten, Ehren.',
    } as ComparisonContent,
  },

  // Slide 10: Praxis - Kontaktaufnahme
  {
    id: 10,
    type: 'practice',
    title: 'Praxis I: Die Kontaktaufnahme',
    content: {
      steps: [
        {
          number: 1,
          title: 'Der Bodyscan',
          icon: '🧘',
          description: 'Nimm dir täglich 10 Minuten. Scanne deinen Körper von den Füßen aufwärts.',
          hint: 'Ziel: Nur wahrnehmen, nicht urteilen. Wo ist Spannung? Wo ist Energie?',
        },
        {
          number: 2,
          title: 'Die Frage',
          icon: '❓',
          description: 'Frage deinen Körper mehrmals täglich direkt: "Was brauchst du jetzt?"',
          hint: 'Die Antwort kommt nicht in Worten, sondern als Gefühl, Impuls oder Wissen (Ruhe, Wasser, Bewegung).',
        },
        {
          number: 3,
          title: 'Interozeption trainieren',
          icon: '🌀',
          description: 'Je öfter du fragst, desto feiner wird deine Wahrnehmung für die leisen Signale.',
        },
      ],
    } as PracticeContent,
  },
];
