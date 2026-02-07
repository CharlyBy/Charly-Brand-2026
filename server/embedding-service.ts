/**
 * Generate embedding for text using OpenAI API
 * Returns 1536-dimensional vector
 * 
 * Key-Aufloesung (Prioritaet):
 * 1. OPENAI_EMBEDDING_KEY (dedizierter Embedding-Key)
 * 2. OPEN_AI_KEY (allgemeiner OpenAI-Key)
 * 3. OPENAI_API_KEY (alternativer Name)
 * 4. OPENAI_TTS_KEY (TTS-Key als letzter Fallback, da auch OpenAI)
 * 
 * WICHTIG: BUILT_IN_FORGE_API_KEY funktioniert NICHT fuer Embeddings,
 * da die Forge/Manus-Proxy-API keine Embedding-Endpunkte unterstuetzt.
 */

let _embeddingKeyWarningLogged = false;

function resolveEmbeddingKey(): string | null {
  const key = process.env.OPENAI_EMBEDDING_KEY
    || process.env.OPEN_AI_KEY
    || process.env.OPENAI_API_KEY
    || process.env.OPENAI_TTS_KEY
    || null;

  if (!key && !_embeddingKeyWarningLogged) {
    _embeddingKeyWarningLogged = true;
    console.warn(
      "[Embedding] WARNUNG: Kein OpenAI API-Key gefunden. " +
      "Setze OPENAI_EMBEDDING_KEY, OPEN_AI_KEY oder OPENAI_API_KEY. " +
      "RAG-Suche faellt auf Keyword-Suche zurueck."
    );
  }

  return key;
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const apiKey = resolveEmbeddingKey();
    
    if (!apiKey) {
      return null;
    }
    
    const response = await fetch("https://api.openai.com/v1/embeddings", {
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
      const errorBody = await response.text().catch(() => '');
      console.warn(
        `[Embedding] API-Fehler (${response.status}): ${errorBody.substring(0, 200)}. ` +
        `Keyword-Suche wird verwendet.`
      );
      return null;
    }
    
    const data = await response.json() as { data: Array<{ embedding: number[] }> };
    
    if (!data.data || data.data.length === 0) {
      console.warn("[Embedding] Keine Embedding-Daten erhalten, Keyword-Suche als Fallback");
      return null;
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.warn("[Embedding] Generierung fehlgeschlagen, Keyword-Suche als Fallback:", 
      error instanceof Error ? error.message : error
    );
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
