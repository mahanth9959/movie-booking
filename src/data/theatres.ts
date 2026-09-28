import type { Theatre } from "../types";

export const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune"] as const;

export const SHOW_TIMES = ["09:30 AM", "01:15 PM", "05:00 PM", "08:45 PM"] as const;

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=900&q=60`;

export const THEATRES: Theatre[] = [
  { id: "t01", name: "CineStar Grand IMAX", address: "4th Floor, Phoenix Mall, Kurla West", city: "Mumbai", screens: 8, amenities: ["IMAX", "Dolby Atmos", "Recliners", "Food Court", "Parking"], contact: "+91 98200 11223", rating: 4.7, image: img("photo-1489599849927-2ee91cede3ba") },
  { id: "t02", name: "Galaxy Multiplex", address: "12 Linking Road, Bandra West", city: "Mumbai", screens: 5, amenities: ["Dolby 7.1", "Recliners", "Cafe"], contact: "+91 98200 44556", rating: 4.4, image: img("photo-1517604931442-7e0c8ed2963c") },
  { id: "t03", name: "PVR Select City", address: "Select Citywalk, Saket", city: "Delhi", screens: 7, amenities: ["4K Laser", "Dolby Atmos", "Lounge", "Valet"], contact: "+91 98110 22334", rating: 4.6, image: img("photo-1536440136628-849c177e76a1") },
  { id: "t04", name: "Cinepolis Connaught", address: "G Block, Connaught Place", city: "Delhi", screens: 4, amenities: ["VIP Seats", "Dolby", "Cafe"], contact: "+91 98110 77889", rating: 4.3, image: img("photo-1478720568477-152d9b164e26") },
  { id: "t05", name: "Orion ScreenX", address: "Orion Mall, Rajajinagar", city: "Bengaluru", screens: 6, amenities: ["ScreenX", "Dolby Atmos", "Gaming Zone", "Parking"], contact: "+91 99010 33445", rating: 4.5, image: img("photo-1485846234645-a62644f84728") },
  { id: "t06", name: "Luxe Cinemas", address: "100 Feet Road, Indiranagar", city: "Bengaluru", screens: 3, amenities: ["Boutique", "Recliners", "Gourmet"], contact: "+91 99010 66778", rating: 4.8, image: img("photo-1440404653325-ab127d49abc1") },
  { id: "t07", name: "AMB Cinemas", address: "Road No. 2, Banjara Hills", city: "Hyderabad", screens: 7, amenities: ["IMAX", "Dolby Atmos", "Food Court"], contact: "+91 97010 11223", rating: 4.7, image: img("photo-1524985069026-dd778a71c7b4") },
  { id: "t08", name: "Prasads Large Screen", address: "NTR Marg, Tank Bund Road", city: "Hyderabad", screens: 5, amenities: ["Large Format", "4K", "Cafe"], contact: "+91 97010 44556", rating: 4.2, image: img("photo-1505686994434-e3cc5abf1330") },
  { id: "t09", name: "Sathyam Grand", address: "8 Thiruvika Road, Royapettah", city: "Chennai", screens: 6, amenities: ["Dolby Atmos", "RGB Laser", "Food Court"], contact: "+91 98410 22334", rating: 4.6, image: img("photo-1518676590629-3dcbd9c5a5c9") },
  { id: "t10", name: "Escape SPI", address: "Express Avenue Mall, Royapettah", city: "Chennai", screens: 4, amenities: ["Premium", "Dolby", "Lounge"], contact: "+91 98410 77889", rating: 4.4, image: img("photo-1507924538820-ede94a04019d") },
  { id: "t11", name: "E-Square Westend", address: "University Road, Shivajinagar", city: "Pune", screens: 5, amenities: ["Dolby Atmos", "Recliners", "Parking"], contact: "+91 98500 33445", rating: 4.3, image: img("photo-1512149177596-f817c7ef5d4c") },
  { id: "t12", name: "CityPride Kothrud", address: "Paud Road, Kothrud", city: "Pune", screens: 3, amenities: ["Family Lounge", "Dolby", "Cafe"], contact: "+91 98500 66778", rating: 4.1, image: img("photo-1492144534655-ae79c964c9d7") },
];

export function theatreById(id: string): Theatre | undefined {
  return THEATRES.find((t) => t.id === id);
}
