import { useMemo } from "react";

export function LineChart({ data, height = 140 }: { data: number[]; height?: number }) {
  const { path, dots } = useMemo(() => {
    const w = 560;
    const h = 160;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const px = (i: number) => (i / Math.max(1, data.length - 1)) * (w - 16) + 8;
    const py = (v: number) => h - 14 - ((v - min) / Math.max(1, max - min)) * (h - 40);
    const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
    return { path: d, dots: data.map((v, i) => ({ x: px(i), y: py(v), v })) };
  }, [data]);
  return (
    <svg viewBox="0 0 560 160" className="w-full" style={{ height }} role="img" aria-label="Trend chart">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e11d48" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[32, 72, 112].map((y) => (
        <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="#232332" strokeDasharray="4 6" />
      ))}
      <path d={`${path} L552,160 L8,160 Z`} fill="url(#lg)" />
      <path d={path} fill="none" stroke="#fb4d6d" strokeWidth="2.5" strokeLinecap="round" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="3.5" fill="#0b0b13" stroke="#fb7185" strokeWidth="2" />
      ))}
    </svg>
  );
}

export function Bars({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-40 items-end gap-2" role="img" aria-label="Bar chart">
      {data.map((v, i) => (
        <div key={labels[i]} className="flex flex-1 flex-col items-center gap-1.5" title={`${labels[i]}: ${v}`}>
          <span className="text-[11px] font-bold text-zinc-300">{v}</span>
          <div className="flex w-full flex-1 items-end rounded-md bg-white/[0.04]">
            <div
              className="w-full rounded-md bg-gradient-to-t from-rose-800 to-rose-500 transition-all"
              style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-zinc-500">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const R = 54;
  const C = 2 * Math.PI * R;
  let running = 0;
  const arcs = segments.map((s) => {
    const frac = s.value / total;
    const offset = -running * C;
    running += frac;
    return { ...s, frac, offset };
  });
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0" role="img" aria-label="Share chart">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#232332" strokeWidth="16" />
        {arcs.map((s) => (
          <circle
            key={s.label}
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="16"
            strokeDasharray={`${s.frac * C} ${C}`}
            strokeDashoffset={s.offset}
            strokeLinecap="butt"
            transform="rotate(-90 70 70)"
          />
        ))}
        <text x="70" y="66" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800">
          {total}
        </text>
        <text x="70" y="84" textAnchor="middle" fill="#8b8b9f" fontSize="10">
          bookings
        </text>
      </svg>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-zinc-300">{s.label}</span>
            <span className="ml-auto pl-4 font-bold">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
