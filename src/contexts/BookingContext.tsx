import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { THEATRES } from "../data/theatres";
import { SHOW_TIMES } from "../data/theatres";
import type { Booking, Show } from "../types";
import { bookingId, nextDays } from "../utils/format";
import { useAuth } from "./AuthContext";

interface Draft {
  movieId: number | null;
  theatreId: string | null;
  showId: string | null;
  seats: string[];
}

interface BookingCtx {
  bookings: Booking[];
  draft: Draft;
  setDraft: (d: Partial<Draft>) => void;
  resetDraft: () => void;
  showsFor: (movieId: number, date: string) => Show[];
  showById: (id: string) => Show | undefined;
  createBooking: (args: { movieId: number; movieTitle: string; poster: string; show: Show; seats: string[]; ticketPrice: number; paymentMethod: string }) => { booking?: Booking; error?: string };
  cancelBooking: (id: string) => void;
}

const BookingContext = createContext<BookingCtx | null>(null);
const KEY = "mtbs_bookings";

function buildShows(movieIds: number[]): Show[] {
  const dates = nextDays(5);
  const shows: Show[] = [];
  for (const theatre of THEATRES) {
    for (const date of dates) {
      SHOW_TIMES.forEach((time, ti) => {
        const movieId = movieIds[(THEATRES.indexOf(theatre) + dates.indexOf(date) + ti) % Math.max(1, movieIds.length)];
        if (movieId === undefined) return;
        const screenNo = 1 + ((ti + dates.indexOf(date)) % theatre.screens);
        shows.push({
          id: `${theatre.id}-${date}-${ti}`,
          movieId,
          theatreId: theatre.id,
          date,
          time,
          screen: `Screen ${screenNo}`,
          priceClassic: 149,
          pricePrime: 229,
          priceRecline: 329,
          format: ti === 3 ? "IMAX 2D" : ti === 1 ? "3D" : "2D",
        });
      });
    }
  }
  return shows;
}

const EMPTY_DRAFT: Draft = { movieId: null, theatreId: null, showId: null, seats: [] };

export function BookingProvider({ children, movieIds }: { children: ReactNode; movieIds: number[] }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Booking[];
    } catch {
      return [];
    }
  });
  const [draft, setDraftState] = useState<Draft>(EMPTY_DRAFT);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(bookings));
  }, [bookings]);

  const showCatalog = useMemo(() => buildShows(movieIds.length ? movieIds : [101, 102, 103, 104]), [movieIds]);

  const setDraft = useCallback((d: Partial<Draft>) => {
    setDraftState((p) => ({ ...p, ...d }));
  }, []);
  const resetDraft = useCallback(() => setDraftState(EMPTY_DRAFT), []);

  const showsFor = useCallback(
    (movieId: number, date: string) => showCatalog.filter((s) => s.movieId === movieId && s.date === date),
    [showCatalog],
  );
  const showById = useCallback((id: string) => showCatalog.find((s) => s.id === id), [showCatalog]);

  const createBooking: BookingCtx["createBooking"] = useCallback(
    ({ movieId, movieTitle, poster, show, seats, ticketPrice, paymentMethod }) => {
      if (!user) return { error: "Please log in to complete booking." };
      const sorted = [...seats].sort();
      const dup = bookings.some(
        (b) => b.userEmail === user.email && b.showId === show.id && b.status === "Confirmed" && b.seats.join(",") === sorted.join(","),
      );
      if (dup) return { error: "Duplicate booking: these seats are already booked by you for this show." };
      const convenienceFee = Math.round(sorted.length * 24);
      const theatre = THEATRES.find((t) => t.id === show.theatreId);
      const booking: Booking = {
        id: bookingId(),
        userEmail: user.email,
        movieId,
        movieTitle,
        poster,
        theatreId: show.theatreId,
        theatreName: theatre?.name ?? show.theatreId,
        city: theatre?.city ?? "",
        showId: show.id,
        date: show.date,
        time: show.time,
        screen: show.screen,
        seats: sorted,
        ticketPrice,
        convenienceFee,
        total: ticketPrice + convenienceFee,
        status: "Confirmed",
        bookedAt: new Date().toISOString(),
        paymentMethod,
      };
      setBookings((p) => [booking, ...p]);
      return { booking };
    },
    [bookings, user],
  );

  const cancelBooking = useCallback((id: string) => {
    setBookings((p) => p.map((b) => (b.id === id ? { ...b, status: "Cancelled" as const } : b)));
  }, []);

  const value = useMemo(
    () => ({ bookings, draft, setDraft, resetDraft, showsFor, showById, createBooking, cancelBooking }),
    [bookings, draft, setDraft, resetDraft, showsFor, showById, createBooking, cancelBooking],
  );
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings outside provider");
  return ctx;
}
