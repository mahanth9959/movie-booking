import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_MOVIES } from "../data/fallbackMovies";
import { fetchMovies } from "../services/movies";
import type { Movie } from "../types";

export function useMovies(page = 0) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [source, setSource] = useState<"api" | "fallback">("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abort.current?.abort();
    const c = new AbortController();
    abort.current = c;
    setLoading(true);
    setError(null);
    try {
      const r = await fetchMovies(page, c.signal);
      setMovies(r.movies);
      setSource(r.source);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setMovies(FALLBACK_MOVIES);
      setSource("fallback");
      setError("Live catalogue unreachable. Showing offline catalogue.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
    return () => abort.current?.abort();
  }, [load]);

  return { movies, source, loading, error, retry: load };
}
