# CineBook — Movie Ticket Booking System

A fully responsive movie ticket booking app built with **React, Vite, TypeScript, Tailwind CSS, Context API, and React Router**. Browse a live movie catalogue, pick theatres and showtimes, select seats on an interactive map, pay (demo checkout), and manage e-tickets — all in one polished dark cinematic UI.

## Features

**Authentication**
- Login, register, and forgot-password screens with React Hook Form validation
- Show/hide password, protected routes, guest-only auth layout (no sidebar before login)
- Session and user profiles persisted in Local Storage

**Dashboard**
- Total movies, theatres, bookings, today's shows, spend summary
- Revenue pulse chart, daily booking bars, recent bookings, quick-action cards, coming-soon rail

**Movies**
- Live catalogue from the TVMaze API with skeleton loaders, error state, and retry
- Offline fallback catalogue when the API is unreachable (badged Live / Offline)
- Detail page with poster, genres, language, runtime, rating, release date, storyline, and trailer preview (UI-only)
- Search, genre / language / rating / status filters, sort by rating or release date, pagination

**Theatres**
- 12 partner multiplexes across 6 cities with screens, amenities, ratings, and contact info
- Search, filter by city, pagination, and per-theatre showtimes grouped by movie

**Seat selection & booking**
- Interactive 10-row seat map with Classic / Prime / Recline tiers and deterministic occupancy
- Available / booked / selected states, 8-seat limit, live price summary
- Checkout summary with convenience-fee math, generated booking IDs, and duplicate-booking protection

**Payment (demo checkout, no real money moves)**
- Card form with validation, UPI QR + ID flow, wallet options
- Processing state, success screen with QR e-ticket, and failure screen (cards ending in `0000` or the failure toggle trigger it)

**History & reports**
- Booking search, movie / date / status filters, cancellation with confirm dialog, e-ticket modal
- Revenue trends, seat-occupancy donut, daily booking charts, most-booked movie and theatre leaderboards

**UX foundations**
- Sidebar navigation on desktop, bottom nav on mobile, reusable buttons / inputs / cards / badges / modals / empty states
- Toast notifications, focus-visible styles, keyboard-accessible dialogs, `prefers-reduced-motion` support

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router 7 |
| State | Context API (Auth, Bookings, Toast) + Local Storage |
| Forms | React Hook Form |
| Icons | Lucide React |
| Lint | Oxlint |
| Movie data | TVMaze API (keyless) with bundled offline fallback |

## Getting started

**Prerequisites:** Node.js 18+ and [pnpm](https://pnpm.io) 8+.

```sh
# install dependencies
pnpm install

# start the dev server
pnpm run dev
```

Open http://localhost:5173 and sign in with the demo account:

> [!TIP]
> Email `demo@cinebook.app` · password `demo1234` — seeded automatically on first launch. You can also register a new account; it's stored locally in your browser.

## Available scripts

```sh
pnpm run dev      # start dev server with HMR
pnpm run build    # type-check (tsc) and build for production
pnpm run preview  # preview the production build locally
pnpm run lint     # run oxlint
```

## Project structure

```text
src/
├── app/            # router
├── components/     # ui kit (button, input, card, modal, pagination, toasts...)
│                   # app shell (sidebar, topbar, auth layout) and svg charts
├── contexts/       # Auth, Booking, Toast providers (Context API + localStorage)
├── data/           # theatre directory + offline fallback catalogue
├── hooks/          # useMovies (live fetch + loading/error states)
├── pages/          # Auth, Dashboard, Movies, MovieDetail, Theatres,
│                   # TheatreDetail, Seats, Checkout, Payment, History, Reports
├── services/       # TVMaze movie API client + response mapping
└── utils/          # formatting, seat-map builder, classnames
```

## Movie data & API

The catalogue is fetched from `https://api.tvmaze.com/shows?page=N` (no API key required) and mapped onto the app's `Movie` model — title, genres, language, runtime, rating, release date, description, and poster/backdrop art. If the request fails, the app serves the bundled offline catalogue and shows an "Offline mode" badge with a retry option.

> [!NOTE]
> Trailer playback and ticket download are UI-only by design. Payment is a simulated checkout — toggle **Simulate payment failure** on the payment page to preview the error flow.

## Booking flow

```text
Movies → Movie detail → pick a showtime → Seats → Checkout → Payment → E-ticket → History
```

Bookings persist per user in Local Storage (`mtbs_bookings`), so history, reports, and cancellation survive reloads.
