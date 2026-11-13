import { getServiceClient, getUserClient } from "@/lib/booking-platform";


export async function GET() {
  const auth = await getUserClient();
  const { data: { user } } = auth ? await auth.auth.getUser() : { data: { user: null } };
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const db = getServiceClient();
  if (!db) return Response.json({ error: "Booking platform is not configured." }, { status: 503 });
  if (user.email_confirmed_at && user.email) await db.from("bookings").update({ customer_id: user.id }).is("customer_id", null).ilike("guest_email", user.email);
  const { data, error } = await db.from("bookings").select("id,reference,guest_name,guest_email,guest_phone,guest_count,start_date,end_date,stay_period,status,amount_cents,currency,hold_expires_at,created_at,room_types(name,rate_period),room_units(unit_name),payment_records(status,checkout_url),contract_documents(id,status,document_body,document_sha256,template_version),invoices(id,invoice_number,kind,amount_cents,status,issued_at)").eq("customer_id", user.id).order("created_at", { ascending: false });
  if (error) return Response.json({ error: "Could not load your bookings." }, { status: 503 });
  return Response.json({ bookings: data }, { headers: { "Cache-Control": "no-store" } });
}
