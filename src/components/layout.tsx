import { BarChart3, Clapperboard, History, Home, LogOut, MapPin, Menu, Ticket, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { cn } from "../utils/cn";
import { ToastStack } from "./ui";

const LINKS = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/movies", label: "Movies", icon: Clapperboard },
  { to: "/theatres", label: "Theatres", icon: MapPin },
  { to: "/bookings", label: "My Bookings", icon: Ticket },
  { to: "/history", label: "History", icon: History },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function NavItems({ onNav }: { onNav?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Primary">
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === "/"}
          onClick={onNav}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-rose-600/15 text-rose-200" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
            )
          }
        >
          {({ isActive }) => (
            <>
              <l.icon size={17} className={isActive ? "text-rose-400" : ""} />
              {l.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-400" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { toasts, dismiss, push } = useToast();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#08080d] text-zinc-100">
      {/* topbar */}
      <header className="sticky top-0 z-40 border-b border-[#1d1d2b] bg-[#0b0b13]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button type="button" className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={19} />
          </button>
          <button type="button" onClick={() => navigate("/")} className="flex items-center gap-2.5" aria-label="CineBook home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-800 shadow-[0_8px_20px_-6px_rgba(225,29,72,0.8)]">
              <Ticket size={18} className="text-white" />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[15px] font-extrabold tracking-tight">CineBook</span>
              <span className="block text-[11px] font-medium text-zinc-500">Movie Ticket Booking</span>
            </span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => navigate("/movies")} className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 sm:block">
              Browse movies
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-lg border border-[#2b2b40] bg-[#12121c] px-3 py-1.5 text-sm sm:flex">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600/20 text-rose-300">
                    <User size={13} />
                  </span>
                  <span className="max-w-32 truncate font-medium">{user.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    push({ kind: "info", title: "Logged out", message: "See you at the movies." });
                    navigate("/login");
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-[#2b2b40] bg-[#12121c] px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => navigate("/login")} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500">
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl items-start gap-6 px-4 py-6 sm:px-6">
        {/* sidebar desktop */}
        <aside className="sticky top-24 hidden w-60 shrink-0 overflow-hidden rounded-2xl border border-[#232332] bg-[#0e0e17] lg:block">
          <div className="border-b border-[#1d1d2b] px-5 py-4">
            <p className="type-label">Menu</p>
          </div>
          <NavItems />
          <div className="m-3 rounded-xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-rose-600/10 p-4">
            <p className="text-sm font-bold">Weekend offer</p>
            <p className="type-caption mt-1">Flat 20% off on Prime seats, auto-applied at checkout.</p>
          </div>
        </aside>

        {/* mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <div className="anim-fade absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
            <div className="anim-pop absolute top-0 left-0 flex h-full w-72 flex-col bg-[#0e0e17]">
              <div className="flex items-center justify-between border-b border-[#1d1d2b] px-4 py-4">
                <span className="font-extrabold">CineBook</span>
                <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/5">
                  <X size={18} />
                </button>
              </div>
              <NavItems onNav={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 pb-24 lg:pb-10">{children}</main>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1d1d2b] bg-[#0b0b13]/95 backdrop-blur lg:hidden" aria-label="Mobile">
        <div className="grid grid-cols-5">
          {[
            { to: "/", label: "Home", icon: Home },
            { to: "/movies", label: "Movies", icon: Clapperboard },
            { to: "/theatres", label: "Halls", icon: MapPin },
            { to: "/bookings", label: "Tickets", icon: Ticket },
            { to: "/reports", label: "Stats", icon: BarChart3 },
          ].map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", isActive ? "text-rose-400" : "text-zinc-500")}>
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
