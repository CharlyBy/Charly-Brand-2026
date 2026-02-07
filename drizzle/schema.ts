import { real, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversations table - stores Luna chat sessions
 */
export const conversations = mysqlTable("conversations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  enneagramType: varchar("enneagramType", { length: 32 }),
  mainTopic: text("mainTopic"),
  intensity: int("intensity"),
  outcome: mysqlEnum("outcome", ["trance", "appointment", "abort", "ongoing"]),
  emergencyFlag: int("emergencyFlag").default(0).notNull(), // 0 = false, 1 = true
  email: varchar("email", { length: 320 }),
  firstName: varchar("firstName", { length: 100 }),
  recommendation: text("recommendation"), // Luna's recommendation (trance, appointment, etc.)
  enneagramConfidence: real("enneagram_confidence"), // Confidence score 0.0-1.0 for enneagram type
  enneagramAnswers: text("enneagram_answers"), // JSON array of user answers for enneagram questions
  enneagramAnalysis: text("enneagram_analysis"), // JSON object with detailed LLM-generated analysis
  userTier: mysqlEnum("userTier", ["free", "premium"]).default("free").notNull(), // User subscription tier
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table - stores individual messages in conversations
 */
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  conversationId: varchar("conversationId", { length: 64 }).notNull(),
  sender: mysqlEnum("sender", ["luna", "user"]).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Enneagram Analyses table - stores personality test results with LLM-generated analysis
 */
export const enneagramAnalyses = mysqlTable("enneagram_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userName: varchar("user_name", { length: 100 }).notNull(),
  userEmail: varchar("user_email", { length: 320 }).notNull(),
  primaryType: int("primary_type").notNull(), // 1-9
  wing: varchar("wing", { length: 10 }), // e.g., "1w2", "9w8"
  confidence: real("confidence").notNull(), // 0.0-1.0
  analysisJson: text("analysis_json").notNull(), // JSON object with LLM-generated analysis
  answersJson: text("answers_json").notNull(), // JSON array of user answers
  conversationId: varchar("conversation_id", { length: 64 }), // Optional link to conversation
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EnneagramAnalysis = typeof enneagramAnalyses.$inferSelect;
export type InsertEnneagramAnalysis = typeof enneagramAnalyses.$inferInsert;

/**
 * Stats table - anonymized statistics for analytics
 */
export const stats = mysqlTable("stats", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  totalChats: int("totalChats").default(0).notNull(),
  tranceSales: int("tranceSales").default(0).notNull(),
  appointmentsBooked: int("appointmentsBooked").default(0).notNull(),
  topics: text("topics"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Stats = typeof stats.$inferSelect;
export type InsertStats = typeof stats.$inferInsert;

/**
 * Trance Sessions table - stores generated hypnosis audio sessions
 */
export const tranceSessions = mysqlTable("tranceSessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  conversationId: varchar("conversationId", { length: 64 }),
  userId: int("userId"),
  enneagramType: varchar("enneagramType", { length: 32 }).notNull(),
  mainTopic: text("mainTopic").notNull(),
  scriptContent: text("scriptContent").notNull(), // Full hypnosis script
  audioUrl: text("audioUrl").notNull(), // S3 URL to audio file
  duration: int("duration"), // Duration in seconds
  isPaid: int("isPaid").default(0).notNull(), // 0 = free, 1 = paid
  email: varchar("email", { length: 320 }),
  firstName: varchar("firstName", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TranceSession = typeof tranceSessions.$inferSelect;
export type InsertTranceSession = typeof tranceSessions.$inferInsert;

/**
 * Subscriptions table - stores Stripe subscription data for Luna Premium
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Optional: link to users table if user is logged in
  email: varchar("email", { length: 320 }).notNull(), // Email for subscription (required)
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "unpaid", "incomplete", "incomplete_expired", "trialing", "paused"]).notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: int("cancelAtPeriodEnd").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Knowledge Articles table - stores educational PDF content for Wissen section
 */
export const knowledgeArticles = mysqlTable("knowledge_articles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier (e.g., "weisheit-des-koerpers")
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // "Körper & Seele", "Beziehungen", etc.
  thumbnailPath: varchar("thumbnailPath", { length: 255 }).notNull(), // Path to thumbnail image
  pdfPath: varchar("pdfPath", { length: 255 }).notNull(), // Path to PDF file
  pageCount: int("pageCount").notNull(),
  readingTime: int("readingTime").notNull(), // Reading time in minutes
  published: int("published").default(0).notNull(), // 0 = draft, 1 = published
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = typeof knowledgeArticles.$inferInsert;

/**
 * Backups table - stores metadata for database backups
 */
export const backups = mysqlTable("backups", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g., "backup-1737699600000"
  createdAt: timestamp("createdAt").notNull(),
  size: int("size").notNull(), // Backup file size in bytes
  tables: text("tables").notNull(), // JSON array of table names included in backup
  fileCount: int("fileCount").notNull(), // Number of S3 files referenced
  s3Url: varchar("s3Url", { length: 500 }).notNull(), // S3 URL to backup ZIP file
});

export type Backup = typeof backups.$inferSelect;
export type InsertBackup = typeof backups.$inferInsert;

/**
 * Article Views table - tracks analytics for knowledge articles
 */
export const articleViews = mysqlTable("article_views", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(), // Foreign key to knowledge_articles
  sessionId: varchar("sessionId", { length: 64 }).notNull(), // Unique session identifier
  deviceType: mysqlEnum("deviceType", ["desktop", "mobile", "tablet"]).notNull(),
  timeSpent: int("timeSpent").notNull(), // Time spent in seconds
  scrollDepth: int("scrollDepth").notNull(), // Scroll depth percentage (0-100)
  bounced: int("bounced").default(0).notNull(), // 0 = false, 1 = true (< 10 seconds)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArticleView = typeof articleViews.$inferSelect;
export type InsertArticleView = typeof articleViews.$inferInsert;

/**
 * Article Chunks table - stores text chunks from PDFs for RAG (Retrieval-Augmented Generation)
 */
export const articleChunks = mysqlTable("article_chunks", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(), // Foreign key to knowledge_articles
  chunkText: text("chunkText").notNull(), // Text content of the chunk (500-1000 chars)
  embedding: text("embedding").notNull(), // JSON array of embedding vector (OpenAI text-embedding-3-small: 1536 dimensions)
  pageNumber: int("pageNumber"), // Optional: page number in PDF
  chunkIndex: int("chunkIndex").notNull(), // Order of chunk in article (0, 1, 2, ...)
  enabledForLuna: int("enabledForLuna").default(1).notNull(), // 0 = disabled, 1 = enabled for Luna RAG
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArticleChunk = typeof articleChunks.$inferSelect;
export type InsertArticleChunk = typeof articleChunks.$inferInsert;


/**
 * Reviews table - stores client testimonials with anonymity options
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  rating: int("rating").notNull(), // 1-5 stars
  text: text("text"), // Optional review text (max 500 chars validated in frontend)
  name: varchar("name", { length: 100 }).notNull(), // Full name provided by client
  email: varchar("email", { length: 255 }).notNull(), // Email (not public, for verification)
  anonymityLevel: mysqlEnum("anonymityLevel", ["full", "first_initial", "initials", "anonymous"]).notNull(),
  // full: "Max Mustermann", first_initial: "Max M.", initials: "M. M.", anonymous: "Anonym"
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
