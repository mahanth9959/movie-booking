import { createBrowserRouter } from "react-router-dom";
import { AppShell, AuthShell, GuestRoute, ProtectedRoute } from "../components/layout";
import { ForgotPage, LoginPage, RegisterPage } from "../pages/Auth";
import { CheckoutPage } from "../pages/Checkout";
import { DashboardPage } from "../pages/Dashboard";
import { BookingsPage, HistoryPage } from "../pages/History";
import { MovieDetailPage } from "../pages/MovieDetail";
import { MoviesPage } from "../pages/Movies";
import { PaymentPage } from "../pages/Payment";
import { ReportsPage } from "../pages/Reports";
import { SeatsPage } from "../pages/Seats";
import { TheatreDetailPage } from "../pages/TheatreDetail";
import { TheatresPage } from "../pages/Theatres";

function shell(node: React.ReactNode, guard = true) {
  return <AppShell>{guard ? <ProtectedRoute>{node}</ProtectedRoute> : node}</AppShell>;
}

function authShell(node: React.ReactNode) {
  // standalone layout: brand header only, no sidebar / bottom nav
  return (
    <AuthShell>
      <GuestRoute>{node}</GuestRoute>
    </AuthShell>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: shell(<DashboardPage />) },
  { path: "/movies", element: shell(<MoviesPage />) },
  { path: "/movies/:id", element: shell(<MovieDetailPage />) },
  { path: "/theatres", element: shell(<TheatresPage />) },
  { path: "/theatres/:id", element: shell(<TheatreDetailPage />) },
  { path: "/seats/:showId", element: shell(<SeatsPage />) },
  { path: "/checkout/:showId", element: shell(<CheckoutPage />) },
  { path: "/payment/:showId", element: shell(<PaymentPage />) },
  { path: "/bookings", element: shell(<BookingsPage />) },
  { path: "/history", element: shell(<HistoryPage />) },
  { path: "/reports", element: shell(<ReportsPage />) },
  { path: "/login", element: authShell(<LoginPage />) },
  { path: "/register", element: authShell(<RegisterPage />) },
  { path: "/forgot", element: authShell(<ForgotPage />) },
  { path: "*", element: shell(<DashboardPage />) },
]);
