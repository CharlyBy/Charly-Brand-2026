import { useState, useEffect } from "react";
import { Search, X, Loader2, FileText } from "lucide-react";
import { trpc } from "../lib/trpc";
import { Link } from "wouter";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface SearchResult {
  articleId: number;
  title: string;
  slug: string;
  category: string;
  relevanceScore: number;
  matchType: "semantic" | "keyword" | "hybrid";
  snippet?: string;
  pageNumber?: number;
}

export function KnowledgeSearchBar() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Trigger search
  const { data: results, isLoading } = trpc.search.query.useQuery(
    {
      query: debouncedQuery,
      method: "hybrid",
      limit: 10,
    },
    {
      enabled: debouncedQuery.length >= 2,
    }
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  // Close results on result click
  const handleResultClick = () => {
    setIsOpen(false);
  };

  // Highlight matched text in snippet
  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-primary/20 text-primary font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Get match type badge color
  const getMatchTypeBadge = (matchType: string) => {
    switch (matchType) {
      case "semantic":
        return "bg-blue-100 text-blue-700";
      case "keyword":
        return "bg-green-100 text-green-700";
      case "hybrid":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Durchsuche Wissens-Artikel... (z.B. 'Verlustangst', 'innere Grenzen')"
          value={query}
          onChange={handleInputChange}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full mt-2 w-full max-h-[500px] overflow-y-auto z-50 shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Suche läuft...</span>
            </div>
          ) : results && results.length > 0 ? (
            <div className="divide-y">
              {results.map((result: SearchResult) => (
                <Link
                  key={`${result.articleId}-${result.pageNumber || 0}`}
                  href={`/wissen/${result.slug}`}
                  onClick={handleResultClick}
                >
                  <div className="p-4 hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <h3 className="font-semibold text-sm line-clamp-1">
                            {highlightText(result.title, query)}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {result.category}
                          {result.pageNumber && ` • Seite ${result.pageNumber}`}
                        </p>
                        {result.snippet && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {highlightText(result.snippet, query)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getMatchTypeBadge(
                            result.matchType
                          )}`}
                        >
                          {result.matchType === "semantic" && "Semantisch"}
                          {result.matchType === "keyword" && "Keyword"}
                          {result.matchType === "hybrid" && "Hybrid"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {result.relevanceScore}% relevant
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : debouncedQuery.length >= 2 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">Keine Ergebnisse gefunden für "{debouncedQuery}"</p>
              <p className="text-xs mt-1">Versuche andere Suchbegriffe</p>
            </div>
          ) : null}
        </Card>
      )}

      {/* Search Hint */}
      {query.length > 0 && query.length < 2 && (
        <p className="text-xs text-muted-foreground mt-2">
          Mindestens 2 Zeichen eingeben
        </p>
      )}
    </div>
  );
}
