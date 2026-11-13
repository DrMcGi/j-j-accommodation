export type BookingRate = {
  bed_count: number;
  overnight_rate_cents_per_bed: number;
  rate_cents: number;
};

const DAY_MS = 86_400_000;

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

function monthAnniversary(start: Date, months: number): Date {
  const year = start.getUTCFullYear();
  const month = start.getUTCMonth() + months;
  const day = start.getUTCDate();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(firstOfMonth.getUTCFullYear(), firstOfMonth.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(firstOfMonth.getUTCFullYear(), firstOfMonth.getUTCMonth(), Math.min(day, lastDay)));
}

export function calculateStayPriceCents(
  rate: BookingRate,
  stayPeriod: "night" | "month",
  startDate: string,
  endDate: string,
): { amountCents: number; units: number; unitLabel: string } | null {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || end <= start) return null;

  if (stayPeriod === "night") {
    const nights = (end.getTime() - start.getTime()) / DAY_MS;
    const amountCents = rate.overnight_rate_cents_per_bed * rate.bed_count * nights;
    return Number.isSafeInteger(amountCents) && amountCents > 0 ? { amountCents, units: nights, unitLabel: "night" } : null;
  }

  let startedMonths = 0;
  while (monthAnniversary(start, startedMonths) < end && startedMonths < 14) startedMonths += 1;
  const amountCents = rate.rate_cents * startedMonths;
  return Number.isSafeInteger(amountCents) && amountCents > 0
    ? { amountCents, units: startedMonths, unitLabel: startedMonths === 1 ? "started month" : "started months" }
    : null;
}
