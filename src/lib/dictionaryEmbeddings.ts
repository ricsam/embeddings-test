/**
 * Dictionary embeddings loader and in-memory search
 * Loads pre-processed embeddings from JSON file
 */

export interface DictionaryEntry {
  word: string;
  type: string;
  meaning: string;
  embedding: number[];
  norm: number; // pre-computed for cosine similarity
}

interface EmbeddingsData {
  version: number;
  model: string;
  dimensions: number;
  totalEntries: number;
  generatedAt: string;
  entries: Array<{
    word: string;
    type: string;
    meaning: string;
    embedding: number[];
  }>;
}

let dictionaryEntries: DictionaryEntry[] = [];
let isLoaded = false;

/**
 * Load pre-processed embeddings from JSON file
 * Much faster than parsing CSV on every startup
 */
export async function loadDictionary(jsonPath: string): Promise<void> {
  if (isLoaded) {
    console.log("📚 Dictionary already loaded, skipping...");
    return;
  }

  console.log(`📖 Loading dictionary entries from ${jsonPath}...`);
  const startTime = performance.now();

  try {
    // Use Bun's fast JSON parsing
    const file = Bun.file(jsonPath);
    const data: EmbeddingsData = await file.json();

    // Pre-compute norms for all entries
    dictionaryEntries = data.entries.map((entry) => {
      const norm = Math.sqrt(
        entry.embedding.reduce((sum, val) => sum + val * val, 0)
      );
      return {
        ...entry,
        norm,
      };
    });

    isLoaded = true;
    const elapsed = (performance.now() - startTime).toFixed(0);
    const fileSizeMB = (await file.size) / (1024 * 1024);
    
    console.log(
      `✅ Loaded ${dictionaryEntries.length} entries (${data.dimensions}D) in ${elapsed}ms from ${fileSizeMB.toFixed(2)}MB file`
    );
  } catch (error) {
    console.error(`❌ Failed to load dictionary from ${jsonPath}:`, error);
    throw new Error(
      `Dictionary file not found. Run: bun scripts/prepare-embeddings.ts`
    );
  }
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(
  a: number[],
  b: number[],
  normA: number,
  normB: number
): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
  }

  return dotProduct / (normA * normB);
}

export interface SearchResult {
  word: string;
  type: string;
  meaning: string;
  score: number;
}

/**
 * Find the top-K most similar dictionary entries to a query embedding
 */
export function findNearestTerms(
  queryEmbedding: number[],
  topK: number = 5
): SearchResult[] {
  if (!isLoaded || dictionaryEntries.length === 0) {
    throw new Error("Dictionary not loaded. Call loadDictionary() first.");
  }

  // Compute query norm
  const queryNorm = Math.sqrt(
    queryEmbedding.reduce((sum, val) => sum + val * val, 0)
  );

  // Compute similarity for all entries
  const results: SearchResult[] = [];

  for (const entry of dictionaryEntries) {
    const score = cosineSimilarity(
      queryEmbedding,
      entry.embedding,
      queryNorm,
      entry.norm
    );
    results.push({
      word: entry.word,
      type: entry.type,
      meaning: entry.meaning,
      score,
    });
  }

  // Sort by score descending and take top K
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

/**
 * Get loaded entry count (for status/debugging)
 */
export function getLoadedCount(): number {
  return dictionaryEntries.length;
}
