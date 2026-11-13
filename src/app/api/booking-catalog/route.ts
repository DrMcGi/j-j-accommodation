import { getServiceClient } from "@/lib/booking-platform";
import { PUBLIC_ROOM_CATALOG } from "@/lib/room-catalog";


export async function GET(request: Request) {
  if (new URL(request.url).pathname !== "/api/booking-catalog") return Response.json({ error: "Not found." }, { status: 404 });
  const db = getServiceClient();
  if (!db) return Response.json({ roomTypes: PUBLIC_ROOM_CATALOG, onlineBookingEnabled: false }, { headers: { "Cache-Control": "no-store" } });
  const { data, error } = await db.from("room_types").select("slug,name,description,rate_period,rate_cents,max_guests").eq("is_active", true).order("name");
  if (error) return Response.json({ roomTypes: PUBLIC_ROOM_CATALOG, onlineBookingEnabled: false }, { headers: { "Cache-Control": "no-store" } });
  return Response.json({ roomTypes: data, onlineBookingEnabled: true }, { headers: { "Cache-Control": "no-store" } });
}
