"use client";

import { FormEvent, useEffect, useState } from "react";

type Policy = {
  lessor_legal_name: string;
  bachelor_max_guests: number;
  two_bedroom_max_guests: number;
  deposit_cents: number;
  deposit_terms: string;
  cancellation_terms: string;
  additional_terms: string;
  authorized_signer_name: string;
  authorized_signer_email: string;
  approved_at: string;
};

export default function BookingPolicySetup() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/booking-policy", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Could not load booking setup."); return; }
      setPolicy(data.policy);
    }).catch(() => setError("Could not load booking setup."));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/booking-policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessorLegalName: values.get("lessorLegalName"),
          bachelorMaxGuests: Number(values.get("bachelorMaxGuests")),
          twoBedroomMaxGuests: Number(values.get("twoBedroomMaxGuests")),
          depositCents: Math.round(Number(values.get("deposit")) * 100),
          depositTerms: values.get("depositTerms"),
          cancellationTerms: values.get("cancellationTerms"),
          additionalTerms: values.get("additionalTerms"),
          authorizedSignerName: values.get("authorizedSignerName"),
          authorizeTerms: values.get("authorizeTerms") === "on",
        }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Could not save booking setup."); return; }
      setPolicy(data.policy);
      setMessage("Booking rules saved. New reservations will use this approved policy automatically.");
    } catch { setError("Could not save booking setup. Check the connection and try again."); }
    finally { setLoading(false); }
  }

  return <section className="admin-policy">
    <h2>One-time automatic booking setup</h2>
    <p>Set the property-wide agreement and capacity rules once. After this is approved, the system assigns rooms, calculates prices and prepares each guest agreement without staff review of individual bookings.</p>
    <p className="booking-setup-notice"><strong>Approval records your authorization</strong><span>Your administrator account and typed name are attached as management&apos;s electronic approval for each agreement generated from these exact terms. Confirm the legal wording and occupancy limits before enabling online booking.</span></p>
    {!policy && !error && <p role="status">Loading saved property rules…</p>}
    {error && <p className="form-message is-error" role="alert">{error}</p>}
    {message && <p className="form-message is-success" role="status">{message}</p>}
    <form key={policy?.approved_at ?? "new-policy"} className="review-form" onSubmit={(event) => void save(event)}>
      <label>Lessor legal name<input name="lessorLegalName" required minLength={2} maxLength={200} defaultValue={policy?.lessor_legal_name ?? ""} /></label>
      <div className="booking-fields">
        <label>Maximum guests in a bachelor<input name="bachelorMaxGuests" type="number" min="1" max="20" required defaultValue={policy?.bachelor_max_guests ?? ""} /></label>
        <label>Maximum guests in a two-bedroom<input name="twoBedroomMaxGuests" type="number" min="1" max="20" required defaultValue={policy?.two_bedroom_max_guests ?? ""} /></label>
      </div>
      <label>Deposit per reservation (ZAR)<input name="deposit" type="number" min="0" step="0.01" required defaultValue={policy ? (policy.deposit_cents / 100).toFixed(2) : "0.00"} /></label>
      <label>Deposit handling and refund terms<textarea name="depositTerms" rows={3} maxLength={4000} defaultValue={policy?.deposit_terms ?? ""} placeholder="Required if a deposit is charged." /></label>
      <label>Cancellation and refund terms<textarea name="cancellationTerms" rows={5} minLength={20} maxLength={4000} required defaultValue={policy?.cancellation_terms ?? ""} /></label>
      <label>Additional terms<textarea name="additionalTerms" rows={4} maxLength={4000} defaultValue={policy?.additional_terms ?? ""} /></label>
      <label>Authorized management signer&apos;s full legal name<input name="authorizedSignerName" minLength={2} maxLength={160} required defaultValue={policy?.authorized_signer_name ?? ""} /></label>
      {policy?.approved_at && <p>Last approved by {policy.authorized_signer_name} ({policy.authorized_signer_email}) on {new Date(policy.approved_at).toLocaleString("en-ZA")}.</p>}
      <label className="booking-policy-approval"><input name="authorizeTerms" type="checkbox" required /><span>I confirm these prices, occupancy, deposit, cancellation and agreement terms are approved for guest bookings. I authorize the platform to apply them and record my management approval for each generated agreement.</span></label>
      <button className="button button-dark" disabled={loading}>{loading ? "Saving policy…" : "Approve and save booking policy"}</button>
    </form>
  </section>;
}
