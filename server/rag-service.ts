import { getDb } from "./db";
import { articleChunks, knowledgeArticles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateEmbedding, cosineSimilarity } from "./embedding-service";
import { invokeLLM } from "./_core/llm";

/**
 * Extract text from images using Vision API (OCR)
 */
async function extractTextFromImages(imageUrls: string[]): Promise<string[]> {
  const pages: string[] = [];
  
  console.log(`[OCR] Processing ${imageUrls.length} images...`);
  
  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    console.log(`[OCR] Processing image ${i + 1}/${imageUrls.length}: ${imageUrl}`);
    
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high"
                }
              },
              {
                type: "text",
                text: "Extract all text from this image. Return only the text content, without any additional commentary or formatting. Preserve the original text structure as much as possible."
              }
            ]
          }
        ]
      });
      
      const content = response.choices[0]?.message?.content || "";
      const extractedText = typeof content === "string" ? content : "";
      
      if (extractedText.trim().length > 0) {
        pages.push(extractedText);
        console.log(`[OCR] Extracted ${extractedText.length} characters from page ${i + 1}`);
      } else {
        console.warn(`[OCR] No text extracted from page ${i + 1}`);
      }
    } catch (error) {
      console.error(`[OCR] Error processing image ${i + 1}:`, error);
      // Continue with next image even if one fails
    }
  }
  
  return pages;
}

/**
 * Split text into chunks (500-1000 characters with overlap)
 */
function splitIntoChunks(text: string, chunkSize: number = 800, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    start += chunkSize - overlap;
  }
  
  return chunks;
}



/**
 * Process article and create chunks with embeddings
 */
export async function processArticleForRAG(articleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Get article
  const article = await db
    .select()
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.id, articleId))
    .limit(1);
  
  if (!article || article.length === 0) {
    throw new Error(`Article ${articleId} not found`);
  }
  
  const articleData = article[0];
  
  console.log(`[RAG] Processing article: ${articleData.title}`);
  
  // Generate image URLs from pdfPath
  const baseUrl = articleData.pdfPath.replace("/document.pdf", "");
  const imageUrls: string[] = [];
  
  for (let i = 1; i <= articleData.pageCount; i++) {
    const pageNum = String(i).padStart(2, "0");
    imageUrls.push(`${baseUrl}/page-${pageNum}.webp`);
  }
  
  console.log(`[RAG] Generated ${imageUrls.length} image URLs`);
  
  // Extract text from images using OCR
  const pages = await extractTextFromImages(imageUrls);
  console.log(`[RAG] Extracted text from ${pages.length} pages`);
  
  // Delete existing chunks for this article
  await db.delete(articleChunks).where(eq(articleChunks.articleId, articleId));
  
  // Process each page
  let chunkIndex = 0;
  
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageText = pages[pageIndex];
    const chunks = splitIntoChunks(pageText);
    
    console.log(`[RAG] Page ${pageIndex + 1}: ${chunks.length} chunks`);
    
    for (const chunkText of chunks) {
      // Generate embedding
      const embedding = await generateEmbedding(chunkText);
      
      // Skip chunk if embedding generation fails
      if (!embedding) {
        console.warn(`[RAG] Skipping chunk ${chunkIndex} (embedding failed)`);
        continue;
      }
      
      // Store chunk
      await db.insert(articleChunks).values({
        articleId,
        chunkText,
        embedding: JSON.stringify(embedding),
        pageNumber: pageIndex + 1,
        chunkIndex: chunkIndex++,
        enabledForLuna: 1,
      });
    }
  }
  
  console.log(`[RAG] Created ${chunkIndex} chunks for article ${articleId}`);
  
  return { success: true, chunkCount: chunkIndex };
}



/**
 * Search for relevant chunks based on query
 */
export async function searchRelevantChunks(query: string, limit: number = 5) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);
  
  // If embedding generation fails, return empty array
  if (!queryEmbedding) {
    console.warn("[RAG] Embedding generation failed, returning empty results");
    return [];
  }
  
  // Get all enabled chunks
  const chunks = await db
    .select()
    .from(articleChunks)
    .where(eq(articleChunks.enabledForLuna, 1));
  
  // Calculate similarity scores
  const scoredChunks = chunks.map((chunk) => {
    const chunkEmbedding = JSON.parse(chunk.embedding);
    const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
    
    return {
      ...chunk,
      similarity,
    };
  });
  
  // Sort by similarity and return top N
  const topChunks = scoredChunks
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
  
  // Get article details for each chunk
  const chunksWithArticles = await Promise.all(
    topChunks.map(async (chunk) => {
      const article = await db
        .select()
        .from(knowledgeArticles)
        .where(eq(knowledgeArticles.id, chunk.articleId))
        .limit(1);
      
      return {
        chunkText: chunk.chunkText,
        articleTitle: article[0]?.title || "Unknown",
        articleSlug: article[0]?.slug || "",
        pageNumber: chunk.pageNumber,
        similarity: chunk.similarity,
      };
    })
  );
  
  return chunksWithArticles;
}

/**
 * Get all chunks for an article (for admin review)
 */
export async function getArticleChunks(articleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const chunks = await db
    .select()
    .from(articleChunks)
    .where(eq(articleChunks.articleId, articleId));
  
  return chunks;
}

/**
 * Toggle chunk enabled status
 */
export async function toggleChunkEnabled(chunkId: number, enabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .update(articleChunks)
    .set({ enabledForLuna: enabled ? 1 : 0 })
    .where(eq(articleChunks.id, chunkId));
  
  return { success: true };
}

/**
 * Delete all chunks for an article
 */
export async function deleteArticleChunks(articleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const result = await db
    .delete(articleChunks)
    .where(eq(articleChunks.articleId, articleId));
  
  console.log(`[RAG] Deleted all chunks for article ${articleId}`);
  return { success: true, deletedCount: result[0].affectedRows };
}

/**
 * Regenerate chunks for an article (delete old + create new)
 */
export async function regenerateArticleChunks(articleId: number) {
  console.log(`[RAG] Regenerating chunks for article ${articleId}...`);
  
  // Delete old chunks
  await deleteArticleChunks(articleId);
  
  // Generate new chunks
  const result = await processArticleForRAG(articleId);
  
  console.log(`[RAG] Regenerated ${result.chunkCount} chunks for article ${articleId}`);
  return result;
}
