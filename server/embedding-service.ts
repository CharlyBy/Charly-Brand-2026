/**
 * Generate embedding for text using Manus Forge API
 * Returns 1536-dimensional vector
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    // Use OpenAI API directly (Manus Proxy doesn't support embeddings)
    const apiUrl = "https://api.openai.com/v1";
    const apiKey = process.env.OPEN_AI_KEY;
    
    if (!apiKey) {
      console.warn("[Embedding] Missing API credentials, falling back to keyword search");
      return null;
    }
    
    const response = await fetch(`${apiUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });
    
    if (!response.ok) {
      // Manus Forge API does not support embeddings yet (404)
      // Fall back to keyword search gracefully
      console.warn(`[Embedding] API not available (${response.status}), using keyword search fallback`);
      return null;
    }
    
    const data = await response.json() as { data: Array<{ embedding: number[] }> };
    
    if (!data.data || data.data.length === 0) {
      console.warn("[Embedding] No embedding returned, using keyword search fallback");
      return null;
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.warn("[Embedding] Generation failed, using keyword search fallback:", error);
    return null;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
