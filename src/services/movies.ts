import { FALLBACK_MOVIES } from "../data/fallbackMovies";
import type { Movie } from "../types";

interface TvShow {
  id: number;
  name: string;
  genres: string[];
  language?: string;
  runtime?: number;
  rating?: { average: number | null };
  premiered?: string;
  summary?: string;
  image?: { medium: string; original: string };
  status?: string;
  network?: { name: string };
}

const LANGS = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam"];

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

function mapShow(s: TvShow, i: number): Movie {
  const lang = s.language && s.language !== "English" && i % 5 !== 0 ? s.language : LANGS[i % LANGS.length];
  const rating = s.rating?.average ? Math.min(10, Math.max(4, s.rating.average)) : 6.5 + ((i * 7) % 25) / 10;
  const runtime = s.runtime ?? 95 + ((i * 37) % 70);
  const premiered = s.premiered ?? `2026-0${1 + (i % 9)}-${10 + (i % 18)}`;
  const premieredDate = new Date(premiered);
  const now = new Date("2026-09-28");
  const diffDays = Math.floor((now.getTime() - premieredDate.getTime()) / 86400000);
  const status: Movie["status"] = diffDays < 0 ? "Upcoming" : diffDays > 900 ? "Classic" : "Now Showing";
  const poster = s.image?.medium?.replace("http://", "https://") ?? FALLBACK_MOVIES[i % FALLBACK_MOVIES.length].poster;
  const backdrop = s.image?.original?.replace("http://", "https://") ?? FALLBACK_MOVIES[i % FALLBACK_MOVIES.length].backdrop;
  return {
    id: s.id,
    title: s.name,
    genres: s.genres.length ? s.genres.slice(0, 3) : [FALLBACK_MOVIES[i % FALLBACK_MOVIES.length].genres[0]],
    language: lang,
    runtime,
    rating: Math.round(rating * 10) / 10,
    releaseDate: premiered,
    description: s.summary ? stripHtml(s.summary).slice(0, 320) : FALLBACK_MOVIES[i % FALLBACK_MOVIES.length].description,
    poster,
    backdrop,
    status,
    certification: rating >= 8 ? "U/A 13+" : i % 4 === 0 ? "A 18+" : "U/A 16+",
    cast: [s.network?.name ?? "Ensemble Cast", "Lead Ensemble", "Supporting Cast"],
  };
}

export async function fetchMovies(page = 0, signal?: AbortSignal): Promise<{ movies: Movie[]; source: "api" | "fallback" }> {
  try {
    const res = await fetch(`https://api.tvmaze.com/shows?page=${page}`, { signal });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = (await res.json()) as TvShow[];
    if (!Array.isArray(data) || data.length === 0) throw new Error("Empty API response");
    return { movies: data.slice(0, 48).map(mapShow), source: "api" };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    await new Promise((r) => setTimeout(r, 350));
    return { movies: FALLBACK_MOVIES, source: "fallback" };
  }
}
