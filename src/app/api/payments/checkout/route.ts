import { getServiceClient, getUserClient, isSameOrigin } from "@/lib/booking-platform";


export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403 });
  const auth = await getUserClient();
  const { data: { user } } = auth ? await auth.auth.getUser() : { data: { user: null } };
  if (!user) return Response.json({ error: "Sign in to continue to payment." }, { status: 401 });
  const db = getServiceClient();
  const clientId = process.env.OZOW_CLIENT_ID;
  const clientSecret = process.env.OZOW_CLIENT_SECRET;
  const siteCode = process.env.OZOW_SITE_CODE;
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!db || !clientId || !clientSecret || !siteCode || !appUrl) return Response.json({ error: "Online payments are not configured yet." }, { status: 503 });
  let body: { bookingId?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.bookingId !== "string") return Response.json({ error: "Choose a booking to pay." }, { status: 400 });
  const { data: booking } = await db.from("bookings").select("id,reference,customer_id,guest_name,guest_email,amount_cents,status,hold_expires_at,contract_documents(status)").eq("id", body.bookingId).eq("customer_id", user.id).maybeSingle();
  if (!booking || booking.status !== "awaiting_payment" || !booking.amount_cents || !booking.hold_expires_at || new Date(booking.hold_expires_at).getTime() <= Date.now()) {
    return Response.json({ error: "This booking is not currently payable." }, { status: 409 });
  }
  if (!booking.contract_documents?.some((document) => document.status === "signed")) return Response.json({ error: "Both parties must sign the accommodation agreement before payment." }, { status: 409 });
  const merchantReference = `JJ-PAY-${booking.reference}`;
  let { data: payment } = await db.from("payment_records").select("id,status,checkout_url,merchant_reference").eq("merchant_reference", merchantReference).maybeSingle();
  if (payment?.checkout_url && ["created", "pending"].includes(payment.status)) return Response.json({ redirectUrl: payment.checkout_url });
  if (!payment) {
    const inserted = await db.from("payment_records").insert({ booking_id: booking.id, provider: "ozow", merchant_reference: merchantReference, amount_cents: booking.amount_cents, status: "created" }).select("id,status,checkout_url,merchant_reference").single();
    if (inserted.error) return Response.json({ error: "Could not initialize this payment." }, { status: 503 });
    payment = inserted.data;
  }
  const base = process.env.OZOW_ENV === "staging" ? "https://stagingone.ozow.com/v1" : "https://one.ozow.com/v1";
  const tokenResponse = await fetch(`${base}/token`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, scope: "payments", grant_type: "client_credentials" }), cache: "no-store",
  });
  if (!tokenResponse.ok) return Response.json({ error: "Payment provider authentication failed." }, { status: 502 });
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) return Response.json({ error: "Payment provider authentication failed." }, { status: 502 });
  const paymentResponse = await fetch(`${base}/payments`, {
    method: "POST", headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json", "Idempotency-Key": merchantReference },
    body: JSON.stringify({
      siteCode,
      region: "ZA",
      amount: { currency: "ZAR", value: booking.amount_cents / 100 },
      merchantReference,
      payerReference: booking.reference,
      payer: { id: booking.reference, name: booking.guest_name, email: booking.guest_email },
      returnUrl: new URL(`/account?payment=returned&booking=${encodeURIComponent(booking.id)}`, appUrl).toString(),
      expireAt: booking.hold_expires_at,
    }), cache: "no-store",
  });
  if (!paymentResponse.ok) return Response.json({ error: "The payment provider could not create checkout. Please try again or contact us." }, { status: 502 });
  const providerPayment = await paymentResponse.json() as { id?: string; redirectUrl?: string };
  if (!providerPayment.redirectUrl || !providerPayment.id) return Response.json({ error: "The payment provider returned an invalid checkout response." }, { status: 502 });
  const { error } = await db.from("payment_records").update({ provider_payment_id: providerPayment.id, checkout_url: providerPayment.redirectUrl, status: "pending", updated_at: new Date().toISOString() }).eq("id", payment.id);
  if (error) return Response.json({ error: "Could not save the payment session." }, { status: 503 });
  return Response.json({ redirectUrl: providerPayment.redirectUrl });
}
