import { ArrowRight, CalendarDays, Clapperboard, IndianRupee, MapPin, Play, Sparkles, Ticket, TrendingUp, Wallet, Zap } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bars, LineChart } from "../components/charts";
import { Badge, Button, Card, PageHeader, Rating, StatCard } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { useBookings } from "../contexts/BookingContext";
import { useMovies } from "../hooks/useMovies";
import { formatDate, formatINR, todayISO } from "../utils/format";

const TREND = [42, 58, 51, 74, 69, 92, 88];
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const REVENUE = [18400, 22100, 19800, 31200, 28900, 41200, 38600];

export function DashboardPage() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const { movies } = useMovies(0);
  const nav = useNavigate();

  const mine = useMemo(() => (user ? bookings.filter((b) => b.userEmail === user.email) : bookings), [bookings, user]);
  const today = todayISO();
  const todays = mine.filter((b) => b.date === today && b.status === "Confirmed");
  const revenue = mine.filter((b) => b.status !== "Cancelled").reduce((a, b) => a + b.total, 0);
  const recent = mine.slice(0, 4);
  const upcoming = movies.filter((m) => m.status === "Upcoming").slice(0, 3);
  const nowShowing = movies.filter((m) => m.status !== "Upcoming").slice(0, 4);

  const stats = [
    { icon: Clapperboard, label: "Total movies", value: String(movies.length || 12), hint: "Live catalogue via TVMaze API" },
    { icon: MapPin, label: "Total theatres", value: "12", hint: "Across 6 cities" },
    { icon: Ticket, label: "My bookings", value: String(mine.length), hint: `${todays.length} show${todays.length === 1 ? "" : "s"} today` },
    { icon: IndianRupee, label: "My spend", value: formatINR(revenue), hint: "Confirmed + completed" },
  ];

  return (
    <div className="anim-rise">
      <PageHeader
        title={`Evening, ${user?.name.split(" ")[0] ?? "Guest"} — what's on?`}
        sub="Live catalogue, showtimes across 12 theatres, and your bookings at a glance."
        actions={
          <>
            <Button variant="secondary" onClick={() => nav("/theatres")}>Find theatres</Button>
            <Button onClick={() => nav("/movies")}>Book tickets <ArrowRight size={15} /></Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* quick actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Zap, t: "Book in 60 seconds", d: "Pick a film, choose seats, pay.", to: "/movies" },
          { icon: Wallet, t: "E-tickets & refunds", d: "History, cancellations, invoices.", to: "/history" },
          { icon: TrendingUp, t: "Occupancy insights", d: "Revenue, trends and top films.", to: "/reports" },
        ].map((q) => (
          <Link key={q.t} to={q.to} className="group flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 transition-all hover:border-rose-500/40 hover:bg-wash">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600/12 text-rose-300 transition-transform group-hover:scale-105">
              <q.icon size={18} />
            </span>
            <span>
              <span className="block text-sm font-bold">{q.t}</span>
              <span className="type-caption block">{q.d}</span>
            </span>
            <ArrowRight size={16} className="ml-auto text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-rose-300" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {/* now showing strip */}
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="type-heading">Now showing</h2>
            <Link to="/movies" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-300 hover:text-rose-200">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {nowShowing.map((m) => (
              <Link key={m.id} to={`/movies/${m.id}`} className="group overflow-hidden rounded-xl border border-line bg-coal transition-all hover:border-rose-500/40">
                <div className="on-photo relative aspect-[2/3] overflow-hidden bg-elevated">
                  <img src={m.poster} alt={m.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute top-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur">★ {m.rating.toFixed(1)}</span>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-[13px] font-bold">{m.title}</p>
                  <p className="truncate text-[11px] text-faint">{m.genres.slice(0, 2).join(" · ")} · {m.language}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* revenue */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="type-heading">Revenue pulse</h2>
            <Badge tone="success">+18% WoW</Badge>
          </div>
          <p className="type-caption mt-1">Dummy box-office data · this week</p>
          <div className="mt-3"><LineChart data={TREND} /></div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div><p className="type-label">Today</p><p className="text-lg font-extrabold">{formatINR(38600)}</p></div>
            <div><p className="type-label">Occupancy</p><p className="text-lg font-extrabold">78%</p></div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="type-heading">Recent bookings</h2>
          <p className="type-caption mt-0.5">Your latest tickets across all theatres</p>
          {recent.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-line p-8 text-center">
              <Ticket size={22} className="mx-auto text-faint" />
              <p className="mt-2 text-sm font-semibold">No bookings yet</p>
              <p className="type-caption mt-1">Your tickets will appear here once you book.</p>
              <Button className="mt-3" onClick={() => nav("/movies")}>Browse movies</Button>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((b) => (
                <li key={b.id} className="flex items-center gap-3 py-3">
                  <img src={b.poster} alt="" className="h-12 w-9 rounded-md object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{b.movieTitle}</p>
                    <p className="type-caption truncate">{b.theatreName} · {formatDate(b.date)} · {b.time} · {b.seats.join(", ")}</p>
                  </div>
                  <Badge tone={b.status === "Confirmed" ? "success" : b.status === "Cancelled" ? "danger" : "neutral"}>{b.status}</Badge>
                  <span className="text-sm font-bold whitespace-nowrap">{formatINR(b.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="type-heading">Daily bookings</h2>
            <p className="type-caption mt-0.5">Dummy trend · tickets per day</p>
            <div className="mt-3"><Bars data={[120, 180, 150, 240, 210, 320, 300]} labels={WEEK} /></div>
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-300" />
              <h2 className="type-heading">Coming soon</h2>
            </div>
            <ul className="space-y-3">
              {upcoming.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <img src={m.poster} alt="" className="h-14 w-10 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{m.title}</p>
                    <p className="type-caption">{formatDate(m.releaseDate)} · {m.language}</p>
                  </div>
                  <Rating value={m.rating} />
                </li>
              ))}
              {upcoming.length === 0 && <p className="type-muted">No upcoming titles this week.</p>}
            </ul>
            <Button variant="secondary" className="mt-4 w-full" onClick={() => nav("/movies?status=Upcoming")}>
              <CalendarDays size={15} /> Notify me
            </Button>
            <Button variant="ghost" className="mt-1 w-full" onClick={() => nav("/movies/101")}>
              <Play size={15} /> Watch trailer (demo)
            </Button>
          </Card>
        </div>
      </div>

      <p className="type-caption mt-6 hidden">{REVENUE.length} weeks aggregated</p>
    </div>
  );
}
