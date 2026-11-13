import Link from "next/link";
import { getServiceClient } from "@/lib/booking-platform";

export const metadata = { title: "Guest rules and booking terms" };
export const instant = false;
const money = (cents: number) => (cents / 100).toLocaleString("en-ZA", { style: "currency", currency: "ZAR" });

export default async function BookingTermsPage() {
  const db = getServiceClient();
  const policyResult = db
    ? await db.from("booking_policy").select("lessor_legal_name,bachelor_max_guests,two_bedroom_max_guests,deposit_cents,deposit_terms,cancellation_terms,additional_terms,approved_at").eq("singleton", true).maybeSingle()
    : { data: null, error: null };
  const policy = policyResult.error ? null : policyResult.data;

  return <main className="booking-terms-page">
    <header className="booking-terms-header">
      <Link href="/book">Back to booking</Link>
      <p className="eyebrow">BEFORE YOU BOOK</p>
      <h1>Guest rules and agreement terms</h1>
      <p>Review the accommodation rules and the terms that are used in the digital agreement. Your booking-specific agreement is shown in your account before you sign it or pay.</p>
    </header>

    <section className="booking-terms-panel">
      <div className="booking-terms-panel-heading"><div><p className="eyebrow">PROPERTY RULES</p><h2>Guest rules</h2></div><a className="button button-light" href="/docs/GUEST%20RULES.pdf" target="_blank" rel="noreferrer">Open or download full rules</a></div>
      <iframe className="guest-rules-preview" src="/docs/GUEST%20RULES.pdf#view=FitH" title="J & J Grootboom Farm Accommodation guest rules" />
      <ul className="booking-terms-rules">
        <li>Check-in is at 13:00 and check-out is at 10:00. Early check-in and late check-out depend on availability and may cost extra.</li>
        <li>No pets are permitted without prior written permission from management.</li>
        <li>Guests must keep noise reasonable, respect other guests, and follow the supplied guest rules.</li>
        <li>Room cleaning takes place between 08:00 and 11:00.</li>
        <li>Guests must promptly report damage, defects, or maintenance issues and keep the room reasonably clean.</li>
        <li>Guests may not alter the premises without written permission. Management arranges repairs to the building and fixed installations.</li>
      </ul>
    </section>

    <section className="booking-terms-panel">
      <p className="eyebrow">APPROVED BOOKING POLICY</p>
      <h2>Legal and payment terms</h2>
      {policy ? <div className="booking-policy-preview">
        <p><strong>Lessor:</strong> {policy.lessor_legal_name}</p>
        <p><strong>Maximum guests:</strong> Bachelor {policy.bachelor_max_guests}; two-bedroom {policy.two_bedroom_max_guests}.</p>
        <p><strong>Deposit:</strong> {money(policy.deposit_cents)}. {policy.deposit_cents > 0 ? policy.deposit_terms : "No deposit is charged."}</p>
        <h3>Cancellation and refund terms</h3><p>{policy.cancellation_terms}</p>
        {policy.additional_terms && <><h3>Additional terms</h3><p>{policy.additional_terms}</p></>}
      </div> : <div className="booking-setup-notice" role="status"><strong>The final property agreement policy has not been published yet.</strong><span>J & J must approve its legal lessor name, occupancy limits, deposit handling, and cancellation/refund terms before automatic reservations can be accepted. The guest rules above are available to read now.</span></div>}
    </section>

    <section className="booking-terms-panel">
      <p className="eyebrow">YOUR BOOKING AGREEMENT</p>
      <h2>What you will sign</h2>
      <p>After a room has been assigned, your account shows the complete agreement for your stay. It includes your name and contact details, room, guest count, dates, full price, deposit and cancellation terms, and the guest rules. You can read the whole agreement before typing your full legal name and accepting it.</p>
      <p>The system records the agreement version, a document fingerprint, the signed-in account and email, your typed name, acceptance, and signing time. You sign before payment. The stay is confirmed only after the payment provider confirms a successful payment.</p>
      <p><strong>Prices:</strong> R850 per bed per night (R850 for a bachelor, R1,700 for a two-bedroom); monthly prices are R7,500 and R13,500 per started month. A partial started month is charged as a full month. Only the selected arrival-to-departure date range is blocked in availability.</p>
    </section>

    <footer className="booking-terms-footer"><Link className="button button-dark" href="/book">Choose dates and accommodation</Link><Link href="/account">Sign in or create an account</Link></footer>
  </main>;
}
