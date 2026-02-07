import { getDb } from "./db";
import { knowledgeArticles, articleChunks } from "../drizzle/schema";
import { eq, like, or, and, sql } from "drizzle-orm";
import { generateEmbedding, cosineSimilarity } from "./embedding-service";

export interface SearchResult {
  articleId: number;
  title: string;
  slug: string;
  category: string;
  relevanceScore: number;
  matchType: "semantic" | "keyword" | "hybrid";
  snippet?: string;
  chunkId?: number;
  pageNumber?: number;
}

/**
 * Semantic search in RAG chunks using embeddings
 * Finds articles based on meaning, not just keywords
 */
export async function semanticSearch(
  query: string,
  limit: number = 10,
  threshold: number = 0.7
): Promise<SearchResult[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Generate embedding for search query
  const queryEmbedding = await generateEmbedding(query);
  
  // If embedding generation fails, return empty results
  // (hybrid search will fall back to keyword search)
  if (!queryEmbedding) {
    return [];
  }

  // Get all chunks with embeddings
  const chunks = await db
    .select()
    .from(articleChunks)
    .where(eq(articleChunks.enabledForLuna, 1));

  if (chunks.length === 0) {
    return [];
  }

  // Calculate similarity scores
  const scoredChunks = chunks
    .map((chunk) => {
      if (!chunk.embedding) return null;

      const similarity = cosineSimilarity(
        queryEmbedding,
        JSON.parse(chunk.embedding) as number[]
      );

      return {
        ...chunk,
        similarity,
      };
    })
    .filter((chunk): chunk is NonNullable<typeof chunk> => chunk !== null && chunk.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  // Get article details for matched chunks
  const results: SearchResult[] = [];
  const seenArticles = new Set<number>();

  for (const chunk of scoredChunks) {
    // Skip if we already have a result for this article
    if (seenArticles.has(chunk.articleId)) continue;
    seenArticles.add(chunk.articleId);

    const article = await db
      .select()
      .from(knowledgeArticles)
      .where(
        and(
          eq(knowledgeArticles.id, chunk.articleId),
          eq(knowledgeArticles.published, 1)
        )
      )
      .limit(1);

    if (article.length === 0) continue;

    // Extract snippet (50 chars before and after match)
    const snippet = extractSnippet(chunk.chunkText, query, 50);

    results.push({
      articleId: article[0].id,
      title: article[0].title,
      slug: article[0].slug,
      category: article[0].category,
      relevanceScore: Math.round(chunk.similarity * 100),
      matchType: "semantic",
      snippet,
      chunkId: chunk.id,
      pageNumber: chunk.pageNumber ?? undefined,
    });
  }

  return results;
}

/**
 * Keyword search in article titles and categories
 * Fast exact-match search
 */
export async function keywordSearch(
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const searchTerm = `%${query.toLowerCase()}%`;

  const articles = await db
    .select()
    .from(knowledgeArticles)
    .where(
      and(
        eq(knowledgeArticles.published, 1),
        or(
          sql`LOWER(${knowledgeArticles.title}) LIKE ${searchTerm}`,
          sql`LOWER(${knowledgeArticles.category}) LIKE ${searchTerm}`,
          sql`LOWER(${knowledgeArticles.description}) LIKE ${searchTerm}`
        )
      )
    )
    .limit(limit);

  return articles.map((article) => ({
    articleId: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    relevanceScore: 100, // Exact keyword match gets max score
    matchType: "keyword" as const,
    snippet: article.description || undefined,
  }));
}

/**
 * Hybrid search combining semantic and keyword search
 * Returns best results from both methods, ranked by relevance
 */
export async function hybridSearch(
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  // Run both searches in parallel
  // If semantic search fails (no embeddings), it returns empty array
  const [semanticResults, keywordResults] = await Promise.all([
    semanticSearch(query, limit, 0.6), // Lower threshold for hybrid
    keywordSearch(query, limit),
  ]);
  
  // If semantic search is not available, return keyword results only
  if (semanticResults.length === 0 && keywordResults.length > 0) {
    console.log("[Search] Using keyword-only search (embeddings not available)");
    return keywordResults;
  }

  // Combine results, prioritizing keyword matches
  const combinedMap = new Map<number, SearchResult>();

  // Add keyword results first (higher priority)
  for (const result of keywordResults) {
    combinedMap.set(result.articleId, {
      ...result,
      matchType: "hybrid",
      relevanceScore: result.relevanceScore + 10, // Boost keyword matches
    });
  }

  // Add semantic results (merge if article already exists)
  for (const result of semanticResults) {
    const existing = combinedMap.get(result.articleId);
    if (existing) {
      // Article found in both searches - boost score
      existing.relevanceScore = Math.min(
        100,
        existing.relevanceScore + result.relevanceScore / 2
      );
      existing.matchType = "hybrid";
      if (!existing.snippet && result.snippet) {
        existing.snippet = result.snippet;
      }
    } else {
      combinedMap.set(result.articleId, result);
    }
  }

  // Sort by relevance and return top N
  return Array.from(combinedMap.values())
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

/**
 * Extract snippet around query match
 * Returns text with context before and after the match
 */
function extractSnippet(
  text: string,
  query: string,
  contextLength: number = 50
): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    // Query not found exactly, return first N chars
    return text.substring(0, contextLength * 2) + "...";
  }

  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + query.length + contextLength);

  let snippet = text.substring(start, end);

  // Add ellipsis if needed
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return snippet;
}
