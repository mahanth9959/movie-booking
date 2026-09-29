import { ArrowLeft, BadgeCheck, CreditCard, Download, QrCode, ShieldCheck, Ticket, Wallet, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, EmptyState, Input, Modal, PageHeader } from "../components/ui";
import { useBookings } from "../contexts/BookingContext";
import { useToast } from "../contexts/ToastContext";
import { useMovies } from "../hooks/useMovies";
import { theatreById } from "../data/theatres";
import type { Booking } from "../types";
import { formatDateLong, formatINR } from "../utils/format";
import { priceFor, tierOf } from "../utils/seats";
import { cn } from "../utils/cn";

type Method = "card" | "upi" | "wallet";
type Phase = "form" | "processing" | "success" | "failure";

export function PaymentPage() {
  const { showId } = useParams();
  const nav = useNavigate();
  const { showById, draft, createBooking, resetDraft } = useBookings();
  const { movies } = useMovies(0);
  const { push } = useToast();

  const [method, setMethod] = useState<Method>("card");
  const [phase, setPhase] = useState<Phase>("form");
  const [forceFail, setForceFail] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);

  // card form state (UI only)
  const [card, setCard] = useState({ number: "4111 1111 1111 1111", name: "", expiry: "", cvv: "" });
  const [upi, setUpi] = useState("user@okhdfc");
  const [cardErr, setCardErr] = useState("");

  const show = showId ? showById(showId) : undefined;
  const seats = draft.showId === showId ? draft.seats : [];
  const movie = show ? movies.find((m) => m.id === show.movieId) : undefined;
  const theatre = show ? theatreById(show.theatreId) : undefined;

  const ticketPrice = !show ? 0 : seats.reduce((a, id) => a + priceFor(show, tierOf(id)), 0);
  const total = ticketPrice + seats.length * 24;

  if (!show || seats.length === 0) {
    return <EmptyState icon={Ticket} title="Nothing to pay for" message="Select seats first — payment needs an active booking draft." action={<Button onClick={() => nav("/movies")}>Browse movies</Button>} />;
  }

  const pay = () => {
    if (method === "card") {
      const digits = card.number.replace(/\D/g, "");
      if (digits.length < 16) { setCardErr("Enter a valid 16-digit card number."); return; }
      if (!card.name.trim() || !card.expiry.trim() || card.cvv.trim().length < 3) { setCardErr("Fill name, expiry and CVV to continue."); return; }
      setCardErr("");
    }
    if (method === "upi" && !/^[\w.-]+@[\w]+$/.test(upi.trim())) {
      push({ kind: "error", title: "Invalid UPI ID", message: "Format looks like name@bank." });
      return;
    }
    setPhase("processing");
    window.setTimeout(() => {
      const fail = forceFail || (method === "card" && card.number.replace(/\D/g, "").endsWith("0000"));
      if (fail) {
        setPhase("failure");
        push({ kind: "error", title: "Payment failed", message: "The bank declined this transaction." });
        return;
      }
      const label = method === "card" ? `Card •• ${card.number.replace(/\D/g, "").slice(-4)}` : method === "upi" ? `UPI ${upi.trim()}` : "Wallet";
      const res = createBooking({ movieId: show.movieId, movieTitle: movie?.title ?? "Movie", poster: movie?.poster ?? "", show, seats, ticketPrice, paymentMethod: label });
      if (res.error || !res.booking) {
        setPhase("failure");
        push({ kind: "error", title: "Booking blocked", message: res.error ?? "Try again." });
        return;
      }
      setConfirmed(res.booking);
      setPhase("success");
      resetDraft();
      push({ kind: "success", title: "Payment successful", message: `Booking ${res.booking.id} confirmed.` });
    }, 1700);
  };

  if (phase === "processing") {
    return (
      <div className="anim-rise mx-auto max-w-md py-16 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600/12">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-rose-500 border-t-transparent" />
        </span>
        <h1 className="type-heading mt-5">Processing payment…</h1>
        <p className="type-muted mt-1">Confirming {formatINR(total)} with your bank. Don't close this page.</p>
        <div className="mx-auto mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-rose-500" />
        </div>
      </div>
    );
  }

  if (phase === "success" && confirmed) {
    return (
      <div className="anim-rise mx-auto max-w-lg py-6 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-300">
          <BadgeCheck size={30} />
        </span>
        <h1 className="type-display mt-4">You're going to the movies!</h1>
        <p className="type-muted mt-2">Booking <span className="font-bold text-zinc-100">{confirmed.id}</span> · {confirmed.seats.join(", ")} · {formatINR(confirmed.total)} paid via {confirmed.paymentMethod}</p>
        {/* e-ticket */}
        <Card className="mt-6 overflow-hidden text-left">
          <div className="flex items-center justify-between bg-gradient-to-r from-rose-600/25 to-transparent px-5 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-extrabold"><Ticket size={16} className="text-rose-300" /> E-TICKET</span>
            <Badge tone="success">{confirmed.status}</Badge>
          </div>
          <div className="flex gap-4 p-5">
            <img src={confirmed.poster} alt="" className="h-28 w-20 rounded-xl object-cover" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="text-base font-extrabold">{confirmed.movieTitle}</p>
              <p className="type-caption mt-1">{confirmed.theatreName} · {confirmed.screen}</p>
              <p className="type-caption">{formatDateLong(confirmed.date)} · {confirmed.time}</p>
              <p className="mt-2 text-sm font-bold">Seats: {confirmed.seats.join(", ")}</p>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-[#2c2c40] p-2">
                <QrCode size={34} className="shrink-0 text-zinc-300" />
                <p className="type-caption">Show this QR at the gate · ID {confirmed.id}</p>
              </div>
            </div>
          </div>
        </Card>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={() => setTicketOpen(true)}><Download size={15} /> Download ticket (demo)</Button>
          <Button className="flex-1" onClick={() => nav("/history")}>View my bookings</Button>
        </div>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => nav("/movies")}>Book another show</Button>
        <Modal open={ticketOpen} onClose={() => setTicketOpen(false)} title="Download ticket">
          <p className="type-body text-zinc-300">Ticket download is UI-only in this build. In production this would render a print-ready PDF with QR, GST invoice and gate map.</p>
          <Button className="mt-4 w-full" onClick={() => { setTicketOpen(false); push({ kind: "info", title: "Added to downloads (demo)" }); }}>Got it</Button>
        </Modal>
      </div>
    );
  }

  if (phase === "failure") {
    return (
      <div className="anim-rise mx-auto max-w-md py-14 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/12 text-red-300">
          <XCircle size={30} />
        </span>
        <h1 className="type-display mt-4">Payment failed</h1>
        <p className="type-muted mt-2">Your seats are still held for 10 minutes. Try another method — no money was debited.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={() => setPhase("form")}>Try again</Button>
          <Button className="flex-1" onClick={() => nav(`/seats/${show.id}`)}>Change seats</Button>
        </div>
        <p className="type-caption mt-4">Tip: cards ending in 0000 always fail here so you can preview this screen.</p>
      </div>
    );
  }

  const tabs: { id: Method; label: string; icon: typeof CreditCard }[] = [
    { id: "card", label: "Card", icon: CreditCard },
    { id: "upi", label: "UPI", icon: QrCode },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ];

  return (
    <div className="anim-rise mx-auto max-w-4xl">
      <button type="button" onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white">
        <ArrowLeft size={15} /> Back to summary
      </button>
      <PageHeader title="Payment" sub="Demo checkout — no real money moves. Toggle failure simulation to preview error states." />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Payment methods">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={method === t.id}
                onClick={() => setMethod(t.id)}
                className={cn("flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-sm font-bold transition-colors", method === t.id ? "border-rose-500/60 bg-rose-600/12 text-rose-100" : "border-[#2b2b40] text-zinc-400 hover:bg-white/5")}
              >
                <t.icon size={18} />{t.label}
              </button>
            ))}
          </div>

          {method === "card" && (
            <div className="anim-fade mt-5 space-y-4">
              <Input label="Card number" inputMode="numeric" placeholder="4111 1111 1111 1111" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} icon={CreditCard} />
              <Input label="Name on card" placeholder="Aarav Sharma" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Expiry" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                <Input label="CVV" placeholder="•••" inputMode="numeric" type="password" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
              </div>
              {cardErr && <p className="text-xs font-medium text-red-400">{cardErr}</p>}
            </div>
          )}

          {method === "upi" && (
            <div className="anim-fade mt-5">
              <div className="flex flex-col items-center rounded-xl border border-dashed border-[#2c2c40] bg-white/[0.02] p-5 text-center">
                <QrCode size={88} className="text-zinc-200" />
                <p className="mt-2 text-sm font-bold">Scan with any UPI app</p>
                <p className="type-caption">GPay · PhonePe · Paytm · BHIM</p>
              </div>
              <div className="mt-4"><Input label="Or pay to UPI ID" placeholder="name@bank" value={upi} onChange={(e) => setUpi(e.target.value)} /></div>
            </div>
          )}

          {method === "wallet" && (
            <div className="anim-fade mt-5 grid gap-2">
              {["CineWallet (₹2,400 balance)", "Paytm Wallet", "Amazon Pay", "Mobikwik"].map((w, i) => (
                <label key={w} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm font-medium transition-colors", i === 0 ? "border-rose-500/50 bg-rose-600/8" : "border-[#2b2b40] hover:bg-white/[0.03]")}>
                  <input type="radio" name="wallet" defaultChecked={i === 0} className="accent-rose-500" />
                  <Wallet size={16} className="text-zinc-400" />{w}
                </label>
              ))}
            </div>
          )}

          <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-[#2b2b40] px-4 py-3 text-xs text-zinc-400">
            <span>Simulate payment failure (preview error screen)</span>
            <input type="checkbox" checked={forceFail} onChange={(e) => setForceFail(e.target.checked)} className="h-4 w-4 accent-rose-500" />
          </label>

          <Button className="mt-4 w-full py-3.5 text-[15px]" onClick={pay}>
            <ShieldCheck size={16} /> Pay {formatINR(total)} securely
          </Button>
          <p className="type-caption mt-2 text-center">256-bit encrypted · PCI-DSS demo · UPI, cards & wallets</p>
        </Card>

        <Card className="h-fit p-5 lg:sticky lg:top-24">
          <h2 className="type-heading">Booking summary</h2>
          {movie && (
            <div className="mt-3 flex gap-3">
              <img src={movie.poster} alt="" className="h-20 w-14 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{movie.title}</p>
                <p className="type-caption mt-0.5">{theatre?.name} · {show.screen}</p>
                <p className="type-caption">{formatDateLong(show.date)} · {show.time}</p>
              </div>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {seats.map((s) => <span key={s} className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-bold">{s}</span>)}
          </div>
          <dl className="mt-4 space-y-1.5 border-t border-[#232332] pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-400">Tickets</dt><dd className="font-semibold">{formatINR(ticketPrice)}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-400">Fees</dt><dd className="font-semibold">{formatINR(seats.length * 24)}</dd></div>
            <div className="flex justify-between text-base font-extrabold"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
          </dl>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500"><ShieldCheck size={12} className="text-emerald-400" /> Duplicate bookings blocked automatically</div>
        </Card>
      </div>
    </div>
  );
}
