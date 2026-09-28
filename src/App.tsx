import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { AuthProvider } from "./contexts/AuthContext";
import { BookingProvider } from "./contexts/BookingContext";
import { ToastProvider } from "./contexts/ToastContext";
import { fetchMovies } from "./services/movies";
import { seedDemoAccount } from "./pages/Auth";

export default function App() {
  const [movieIds, setMovieIds] = useState<number[]>([101, 102, 103, 104, 105, 106]);

  useEffect(() => {
    seedDemoAccount();
    let live = true;
    fetchMovies(0)
      .then((r) => {
        if (live) setMovieIds(r.movies.map((m) => m.id));
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <BookingProvider movieIds={movieIds}>
          <RouterProvider router={router} />
        </BookingProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
