export interface Movie {
  id: number;
  title: string;
  genres: string[];
  language: string;
  runtime: number; // minutes
  rating: number; // 0-10
  releaseDate: string; // ISO
  description: string;
  poster: string;
  backdrop: string;
  status: "Now Showing" | "Upcoming" | "Classic";
  certification: string;
  cast: string[];
}

export interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  screens: number;
  amenities: string[];
  contact: string;
  rating: number;
  image: string;
}

export interface Show {
  id: string;
  movieId: number;
  theatreId: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // "10:30 AM"
  screen: string;
  priceClassic: number;
  pricePrime: number;
  priceRecline: number;
  format: "2D" | "3D" | "IMAX 2D";
}

export type BookingStatus = "Confirmed" | "Cancelled" | "Completed";

export interface Booking {
  id: string;
  userEmail: string;
  movieId: number;
  movieTitle: string;
  poster: string;
  theatreId: string;
  theatreName: string;
  city: string;
  showId: string;
  date: string;
  time: string;
  screen: string;
  seats: string[];
  ticketPrice: number;
  convenienceFee: number;
  total: number;
  status: BookingStatus;
  bookedAt: string;
  paymentMethod: string;
}

export interface AuthUser {
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface SeatInfo {
  id: string;
  row: string;
  number: number;
  tier: "Classic" | "Prime" | "Recline";
  price: number;
  status: "available" | "booked" | "selected";
}
