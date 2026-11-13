import { getServiceClient } from "@/lib/booking-platform";
import { PUBLIC_ROOM_CATALOG } from "@/lib/room-catalog";


export async function GET(request: Request) {
  if (new URL(request.url).pathname !== "/api/booking-catalog") return Response.json({ error: "Not found." }, { status: 404 });
  const db = getServiceClient();
  if (!db) return Response.json({ roomTypes: PUBLIC_ROOM_CATALOG, onlineBookingEnabled: false }, { headers: { "Cache-Control": "no-store" } });
  const { data, error } = await db.from("room_types").select("slug,name,description,rate_period,rate_cents,max_guests,bed_count,overnight_rate_cents_per_bed").eq("is_active", true).order("name");
  if (error) return Response.json({ roomTypes: PUBLIC_ROOM_CATALOG, onlineBookingEnabled: false }, { headers: { "Cache-Control": "no-store" } });
  const { data: policy } = await db.from("booking_policy").select("approved_at,bachelor_max_guests,two_bedroom_max_guests").eq("singleton", true).maybeSingle();
  const paymentConfigured = Boolean(process.env.OZOW_CLIENT_ID && process.env.OZOW_CLIENT_SECRET && process.env.OZOW_SITE_CODE
    && process.env.OZOW_WEBHOOK_SECRET && process.env.NEXT_PUBLIC_SITE_URL);
  const notificationsConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.CRON_SECRET
    && process.env.NOTIFICATIONS_CRON_CONFIGURED === "true");
  const roomTypes = data.map((room) => ({
    ...room,
    max_guests: room.slug === "bachelor" ? (policy?.bachelor_max_guests ?? room.max_guests)
      : room.slug === "two-bedroom" ? (policy?.two_bedroom_max_guests ?? room.max_guests) : room.max_guests,
  }));
  return Response.json({
    roomTypes,
    availabilityEnabled: true,
    onlineBookingEnabled: Boolean(policy?.approved_at && paymentConfigured && notificationsConfigured),
    bookingSetupComplete: Boolean(policy?.approved_at && paymentConfigured && notificationsConfigured),
  }, { headers: { "Cache-Control": "no-store" } });
}
