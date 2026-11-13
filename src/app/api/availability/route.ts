import { getServiceClient, validDate } from "@/lib/booking-platform";


export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const roomType = params.get("roomType");
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  if (!roomType || !validDate(startDate) || !validDate(endDate) || endDate <= startDate) {
    return Response.json({ error: "Choose valid start and end dates." }, { status: 400 });
  }
  if ((new Date(`${endDate}T00:00:00Z`).getTime() - new Date(`${startDate}T00:00:00Z`).getTime()) / 86400000 > 366) {
    return Response.json({ error: "Date ranges can be up to 366 days." }, { status: 400 });
  }
  const db = getServiceClient();
  if (!db) return Response.json({ error: "Live room availability is not connected yet. Please contact J & J to confirm your dates." }, { status: 503 });
  const { data, error } = await db.rpc("get_room_availability", { p_room_type_slug: roomType, p_start_date: startDate, p_end_date: endDate });
  if (error) return Response.json({ error: "Availability is temporarily unavailable." }, { status: 503 });
  return Response.json({ availability: data }, { headers: { "Cache-Control": "no-store" } });
}
