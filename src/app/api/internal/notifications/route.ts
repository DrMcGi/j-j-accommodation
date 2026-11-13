import { getServiceClient } from "@/lib/booking-platform";


function escapeHtml(value: unknown) { return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!); }
function emailFor(template: string, payload: Record<string, unknown>, siteUrl: string) {
  const ref = escapeHtml(payload.reference);
  const link = `<p><a href="${escapeHtml(siteUrl)}/account">View your booking account</a></p>`;
  const copy: Record<string, { subject: string; body: string }> = {
    "booking-request-received": { subject: `Booking request ${ref} received`, body: `<h2>We received your request</h2><p>Your reference is <strong>${ref}</strong>. The property team will confirm your room, dates and final price before requesting payment.</p>${link}` },
    "booking-payment-required": { subject: `Complete payment for booking ${ref}`, body: `<h2>Your room is held</h2><p>Booking <strong>${ref}</strong> has been assigned to ${escapeHtml(payload.unit)}. Total: ${escapeHtml((Number(payload.amount_cents ?? 0) / 100).toLocaleString("en-ZA", { style: "currency", currency: "ZAR" }))}. Sign the agreement and complete payment before the room hold expires.</p>${link}` },
    "booking-auto-reserved-admin": { subject: `Automatic room hold ${ref}`, body: `<h2>Room held automatically</h2><p>Reference: <strong>${ref}</strong><br>Guest: ${escapeHtml(payload.guest)}<br>Room: ${escapeHtml(payload.roomType)} — ${escapeHtml(payload.unit)}<br>Dates: ${escapeHtml(payload.startDate)} to ${escapeHtml(payload.endDate)}<br>Quote: ${escapeHtml((Number(payload.amount_cents ?? 0) / 100).toLocaleString("en-ZA", { style: "currency", currency: "ZAR" }))}</p><p>The guest is completing agreement and payment online. No manual approval is required.</p><p><a href="${escapeHtml(siteUrl)}/admin">Open booking administration</a></p>` },
    "booking-approved": { subject: `Booking ${ref} is ready for the next step`, body: `<h2>Your stay request is approved</h2><p>Reference ${ref}. Please review and sign the accommodation agreement in your account. Payment is due only after both signatures.</p>${link}` },
    "booking-declined": { subject: `Booking request ${ref} update`, body: `<h2>We could not confirm this request</h2><p>The property team is unable to accept booking ${ref} as requested. Please contact us on 071 544 0744 to discuss alternatives.</p>${link}` },
    "booking-payment-failed": { subject: `Payment needs attention for ${ref}`, body: `<h2>Payment did not complete</h2><p>Ozow reported that payment for booking ${ref} did not complete. Contact us if you need help or wish to try again.</p>${link}` },
    "agreement-ready": { subject: `Accommodation agreement for ${ref}`, body: `<h2>Your agreement is ready</h2><p>Review the complete document and sign it from your account.</p>${link}` },
    "agreement-signed": { subject: `Agreement signed for ${ref}`, body: `<h2>Both parties have signed</h2><p>Your accommodation agreement for reference ${ref} is complete. Continue to payment from your account.</p>${link}` },
    "booking-payment-confirmed": { subject: `Payment received for ${ref}`, body: `<h2>Payment confirmed</h2><p>Payment has been confirmed for booking ${ref}. Your receipt ${escapeHtml(payload.invoice)} is available in your account.</p>${link}` },
    "booking-request-admin": { subject: `New accommodation request ${ref}`, body: `<h2>New booking request</h2><p>Reference: <strong>${ref}</strong><br>Guest: ${escapeHtml(payload.guest)}<br>Accommodation: ${escapeHtml(payload.roomType)} (${escapeHtml(payload.stayPeriod)})<br>Dates: ${escapeHtml(payload.startDate)} to ${escapeHtml(payload.endDate)}</p><p><a href="${escapeHtml(siteUrl)}/admin">Open booking administration</a></p>` },
  };
  return copy[template] ?? { subject: `J & J booking update ${ref}`, body: `<p>There is an update to booking ${ref}.</p>${link}` };
}

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const db = getServiceClient();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!db || !apiKey || !from || !siteUrl) return Response.json({ error: "Notification delivery is not configured." }, { status: 503 });
  const { data: messages, error } = await db.rpc("claim_notification_batch", { p_limit: 20 });
  if (error) return Response.json({ error: "Could not claim notification messages." }, { status: 503 });
  let sent = 0;
  for (const message of messages ?? []) {
    try {
      const email = emailFor(message.template, message.payload ?? {}, siteUrl);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [message.recipient], subject: email.subject, html: email.body, ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}) }), cache: "no-store",
      });
      if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
      await db.rpc("finish_notification", { p_notification_id: message.id, p_success: true, p_error: null });
      sent++;
    } catch (cause) {
      const description = cause instanceof Error ? cause.message : "Delivery failed";
      await db.rpc("finish_notification", { p_notification_id: message.id, p_success: false, p_error: description });
    }
  }
  return Response.json({ claimed: messages?.length ?? 0, sent });
}
