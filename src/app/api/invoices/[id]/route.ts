import { getServiceClient, getUserClient } from "@/lib/booking-platform";


function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await getUserClient();
  const { data: { user } } = auth ? await auth.auth.getUser() : { data: { user: null } };
  if (!user) return new Response("Sign in required", { status: 401 });
  const { id } = await context.params;
  const db = getServiceClient();
  if (!db) return new Response("Booking service unavailable", { status: 503 });
  const { data: invoice } = await db.from("invoices").select("id,invoice_number,kind,amount_cents,currency,status,issued_at,bookings!inner(reference,guest_name,guest_email,start_date,end_date,stay_period,customer_id,room_types(name),room_units(unit_name))").eq("id", id).eq("bookings.customer_id", user.id).maybeSingle();
  if (!invoice) return new Response("Invoice not found", { status: 404 });
  const joinedBooking = Array.isArray(invoice.bookings) ? invoice.bookings[0] : invoice.bookings;
  const booking = joinedBooking ? {
    ...joinedBooking,
    room_types: Array.isArray(joinedBooking.room_types) ? joinedBooking.room_types[0] : joinedBooking.room_types,
    room_units: Array.isArray(joinedBooking.room_units) ? joinedBooking.room_units[0] : joinedBooking.room_units,
  } : null;
  const amount = (invoice.amount_cents / 100).toLocaleString("en-ZA", { style: "currency", currency: invoice.currency });
  const title = invoice.kind === "receipt" ? "Payment receipt" : "Accommodation invoice";
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} ${escapeHtml(invoice.invoice_number)}</title><style>body{font:16px/1.5 Arial,sans-serif;color:#222820;margin:0;background:#f7f5ef}.sheet{max-width:760px;margin:40px auto;padding:56px;background:white;box-shadow:0 8px 32px #0001}.top{display:flex;justify-content:space-between;border-bottom:2px solid #264333;padding-bottom:24px}.eyebrow{letter-spacing:.15em;color:#62715e;font-size:12px}.number{font-size:14px;text-align:right}.amount{font-size:30px;color:#264333}dl{display:grid;grid-template-columns:200px 1fr;gap:12px}dt{color:#667064}dd{margin:0}footer{margin-top:48px;color:#667064;font-size:13px}.print{padding:12px 20px;background:#264333;color:white;border:0;border-radius:24px}@media print{body{background:white}.sheet{margin:0 auto;box-shadow:none}.print{display:none}}@media(max-width:600px){.sheet{margin:0;padding:28px 22px}.top{display:block}.number{text-align:left;margin-top:20px}dl{grid-template-columns:1fr;gap:5px}dd{margin-bottom:10px}}</style><main class="sheet"><header class="top"><div><p class="eyebrow">J &amp; J GROOTBOOM FARM ACCOMMODATION</p><h1>${escapeHtml(title)}</h1></div><div class="number"><strong>${escapeHtml(invoice.invoice_number)}</strong><p>${new Date(invoice.issued_at).toLocaleDateString("en-ZA")}</p></div></header><p class="amount">${escapeHtml(amount)}</p><dl><dt>Guest</dt><dd>${escapeHtml(booking?.guest_name)}</dd><dt>Email</dt><dd>${escapeHtml(booking?.guest_email)}</dd><dt>Booking reference</dt><dd>${escapeHtml(booking?.reference)}</dd><dt>Accommodation</dt><dd>${escapeHtml(booking?.room_types?.name)} — ${escapeHtml(booking?.room_units?.unit_name)}</dd><dt>Stay</dt><dd>${escapeHtml(booking?.start_date)} to ${escapeHtml(booking?.end_date)} (${escapeHtml(booking?.stay_period)})</dd><dt>Status</dt><dd>${escapeHtml(invoice.status)}</dd></dl><footer><p>336KT Grootboom Farm, Corner Lannex R555, Steelpoort 1133</p><p>jjgrootboom405@gmail.com · 071 544 0744</p><p>Keep this ${invoice.kind === "receipt" ? "receipt" : "invoice"} with your booking records.</p><button class="print" onclick="window.print()">Print / Save as PDF</button></footer></main></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "Content-Disposition": `inline; filename="${invoice.invoice_number}.html"` } });
}
