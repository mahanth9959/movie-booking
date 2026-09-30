import { Download, QrCode, Search, Ticket, TicketX } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, SearchInput, Select } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { useBookings } from "../contexts/BookingContext";
import { useToast } from "../contexts/ToastContext";
import { useMovies } from "../hooks/useMovies";
import type { Booking } from "../types";
import { formatDate, formatDateLong, formatINR } from "../utils/format";

export function HistoryPage() {
  const { user } = useAuth();
  const { bookings, cancelBooking } = useBookings();
  const { movies } = useMovies(0);
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [movieF, setMovieF] = useState("All");
  const [dateF, setDateF] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [ticket, setTicket] = useState<Booking | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null);

  const mine = useMemo(() => (user ? bookings.filter((b) => b.userEmail === user.email) : []), [bookings, user]);
  const titles = useMemo(() => ["All", ...Array.from(new Set(mine.map((b) => b.movieTitle)))], [mine]);

  const filtered = mine.filter((b) => {
    if (q && !`${b.movieTitle} ${b.id} ${b.theatreName}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (movieF !== "All" && b.movieTitle !== movieF) return false;
    if (dateF && b.date !== dateF) return false;
    if (statusF !== "All" && b.status !== statusF) return false;
    return true;
  });

  const moviePoster = (id: number) => movies.find((m) => m.id === id)?.poster;

  return (
    <div className="anim-rise">
      <PageHeader title="Booking history" sub="Search, filter, cancel and re-open e-tickets for every order." actions={<Badge tone="neutral">{mine.length} total</Badge>} />

      <div className="mb-5 grid gap-3 rounded-2xl border border-line bg-coal p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <SearchInput placeholder="Search by movie, theatre or booking ID…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
        <Select label="Movie" options={titles.map((t) => ({ value: t, label: t === "All" ? "All movies" : t }))} value={movieF} onChange={(e) => setMovieF((e.target as HTMLSelectElement).value)} />
        <div>
          <label htmlFor="bf-date" className="type-label mb-1.5 block">Booking date</label>
          <input id="bf-date" type="date" value={dateF} onChange={(e) => setDateF(e.target.value)} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-strong focus:border-rose-500/70 focus:outline-none" />
        </div>
        <Select label="Status" options={["All", "Confirmed", "Cancelled", "Completed"].map((s) => ({ value: s, label: s === "All" ? "All statuses" : s }))} value={statusF} onChange={(e) => setStatusF((e.target as HTMLSelectElement).value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={mine.length === 0 ? Ticket : Search}
          title={mine.length === 0 ? "No bookings yet" : "No bookings match"}
          message={mine.length === 0 ? "Book your first show — tickets, QR codes and invoices will live here." : "Try widening the search or clearing the movie, date and status filters."}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((b) => (
            <Card key={b.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <img src={b.poster || moviePoster(b.movieId) || ""} alt="" className="h-28 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-[15px] font-bold">{b.movieTitle}</h3>
                  <Badge tone={b.status === "Confirmed" ? "success" : b.status === "Cancelled" ? "danger" : "neutral"}>{b.status}</Badge>
                </div>
                <p className="type-caption mt-1">{b.id} · booked {formatDate(b.bookedAt)} · {b.paymentMethod}</p>
                <p className="mt-1 text-[13px] text-soft">{b.theatreName} · {b.screen} · {formatDateLong(b.date)} · {b.time}</p>
                <p className="mt-1 text-[13px] font-semibold">Seats {b.seats.join(", ")} · <span className="text-mist">{formatINR(b.total)}</span></p>
              </div>
              <div className="flex shrink-0 gap-2 sm:flex-col">
                <Button variant="secondary" onClick={() => setTicket(b)}><QrCode size={14} /> E-ticket</Button>
                {b.status === "Confirmed" && (
                  <Button variant="danger" onClick={() => setConfirmCancel(b)}><TicketX size={14} /> Cancel</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* e-ticket modal */}
      <Modal open={!!ticket} onClose={() => setTicket(null)} title={ticket ? `E-Ticket · ${ticket.id}` : "E-Ticket"}>
        {ticket && (
          <div>
            <div className="flex gap-4">
              <img src={ticket.poster} alt="" className="h-32 w-24 rounded-xl object-cover" />
              <div className="min-w-0 text-sm">
                <p className="text-base font-extrabold">{ticket.movieTitle}</p>
                <p className="type-caption mt-1">{ticket.theatreName}, {ticket.city} · {ticket.screen}</p>
                <p className="type-caption">{formatDateLong(ticket.date)} · {ticket.time}</p>
                <p className="mt-2 font-bold">Seats {ticket.seats.join(", ")}</p>
                <p className="type-caption">{ticket.paymentMethod} · {formatINR(ticket.total)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-line bg-wash p-3">
              <QrCode size={64} className="shrink-0" />
              <p className="type-caption">Scan at entry. Arrive 20 min early · outside food not allowed · ID may be checked for A-rated films.</p>
            </div>
            <Button className="mt-4 w-full" onClick={() => { setTicket(null); push({ kind: "info", title: "Ticket download (demo)", message: "PDF export would start here." }); }}>
              <Download size={15} /> Download ticket (demo)
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmCancel} onClose={() => setConfirmCancel(null)} title="Cancel booking?">
        {confirmCancel && (
          <div>
            <p className="type-body text-soft">Cancel <span className="font-bold text-strong">{confirmCancel.id}</span> — {confirmCancel.movieTitle}, {confirmCancel.seats.join(", ")} on {formatDate(confirmCancel.date)}? Refund (demo) lands in 3–5 days.</p>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmCancel(null)}>Keep ticket</Button>
              <Button variant="danger" className="flex-1" onClick={() => { cancelBooking(confirmCancel.id); push({ kind: "success", title: "Booking cancelled", message: `${confirmCancel.id} refunded (demo).` }); setConfirmCancel(null); }}>
                Yes, cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// "My Bookings" quick route reuses history with confirmed filter hint
export function BookingsPage() {
  return <HistoryPage />;
}
