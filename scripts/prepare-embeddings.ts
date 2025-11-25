#!/usr/bin/env bun
/**
 * Preprocessing script to convert CSV embeddings to JSON
 * Usage: bun scripts/prepare-embeddings.ts [max_entries]
 * Example: bun scripts/prepare-embeddings.ts 5000
 */

import fs from "node:fs";
import readline from "node:readline";

interface DictionaryEntry {
  word: string;
  type: string;
  meaning: string;
  embedding: number[];
}

const CSV_PATH = "./oted_embeddings.csv";
const OUTPUT_PATH = "./dictionary-embeddings.json";
const DEFAULT_MAX_ENTRIES = 2000;

// Get max entries from command line arg
const maxEntries = process.argv[2] ? parseInt(process.argv[2], 10) : DEFAULT_MAX_ENTRIES;

if (isNaN(maxEntries) || maxEntries <= 0) {
  console.error("❌ Invalid max entries argument. Must be a positive number.");
  process.exit(1);
}

/**
 * Simple CSV parser that handles quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  if (current) result.push(current);
  return result;
}

/**
 * Parse a CSV line into a dictionary entry
 */
function parseLine(line: string): DictionaryEntry | null {
  try {
    const fields = parseCSVLine(line);

    if (fields.length < 4) return null;

    const type = fields[0]?.trim() || "";
    const word = fields[1]?.trim() || "";
    const meaning = fields[2]?.trim() || "";
    const embeddingStr = fields[3]?.trim() || "";

    if (!word || !embeddingStr) return null;

    // Parse the embedding JSON array
    const embedding: number[] = JSON.parse(embeddingStr);

    if (!Array.isArray(embedding) || embedding.length === 0) {
      return null;
    }

    return {
      word,
      type,
      meaning,
      embedding,
    };
  } catch (err) {
    return null;
  }
}

console.log(`📖 Converting first ${maxEntries} entries from ${CSV_PATH} to JSON...`);
const startTime = performance.now();

const entries: DictionaryEntry[] = [];
let parsed = 0;
let skipped = 0;
let lineNumber = 0;

await new Promise<void>((resolve, reject) => {
  const fileStream = fs.createReadStream(CSV_PATH, {
    highWaterMark: 64 * 1024,
  });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    lineNumber++;

    // Skip header row
    if (lineNumber === 1) return;

    if (!line.trim()) return;

    const entry = parseLine(line);
    if (entry) {
      entries.push(entry);
      parsed++;

      // Show progress every 500 entries
      if (parsed % 500 === 0) {
        console.log(`  ... processed ${parsed} entries`);
      }

      // Stop when we reach max entries
      if (parsed >= maxEntries) {
        rl.close();
        fileStream.destroy();
        resolve();
      }
    } else {
      skipped++;
    }
  });

  rl.on("close", () => {
    if (parsed < maxEntries) {
      resolve(); // File ended before reaching max
    }
  });

  rl.on("error", reject);
  fileStream.on("error", reject);
});

// Write JSON file
const outputData = {
  version: 1,
  model: "text-embedding-3-large",
  dimensions: entries[0]?.embedding.length || 0,
  totalEntries: entries.length,
  generatedAt: new Date().toISOString(),
  entries,
};

await Bun.write(OUTPUT_PATH, JSON.stringify(outputData, null, 2));

const elapsed = (performance.now() - startTime).toFixed(0);
const fileSizeMB = (await Bun.file(OUTPUT_PATH).size) / (1024 * 1024);

console.log(`✅ Converted ${parsed} entries (skipped ${skipped}) in ${elapsed}ms`);
console.log(`📦 Output: ${OUTPUT_PATH} (${fileSizeMB.toFixed(2)} MB)`);
console.log(`📊 Embedding dimensions: ${outputData.dimensions}`);
console.log("");
console.log("To use this file, update src/lib/dictionaryEmbeddings.ts to load from JSON instead of CSV.");

