import { Armchair, MapPin, Phone, RotateCcw, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, EmptyState, PageHeader, Pagination, SearchInput, Select } from "../components/ui";
import { CITIES, THEATRES } from "../data/theatres";

const PER_PAGE = 6;

export function TheatresPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return THEATRES.filter((t) => {
      if (city !== "All" && t.city !== city) return false;
      if (q && !`${t.name} ${t.address} ${t.city}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, city]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="anim-rise">
      <PageHeader title="Theatres" sub="12 partner multiplexes across 6 cities — screens, showtimes, amenities and contact info." />

      <div className="mb-5 grid gap-3 rounded-2xl border border-[#232332] bg-[#0e0e17] p-4 sm:grid-cols-[1.6fr_1fr_auto]">
        <SearchInput placeholder="Search theatres, areas…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} aria-label="Search theatres" />
        <Select label="City" options={["All", ...CITIES].map((c) => ({ value: c, label: c === "All" ? "All cities" : c }))} value={city} onChange={(e) => { setCity((e.target as HTMLSelectElement).value); setPage(0); }} />
        <div className="flex items-end">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b2b40] px-3 py-2.5 text-xs font-semibold text-zinc-400"><Search size={13} />{filtered.length} found</span>
        </div>
      </div>

      {(q || city !== "All") && (
        <button type="button" onClick={() => { setQ(""); setCity("All"); setPage(0); }} className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200">
          <RotateCcw size={12} /> Clear search & filters
        </button>
      )}

      {slice.length === 0 ? (
        <EmptyState icon={MapPin} title="No theatres found" message="Try a different area name or pick another city." />
      ) : (
        <>
          <div className="stagger grid gap-4 md:grid-cols-2">
            {slice.map((t) => (
              <Link key={t.id} to={`/theatres/${t.id}`} className="group overflow-hidden rounded-2xl border border-[#232332] bg-[#12121c] transition-all hover:-translate-y-0.5 hover:border-rose-500/40">
                <div className="relative h-40 overflow-hidden">
                  <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12121c] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3"><Badge tone="neutral">{t.city}</Badge></span>
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-amber-300 backdrop-blur"><Star size={12} className="fill-amber-400 text-amber-400" />{t.rating.toFixed(1)}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold group-hover:text-rose-200">{t.name}</h3>
                  <p className="type-caption mt-1">{t.address}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge tone="info"><Armchair size={11} /> {t.screens} screens</Badge>
                    <Badge tone="neutral">4 shows / day</Badge>
                    {t.amenities.slice(0, 2).map((a) => <Badge key={a} tone="neutral">{a}</Badge>)}
                  </div>
                  <p className="type-caption mt-3 inline-flex items-center gap-1.5"><Phone size={11} />{t.contact}</p>
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
