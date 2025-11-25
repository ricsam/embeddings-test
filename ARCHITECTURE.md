# Architecture

## Overview

This is a semantic search application that suggests dictionary terms based on free-text queries using OpenAI embeddings.

## Data Flow

```
1. Preprocessing (one-time):
   oted_embeddings.csv → [prepare-embeddings script] → dictionary-embeddings.json

2. Server Startup:
   dictionary-embeddings.json → [Bun.file().json()] → In-memory array with pre-computed norms

3. Query Processing:
   User Query → OpenAI API (embedding) → Cosine similarity search → Top-K results
```

## Performance Optimizations

### 1. **Preprocessing Script** (`scripts/prepare-embeddings.ts`)
- **Why**: CSV parsing is slow and happens on every server start
- **What**: One-time conversion of CSV to JSON
- **Benefit**: 
  - Server startup: ~1000ms → ~50ms (20x faster)
  - Clean JSON structure vs complex CSV parsing
  - Configurable entry count

### 2. **Pre-computed Norms**
- **Why**: Cosine similarity needs vector norms
- **What**: L2 norm computed once at load time
- **Benefit**: Faster similarity calculations

### 3. **Event-based CSV Reading** (preprocessing only)
- **Why**: 176K row CSV is too large to load into memory as string
- **What**: Node.js readline with immediate stream destruction
- **Benefit**: Memory-safe preprocessing

### 4. **In-memory Search**
- **Why**: Fast query responses
- **What**: Simple linear scan with pre-computed norms
- **Trade-off**: Limited to ~2-10K entries, but sufficient for demo

## File Structure

```
scripts/
  prepare-embeddings.ts      # CSV → JSON converter

src/
  index.ts                   # Bun server + dictionary loader
  App.tsx                    # React UI
  
  lib/
    openaiClient.ts          # OpenAI API wrapper
    dictionaryEmbeddings.ts  # JSON loader + similarity search
    semanticSearch.ts        # High-level search API

Data files (gitignored):
  oted_embeddings.csv        # Source CSV (176K rows, ~300MB)
  dictionary-embeddings.json # Processed JSON (2K entries, ~50MB)
```

## Workflow

### First-time Setup
```bash
bun install
bun run prepare:embeddings        # Creates dictionary-embeddings.json
bun dev                            # Starts server
```

### Development
```bash
bun dev                            # Hot-reload enabled
```

### Changing Entry Count
```bash
bun scripts/prepare-embeddings.ts 5000
bun dev
```

## Future Improvements

1. **Vector Database**: For >10K entries, use a proper vector DB (Qdrant, Pinecone, etc.)
2. **Caching**: Cache query embeddings for frequently searched terms
3. **Approximate Search**: Implement HNSW or IVF for faster similarity search
4. **Streaming**: Stream results as they're found (not needed for 2K entries)
5. **Incremental Loading**: Load more entries on demand

## Technology Choices

- **Bun**: Fast runtime with built-in hot reload and HTML imports
- **React 19 + shadcn/ui**: Modern, accessible UI components
- **OpenAI text-embedding-3-large**: 3,072-dimensional embeddings
- **JSON over CSV**: ~20x faster loading, simpler parsing
- **Event-based I/O**: Memory-efficient preprocessing

