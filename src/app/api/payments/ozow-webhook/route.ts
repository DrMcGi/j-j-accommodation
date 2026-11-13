import { createHmac, timingSafeEqual } from "node:crypto";
import { getServiceClient } from "@/lib/booking-platform";


function validSignature(secret: string, id: string, timestamp: string, header: string, body: Buffer) {
  const seconds = Number(timestamp);
  if (!Number.isInteger(seconds) || Math.abs(Date.now() / 1000 - seconds) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${seconds}.`).update(body).digest();
  return header.split(" ").some((candidate) => {
    const [version, signature] = candidate.split(",");
    if (version !== "v1" || !signature) return false;
    const given = Buffer.from(signature, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export async function POST(request: Request) {
  const secret = process.env.OZOW_WEBHOOK_SECRET;
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!secret || !id || !timestamp || !signature) return Response.json({ error: "Webhook signature is required." }, { status: 401 });
  const rawBody = Buffer.from(await request.arrayBuffer());
  if (rawBody.byteLength > 64_000 || !validSignature(secret, id, timestamp, signature, rawBody)) return Response.json({ error: "Webhook signature is invalid." }, { status: 401 });
  let event: { type?: unknown; timestamp?: unknown; data?: Record<string, unknown> };
  try { event = JSON.parse(rawBody.toString("utf8")); } catch { return Response.json({ error: "Invalid webhook body." }, { status: 400 }); }
  if (event.type !== "transaction.complete") return Response.json({ received: true });
  const data = event.data;
  const db = getServiceClient();
  if (!db || !data || typeof data.SiteCode !== "string" || data.SiteCode !== process.env.OZOW_SITE_CODE
    || typeof data.TransactionReference !== "string" || typeof data.TransactionId !== "string" || typeof data.Amount !== "string" || typeof data.Status !== "string" || data.CurrencyCode !== "ZAR") {
    return Response.json({ error: "Webhook data is incomplete." }, { status: 400 });
  }
  const amountCents = Math.round(Number(data.Amount) * 100);
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) return Response.json({ error: "Invalid transaction amount." }, { status: 400 });
  const { error } = await db.rpc("process_ozow_transaction", {
    p_event_id: id,
    p_reference: data.TransactionReference,
    p_provider_payment_id: data.TransactionId,
    p_amount_cents: amountCents,
    p_status: data.Status,
    p_paid_at: typeof event.timestamp === "string" && Number.isFinite(Date.parse(event.timestamp)) ? new Date(event.timestamp).toISOString() : new Date().toISOString(),
  });
  if (error) return Response.json({ error: "Transaction requires reconciliation." }, { status: 500 });
  return Response.json({ received: true });
}
