import { createHash } from "node:crypto";
import { requireAdmin } from "@/lib/booking-platform";

const TEMPLATE_VERSION = "JJF-STAY-2026-02";

export async function POST(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  if (Number(request.headers.get("content-length") ?? 0) > 12_000) return Response.json({ error: "Agreement details are too large." }, { status: 413 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.bookingId !== "string" || typeof body.lessorName !== "string" || body.lessorName.trim().length < 2
    || typeof body.cancellationTerms !== "string" || body.cancellationTerms.trim().length < 20
    || !Number.isSafeInteger(body.depositCents) || Number(body.depositCents) < 0
    || !Number.isSafeInteger(body.confirmedOccupancy) || Number(body.confirmedOccupancy) < 1 || Number(body.confirmedOccupancy) > 20) {
    return Response.json({ error: "Enter the lessor's legal name, deposit, cancellation terms and confirmed unit occupancy limit before preparing an agreement." }, { status: 400 });
  }
  const { data: booking } = await result.db.from("bookings").select("*,room_types(name,rate_period),room_units(unit_name)").eq("id", body.bookingId).in("status", ["awaiting_payment", "confirmed"]).maybeSingle();
  if (!booking || !booking.room_units?.unit_name || !booking.amount_cents) return Response.json({ error: "The booking must have a confirmed room and final price first." }, { status: 409 });
  if (Number(body.confirmedOccupancy) < booking.guest_count) return Response.json({ error: "The confirmed room occupancy limit cannot be lower than the booking's guest count." }, { status: 400 });
  if (Number(body.depositCents) > 0 && (typeof body.depositTerms !== "string" || body.depositTerms.trim().length < 20)) {
    return Response.json({ error: "Add the deposit handling and refund terms, or set the deposit amount to zero." }, { status: 400 });
  }
  const { data: previousAgreement } = await result.db.from("contract_documents").select("id").eq("booking_id", booking.id).not("status", "in", "(voided,declined)").limit(1).maybeSingle();
  if (previousAgreement) return Response.json({ error: "An agreement already exists for this booking. Contact management before preparing a replacement version." }, { status: 409 });
  const extra = typeof body.additionalTerms === "string" && body.additionalTerms.trim() ? body.additionalTerms.trim().slice(0, 2000) : "None.";
  const depositTerms = typeof body.depositTerms === "string" && body.depositTerms.trim()
    ? body.depositTerms.trim().slice(0, 2000)
    : "No deposit is due unless the amount above is greater than zero. If a deposit is due, its handling, permitted deductions and refund timing must be confirmed by management before this agreement is sent.";
  const rules = [
    "The accommodation is for residential use by the guests listed on this booking. The approved guest count is shown above; management must confirm the selected unit's occupancy limit before sending this agreement.",
    "No pets are permitted without prior written permission from management.",
    "Check-in is at 13:00 and check-out is at 10:00. Early check-in and late check-out depend on availability and may incur additional charges.",
    "Guests must maintain reasonable noise levels, especially during night hours, and respect other guests.",
    "Room cleaning takes place between 08:00 and 11:00.",
    "The guest must report existing damage or defects promptly and is responsible for damage caused by the guest or their visitors, excluding fair wear and tear. The parties should record the room condition at arrival and departure.",
    "The guest must promptly report maintenance issues, keep the room reasonably clean, and must not alter the premises without written permission. Management arranges repairs to the building and fixed installations.",
  ];
  const agreement = [
    "J & J GROOTBOOM FARM ACCOMMODATION — ACCOMMODATION AGREEMENT",
    `Agreement version: ${TEMPLATE_VERSION}`,
    `Lessor / management: ${body.lessorName.trim()}`,
    "Premises: 336KT Grootboom Farm, Corner Lannex R555, Steelpoort 1133.",
    `Guest: ${booking.guest_name} (${booking.guest_email}; ${booking.guest_phone})`,
    `Accommodation: ${booking.room_types.name} — ${booking.room_units.unit_name}`,
    `Approved guest count: ${booking.guest_count}. Maximum occupants confirmed by management for this unit: ${Number(body.confirmedOccupancy)}.`,
    `Stay dates: ${booking.start_date} to ${booking.end_date} (${booking.stay_period === "night" ? "overnight stay" : "monthly stay"})`,
    "1. RENT, DEPOSIT AND CANCELLATION",
    `Agreed accommodation charge for this stay: ZAR ${(booking.amount_cents / 100).toFixed(2)}. The charge and dates above are specific to this booking.`,
    `Deposit: ZAR ${(Number(body.depositCents) / 100).toFixed(2)}. Deposit handling and refund terms: ${depositTerms}`,
    `Cancellation and refund terms: ${body.cancellationTerms.trim()}`,
    "The booking-specific cancellation terms above are subject to applicable law. Any agreed change must be recorded in writing by both parties.",
    "2. PREMISES, CONDITION AND CARE",
    "The parties should record the room condition and existing defects at check-in, then inspect it again at check-out. Any deposit deduction must be itemized and supported by the applicable agreement and law.",
    "3. ADDITIONAL AGREED TERMS",
    extra,
    "4. HOUSE RULES AND CARE OBLIGATIONS",
    ...rules.map((rule, index) => `${index + 1}. ${rule}`),
    "5. ELECTRONIC SIGNATURE AND COPIES",
    "Each party receives an electronic copy. This platform records the signer's authenticated account, typed name, explicit acceptance, fixed document hash and server timestamp as electronic signature evidence. The parties should obtain legal advice if this agreement requires an advanced or other specific signature type.",
    "DRAFT FOR MANAGEMENT AND LEGAL REVIEW. This agreement was prepared using the booking details, supplied guest rules and a partial scanned residential lease template. The scan set is incomplete and contains blank and long-term lease fields. Those clauses have not been copied as default rules for this stay. Management must verify its legal identity, unit occupancy, all rent/deposit/cancellation terms and applicable consumer and rental law before sending or signing this document.",
  ].join("\n\n");
  const digest = createHash("sha256").update(agreement, "utf8").digest("hex");
  const { data, error } = await result.db.from("contract_documents").insert({ booking_id: booking.id, provider: "internal", template_version: TEMPLATE_VERSION, document_body: agreement, document_sha256: digest, status: "draft" }).select("id,status,document_sha256").single();
  if (error) return Response.json({ error: "Could not create the agreement." }, { status: 503 });
  return Response.json({ document: { ...data, document_body: agreement } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.documentId !== "string" || typeof body.signerName !== "string" || body.signerName.trim().length < 2) return Response.json({ error: "Enter the authorized management signer's full name." }, { status: 400 });
  const { data: document } = await result.db.from("contract_documents").select("id,booking_id,document_sha256,status,bookings(reference,guest_email)").eq("id", body.documentId).maybeSingle();
  if (!document || document.status === "signed") return Response.json({ error: "This agreement is not awaiting a management signature." }, { status: 409 });
  const { error } = await result.db.rpc("sign_contract", { p_document_id: document.id, p_signer_role: "management", p_signer_user_id: result.user.id, p_signer_name: body.signerName.trim(), p_signer_email: result.user.email ?? "", p_accepted_text: "I am authorized to sign this agreement for J & J Grootboom Farm Accommodation and approve its fixed terms.", p_document_sha256: document.document_sha256 });
  if (error) return Response.json({ error: "Could not record the management signature." }, { status: 409 });
  return Response.json({ ok: true });
}
