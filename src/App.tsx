import { useState } from "react";
import "./index.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchResult {
  word: string;
  type: string;
  meaning: string;
  score: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  elapsedMs: number;
}

function App() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState("5");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a query");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/suggest-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          topK: parseInt(topK, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch suggestions");
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
      setLastQuery(data.query);
      setElapsedMs(data.elapsedMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Dictionary Term Suggester</h1>
          <p className="text-gray-600">
            Find English terms using AI-powered semantic search
          </p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle>Search Query</CardTitle>
            <CardDescription>
              Describe a concept in your own words and we'll find matching dictionary terms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Your query</Label>
              <Textarea
                id="query"
                placeholder="e.g., 'a feeling of great happiness' or 'something that helps you remember'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-end gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="topK">Number of results</Label>
                <Select value={topK} onValueChange={setTopK}>
                  <SelectTrigger id="topK">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="px-8"
              >
                {isLoading ? "Searching..." : "Find Terms"}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Results for "{lastQuery}"</CardTitle>
              <CardDescription>
                Found {results.length} matching terms in {elapsedMs}ms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.word}
                          </h3>
                          {result.type && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                              {result.type}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {result.meaning}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xs text-gray-500 mb-1">Similarity</div>
                        <div className="text-lg font-bold text-indigo-600">
                          {(result.score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && results.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center text-gray-500">
              <p className="text-lg mb-2">No results yet</p>
              <p className="text-sm">
                Type a description above and press "Find Terms" to see suggestions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export { App };
export default App;
