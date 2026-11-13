import Link from "next/link";
import BookingForm from "./booking-form";

export const metadata = { title: "Request a stay" };

export default function BookPage() {
  return <main className="booking-page"><div className="booking-page-head"><Link href="/">J &amp; J Grootboom Farm Accommodation</Link><p className="eyebrow">BOOK YOUR STAY</p><h1>Find your room at Grootboom Farm.</h1><p>Check live dates, get a room assigned and quoted automatically, review and sign your agreement, then pay online.</p><p><Link href="/booking-terms">Read the guest rules and booking agreement terms</Link></p></div><BookingForm /></main>;
}
