# Quick Start Guide

## Prerequisites

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Get OpenAI API Key**:
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Copy it for the next step

## Setup & Run

### 1. Set your OpenAI API key

Create a `.env` file in the project root:

```bash
echo "OPENAI_API_KEY=sk-your-actual-key-here" > .env
```

Or copy the example:
```bash
cp .env.example .env
# Then edit .env and add your real API key
```

### 2. Install dependencies

```bash
bun install
```

### 3. Prepare the embeddings

Convert the CSV to a fast-loading JSON file (one-time setup):

```bash
bun run prepare:embeddings
```

This will create `dictionary-embeddings.json` with 2,000 entries. For more entries:
```bash
bun run prepare:embeddings:5k   # 5,000 entries
bun run prepare:embeddings:10k  # 10,000 entries
```

### 4. Start the development server

```bash
bun dev
```

The server will start and load the dictionary entries instantly from JSON. You should see:

```
📖 Loading dictionary entries from ./dictionary-embeddings.json...
✅ Loaded 2000 entries (3072D) in ~50ms from XX.XX MB file
🚀 Server running at http://localhost:XXXX
```

### 4. Open your browser

Navigate to the URL shown in the terminal (e.g., `http://localhost:3000`).

## Usage

1. **Enter a query**: Type a natural language description of a concept
   - Example: "a feeling of great happiness"
   - Example: "something that helps you remember"
   - Example: "the study of living things"

2. **Select number of results**: Choose how many suggestions you want (3, 5, 10, or 15)

3. **Click "Find Terms"** or press Enter

4. **View results**: See dictionary terms ranked by semantic similarity with their definitions

## Example Queries

Try these to see how it works:

- `extreme joy` → finds "ecstasy", "elation", "bliss"
- `very small` → finds "tiny", "minute", "microscopic"  
- `speaks multiple languages` → finds "polyglot", "multilingual"
- `fear of heights` → finds "acrophobia"
- `love of books` → finds "bibliophile"

## Troubleshooting

### "Missing API key" error

Make sure your `.env` file exists and contains:
```
OPENAI_API_KEY=sk-...
```

Bun automatically loads `.env` files, so restart the dev server after creating it.

### "Dictionary file not found" error

You need to run the preprocessing script first:
```bash
bun run prepare:embeddings
```

This requires `oted_embeddings.csv` to be in the project root directory.

### Port already in use

Bun will automatically pick an available port. Check the terminal output for the actual URL.

### Out of memory

The default is 2,000 entries. To use fewer entries, regenerate the JSON:
```bash
bun scripts/prepare-embeddings.ts 1000
```

## API Testing

You can also test the API directly:

```bash
# Check server status
curl http://localhost:3000/api/status

# Search for terms
curl -X POST http://localhost:3000/api/suggest-terms \
  -H "Content-Type: application/json" \
  -d '{"query": "extreme happiness", "topK": 5}'
```

## Next Steps

- Explore the code in `src/lib/` to understand how embeddings work
- Modify `MAX_ENTRIES` to load more/fewer dictionary entries
- Customize the UI in `src/App.tsx`
- Add caching for frequently searched queries
- Experiment with different similarity thresholds

Enjoy exploring semantic search! 🚀

