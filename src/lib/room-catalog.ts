export type PublicRoomType = {
  slug: string;
  name: string;
  description: string;
  rate_period: string;
  rate_cents: number;
  max_guests: number;
};

// Publicly advertised rates remain visible before the private booking service
// is configured. This catalog never represents live availability.
export const PUBLIC_ROOM_CATALOG: PublicRoomType[] = [
  {
    slug: "bachelor",
    name: "Bachelor",
    description: "Furnished bachelor accommodation.",
    rate_period: "month",
    rate_cents: 750_000,
    max_guests: 20,
  },
  {
    slug: "two-bedroom",
    name: "Two bedroom",
    description: "Furnished two-bedroom accommodation.",
    rate_period: "month",
    rate_cents: 1_350_000,
    max_guests: 20,
  },
];
