import { getServiceClient } from "@/lib/booking-platform";


export async function GET(request: Request) {
  if (new URL(request.url).pathname !== "/api/booking-catalog") return Response.json({ error: "Not found." }, { status: 404 });
  const db = getServiceClient();
  if (!db) return Response.json({ error: "Online booking is being prepared. Please contact us directly." }, { status: 503 });
  const { data, error } = await db.from("room_types").select("slug,name,description,rate_period,rate_cents,max_guests").eq("is_active", true).order("name");
  if (error) return Response.json({ error: "Room options are temporarily unavailable." }, { status: 503 });
  return Response.json({ roomTypes: data }, { headers: { "Cache-Control": "no-store" } });
}
