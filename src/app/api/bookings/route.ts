import { getServiceClient, getUserClient, isSameOrigin, validDate } from "@/lib/booking-platform";
import { buildBookingAgreement } from "@/lib/booking-agreement";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return Response.json({ error: "Request is too large." }, { status: 413 });
  const db = getServiceClient();
  if (!db) return Response.json({ error: "Online booking is not configured. Please contact us by phone or WhatsApp." }, { status: 503 });
  const { data: policy } = await db.from("booking_policy").select("*").eq("singleton", true).maybeSingle();
  if (!policy?.approved_at) return Response.json({ error: "The property agreement and occupancy policy is not published yet, so no room has been held. You can review the guest rules and agreement terms before booking." }, { status: 503 });

  const auth = await getUserClient();
  const { data: { user } } = auth ? await auth.auth.getUser() : { data: { user: null } };
  if (!user || !user.email_confirmed_at || !user.email) {
    return Response.json({ error: "Create an account, confirm your email and sign in to reserve a room." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const fields = ["roomType", "name", "email", "phone"] as const;
  if (fields.some((field) => typeof body[field] !== "string") || typeof body.guests !== "number" || !Number.isInteger(body.guests)
    || !validDate(body.startDate) || !validDate(body.endDate) || body.endDate <= body.startDate
    || (body.stayPeriod !== "night" && body.stayPeriod !== "month")) {
    return Response.json({ error: "Complete the required fields with valid room and date details." }, { status: 400 });
  }
  if (String(body.email).trim().toLowerCase() !== user.email.toLowerCase()) {
    return Response.json({ error: "Use the same email address as your confirmed account." }, { status: 400 });
  }
  if (JSON.stringify(body).length > 8000) return Response.json({ error: "Request is too large." }, { status: 413 });

  const { data, error } = await db.rpc("create_instant_booking", {
    p_room_type_slug: body.roomType,
    p_guest_name: body.name,
    p_guest_email: body.email,
    p_guest_phone: body.phone,
    p_guest_count: body.guests,
    p_start_date: body.startDate,
    p_end_date: body.endDate,
    p_customer_notes: typeof body.notes === "string" ? body.notes.slice(0, 2000) : "",
    p_customer_id: user.id,
    p_stay_period: body.stayPeriod,
  });

  if (error) {
    const status = error.code === "P0001" ? 409 : error.code === "22023" ? 400 : 503;
    return Response.json({ error: status === 503 ? "We could not complete the reservation. Please try again shortly." : error.message }, { status });
  }

  const booking = data?.[0];
  if (!booking) return Response.json({ error: "No reservation was created. Please try again." }, { status: 503 });
  const { data: savedBooking, error: savedBookingError } = await db.from("bookings")
    .select("reference,guest_name,guest_email,guest_phone,guest_count,start_date,end_date,stay_period,amount_cents,room_types(name,slug),room_units(unit_name)")
    .eq("id", booking.booking_id).single();
  if (savedBookingError || !savedBooking) {
    await db.from("bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", booking.booking_id).eq("status", "awaiting_payment");
    await db.from("invoices").update({ status: "void" }).eq("booking_id", booking.booking_id).eq("status", "issued");
    return Response.json({ error: "The room was released because its booking document could not be prepared." }, { status: 503 });
  }
  const roomType = Array.isArray(savedBooking.room_types) ? savedBooking.room_types[0] : savedBooking.room_types;
  const roomUnit = Array.isArray(savedBooking.room_units) ? savedBooking.room_units[0] : savedBooking.room_units;
  if (!roomType || !roomUnit) {
    await db.from("bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", booking.booking_id).eq("status", "awaiting_payment");
    await db.from("invoices").update({ status: "void" }).eq("booking_id", booking.booking_id).eq("status", "issued");
    return Response.json({ error: "The room was released because its booking details could not be prepared." }, { status: 503 });
  }
  const { body: agreementBody, documentSha256, templateVersion } = buildBookingAgreement(
    { ...savedBooking, room_types: roomType, room_units: roomUnit } as Parameters<typeof buildBookingAgreement>[0],
    policy,
  );
  const { data: document, error: documentError } = await db.from("contract_documents").insert({
    booking_id: booking.booking_id,
    provider: "internal",
    template_version: templateVersion,
    document_body: agreementBody,
    document_sha256: documentSha256,
    status: "sent",
  }).select("id").single();
  if (documentError || !document) {
    await db.from("bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", booking.booking_id).eq("status", "awaiting_payment");
    await db.from("invoices").update({ status: "void" }).eq("booking_id", booking.booking_id).eq("status", "issued");
    return Response.json({ error: "The room was released because its agreement could not be prepared." }, { status: 503 });
  }
  const { error: signatureError } = await db.from("contract_signatures").insert({
    contract_document_id: document.id,
    signer_role: "management",
    signer_user_id: policy.authorized_signer_id,
    signer_name: policy.authorized_signer_name,
    signer_email: policy.authorized_signer_email,
    accepted_text: "I approved this fixed booking policy and authorized it to be issued and signed automatically for reservations using these terms.",
    document_sha256: documentSha256,
  });
  if (signatureError) {
    await db.from("contract_documents").update({ status: "voided", updated_at: new Date().toISOString() }).eq("id", document.id);
    await db.from("bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", booking.booking_id).eq("status", "awaiting_payment");
    await db.from("invoices").update({ status: "void" }).eq("booking_id", booking.booking_id).eq("status", "issued");
    return Response.json({ error: "The room was released because its management authorization could not be recorded." }, { status: 503 });
  }
  await db.from("profiles").update({ full_name: String(body.name).slice(0, 160), phone: String(body.phone).slice(0, 32) }).eq("id", user.id);
  const { error: notificationError } = await db.from("notification_outbox").insert([
    { booking_id: booking.booking_id, recipient: user.email, channel: "email", template: "booking-agreement-ready", payload: { reference: booking.booking_reference } },
    { booking_id: booking.booking_id, recipient: user.email, channel: "email", template: "booking-payment-required", payload: { reference: booking.booking_reference, amount_cents: booking.amount_cents, unit: booking.assigned_unit, hold_expires_at: booking.hold_expires_at } },
    { booking_id: booking.booking_id, recipient: process.env.BOOKING_NOTIFY_EMAIL ?? "jjgrootboom405@gmail.com", channel: "email", template: "booking-auto-reserved-admin", payload: { reference: booking.booking_reference, guest: String(body.name).slice(0, 160), roomType: String(body.roomType), unit: booking.assigned_unit, startDate: body.startDate, endDate: body.endDate, amount_cents: booking.amount_cents } },
  ]);
  if (notificationError) {
    await db.from("contract_documents").update({ status: "voided", updated_at: new Date().toISOString() }).eq("id", document.id);
    await db.from("bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", booking.booking_id).eq("status", "awaiting_payment");
    await db.from("invoices").update({ status: "void" }).eq("booking_id", booking.booking_id).eq("status", "issued");
    return Response.json({ error: "The room was released because booking notifications could not be queued." }, { status: 503 });
  }

  return Response.json({
    booking: {
      id: booking.booking_id,
      booking_reference: booking.booking_reference,
      room_unit: booking.assigned_unit,
      amount_cents: booking.amount_cents,
      billable_months: booking.billable_months,
      hold_expires_at: booking.hold_expires_at,
      invoice_number: booking.invoice_number,
      status: "awaiting_payment",
    },
    message: `Room ${booking.assigned_unit} has been assigned and held for 20 minutes. Review and sign the agreement in your account, then continue to payment.`,
  }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
