import { ArrowLeft, BadgeCheck, Ticket } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";
import { useBookings } from "../contexts/BookingContext";
import { useToast } from "../contexts/ToastContext";
import { useMovies } from "../hooks/useMovies";
import { theatreById } from "../data/theatres";
import { formatDateLong, formatINR } from "../utils/format";
import { priceFor, tierOf } from "../utils/seats";

export function CheckoutPage() {
  const { showId } = useParams();
  const nav = useNavigate();
  const { showById, draft, resetDraft } = useBookings();
  const { movies } = useMovies(0);
  const { push } = useToast();

  const show = showId ? showById(showId) : undefined;
  const seats = draft.showId === showId && draft.seats.length ? draft.seats : [];
  const movie = show ? movies.find((m) => m.id === show.movieId) : undefined;
  const theatre = show ? theatreById(show.theatreId) : undefined;

  const ticketPrice = !show ? 0 : seats.reduce((a, id) => a + priceFor(show, tierOf(id)), 0);
  const fee = seats.length * 24;
  const total = ticketPrice + fee;

  if (!show) {
    return <EmptyState icon={Ticket} title="Checkout expired" message="We couldn't find this show. Please reselect your seats." action={<Button onClick={() => nav("/movies")}>Browse movies</Button>} />;
  }
  if (seats.length === 0) {
    return (
      <EmptyState
        icon={Ticket}
        title="No seats in this booking"
        message="Your seat selection is empty — head back and pick seats first."
        action={<Button onClick={() => nav(`/seats/${show.id}`)}>Select seats</Button>}
      />
    );
  }

  return (
    <div className="anim-rise mx-auto max-w-3xl">
      <button type="button" onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-mist hover:text-strong">
        <ArrowLeft size={15} /> Back to seats
      </button>
      <PageHeader title="Booking summary" sub="Review every detail before you pay — duplicates are blocked automatically." />

      <Card className="overflow-hidden">
        <div className="flex gap-4 bg-gradient-to-r from-rose-600/15 to-transparent p-5">
          {movie && <img src={movie.poster} alt="" className="h-28 w-20 rounded-xl object-cover" />}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">Summary</Badge>
              <Badge tone="neutral">{show.format}</Badge>
            </div>
            <h2 className="type-heading mt-1.5">{movie?.title}</h2>
            <p className="type-muted mt-0.5">{theatre?.name}, {theatre?.city} · {show.screen}</p>
            <p className="type-muted">{formatDateLong(show.date)} · {show.time}</p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="type-label mb-2">Seats · {seats.length}</p>
            <div className="flex flex-wrap gap-1.5">
              {seats.map((s) => <span key={s} className="rounded-md border border-rose-500/30 bg-rose-600/10 px-2.5 py-1 text-xs font-bold text-rose-200">{s}</span>)}
            </div>
          </div>

          <dl className="space-y-2 rounded-xl border border-line bg-coal p-4 text-sm">
            <div className="flex justify-between"><dt className="text-mist">Tickets ({seats.length})</dt><dd className="font-semibold">{formatINR(ticketPrice)}</dd></div>
            <div className="flex justify-between"><dt className="text-mist">Convenience fee</dt><dd className="font-semibold">{formatINR(fee)}</dd></div>
            <div className="flex justify-between"><dt className="text-mist">Weekend offer (Prime)</dt><dd className="font-semibold text-emerald-300">Included</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold"><dt>Total payable</dt><dd>{formatINR(total)}</dd></div>
          </dl>

          <div className="flex items-start gap-2 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5 text-xs leading-relaxed text-sky-200">
            <BadgeCheck size={15} className="mt-0.5 shrink-0" />
            Same user + show + seats can't be booked twice. Cancelling frees the seats instantly in this demo.
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => { resetDraft(); push({ kind: "info", title: "Draft cleared" }); nav(`/seats/${show.id}`); }}>
              Change seats
            </Button>
            <Button className="flex-1 py-3" onClick={() => nav(`/payment/${show.id}`)}>
              Proceed to payment · {formatINR(total)}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
