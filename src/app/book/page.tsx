import Link from "next/link";
import BookingForm from "./booking-form";

export const metadata = { title: "Request a stay" };

export default function BookPage() {
  return <main className="booking-page"><div className="booking-page-head"><Link href="/">J &amp; J Grootboom Farm Accommodation</Link><p className="eyebrow">BOOK YOUR STAY</p><h1>Find your room at Grootboom Farm.</h1><p>Choose your dates and send a booking request. Your stay is only confirmed after the team assigns a room and confirms the final price.</p></div><BookingForm /></main>;
}
