/**
 * High-level semantic search API
 * Combines OpenAI embedding + local dictionary search
 */

import { embedText } from "./openaiClient.ts";
import { findNearestTerms, type SearchResult } from "./dictionaryEmbeddings.ts";

export interface SuggestTermsRequest {
  query: string;
  topK?: number;
}

export interface SuggestTermsResponse {
  query: string;
  results: SearchResult[];
  elapsedMs: number;
}

/**
 * Suggest dictionary terms for a given free-text query
 */
export async function suggestTerms(
  request: SuggestTermsRequest
): Promise<SuggestTermsResponse> {
  const { query, topK = 5 } = request;

  if (!query || query.trim().length === 0) {
    throw new Error("Query cannot be empty");
  }

  const startTime = performance.now();

  // 1. Get embedding from OpenAI
  const queryEmbedding = await embedText(query.trim());

  // 2. Find nearest terms in dictionary
  const results = findNearestTerms(queryEmbedding, topK);

  const elapsedMs = Math.round(performance.now() - startTime);

  return {
    query: query.trim(),
    results,
    elapsedMs,
  };
}

