import { getServiceClient } from "@/lib/booking-platform";
import { PUBLIC_ROOM_CATALOG } from "@/lib/room-catalog";

export async function GET(request: Request) {
  if (new URL(request.url).pathname !== "/api/booking-catalog") return Response.json({ error: "Not found." }, { status: 404 });
  const db = getServiceClient();
  if (!db) return Response.json({
    roomTypes: PUBLIC_ROOM_CATALOG,
    availabilityEnabled: false,
    reservationEnabled: false,
    propertyPolicyConfigured: false,
    automaticReservationsReady: false,
    onlinePaymentsEnabled: false,
    emailNotificationsEnabled: false,
  }, { headers: { "Cache-Control": "no-store" } });

  const { data: baseRooms, error: baseError } = await db.from("room_types")
    .select("slug,name,description,rate_period,rate_cents,max_guests")
    .eq("is_active", true).order("name");
  if (baseError) return Response.json({
    roomTypes: PUBLIC_ROOM_CATALOG,
    availabilityEnabled: false,
    reservationEnabled: false,
    propertyPolicyConfigured: false,
    automaticReservationsReady: false,
    onlinePaymentsEnabled: false,
    emailNotificationsEnabled: false,
  }, { headers: { "Cache-Control": "no-store" } });

  // Keep date checks available on the base booking schema. Allocation and quoting
  // require the second migration's extra room pricing and property-policy tables.
  const { data: automaticRooms, error: automaticSchemaError } = await db.from("room_types")
    .select("slug,name,description,rate_period,rate_cents,max_guests,bed_count,overnight_rate_cents_per_bed")
    .eq("is_active", true).order("name");
  const automaticReservationsReady = !automaticSchemaError && Array.isArray(automaticRooms);
  const { data: policy, error: policyError } = automaticReservationsReady
    ? await db.from("booking_policy").select("approved_at,bachelor_max_guests,two_bedroom_max_guests").eq("singleton", true).maybeSingle()
    : { data: null, error: null };
  const propertyPolicyConfigured = automaticReservationsReady && !policyError && Boolean(policy?.approved_at);
  const nightlyDefaults = new Map(PUBLIC_ROOM_CATALOG.map((room) => [room.slug, room]));
  const sourceRooms = automaticReservationsReady ? automaticRooms! : baseRooms;
  const roomTypes = sourceRooms.map((room) => {
    const defaults = nightlyDefaults.get(room.slug);
    return {
      ...room,
      bed_count: "bed_count" in room ? room.bed_count : (defaults?.bed_count ?? 1),
      overnight_rate_cents_per_bed: "overnight_rate_cents_per_bed" in room
        ? room.overnight_rate_cents_per_bed : (defaults?.overnight_rate_cents_per_bed ?? 85_000),
      max_guests: room.slug === "bachelor" ? (policy?.bachelor_max_guests ?? room.max_guests)
        : room.slug === "two-bedroom" ? (policy?.two_bedroom_max_guests ?? room.max_guests) : room.max_guests,
    };
  });
  const onlinePaymentsEnabled = Boolean(process.env.OZOW_CLIENT_ID && process.env.OZOW_CLIENT_SECRET
    && process.env.OZOW_SITE_CODE && process.env.OZOW_WEBHOOK_SECRET && process.env.NEXT_PUBLIC_SITE_URL);
  const emailNotificationsEnabled = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM
    && process.env.CRON_SECRET && process.env.NOTIFICATIONS_CRON_CONFIGURED === "true");

  return Response.json({
    roomTypes,
    availabilityEnabled: true,
    automaticReservationsReady,
    propertyPolicyConfigured,
    reservationEnabled: propertyPolicyConfigured,
    onlinePaymentsEnabled,
    emailNotificationsEnabled,
  }, { headers: { "Cache-Control": "no-store" } });
}
