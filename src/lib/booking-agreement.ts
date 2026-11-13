import { createHash } from "node:crypto";

type Policy = {
  lessor_legal_name: string;
  bachelor_max_guests: number;
  two_bedroom_max_guests: number;
  deposit_cents: number;
  deposit_terms: string;
  cancellation_terms: string;
  additional_terms: string;
};

type Booking = {
  reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_count: number;
  start_date: string;
  end_date: string;
  stay_period: "night" | "month";
  amount_cents: number;
  room_types: { name: string; slug: string };
  room_units: { unit_name: string };
};

export function buildBookingAgreement(booking: Booking, policy: Policy) {
  const maximumGuests = booking.room_types.slug === "bachelor" ? policy.bachelor_max_guests : policy.two_bedroom_max_guests;
  const depositTerms = policy.deposit_cents > 0
    ? policy.deposit_terms
    : "No deposit is charged for this reservation.";
  const body = [
    "J & J GROOTBOOM FARM ACCOMMODATION — ACCOMMODATION AGREEMENT",
    "Agreement version: JJ-AUTO-2026-01",
    `Lessor: ${policy.lessor_legal_name}`,
    "Premises: 336KT Grootboom Farm, Corner Lannex R555, Steelpoort 1133.",
    `Booking reference: ${booking.reference}`,
    `Guest: ${booking.guest_name} (${booking.guest_email}; ${booking.guest_phone})`,
    `Accommodation: ${booking.room_types.name} — ${booking.room_units.unit_name}`,
    `Occupants: ${booking.guest_count}; maximum occupancy for this accommodation type: ${maximumGuests}.`,
    `Stay: ${booking.start_date} to ${booking.end_date} (${booking.stay_period === "night" ? "overnight" : "monthly"}; departure date is not occupied).`,
    `Accommodation charge: ZAR ${(booking.amount_cents / 100).toFixed(2)}. The guest must complete payment before the room is confirmed.`,
    `Deposit: ZAR ${(policy.deposit_cents / 100).toFixed(2)}. ${depositTerms}`,
    "CANCELLATION AND REFUND TERMS",
    policy.cancellation_terms,
    "HOUSE RULES AND CARE",
    "Check-in is at 13:00 and check-out is at 10:00. Early check-in and late check-out depend on availability and may incur additional charges.",
    "Guests must maintain reasonable noise levels, respect other guests, and follow the supplied guest rules. No pets are permitted without prior written permission.",
    "Room cleaning takes place between 08:00 and 11:00. Guests must report existing damage or defects promptly and are responsible for damage caused by them or their visitors, excluding fair wear and tear.",
    "Guests must promptly report maintenance issues, keep the room reasonably clean, and must not alter the premises without written permission. Management arranges repairs to the building and fixed installations.",
    `ADDITIONAL TERMS\n${policy.additional_terms || "None."}`,
    "ELECTRONIC SIGNATURE",
    "The guest confirms that they have read and accept this agreement. The platform records the authenticated account, typed legal name, acceptance text, document hash and server timestamp. Each party can obtain an electronic copy.",
  ].join("\n\n");
  const documentSha256 = createHash("sha256").update(body, "utf8").digest("hex");
  return { body, documentSha256, templateVersion: "JJ-AUTO-2026-01", maximumGuests };
}
