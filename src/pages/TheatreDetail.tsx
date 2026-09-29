import { ArrowLeft, Armchair, Clock, MapPin, Phone, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, EmptyState } from "../components/ui";
import { useBookings } from "../contexts/BookingContext";
import { theatreById } from "../data/theatres";
import { useMovies } from "../hooks/useMovies";
import { formatDate, nextDays } from "../utils/format";

export function TheatreDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const theatre = id ? theatreById(id) : undefined;
  const { movies } = useMovies(0);
  const { showsFor, setDraft } = useBookings();
  const [date, setDate] = useState(nextDays(5)[0]);
  const dates = useMemo(() => nextDays(5), []);

  const movieById = useMemo(() => new Map(movies.map((m) => [m.id, m])), [movies]);

  if (!theatre) {
    return <EmptyState icon={MapPin} title="Theatre not found" message="This venue may have been removed." action={<Button onClick={() => nav("/theatres")}>Back to theatres</Button>} />;
  }

  const shows = movies.flatMap((m) => showsFor(m.id, date)).filter((s) => s.theatreId === theatre.id);
  const byMovie = new Map<number, typeof shows>();
  for (const s of shows) {
    const arr = byMovie.get(s.movieId) ?? [];
    arr.push(s);
    byMovie.set(s.movieId, arr);
  }

  return (
    <div className="anim-rise">
      <button type="button" onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="relative overflow-hidden rounded-3xl border border-[#232332]">
        <img src={theatre.image} alt="" className="h-56 w-full object-cover sm:h-72" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b13] via-[#0b0b13]/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{theatre.city}</Badge>
            <Badge tone="gold"><Star size={11} className="fill-amber-400 text-amber-400" />{theatre.rating.toFixed(1)}</Badge>
            <Badge tone="info"><Armchair size={11} />{theatre.screens} screens</Badge>
          </div>
          <h1 className="type-display mt-2">{theatre.name}</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-300">
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-zinc-500" />{theatre.address}</span>
            <span className="inline-flex items-center gap-1.5"><Phone size={14} className="text-zinc-500" />{theatre.contact}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="type-heading">Amenities</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {theatre.amenities.map((a) => <Badge key={a} tone="neutral"><Sparkles size={11} />{a}</Badge>)}
          </div>
          <div className="mt-4 border-t border-[#232332] pt-4 text-sm">
            <p className="type-label">Screens</p>
            <p className="mt-1 text-zinc-300">{Array.from({ length: theatre.screens }).map((_, i) => `Screen ${i + 1}`).join(" · ")}</p>
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="type-heading">Available shows</h2>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {dates.map((d) => (
                <button key={d} type="button" onClick={() => setDate(d)} aria-pressed={d === date} className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold ${d === date ? "border-rose-500/60 bg-rose-600/15 text-rose-100" : "border-[#2b2b40] text-zinc-400 hover:bg-white/5"}`}>
                  {formatDate(d)}
                </button>
              ))}
            </div>
          </div>
          {shows.length === 0 ? (
            <p className="type-muted mt-4">No shows on this date — overlay catalogue is still loading or empty.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {[...byMovie.entries()].map(([movieId, list]) => {
                const m = movieById.get(movieId);
                if (!m) return null;
                return (
                  <li key={movieId} className="rounded-xl border border-[#232332] bg-[#0e0e17] p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={m.poster} alt="" className="h-14 w-10 rounded-lg object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{m.title}</p>
                        <p className="type-caption">{m.genres.slice(0, 2).join(" · ")} · {m.certification}</p>
                      </div>
                      <Badge tone="gold">★ {m.rating.toFixed(1)}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {list.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setDraft({ movieId, theatreId: theatre.id, showId: s.id, seats: [] }); nav(`/seats/${s.id}`); }}
                          className="group rounded-lg border border-[#2b2b40] px-3.5 py-2 text-left transition-colors hover:border-rose-500/50 hover:bg-rose-600/10"
                        >
                          <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-300"><Clock size={13} />{s.time}</span>
                          <span className="type-caption">{s.screen} · {s.format} · ₹{s.priceClassic}+</span>
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
