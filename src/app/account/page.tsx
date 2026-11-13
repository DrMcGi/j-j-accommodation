import Link from "next/link";
import AccountPanel from "./account-panel";

export const metadata = { title: "Your account" };

export default function AccountPage() {
  return <main className="booking-page"><div className="booking-page-head"><Link href="/">J &amp; J Grootboom Farm Accommodation</Link><p className="eyebrow">GUEST ACCOUNT</p><h1>Your stay, all in one place.</h1><p>Sign in or create an account to follow booking requests, complete payment and view receipts.</p></div><AccountPanel /></main>;
}
