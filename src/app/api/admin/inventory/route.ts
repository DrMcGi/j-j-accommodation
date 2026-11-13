import { requireAdmin } from "@/lib/booking-platform";


export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  const [types, units, blocks] = await Promise.all([
    result.db.from("room_types").select("*").order("name"),
    result.db.from("room_units").select("*,room_types(name,slug)").order("unit_name"),
    result.db.from("availability_blocks").select("*,room_units(unit_name,room_types(name))").gte("end_date", new Date().toISOString().slice(0, 10)).order("start_date").limit(300),
  ]);
  if (types.error || units.error || blocks.error) return Response.json({ error: "Could not load inventory." }, { status: 503 });
  return Response.json({ roomTypes: types.data, units: units.data, blocks: blocks.data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (body.action === "unit") {
    if (typeof body.roomTypeId !== "string" || typeof body.unitName !== "string" || body.unitName.trim().length < 1 || body.unitName.trim().length > 100) return Response.json({ error: "Choose a room type and enter a unit name." }, { status: 400 });
    const { data, error } = await result.db.from("room_units").insert({ room_type_id: body.roomTypeId, unit_name: body.unitName.trim(), is_active: false }).select().single();
    if (error) return Response.json({ error: "Could not create unit. Check for a duplicate unit name." }, { status: 400 });
    return Response.json({ unit: data }, { status: 201 });
  }
  if (body.action === "block") {
    if (typeof body.unitId !== "string" || typeof body.startDate !== "string" || typeof body.endDate !== "string" || body.endDate <= body.startDate) return Response.json({ error: "Choose a unit and a valid date range." }, { status: 400 });
    const { error } = await result.db.rpc("create_availability_block", { p_room_unit_id: body.unitId, p_start_date: body.startDate, p_end_date: body.endDate, p_created_by: result.user.id });
    if (error) return Response.json({ error: error.code === "23P01" ? error.message : "Could not block these dates." }, { status: error.code === "23P01" ? 409 : 400 });
    return Response.json({ ok: true }, { status: 201 });
  }
  return Response.json({ error: "Unknown inventory action." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.id !== "string") return Response.json({ error: "Missing record id." }, { status: 400 });
  if (body.kind === "unit" && typeof body.isActive === "boolean") {
    const { error } = await result.db.rpc("set_room_unit_active", { p_room_unit_id: body.id, p_is_active: body.isActive });
    if (error) return Response.json({ error: error.message }, { status: error.code === "P0001" ? 409 : 400 });
    return Response.json({ ok: true });
  }
  if (body.kind === "type" && typeof body.isActive === "boolean") {
    if (body.isActive) {
      const { count } = await result.db.from("room_units").select("id", { count: "exact", head: true }).eq("room_type_id", body.id).eq("is_active", true);
      if (!count) return Response.json({ error: "Add and activate at least one physical unit before publishing availability." }, { status: 400 });
    }
    const { error } = await result.db.from("room_types").update({ is_active: body.isActive }).eq("id", body.id);
    if (error) return Response.json({ error: "Could not update room type." }, { status: 400 });
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Invalid inventory update." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.blockId !== "string") return Response.json({ error: "Missing maintenance block id." }, { status: 400 });
  const { error } = await result.db.from("availability_blocks").delete().eq("id", body.blockId);
  if (error) return Response.json({ error: "Could not release the maintenance block." }, { status: 400 });
  return Response.json({ ok: true });
}
