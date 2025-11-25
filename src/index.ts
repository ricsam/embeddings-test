import { serve } from "bun";
import index from "./index.html";
import { loadDictionary, getLoadedCount } from "./lib/dictionaryEmbeddings.ts";
import { suggestTerms, type SuggestTermsRequest } from "./lib/semanticSearch.ts";

// Load dictionary at startup
const EMBEDDINGS_JSON_PATH = "./dictionary-embeddings.json";
await loadDictionary(EMBEDDINGS_JSON_PATH);

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/suggest-terms": {
      async POST(req) {
        try {
          const body = (await req.json()) as SuggestTermsRequest;

          if (!body.query || typeof body.query !== "string") {
            return Response.json(
              { error: "Missing or invalid 'query' field" },
              { status: 400 }
            );
          }

          const topK = body.topK && typeof body.topK === "number" ? body.topK : 5;

          const result = await suggestTerms({ query: body.query, topK });

          return Response.json(result);
        } catch (error) {
          console.error("Error in /api/suggest-terms:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
          );
        }
      },
    },

    "/api/status": {
      async GET(_req) {
        return Response.json({
          status: "ok",
          dictionaryEntries: getLoadedCount(),
        });
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
