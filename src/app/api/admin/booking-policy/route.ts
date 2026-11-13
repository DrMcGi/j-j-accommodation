import { requireAdmin } from "@/lib/booking-platform";

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  const { data, error } = await result.db.from("booking_policy").select("lessor_legal_name,bachelor_max_guests,two_bedroom_max_guests,deposit_cents,deposit_terms,cancellation_terms,additional_terms,authorized_signer_name,authorized_signer_email,approved_at").eq("singleton", true).maybeSingle();
  if (error) return Response.json({ error: "Booking policy is not available. Apply the automatic reservations migration first." }, { status: 503 });
  return Response.json({ policy: data });
}

export async function PUT(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const lessor = typeof body.lessorLegalName === "string" ? body.lessorLegalName.trim() : "";
  const signer = typeof body.authorizedSignerName === "string" ? body.authorizedSignerName.trim() : "";
  const cancellation = typeof body.cancellationTerms === "string" ? body.cancellationTerms.trim() : "";
  const depositTerms = typeof body.depositTerms === "string" ? body.depositTerms.trim() : "";
  const additional = typeof body.additionalTerms === "string" ? body.additionalTerms.trim() : "";
  const occupancy = [body.bachelorMaxGuests, body.twoBedroomMaxGuests];
  const depositCents = body.depositCents;
  if (lessor.length < 2 || lessor.length > 200 || signer.length < 2 || signer.length > 160
    || occupancy.some((value) => !Number.isInteger(value) || Number(value) < 1 || Number(value) > 20)
    || !Number.isSafeInteger(depositCents) || Number(depositCents) < 0
    || cancellation.length < 20 || cancellation.length > 4000
    || (Number(depositCents) > 0 && depositTerms.length < 20)
    || additional.length > 4000 || body.authorizeTerms !== true || !result.user.email) {
    return Response.json({ error: "Complete the legal entity, occupancy, deposit and cancellation rules, and explicitly authorize this fixed policy before enabling automatic reservations." }, { status: 400 });
  }
  const { data, error } = await result.db.from("booking_policy").upsert({
    singleton: true,
    lessor_legal_name: lessor,
    bachelor_max_guests: Number(body.bachelorMaxGuests),
    two_bedroom_max_guests: Number(body.twoBedroomMaxGuests),
    deposit_cents: Number(depositCents),
    deposit_terms: depositTerms,
    cancellation_terms: cancellation,
    additional_terms: additional,
    authorized_signer_id: result.user.id,
    authorized_signer_name: signer,
    authorized_signer_email: result.user.email,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "singleton" }).select("lessor_legal_name,bachelor_max_guests,two_bedroom_max_guests,deposit_cents,deposit_terms,cancellation_terms,additional_terms,authorized_signer_name,authorized_signer_email,approved_at").single();
  if (error) return Response.json({ error: "Could not save the booking policy." }, { status: 503 });
  return Response.json({ policy: data });
}
