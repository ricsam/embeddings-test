const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const OPENAI_EMBEDDING_MODEL = "text-embedding-3-large";
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";

interface OpenAIEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
    object: string;
  }>;
  model: string;
  object: string;
}

export async function embedText(input: string): Promise<number[]> {
  if (!input.trim()) {
    throw new Error("Input text for embedding must not be empty");
  }

  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `OpenAI embeddings request failed with ${response.status} ${response.statusText}${
        text ? `: ${text}` : ""
      }`,
    );
  }

  const json = (await response.json()) as OpenAIEmbeddingResponse;

  if (!json.data?.length) {
    throw new Error("OpenAI embeddings response contained no data");
  }

  return json.data[0]!.embedding;
}

export async function embedTexts(inputs: string[]): Promise<number[][]> {
  const sanitized = inputs.map((text) => text.trim());

  if (sanitized.length === 0) {
    return [];
  }

  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: sanitized,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `OpenAI embeddings request failed with ${response.status} ${response.statusText}${
        text ? `: ${text}` : ""
      }`,
    );
  }

  const json = (await response.json()) as OpenAIEmbeddingResponse;

  if (!json.data?.length || json.data.length !== sanitized.length) {
    throw new Error("OpenAI embeddings response size did not match inputs");
  }

  return json.data.map((item) => item.embedding);
}


