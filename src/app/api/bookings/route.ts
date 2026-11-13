import { getServiceClient, getUserClient, isSameOrigin, validDate } from "@/lib/booking-platform";


export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return Response.json({ error: "Request is too large." }, { status: 413 });
  const db = getServiceClient();
  if (!db) return Response.json({ error: "Online booking is not configured. Please contact us by phone or WhatsApp." }, { status: 503 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const fields = ["roomType", "name", "email", "phone"] as const;
  if (fields.some((field) => typeof body[field] !== "string") || typeof body.guests !== "number" || !Number.isInteger(body.guests)
    || !validDate(body.startDate) || !validDate(body.endDate) || body.endDate <= body.startDate) {
    return Response.json({ error: "Complete the required fields with valid dates." }, { status: 400 });
  }
  if (JSON.stringify(body).length > 8000) return Response.json({ error: "Request is too large." }, { status: 413 });
  const auth = await getUserClient();
  const { data: { user } } = auth ? await auth.auth.getUser() : { data: { user: null } };
  const requestedEmail = String(body.email).trim().toLowerCase();
  const verifiedMatchingCustomer = user?.email_confirmed_at && user.email?.toLowerCase() === requestedEmail ? user : null;
  const { data, error } = await db.rpc("create_booking_request", {
    p_room_type_slug: body.roomType,
    p_guest_name: body.name,
    p_guest_email: body.email,
    p_guest_phone: body.phone,
    p_guest_count: body.guests,
    p_start_date: body.startDate,
    p_end_date: body.endDate,
    p_customer_notes: typeof body.notes === "string" ? body.notes.slice(0, 2000) : "",
    p_customer_id: verifiedMatchingCustomer?.id ?? null,
    p_stay_period: body.stayPeriod === "night" ? "night" : "month",
  });
  if (error) {
    const status = error.code === "P0001" ? 429 : error.code === "22023" ? 400 : 503;
    return Response.json({ error: status === 503 ? "We could not save this request. Please try again shortly." : error.message }, { status });
  }
  const booking = data?.[0];
  if (booking) {
    await db.from("notification_outbox").insert([
      { booking_id: booking.booking_id, recipient: requestedEmail, channel: "email", template: "booking-request-received", payload: { reference: booking.booking_reference } },
      { booking_id: booking.booking_id, recipient: process.env.BOOKING_NOTIFY_EMAIL ?? "jjgrootboom405@gmail.com", channel: "email", template: "booking-request-admin", payload: { reference: booking.booking_reference, guest: String(body.name).slice(0, 160), roomType: String(body.roomType), stayPeriod: body.stayPeriod === "night" ? "night" : "month", startDate: body.startDate, endDate: body.endDate } },
    ]);
    if (verifiedMatchingCustomer?.email) {
      await db.from("profiles").update({ full_name: String(body.name).slice(0, 160), phone: String(body.phone).slice(0, 32) }).eq("id", verifiedMatchingCustomer.id);
    }
  }
  return Response.json({ booking, status: "requested", message: "Request received. The property team will confirm availability, the assigned unit, and the final amount before payment." }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
