import { ArrowLeft, ArrowRight, Armchair, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";
import { useBookings } from "../contexts/BookingContext";
import { useToast } from "../contexts/ToastContext";
import { useMovies } from "../hooks/useMovies";
import { theatreById } from "../data/theatres";
import { formatDateLong, formatINR } from "../utils/format";
import { buildSeatMap, MAX_SEATS, priceFor } from "../utils/seats";
import { cn } from "../utils/cn";

export function SeatsPage() {
  const { showId } = useParams();
  const nav = useNavigate();
  const { showById, draft, setDraft } = useBookings();
  const { movies } = useMovies(0);
  const { push } = useToast();
  const [selected, setSelected] = useState<string[]>(draft.showId === showId ? draft.seats : []);

  const show = showId ? showById(showId) : undefined;
  const movie = show ? movies.find((m) => m.id === show.movieId) : undefined;
  const theatre = show ? theatreById(show.theatreId) : undefined;

  const seats = useMemo(() => (show ? buildSeatMap(show) : []), [show]);
  const byRow = useMemo(() => {
    const map = new Map<string, typeof seats>();
    for (const s of seats) {
      const arr = map.get(s.row) ?? [];
      arr.push(s);
      map.set(s.row, arr);
    }
    return [...map.entries()];
  }, [seats]);

  if (!show) {
    return <EmptyState icon={Armchair} title="Show not found" message="This showtime is no longer available. Pick another show." action={<Button onClick={() => nav("/movies")}>Browse movies</Button>} />;
  }

  const toggle = (id: string, booked: boolean) => {
    if (booked) return;
    setSelected((p) => {
      if (p.includes(id)) return p.filter((s) => s !== id);
      if (p.length >= MAX_SEATS) {
        push({ kind: "error", title: `Maximum ${MAX_SEATS} seats`, message: "Split larger groups across two bookings." });
        return p;
      }
      return [...p, id];
    });
  };

  const total = selected.reduce((a, id) => {
    const s = seats.find((x) => x.id === id);
    return a + (s ? s.price : 0);
  }, 0);

  const proceed = () => {
    if (selected.length === 0) {
      push({ kind: "error", title: "No seats selected", message: "Pick at least one seat to continue." });
      return;
    }
    setDraft({ movieId: show.movieId, theatreId: show.theatreId, showId: show.id, seats: [...selected].sort() });
    nav(`/checkout/${show.id}`);
  };

  return (
    <div className="anim-rise">
      <button type="button" onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white">
        <ArrowLeft size={15} /> Back
      </button>
      <PageHeader
        title={movie?.title ?? "Select seats"}
        sub={`${theatre?.name ?? ""} · ${show.screen} · ${formatDateLong(show.date)} · ${show.time} · ${show.format}`}
        actions={<Badge tone="info">Max {MAX_SEATS} seats / booking</Badge>}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 sm:p-7 xl:col-span-2">
          {/* legend */}
          <div className="mb-5 flex flex-wrap items-center gap-4 text-xs">
            {[
              ["Available", "border-[#3a3a52] bg-[#1c1c2a]"],
              ["Selected", "border-rose-500 bg-rose-600"],
              ["Booked", "border-transparent bg-[#2a2a38] opacity-50"],
            ].map(([label, cls]) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className={cn("inline-block h-4 w-6 rounded-t-md border", cls)} />{label}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1 text-zinc-500"><Info size={13} />Deterministic demo occupancy</span>
          </div>

          {/* screen */}
          <div className="mb-6">
            <div className="mx-auto h-1.5 w-3/4 rounded-full bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
            <p className="type-caption mt-1.5 text-center tracking-[0.3em] uppercase">Screen this way</p>
          </div>

          <div className="space-y-2.5 overflow-x-auto pb-2">
            {byRow.map(([row, list]) => (
              <div key={row} className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-6 shrink-0 text-center text-xs font-bold text-zinc-500">{row}</span>
                <div className={cn("flex flex-1 justify-center gap-1.5 sm:gap-2", row >= "H" && "gap-2 sm:gap-2.5")}>
                  {list.map((s, i) => {
                    const isSel = selected.includes(s.id);
                    const booked = s.status === "booked";
                    return (
                      <span key={s.id} className={cn((row === "D" || row === "H") && i === 0 && "mr-3 sm:mr-5", (row === "D" || row === "H") && i === list.length - 1 && "ml-3 sm:ml-5")}>
                        <button
                          type="button"
                          disabled={booked}
                          onClick={() => toggle(s.id, booked)}
                          aria-label={`Seat ${s.id}, ${s.tier}, ${booked ? "booked" : isSel ? "selected" : "available"}, ₹${s.price}`}
                          aria-pressed={isSel}
                          title={`${s.id} · ${s.tier} · ₹${s.price}`}
                          className={cn(
                            "h-7 w-7 rounded-t-lg border text-[10px] font-bold transition-all duration-100 sm:h-8 sm:w-8 sm:text-[11px]",
                            booked && "cursor-not-allowed border-transparent bg-[#262633] text-zinc-600 line-through",
                            !booked && !isSel && "border-[#3d3d58] bg-[#1c1c2a] text-zinc-400 hover:border-emerald-400/70 hover:bg-emerald-500/15 hover:text-emerald-200",
                            isSel && "scale-105 border-rose-400 bg-rose-600 text-white shadow-[0_6px_16px_-4px_rgba(225,29,72,0.8)]",
                            row >= "H" && !booked && !isSel && "border-amber-400/30 bg-amber-400/5",
                          )}
                        >
                          {s.number}
                        </button>
                      </span>
                    );
                  })}
                </div>
                <span className="w-6 shrink-0 text-center text-xs font-bold text-zinc-500">{row}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#232332] pt-4 text-center text-xs">
            <div><p className="font-bold text-zinc-200">Classic A–C</p><p className="text-zinc-500">₹{show.priceClassic}</p></div>
            <div><p className="font-bold text-zinc-200">Prime D–G</p><p className="text-zinc-500">₹{show.pricePrime}</p></div>
            <div><p className="font-bold text-zinc-200">Recline H–J</p><p className="text-zinc-500">₹{show.priceRecline}</p></div>
          </div>
        </Card>

        {/* summary */}
        <Card className="h-fit p-5 xl:sticky xl:top-24">
          <h2 className="type-heading">Selection summary</h2>
          {movie && (
            <div className="mt-3 flex gap-3">
              <img src={movie.poster} alt="" className="h-20 w-14 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{movie.title}</p>
                <p className="type-caption mt-0.5">{theatre?.name}</p>
                <p className="type-caption">{show.date} · {show.time}</p>
              </div>
            </div>
          )}
          <div className="mt-4 space-y-2 border-t border-[#232332] pt-4 text-sm">
            <div className="flex justify-between"><span className="text-zinc-400">Seats ({selected.length}/{MAX_SEATS})</span><span className="font-bold">{selected.length ? [...selected].sort().join(", ") : "—"}</span></div>
            {selected.length > 0 && (
              <ul className="space-y-1 text-xs text-zinc-400">
                {(["Classic", "Prime", "Recline"] as const).map((tier) => {
                  const n = selected.filter((id) => seats.find((s) => s.id === id)?.tier === tier).length;
                  if (!n) return null;
                  return <li key={tier} className="flex justify-between"><span>{tier} × {n}</span><span>{formatINR(n * priceFor(show, tier))}</span></li>;
                })}
              </ul>
            )}
            <div className="flex justify-between border-t border-[#232332] pt-2 text-base font-extrabold"><span>Total</span><span>{formatINR(total)}</span></div>
            <p className="type-caption">+ ₹24 convenience fee / ticket at checkout</p>
          </div>
          <Button className="mt-4 w-full py-3" disabled={selected.length === 0} onClick={proceed}>
            Continue to booking <ArrowRight size={15} />
          </Button>
          {selected.length > 0 && (
            <Button variant="ghost" className="mt-1 w-full" onClick={() => setSelected([])}>Clear selection</Button>
          )}
        </Card>
      </div>
    </div>
  );
}
