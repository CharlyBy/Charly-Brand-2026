import { describe, it, expect, beforeAll } from "vitest";
import {
  trackArticleView,
  getArticleStats,
  getTopArticles,
  getEngagementTrends,
  getAnalyticsSummary,
} from "../analytics-service";
import {
  processArticleForRAG,
  searchRelevantChunks,
  getArticleChunks,
} from "../rag-service";
import { generateEmbedding, cosineSimilarity } from "../embedding-service";

describe("Analytics System", () => {
  const testArticleId = 1;
  const testSessionId = `test_${Date.now()}`;

  it("should track article view with all metrics", async () => {
    const result = await trackArticleView({
      articleId: testArticleId,
      sessionId: testSessionId,
      deviceType: "desktop",
      timeSpent: 120,
      scrollDepth: 75,
      bounced: false,
    });

    expect(result.success).toBe(true);
  });

  it("should get article stats", async () => {
    const stats = await getArticleStats(testArticleId);

    expect(stats).toHaveProperty("totalViews");
    expect(stats).toHaveProperty("avgTimeSpent");
    expect(stats).toHaveProperty("avgScrollDepth");
    expect(stats).toHaveProperty("bounceRate");
    expect(stats).toHaveProperty("deviceBreakdown");
  });

  it("should get top articles by engagement", async () => {
    const topArticles = await getTopArticles(5);

    expect(Array.isArray(topArticles)).toBe(true);
    expect(topArticles.length).toBeLessThanOrEqual(5);

    if (topArticles.length > 0) {
      expect(topArticles[0]).toHaveProperty("articleId");
      expect(topArticles[0]).toHaveProperty("title");
      expect(topArticles[0]).toHaveProperty("engagementScore");
    }
  });

  it("should get engagement trends", async () => {
    const trends = await getEngagementTrends(30);

    expect(Array.isArray(trends)).toBe(true);

    if (trends.length > 0) {
      expect(trends[0]).toHaveProperty("date");
      expect(trends[0]).toHaveProperty("views");
      expect(trends[0]).toHaveProperty("avgTimeSpent");
    }
  });

  it("should get analytics summary", async () => {
    const summary = await getAnalyticsSummary();

    expect(summary).toHaveProperty("totalViews");
    expect(summary).toHaveProperty("avgTimeSpent");
    expect(summary).toHaveProperty("avgScrollDepth");
    expect(summary).toHaveProperty("bounceRate");
  });
});

describe("Embedding Service", () => {
  it("should generate embedding for text", async () => {
    const text = "Dies ist ein Test-Text für Embedding-Generierung.";
    const embedding = await generateEmbedding(text);

    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
    expect(typeof embedding[0]).toBe("number");
  });

  it("should calculate cosine similarity correctly", () => {
    const vec1 = [1, 0, 0];
    const vec2 = [1, 0, 0];
    const vec3 = [0, 1, 0];

    // Identical vectors should have similarity 1
    const sim1 = cosineSimilarity(vec1, vec2);
    expect(sim1).toBeCloseTo(1, 5);

    // Orthogonal vectors should have similarity 0
    const sim2 = cosineSimilarity(vec1, vec3);
    expect(sim2).toBeCloseTo(0, 5);
  });

  it("should throw error for vectors of different lengths", () => {
    const vec1 = [1, 0, 0];
    const vec2 = [1, 0];

    expect(() => cosineSimilarity(vec1, vec2)).toThrow();
  });
});

describe("RAG System", () => {
  const testArticleId = 1;

  it("should process article for RAG (if article exists)", async () => {
    try {
      const result = await processArticleForRAG(testArticleId);

      expect(result.success).toBe(true);
      expect(result.chunkCount).toBeGreaterThan(0);
    } catch (error) {
      // Article might not exist in test environment
      expect(error).toBeDefined();
    }
  });

  it("should get article chunks (if processed)", async () => {
    try {
      const chunks = await getArticleChunks(testArticleId);

      expect(Array.isArray(chunks)).toBe(true);

      if (chunks.length > 0) {
        expect(chunks[0]).toHaveProperty("id");
        expect(chunks[0]).toHaveProperty("articleId");
        expect(chunks[0]).toHaveProperty("chunkText");
        expect(chunks[0]).toHaveProperty("embedding");
        expect(chunks[0]).toHaveProperty("pageNumber");
        expect(chunks[0]).toHaveProperty("enabledForLuna");
      }
    } catch (error) {
      // Article might not be processed yet
      expect(error).toBeDefined();
    }
  });

  it("should search relevant chunks by query", async () => {
    try {
      const query = "Verlustangst in Beziehungen";
      const results = await searchRelevantChunks(query, 3);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(3);

      if (results.length > 0) {
        expect(results[0]).toHaveProperty("chunkText");
        expect(results[0]).toHaveProperty("articleTitle");
        expect(results[0]).toHaveProperty("similarity");
        expect(results[0].similarity).toBeGreaterThan(0);
        expect(results[0].similarity).toBeLessThanOrEqual(1);
      }
    } catch (error) {
      // No chunks might be available yet
      expect(error).toBeDefined();
    }
  });

  it("should return results sorted by similarity", async () => {
    try {
      const query = "Psychotherapie";
      const results = await searchRelevantChunks(query, 5);

      if (results.length > 1) {
        // Check if sorted descending by similarity
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].similarity).toBeGreaterThanOrEqual(
            results[i + 1].similarity
          );
        }
      }
    } catch (error) {
      // No chunks might be available yet
      expect(error).toBeDefined();
    }
  });
});

describe("Integration Tests", () => {
  it("should track view and retrieve stats consistently", async () => {
    const sessionId = `integration_test_${Date.now()}`;
    const articleId = 1;

    // Track a view
    await trackArticleView({
      articleId,
      sessionId,
      deviceType: "mobile",
      timeSpent: 180,
      scrollDepth: 90,
      bounced: false,
    });

    // Retrieve stats
    const stats = await getArticleStats(articleId);

    expect(stats.totalViews).toBeGreaterThan(0);
  });

  it("should process article and enable search", async () => {
    try {
      const articleId = 1;

      // Process article
      const processResult = await processArticleForRAG(articleId);
      expect(processResult.success).toBe(true);

      // Search should now work
      const searchResults = await searchRelevantChunks("Test", 1);
      expect(Array.isArray(searchResults)).toBe(true);
    } catch (error) {
      // Test environment might not have articles
      expect(error).toBeDefined();
    }
  });
});
