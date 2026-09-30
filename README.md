# CineBook — Movie Ticket Booking System

React + Vite + TypeScript + Tailwind CSS v4 + React Router + Context API + React Hook Form + Lucide.

## Run

```sh
pnpm install
pnpm run dev
```

Demo login: `demo@cinebook.app` / `demo1234` (seeded automatically).

## Modules

| # | Module | Route |
|---|--------|-------|
| 1 | Auth (login / register / forgot, validation, show-hide, protected routes, localStorage) | `/login` `/register` `/forgot` |
| 2 | Dashboard (stats, revenue pulse, recent bookings, quick actions, coming soon) | `/` |
| 3 | Movies (TVMaze live API + offline fallback, detail, search, genre/language/rating filters, sort, pagination) | `/movies` `/movies/:id` |
| 4 | Theatres (list, detail, screens, showtimes, search, city filter, pagination) | `/theatres` `/theatres/:id` |
| 5 | Seat selection (tiers, max 8, summary, price calc) | `/seats/:showId` |
| 6 | Booking (summary, price calc, booking ID, duplicate guard) | `/checkout/:showId` |
| 7 | Payment (card/UPI/wallet UI, success + failure screens, e-ticket) | `/payment/:showId` |
| 8 | History (search, filters, cancel, e-ticket modal) | `/history` `/bookings` |
| 9 | Reports (revenue, trends, occupancy, leaderboards) | `/reports` |

## Notes

- Third-party API: TVMaze (`https://api.tvmaze.com/shows?page=N`), no key required, with loading skeletons, error + retry, and an offline fallback catalogue.
- Trailer + ticket download are UI-only as specified.
- Bookings, users and session persist in `localStorage` (`mtbs_*` keys).
- Cards ending in `0000` (or the failure toggle) preview the payment-failure screen.
