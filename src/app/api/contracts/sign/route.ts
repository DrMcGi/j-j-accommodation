import { getServiceClient, getUserClient, isSameOrigin } from "@/lib/booking-platform";


export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403 });
  const auth = await getUserClient();
  const { data: { user } } = auth ? await auth.auth.getUser() : { data: { user: null } };
  if (!user || !user.email_confirmed_at) return Response.json({ error: "Sign in with a confirmed email to sign this agreement." }, { status: 401 });
  const db = getServiceClient();
  if (!db) return Response.json({ error: "Online signing is not configured." }, { status: 503 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.documentId !== "string" || typeof body.fullName !== "string" || body.fullName.trim().length < 2 || body.fullName.trim().length > 160 || body.accepted !== true) {
    return Response.json({ error: "Read the agreement, enter your full legal name and confirm acceptance." }, { status: 400 });
  }
  const { data: document } = await db.from("contract_documents").select("id,document_sha256,status,bookings(customer_id,guest_email)").eq("id", body.documentId).maybeSingle();
  const booking = document ? (Array.isArray(document.bookings) ? document.bookings[0] : document.bookings) : null;
  if (!document || !booking || booking.customer_id !== user.id || booking.guest_email.toLowerCase() !== user.email?.toLowerCase()) return Response.json({ error: "This agreement is not linked to your account." }, { status: 404 });
  if (!/[0-9a-f]{64}/.test(document.document_sha256)) return Response.json({ error: "Agreement integrity could not be verified." }, { status: 409 });
  const acceptedText = "I have read and agree to this complete accommodation agreement. My typed name is my electronic signature for the agreement version shown above.";
  const { data, error } = await db.rpc("sign_contract", { p_document_id: document.id, p_signer_role: "customer", p_signer_user_id: user.id, p_signer_name: body.fullName.trim(), p_signer_email: user.email, p_accepted_text: acceptedText, p_document_sha256: document.document_sha256 });
  if (error) return Response.json({ error: "Could not record your signature. The agreement may have changed; reload and review the current version." }, { status: 409 });
  return Response.json({ signed: data === true, message: data ? "Both parties have signed the agreement." : "Your signature is recorded. The agreement is waiting for management to countersign." });
}
