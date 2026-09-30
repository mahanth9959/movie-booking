import { ArrowLeft, CalendarDays, Clock, Globe, MapPin, Play, ShieldCheck, Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Badge, Button, Card, EmptyState, Modal, Rating, Spinner } from "../components/ui";
import { useBookings } from "../contexts/BookingContext";
import { THEATRES } from "../data/theatres";
import { useMovies } from "../hooks/useMovies";
import { formatDate, formatDateLong, formatDuration, nextDays } from "../utils/format";

export function MovieDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const apiPage = Number(params.get("apiPage") ?? 0);
  const { movies, loading } = useMovies(apiPage);
  const { showsFor, setDraft } = useBookings();
  const nav = useNavigate();
  const [date, setDate] = useState(nextDays(5)[0]);
  const [trailer, setTrailer] = useState(false);

  const movie = movies.find((m) => String(m.id) === id);
  const dates = useMemo(() => nextDays(5), []);
  const shows = useMemo(() => (movie ? showsFor(movie.id, date) : []), [movie, showsFor, date]);

  if (loading) return <Spinner label="Loading movie details…" />;
  if (!movie) {
    return <EmptyState icon={Ticket} title="Movie not found" message="This title isn't in the current catalogue page. Try browsing the full list." action={<Button onClick={() => nav("/movies")}>Back to movies</Button>} />;
  }

  return (
    <div className="anim-rise">
      <button type="button" onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-mist hover:text-strong">
        <ArrowLeft size={15} /> Back
      </button>

      {/* hero */}
      <div className="relative overflow-hidden rounded-3xl border border-line">
        <img src={movie.backdrop} alt="" className="h-60 w-full object-cover sm:h-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b13] via-[#0b0b13]/60 to-transparent" />
        <div className="on-photo absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:p-7">
          <img src={movie.poster} alt={`${movie.title} poster`} className="hidden w-36 shrink-0 rounded-xl border border-line shadow-2xl sm:block" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">{movie.status}</Badge>
              <Badge tone="neutral">{movie.certification}</Badge>
              {movie.genres.map((g) => <Badge key={g} tone="info">{g}</Badge>)}
            </div>
            <h1 className="type-display mt-2">{movie.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-soft">
              <Rating value={movie.rating} />
              <span className="inline-flex items-center gap-1.5"><Clock size={14} className="text-faint" />{formatDuration(movie.runtime)}</span>
              <span className="inline-flex items-center gap-1.5"><Globe size={14} className="text-faint" />{movie.language}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-faint" />{formatDate(movie.releaseDate)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setTrailer(true)}><Play size={15} /> Trailer</Button>
            <Button onClick={() => { const s = shows[0]; if (s) { setDraft({ movieId: movie.id, theatreId: s.theatreId, showId: s.id, seats: [] }); nav(`/seats/${s.id}`); } }} disabled={shows.length === 0}><Ticket size={15} /> Book now</Button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="type-heading">Storyline</h2>
          <p className="type-body mt-2 text-soft">{movie.description}</p>
          <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
            <div><p className="type-label">Cast</p><p className="mt-1 text-sm">{movie.cast.join(", ")}</p></div>
            <div><p className="type-label">Release</p><p className="mt-1 text-sm">{formatDateLong(movie.releaseDate)}</p></div>
            <div><p className="type-label">Advisory</p><p className="mt-1 inline-flex items-center gap-1.5 text-sm"><ShieldCheck size={14} className="text-emerald-400" />{movie.certification}</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="type-heading">Good to know</h2>
          <ul className="type-body mt-2 space-y-2 text-soft">
            <li>· Dolby Atmos in 9 of 12 partner theatres</li>
            <li>· Recliner upgrade from ₹100 per seat</li>
            <li>· Free cancellation up to 3 hrs before show</li>
            <li>· E-ticket + QR accepted at all gates</li>
          </ul>
        </Card>
      </div>

      {/* shows */}
      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="type-heading">Showtimes</h2>
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Dates">
            {dates.map((d) => (
              <button key={d} type="button" role="tab" aria-selected={d === date} onClick={() => setDate(d)} className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${d === date ? "border-rose-500/60 bg-rose-600/15 text-rose-100" : "border-line text-mist hover:bg-wash"}`}>
                {formatDate(d)}
              </button>
            ))}
          </div>
        </div>
        {shows.length === 0 ? (
          <p className="type-muted mt-4">No shows scheduled for this date.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {shows.map((s) => {
              const t = THEATRES.find((x) => x.id === s.theatreId);
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-coal p-3.5 transition-colors hover:border-rose-500/30">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{t?.name}</p>
                    <p className="type-caption mt-0.5 inline-flex items-center gap-1"><MapPin size={11} />{t?.address}, {t?.city} · {s.screen} · {s.format}</p>
                  </div>
                  <Badge tone="gold">{s.time}</Badge>
                  <span className="text-xs text-mist">₹{s.priceClassic} onwards</span>
                  <Button onClick={() => { setDraft({ movieId: movie.id, theatreId: s.theatreId, showId: s.id, seats: [] }); nav(`/seats/${s.id}`); }}>
                    Select seats
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal open={trailer} onClose={() => setTrailer(false)} title={`${movie.title} — Trailer`}>
        <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-black text-center text-white">
          <Play size={28} className="text-rose-400" />
          <p className="mt-3 text-sm font-bold">Trailer preview (UI demo)</p>
          <p className="type-caption mt-1 max-w-xs">Video playback is out of scope for this build — the button, dialog and focus handling are fully wired.</p>
          <Button className="mt-4" onClick={() => setTrailer(false)}>Close preview</Button>
        </div>
      </Modal>
    </div>
  );
}
