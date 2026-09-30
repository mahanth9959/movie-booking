import { Armchair, Crown, IndianRupee, MapPin, Ticket } from "lucide-react";
import { useMemo } from "react";
import { Bars, Donut, LineChart } from "../components/charts";
import { Badge, Card, PageHeader, StatCard } from "../components/ui";
import { useBookings } from "../contexts/BookingContext";
import { useMovies } from "../hooks/useMovies";
import { formatINR } from "../utils/format";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAILY = [120, 180, 150, 240, 210, 320, 300];
const REVENUE_TREND = [18400, 22100, 19800, 31200, 28900, 41200, 38600];

export function ReportsPage() {
  const { bookings } = useBookings();
  const { movies } = useMovies(0);

  const live = useMemo(() => bookings.filter((b) => b.status !== "Cancelled"), [bookings]);
  const totalRevenue = live.reduce((a, b) => a + b.total, 0) + 284600; // + dummy base
  const totalTickets = live.reduce((a, b) => a + b.seats.length, 0) + 1240;

  const byMovie = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of live) m.set(b.movieTitle, (m.get(b.movieTitle) ?? 0) + 1);
    // pad with dummy so charts look alive on fresh installs
    const dummy: [string, number][] = [["Neon Horizon", 214], ["Varanasi Nights", 186], ["Shadow Protocol", 152], ["Deccan Queens", 141], ["The Last Lighthouse", 118]];
    for (const [k, v] of dummy) m.set(k, (m.get(k) ?? 0) + v);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [live]);

  const byTheatre = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of live) m.set(b.theatreName, (m.get(b.theatreName) ?? 0) + 1);
    const dummy: [string, number][] = [["CineStar Grand IMAX", 302], ["AMB Cinemas", 268], ["PVR Select City", 244], ["Sathyam Grand", 198], ["Orion ScreenX", 171]];
    for (const [k, v] of dummy) m.set(k, (m.get(k) ?? 0) + v);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [live]);

  const topMovie = byMovie[0];
  const topTheatre = byTheatre[0];
  const occupancy = 78;
  const topMovieMeta = movies.find((m) => m.title === topMovie?.[0]);

  return (
    <div className="anim-rise">
      <PageHeader title="Reports & analytics" sub="Live counts from your bookings blended with dummy box-office data for a full dashboard feel." actions={<Badge tone="success">Updated just now</Badge>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Ticket} label="Total bookings" value={String(live.length + 1240)} hint={`${bookings.length} from your session`} />
        <StatCard icon={IndianRupee} label="Total revenue" value={formatINR(totalRevenue)} hint="+18% vs last week (dummy)" />
        <StatCard icon={Crown} label="Most booked movie" value={topMovie ? topMovie[0].split(" ").slice(0, 2).join(" ") : "—"} hint={topMovie ? `${topMovie[1]} bookings` : ""} />
        <StatCard icon={MapPin} label="Top theatre" value={topTheatre ? topTheatre[0].split(" ").slice(0, 2).join(" ") : "—"} hint={topTheatre ? `${topTheatre[1]} bookings` : ""} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div><h2 className="type-heading">Revenue trend</h2><p className="type-caption">Dummy data · last 7 days</p></div>
            <Badge tone="success">+18.2%</Badge>
          </div>
          <div className="mt-3"><LineChart data={REVENUE_TREND} height={170} /></div>
          <div className="mt-3 flex gap-5 border-t border-line pt-3 text-sm">
            <span className="text-mist">Avg / day <span className="ml-1 font-extrabold text-strong">{formatINR(29600)}</span></span>
            <span className="text-mist">Peak <span className="ml-1 font-extrabold text-strong">Sat · {formatINR(41200)}</span></span>
            <span className="text-mist">Tickets <span className="ml-1 font-extrabold text-strong">{totalTickets.toLocaleString("en-IN")}</span></span>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="type-heading">Seat occupancy</h2>
          <p className="type-caption">Blended live + dummy</p>
          <div className="mt-4"><Donut segments={[{ label: "Occupied", value: occupancy, color: "#e11d48" }, { label: "Prime", value: 12, color: "#fbbf24" }, { label: "Available", value: 100 - occupancy - 12, color: "var(--line)" }]} /></div>
          <p className="type-caption mt-4 flex items-center gap-1.5"><Armchair size={13} />Prime rows (D–G) fill fastest on weekends.</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="type-heading">Daily booking trend</h2>
          <p className="type-caption">Tickets per day · dummy data</p>
          <div className="mt-3"><Bars data={DAILY} labels={WEEK} /></div>
        </Card>
        <Card className="p-5">
          <h2 className="type-heading">Leaderboards</h2>
          <p className="type-caption">Most booked movies & theatres</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="type-label mb-2">Top movies</p>
              <ol className="space-y-2.5">
                {byMovie.slice(0, 5).map(([t, n], i) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-extrabold ${i === 0 ? "bg-amber-400 text-zinc-950" : "bg-wash text-mist"}`}>{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{t}</span>
                    <span className="font-bold text-soft">{n}</span>
                  </li>
                ))}
              </ol>
              {topMovieMeta && <p className="type-caption mt-3">★ {topMovieMeta.title} is rated {topMovieMeta.rating.toFixed(1)}/10 in the live catalogue.</p>}
            </div>
            <div>
              <p className="type-label mb-2">Top theatres</p>
              <ol className="space-y-2.5">
                {byTheatre.slice(0, 5).map(([t, n], i) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-extrabold ${i === 0 ? "bg-rose-500 text-white" : "bg-wash text-mist"}`}>{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{t}</span>
                    <span className="font-bold text-soft">{n}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
