"use client";

import { createBrowserClient } from "@supabase/ssr";
import { FormEvent, useEffect, useState } from "react";

type Booking = { id: string; reference: string; start_date: string; end_date: string; stay_period: string; status: string; amount_cents: number | null; hold_expires_at: string | null; room_types: { name: string } | null; room_units: { unit_name: string } | null; contract_documents: { id: string; status: string; document_body: string; template_version: string }[]; payment_records: { status: string; checkout_url: string | null }[]; invoices: { id: string; invoice_number: string; kind: string; amount_cents: number; issued_at: string }[] };
function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createBrowserClient(url, key) : null;
}
const money = (cents: number) => `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

export default function AccountPanel() {
  const [client] = useState(supabaseBrowser);
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    if (client) client.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUserEmail(data.user?.email ?? null);
      if (data.user) {
        const response = await fetch("/api/my-bookings", { cache: "no-store" });
        const result = await response.json();
        if (active && response.ok) { setBookings(result.bookings); setOnlinePaymentsEnabled(result.onlinePaymentsEnabled === true); }
      }
    });
    return () => { active = false; };
  }, [client]);
  useEffect(() => {
    if (typeof window === "undefined" || new URLSearchParams(window.location.search).get("payment") !== "returned") return;
    let active = true;
    let attempts = 0;
    const timer = window.setInterval(async () => {
      if (attempts === 0) setMessage("Ozow returned you to J & J. We are waiting for its signed payment confirmation; this page will update automatically.");
      const response = await fetch("/api/my-bookings", { cache: "no-store" });
      const result = await response.json();
      if (active && response.ok) { setBookings(result.bookings); setOnlinePaymentsEnabled(result.onlinePaymentsEnabled === true); }
      attempts += 1;
      if (attempts >= 12) window.clearInterval(timer);
    }, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  async function refresh() {
    if (!client) return;
    const { data } = await client.auth.getUser();
    setUserEmail(data.user?.email ?? null);
    if (data.user) {
      const response = await fetch("/api/my-bookings", { cache: "no-store" });
      const result = await response.json();
      if (response.ok) { setBookings(result.bookings); setOnlinePaymentsEnabled(result.onlinePaymentsEnabled === true); }
    }
  }
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(""); setError("");
    if (!client) { setError("Account sign-in is not configured yet."); setLoading(false); return; }
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const result = form.get("mode") === "signup"
      ? await client.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/account` } })
      : await client.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) setError(result.error.message);
    else if (form.get("mode") === "signup" && !result.data.session) setMessage("Check your email to confirm your account, then sign in here.");
    else { setMessage("You’re signed in."); await refresh(); }
  }
  async function pay(bookingId: string) {
    setError(""); setLoading(true);
    const response = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) {
      setError(!onlinePaymentsEnabled
        ? "Your room and signed agreement are ready to pay, but Ozow is not configured yet. The booking remains unconfirmed, and the 20-minute room hold will expire unless payment is completed."
        : data.error);
      return;
    }
    window.location.assign(data.redirectUrl);
  }
  async function signOut() { await client?.auth.signOut(); setUserEmail(null); setBookings([]); setOnlinePaymentsEnabled(false); }
  return <section className="booking-card account-card">
    {userEmail ? <><div className="account-heading"><div><span>ACCOUNT</span><h2>{userEmail}</h2></div><button className="button button-light" onClick={signOut}>Sign out</button></div><h3>Your bookings</h3>
      {bookings.length === 0 ? <p>No reservations are linked to this account yet. <a href="/book">Book a stay</a>.</p> : <div className="account-bookings">{bookings.map((booking) => <article className="account-booking" key={booking.id}><div><span>{booking.reference}</span><h3>{booking.room_types?.name ?? "Accommodation"} {booking.room_units?.unit_name ? `· ${booking.room_units.unit_name}` : ""}</h3><p>{booking.start_date} to {booking.end_date} · {booking.stay_period}</p><strong className={`booking-status status-${booking.status}`}>{booking.status.replaceAll("_", " ")}</strong>{booking.status === "awaiting_payment" && booking.hold_expires_at && <p>Room held until {new Date(booking.hold_expires_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}. Complete the agreement and payment before then.</p>}</div><div className="account-booking-actions">{booking.amount_cents && <strong>{money(booking.amount_cents)}</strong>}{booking.contract_documents?.map((contract) => <AgreementSigner contract={contract} key={contract.id} onSigned={refresh} />)}{booking.status === "awaiting_payment" && booking.contract_documents?.some((contract) => contract.status === "signed") && <>{!onlinePaymentsEnabled && <p className="payment-setup-note">Agreement signed. Ozow checkout is not connected yet, so this stay is not confirmed. The room hold expires in 20 minutes.</p>}<button className="button button-dark" disabled={loading || !onlinePaymentsEnabled} onClick={() => pay(booking.id)}>{onlinePaymentsEnabled ? "Continue to payment" : "Ozow payment setup pending"}</button></>}{booking.invoices?.map((invoice) => <a className="button button-light" href={`/api/invoices/${invoice.id}`} key={invoice.id} target="_blank" rel="noreferrer">Print {invoice.kind}</a>)}</div></article>)}</div>}
    </> : <><h2>Sign in or create an account</h2><p>Use the same email address you put on your booking request to link it to your account.</p><form onSubmit={login}><label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" name="password" minLength={8} autoComplete="current-password" required /></label><div className="account-auth-actions"><button className="button button-dark" name="mode" value="signin" disabled={loading}>Sign in</button><button className="button button-light" name="mode" value="signup" disabled={loading}>Create account</button></div></form></>}
    {error && <p className="form-message is-error" role="alert">{error}</p>}{message && <p className="form-message is-success" role="status">{message}</p>}
  </section>;
}

function AgreementSigner({ contract, onSigned }: { contract: Booking["contract_documents"][number]; onSigned: () => void }) {
  const [fullName, setFullName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function sign() {
    setBusy(true); setError("");
    const response = await fetch("/api/contracts/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId: contract.id, fullName, accepted }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setError(data.error); return; }
    setMessage(data.message); onSigned();
  }
  return <section className="account-contract"><details><summary>Review agreement · {contract.status}</summary><pre>{contract.document_body}</pre></details>{contract.status === "draft" ? <p>Management is reviewing this agreement before sending it for your signature.</p> : contract.status !== "signed" && <><label>Type your full legal name<input value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={160} /></label><label className="agreement-check"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /> I have read and agree to the complete agreement above.</label><button className="button button-light" disabled={busy || !accepted || fullName.trim().length < 2} onClick={sign}>Sign agreement</button></>}{message && <p className="form-message is-success">{message}</p>}{error && <p className="form-message is-error">{error}</p>}</section>;
}
