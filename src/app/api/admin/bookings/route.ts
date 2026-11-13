import { requireAdmin } from "@/lib/booking-platform";
import { calculateStayPriceCents } from "@/lib/booking-pricing";


export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  const { data, error } = await result.db.from("bookings").select("*,room_types(name,slug,rate_period,rate_cents,bed_count,overnight_rate_cents_per_bed),room_units(unit_name),payment_records(status,amount_cents),contract_documents(id,status,document_body,document_sha256,contract_signatures(signer_role)),invoices(invoice_number,kind,status,amount_cents)").order("created_at", { ascending: false }).limit(200);
  if (error) return Response.json({ error: "Could not load booking requests." }, { status: 503 });
  return Response.json({ bookings: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.bookingId !== "string" || !["accept", "decline"].includes(String(body.decision))) return Response.json({ error: "Invalid booking decision." }, { status: 400 });
  let amountCents: number | null = null;
  if (body.decision === "accept") {
    const { data: booking, error: bookingError } = await result.db.from("bookings")
      .select("id,status,stay_period,start_date,end_date,room_types!inner(slug,rate_cents,bed_count,overnight_rate_cents_per_bed)")
      .eq("id", body.bookingId).maybeSingle();
    const room = Array.isArray(booking?.room_types) ? booking.room_types[0] : booking?.room_types;
    if (bookingError || !booking || booking.status !== "requested" || !room) {
      return Response.json({ error: "This request could not be priced. Refresh the reservation list and try again." }, { status: 409 });
    }
    const price = calculateStayPriceCents(room, booking.stay_period, booking.start_date, booking.end_date);
    if (!price) return Response.json({ error: "The system could not calculate a valid price for these dates." }, { status: 400 });
    amountCents = price.amountCents;
  }
  const { data, error } = await result.db.rpc("admin_review_booking", { p_booking_id: body.bookingId, p_decision: body.decision, p_room_unit_id: typeof body.roomUnitId === "string" ? body.roomUnitId : null, p_amount_cents: amountCents, p_admin_notes: typeof body.adminNotes === "string" ? body.adminNotes.slice(0, 2000) : "" });
  if (error) return Response.json({ error: error.message }, { status: error.code === "23P01" ? 409 : 400 });
  return Response.json({ booking: data });
}
