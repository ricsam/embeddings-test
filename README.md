# Dictionary Term Suggester

A full-stack semantic search application that suggests English dictionary terms based on free-text descriptions using OpenAI embeddings.

## Features

- 🤖 **AI-Powered Search**: Uses OpenAI's `text-embedding-3-large` model for semantic understanding
- 📚 **Pre-embedded Dictionary**: Searches 2,000 precomputed embeddings from the Oxford English Dictionary
- ⚡ **Fast & Efficient**: In-memory cosine similarity search with Bun runtime
- 🎨 **Modern UI**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui components
- 🔥 **Hot Module Reloading**: Instant feedback during development

## Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components

### Backend
- Bun runtime
- TypeScript
- REST API with `Bun.serve()`

### AI/ML
- OpenAI text-embedding-3-large (3,072 dimensions)
- Precomputed dictionary embeddings from [Kaggle dataset](https://www.kaggle.com/datasets/bboyenergetic/english-dictionary-openai-embeddings)

## Setup

### Prerequisites

- [Bun](https://bun.sh) v1.3.3 or higher
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file with your OpenAI API key:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ```

4. Ensure `oted_embeddings.csv` is in the project root directory

### Development

Start the development server with hot reloading:

```bash
bun dev
```

The app will be available at `http://localhost:3000` (or the port Bun assigns).

### Production

Run the production server:

```bash
bun start
```

## How It Works

1. **User Input**: You describe a concept in natural language (e.g., "a feeling of great happiness")
2. **Live Embedding**: The backend sends your query to OpenAI's embedding API
3. **Similarity Search**: Your query embedding is compared against 2,000 pre-embedded dictionary entries using cosine similarity
4. **Results**: The top-K most similar terms are returned with their definitions and similarity scores

## API Endpoints

### `POST /api/suggest-terms`

Suggest dictionary terms for a given query.

**Request:**
```json
{
  "query": "a feeling of great happiness",
  "topK": 5
}
```

**Response:**
```json
{
  "query": "a feeling of great happiness",
  "results": [
    {
      "word": "joy",
      "type": "noun",
      "meaning": "A feeling of great pleasure and happiness.",
      "score": 0.89
    }
  ],
  "elapsedMs": 423
}
```

### `GET /api/status`

Get server status and loaded dictionary count.

## Project Structure

```
├── src/
│   ├── index.ts                 # Bun server entry point
│   ├── App.tsx                  # React main component
│   ├── lib/
│   │   ├── openaiClient.ts      # OpenAI API wrapper
│   │   ├── dictionaryEmbeddings.ts # CSV loader & similarity search
│   │   └── semanticSearch.ts    # High-level search API
│   └── components/ui/           # shadcn/ui components
├── oted_embeddings.csv          # Pre-embedded dictionary (2000 rows loaded)
└── README.md
```

## Memory Optimization

To keep memory usage under control, the app loads only the **first 2,000 rows** from the ~176K row CSV file. This provides a good balance between variety and performance for demonstration purposes.

## Development

This project was created using Bun. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

### Key Commands

- `bun dev` - Start development server with HMR
- `bun start` - Start production server
- `bun install` - Install dependencies
- `bun test` - Run tests (if any)

## License

MIT
