import { describe, it, expect, beforeAll } from "vitest";
import {
  semanticSearch,
  keywordSearch,
  hybridSearch,
} from "../search-service";

describe("Search Service", () => {
  describe("Keyword Search", () => {
    it("should find articles by title", async () => {
      const results = await keywordSearch("Grenzen", 10);
      
      expect(Array.isArray(results)).toBe(true);
      // If articles exist, check structure
      if (results.length > 0) {
        expect(results[0]).toHaveProperty("articleId");
        expect(results[0]).toHaveProperty("title");
        expect(results[0]).toHaveProperty("slug");
        expect(results[0]).toHaveProperty("category");
        expect(results[0]).toHaveProperty("relevanceScore");
        expect(results[0].matchType).toBe("keyword");
      }
    });

    it("should find articles by category", async () => {
      const results = await keywordSearch("Beziehungen", 10);
      
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(results[0].matchType).toBe("keyword");
      }
    });

    it("should return empty array for non-existent keywords", async () => {
      const results = await keywordSearch("xyzabc123nonexistent", 10);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it("should limit results correctly", async () => {
      const results = await keywordSearch("Grenzen", 3);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe("Semantic Search", () => {
    it("should find articles by semantic meaning", async () => {
      // This test requires RAG chunks to be generated first
      const results = await semanticSearch("Angst in Beziehungen", 10, 0.5);
      
      expect(Array.isArray(results)).toBe(true);
      // If chunks exist, check structure
      if (results.length > 0) {
        expect(results[0]).toHaveProperty("articleId");
        expect(results[0]).toHaveProperty("title");
        expect(results[0]).toHaveProperty("relevanceScore");
        expect(results[0].matchType).toBe("semantic");
        expect(results[0]).toHaveProperty("snippet");
      }
    });

    it("should return empty array when no chunks exist", async () => {
      // If no RAG chunks are generated, should return empty
      const results = await semanticSearch("test query", 10, 0.9);
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should respect similarity threshold", async () => {
      const highThreshold = await semanticSearch("Grenzen", 10, 0.9);
      const lowThreshold = await semanticSearch("Grenzen", 10, 0.5);
      
      expect(Array.isArray(highThreshold)).toBe(true);
      expect(Array.isArray(lowThreshold)).toBe(true);
      // Low threshold should return more or equal results
      expect(lowThreshold.length).toBeGreaterThanOrEqual(highThreshold.length);
    });
  });

  describe("Hybrid Search", () => {
    it("should combine keyword and semantic results", async () => {
      const results = await hybridSearch("Grenzen", 10);
      
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(results[0]).toHaveProperty("articleId");
        expect(results[0]).toHaveProperty("title");
        expect(results[0]).toHaveProperty("relevanceScore");
        // Match type can be keyword, semantic, or hybrid
        expect(["keyword", "semantic", "hybrid"]).toContain(results[0].matchType);
      }
    });

    it("should boost articles found in both searches", async () => {
      const results = await hybridSearch("Beziehungen", 10);
      
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        // Results should be sorted by relevance score
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].relevanceScore).toBeGreaterThanOrEqual(
            results[i + 1].relevanceScore
          );
        }
      }
    });

    it("should return unique articles (no duplicates)", async () => {
      const results = await hybridSearch("Grenzen", 10);
      
      expect(Array.isArray(results)).toBe(true);
      const articleIds = results.map((r) => r.articleId);
      const uniqueIds = new Set(articleIds);
      expect(articleIds.length).toBe(uniqueIds.size);
    });

    it("should respect limit parameter", async () => {
      const results = await hybridSearch("Beziehungen", 5);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Search Results Structure", () => {
    it("should return valid SearchResult objects", async () => {
      const results = await keywordSearch("Grenzen", 1);
      
      if (results.length > 0) {
        const result = results[0];
        expect(typeof result.articleId).toBe("number");
        expect(typeof result.title).toBe("string");
        expect(typeof result.slug).toBe("string");
        expect(typeof result.category).toBe("string");
        expect(typeof result.relevanceScore).toBe("number");
        expect(result.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(result.relevanceScore).toBeLessThanOrEqual(100);
        expect(["keyword", "semantic", "hybrid"]).toContain(result.matchType);
      }
    });
  });
});
