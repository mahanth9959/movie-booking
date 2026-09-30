import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Info, Moon, Search, Star, Sun, XCircle, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

/* ---------- Button ---------- */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  loading?: boolean;
}
export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: BtnProps) {
  const styles: Record<BtnVariant, string> = {
    primary: "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-[0_8px_24px_-8px_rgba(225,29,72,0.7)]",
    secondary: "bg-elevated hover:bg-wash text-strong border border-line",
    ghost: "bg-transparent hover:bg-wash text-soft",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30",
    gold: "bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold",
  };
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2",
        styles[variant],
        className,
      )}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Input ---------- */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}
export function Input({ label, error, icon: Icon, className, id, ...rest }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="type-label mb-1.5 block">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />}
        <input
          id={id}
          {...rest}
          className={cn(
            "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-strong placeholder:text-faint transition-colors",
            Icon && "pl-9",
            error ? "border-red-500/60 focus:border-red-400" : "border-line focus:border-rose-500/70",
            "focus:outline-none",
            className,
          )}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function SearchInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
      <input
        {...rest}
        className="w-full rounded-lg border border-line bg-surface py-2.5 pr-3 pl-9 text-sm text-strong placeholder:text-faint focus:border-rose-500/70 focus:outline-none"
      />
    </div>
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}
export function Select({ label, options, className, id, ...rest }: SelectProps & { [k: string]: unknown }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="type-label mb-1.5 block">
          {label}
        </label>
      )}
      <select
        id={id}
        {...(rest as object)}
        className={cn(
          "w-full appearance-none rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-strong focus:border-rose-500/70 focus:outline-none",
          className,
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-elevated">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------- Card / Badge ---------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-surface shadow-[0_12px_32px_-16px_rgba(0,0,0,0.8)]", className)}>{children}</div>;
}

export function Badge({ tone = "neutral", children, className }: { tone?: "neutral" | "success" | "warning" | "danger" | "info" | "gold"; children: ReactNode; className?: string }) {
  const map: Record<string, string> = {
    neutral: "bg-wash text-soft border-line",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    danger: "bg-red-500/10 text-red-300 border-red-500/25",
    info: "bg-sky-500/10 text-sky-300 border-sky-500/25",
    gold: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold", map[tone], className)}>
      {children}
    </span>
  );
}

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-bold text-amber-300", className)}>
      <Star size={14} className="fill-amber-400 text-amber-400" />
      {value.toFixed(1)}
      <span className="font-medium text-faint">/10</span>
    </span>
  );
}

/* ---------- Page header / stats ---------- */
export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="type-display">{title}</h1>
        {sub && <p className="type-muted mt-1.5 max-w-xl">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, accent }: { icon: LucideIcon; label: string; value: string; hint?: string; accent?: string }) {
  return (
    <Card className="p-5 transition-colors hover:border-rose-500/40">
      <div className="flex items-center justify-between">
        <span className="type-label">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600/12 text-rose-400" style={accent ? { background: accent } : undefined}>
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-2 text-[1.7rem] leading-none font-extrabold tracking-tight">{value}</p>
      {hint && <p className="type-caption mt-1.5">{hint}</p>}
    </Card>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="anim-fade fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`anim-pop w-full overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl ${wide ? "max-w-2xl" : "max-w-lg"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="type-sub">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-md p-1.5 text-mist transition-colors hover:bg-wash hover:text-strong">
            <XCircle size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Empty / loading / error ---------- */
export function EmptyState({ icon: Icon, title, message, action }: { icon: LucideIcon; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-wash px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wash text-faint">
        <Icon size={22} />
      </span>
      <h3 className="type-sub mt-4">{title}</h3>
      <p className="type-muted mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/[0.04] px-6 py-12 text-center">
      <AlertTriangle size={24} className="text-red-400" />
      <h3 className="type-sub mt-3">Something went wrong</h3>
      <p className="type-muted mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-10 text-mist" role="status" aria-label={label}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="skeleton aspect-[2/3]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const nums: number[] = [];
  for (let i = Math.max(0, page - 2); i < Math.min(totalPages, page + 3); i++) nums.push(i);
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page" className="rounded-lg border border-line bg-surface p-2 text-soft transition-colors hover:bg-wash disabled:opacity-40">
        <ChevronLeft size={16} />
      </button>
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={cn("min-w-9 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors", n === page ? "bg-rose-600 text-white" : "border border-line bg-surface text-soft hover:bg-wash")}
        >
          {n + 1}
        </button>
      ))}
      <button type="button" disabled={page === totalPages - 1} onClick={() => onChange(page + 1)} aria-label="Next page" className="rounded-lg border border-line bg-surface p-2 text-soft transition-colors hover:bg-wash disabled:opacity-40">
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

/* ---------- Theme toggle ---------- */
export function ThemeToggle({ theme, onToggle }: { theme: "dark" | "light"; onToggle: () => void }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-xs font-semibold text-soft transition-colors hover:bg-wash"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
      <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </button>
  );
}

/* ---------- Toasts ---------- */
export function ToastStack({ toasts, dismiss }: { toasts: { id: number; kind: string; title: string; message?: string }[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const Icon = t.kind === "success" ? CheckCircle2 : t.kind === "error" ? XCircle : Info;
        const bar = t.kind === "success" ? "bg-emerald-400" : t.kind === "error" ? "bg-red-400" : "bg-sky-400";
        return (
          <div key={t.id} className="anim-pop pointer-events-auto flex items-start gap-3 overflow-hidden rounded-xl border border-line bg-elevated p-3.5 shadow-2xl">
            <span className={`mt-0.5 h-8 w-1 shrink-0 rounded-full ${bar}`} />
            <Icon size={18} className={t.kind === "success" ? "mt-0.5 shrink-0 text-emerald-400" : t.kind === "error" ? "mt-0.5 shrink-0 text-red-400" : "mt-0.5 shrink-0 text-sky-400"} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.message && <p className="mt-0.5 text-xs text-mist">{t.message}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="rounded p-1 text-faint hover:text-strong">
              <XCircle size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
