import type { SeatInfo, Show } from "../types";
import { hashStr } from "./format";

export const MAX_SEATS = 8;

const ROWS: { row: string; tier: SeatInfo["tier"]; count: number }[] = [
  { row: "A", tier: "Classic", count: 12 },
  { row: "B", tier: "Classic", count: 12 },
  { row: "C", tier: "Classic", count: 12 },
  { row: "D", tier: "Prime", count: 12 },
  { row: "E", tier: "Prime", count: 12 },
  { row: "F", tier: "Prime", count: 12 },
  { row: "G", tier: "Prime", count: 12 },
  { row: "H", tier: "Recline", count: 10 },
  { row: "I", tier: "Recline", count: 10 },
  { row: "J", tier: "Recline", count: 10 },
];

export function priceFor(show: Show, tier: SeatInfo["tier"]): number {
  if (tier === "Classic") return show.priceClassic;
  if (tier === "Prime") return show.pricePrime;
  return show.priceRecline;
}

export function buildSeatMap(show: Show): SeatInfo[] {
  const seats: SeatInfo[] = [];
  for (const r of ROWS) {
    for (let n = 1; n <= r.count; n++) {
      const id = `${r.row}${n}`;
      const h = hashStr(show.id + id);
      const booked = h % 10 < 3; // ~30% pre-booked, deterministic
      seats.push({ id, row: r.row, number: n, tier: r.tier, price: priceFor(show, r.tier), status: booked ? "booked" : "available" });
    }
  }
  return seats;
}

export function tierOf(seatId: string): SeatInfo["tier"] {
  const row = seatId.charAt(0);
  if (row <= "C") return "Classic";
  if (row <= "G") return "Prime";
  return "Recline";
}
