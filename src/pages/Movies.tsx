import { ArrowUpDown, Clapperboard, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge, EmptyState, ErrorState, MovieCardSkeleton, PageHeader, Pagination, Rating, SearchInput, Select } from "../components/ui";
import { useMovies } from "../hooks/useMovies";
import { formatDate, formatDuration } from "../utils/format";

const PER_PAGE = 12;

export function MoviesPage() {
  const [apiPage, setApiPage] = useState(0);
  const { movies, source, loading, error, retry } = useMovies(apiPage);
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(0);

  const q = params.get("q") ?? "";
  const genre = params.get("genre") ?? "All";
  const lang = params.get("lang") ?? "All";
  const minRating = Number(params.get("rating") ?? 0);
  const sort = params.get("sort") ?? "rating";
  const status = params.get("status") ?? "All";

  useEffect(() => setPage(0), [q, genre, lang, minRating, sort, status, movies]);

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (!v || v === "All" || (k === "q" && !v) || (k === "sort" && v === "rating") || (k === "rating" && v === "0")) n.delete(k);
    else n.set(k, v);
    setParams(n, { replace: true });
  };

  const genres = useMemo(() => ["All", ...Array.from(new Set(movies.flatMap((m) => m.genres))).sort()], [movies]);
  const langs = useMemo(() => ["All", ...Array.from(new Set(movies.map((m) => m.language))).sort()], [movies]);

  const filtered = useMemo(() => {
    const out = movies.filter((m) => {
      if (q && !m.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (genre !== "All" && !m.genres.includes(genre)) return false;
      if (lang !== "All" && m.language !== lang) return false;
      if (m.rating < minRating) return false;
      if (status !== "All" && m.status !== status) return false;
      return true;
    });
    out.sort((a, b) => {
      if (sort === "release-desc") return +new Date(b.releaseDate) - +new Date(a.releaseDate);
      if (sort === "release-asc") return +new Date(a.releaseDate) - +new Date(b.releaseDate);
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.rating - a.rating;
    });
    return out;
  }, [movies, q, genre, lang, minRating, sort, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="anim-rise">
      <PageHeader
        title="Movies"
        sub={source === "api" ? "Live catalogue from TVMaze · posters, ratings and showtimes update automatically." : "Offline catalogue · live API unreachable, showing bundled titles."}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={source === "api" ? "success" : "warning"}>{source === "api" ? "● Live API" : "● Offline mode"}</Badge>
            <select value={String(apiPage)} onChange={(e) => setApiPage(Number(e.target.value))} className="rounded-lg border border-[#2b2b40] bg-[#12121c] px-2.5 py-2 text-xs font-semibold" aria-label="Catalogue page">
              {[0, 1, 2, 3].map((p) => <option key={p} value={p} className="bg-zinc-900">Catalogue {p + 1}</option>)}
            </select>
          </div>
        }
      />

      <div className="mb-5 grid gap-3 rounded-2xl border border-[#232332] bg-[#0e0e17] p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr]">
        <SearchInput placeholder="Search movies…" value={q} onChange={(e) => set(q === "" ? "q" : "q", e.target.value)} aria-label="Search movies" />
        <Select label="Genre" options={genres.map((g) => ({ value: g, label: g }))} value={genre} onChange={(e) => set("genre", (e.target as HTMLSelectElement).value)} />
        <Select label="Language" options={langs.map((l) => ({ value: l, label: l }))} value={lang} onChange={(e) => set("lang", (e.target as HTMLSelectElement).value)} />
        <Select label="Rating" options={[{ value: "0", label: "Any rating" }, { value: "6", label: "6+ Good" }, { value: "7", label: "7+ Great" }, { value: "8", label: "8+ Superb" }]} value={String(minRating)} onChange={(e) => set("rating", (e.target as HTMLSelectElement).value)} />
        <Select label="Sort" options={[{ value: "rating", label: "Top rated" }, { value: "release-desc", label: "Newest first" }, { value: "release-asc", label: "Oldest first" }, { value: "title", label: "A – Z" }]} value={sort} onChange={(e) => set("sort", (e.target as HTMLSelectElement).value)} />
        <Select label="Status" options={["All", "Now Showing", "Upcoming", "Classic"].map((s) => ({ value: s, label: s }))} value={status} onChange={(e) => set("status", (e.target as HTMLSelectElement).value)} />
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
        <SlidersHorizontal size={13} />
        <span>{filtered.length} title{filtered.length === 1 ? "" : "s"} found</span>
        {(q || genre !== "All" || lang !== "All" || minRating > 0 || status !== "All") && (
          <button type="button" onClick={() => setParams({}, { replace: true })} className="ml-1 inline-flex items-center gap-1 font-semibold text-rose-300 hover:text-rose-200">
            <RotateCcw size={12} /> Clear filters
          </button>
        )}
        <span className="ml-auto hidden items-center gap-1 sm:flex"><ArrowUpDown size={12} /> Sorted by {sort === "rating" ? "rating" : sort}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : slice.length === 0 ? (
        <EmptyState icon={Clapperboard} title="No movies match" message="Try a different search term or clear the genre, language and rating filters." action={<button type="button" onClick={() => setParams({}, { replace: true })} className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white">Clear all filters</button>} />
      ) : (
        <>
          <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {slice.map((m) => (
              <Link key={m.id} to={`/movies/${m.id}?apiPage=${apiPage}`} className="group overflow-hidden rounded-2xl border border-[#232332] bg-[#12121c] transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-[0_20px_40px_-16px_rgba(225,29,72,0.35)]">
                <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
                  <img src={m.poster} alt={`${m.title} poster`} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute top-2.5 left-2.5"><Badge tone={m.status === "Now Showing" ? "success" : m.status === "Upcoming" ? "warning" : "neutral"}>{m.status}</Badge></span>
                  <span className="absolute bottom-2.5 left-2.5"><Rating value={m.rating} /></span>
                  <span className="absolute right-2.5 bottom-2.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-200 backdrop-blur">{formatDuration(m.runtime)}</span>
                </div>
                <div className="p-3.5">
                  <h3 className="truncate text-sm font-bold group-hover:text-rose-200">{m.title}</h3>
                  <p className="type-caption mt-0.5 truncate">{m.genres.slice(0, 2).join(" · ")} · {m.language}</p>
                  <p className="type-caption mt-1">{formatDate(m.releaseDate)} · {m.certification}</p>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </>
      )}
    </div>
  );
}
