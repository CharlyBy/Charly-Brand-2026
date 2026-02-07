import { eq, desc, count, sql } from "drizzle-orm";
import { getDb } from "./db";
import { knowledgeArticles, articleChunks, type InsertKnowledgeArticle } from "../drizzle/schema";

/**
 * Get all published knowledge articles
 */
export async function getAllPublishedArticles() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.published, 1))
    .orderBy(desc(knowledgeArticles.createdAt));
}

/**
 * Get all articles (including drafts) - admin only
 * Returns articles with chunk count for RAG status
 */
export async function getAllArticles() {
  const db = await getDb();
  if (!db) return [];
  
  // Get all articles
  const articles = await db
    .select()
    .from(knowledgeArticles)
    .orderBy(desc(knowledgeArticles.createdAt));
  
  // Get chunk counts for all articles
  const chunkCounts = await db
    .select({
      articleId: articleChunks.articleId,
      count: sql<number>`CAST(COUNT(*) AS SIGNED)`.as('count')
    })
    .from(articleChunks)
    .groupBy(articleChunks.articleId);
  
  // Create a map of article ID to chunk count
  const chunkCountMap = new Map(
    chunkCounts.map(row => [row.articleId, Number(row.count)])
  );
  
  // Add chunk count to each article
  return articles.map(article => ({
    ...article,
    chunkCount: chunkCountMap.get(article.id) || 0
  }));
}

/**
 * Get article by slug
 */
export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.slug, slug))
    .limit(1);
  return results[0] || null;
}

/**
 * Get article by ID
 */
export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.id, id))
    .limit(1);
  return results[0] || null;
}

/**
 * Create new article
 */
export async function createArticle(article: InsertKnowledgeArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(knowledgeArticles).values(article);
  return result[0].insertId;
}

/**
 * Update article
 */
export async function updateArticle(id: number, updates: Partial<InsertKnowledgeArticle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(knowledgeArticles)
    .set(updates)
    .where(eq(knowledgeArticles.id, id));
}

/**
 * Delete article
 */
export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(knowledgeArticles)
    .where(eq(knowledgeArticles.id, id));
}

/**
 * Publish article
 */
export async function publishArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(knowledgeArticles)
    .set({ published: 1 })
    .where(eq(knowledgeArticles.id, id));
}

/**
 * Unpublish article
 */
export async function unpublishArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(knowledgeArticles)
    .set({ published: 0 })
    .where(eq(knowledgeArticles.id, id));
}
