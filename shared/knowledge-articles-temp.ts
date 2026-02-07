// Temporary data structure for knowledge articles
// Will be replaced by database in Phase 3

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  thumbnailPath: string;
  pdfPath: string;
  pageCount: number;
  readingTime: number; // in minutes
  published: boolean;
  createdAt: Date;
}

export const KNOWLEDGE_CATEGORIES = [
  "Alle",
  "Körper & Seele",
  "Beziehungen",
  "Angst & Mut",
  "Selbsterkenntnis",
] as const;

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

// Temporary hardcoded articles (will be replaced by database)
export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "1",
    slug: "weisheit-des-koerpers",
    title: "Die Weisheit des Körpers",
    description:
      "Eine neurobiologische Reise zurück zu dir selbst. Basierend auf den Erkenntnissen von Gerald Hüther. Verstehe die Biologie deiner Seele und lerne, die Sprache deines Körpers zu entschlüsseln.",
    category: "Körper & Seele",
    thumbnailPath: "/images/thumbnails/weisheit-des-koerpers.webp",
    pdfPath: "/Die_Weisheit_des_Körpers.pdf",
    pageCount: 15,
    readingTime: 8, // 15 pages × 30 seconds = 7.5 minutes, rounded to 8
    published: true,
    createdAt: new Date("2026-01-23"),
  },
];
