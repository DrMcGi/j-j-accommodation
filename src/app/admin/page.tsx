import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import AdminPanel from "./admin-panel";

export const metadata = { title: "Booking administration" };

async function AdminDashboard() {
  await connection();
  return <AdminPanel />;
}

export default function AdminPage() {
  return <main className="booking-page admin-page"><div className="booking-page-head"><Link href="/">J &amp; J Grootboom Farm Accommodation</Link><p className="eyebrow">MANAGEMENT</p><h1>Booking administration.</h1><p>Review requests, check the room calendar, manage inventory, agreements and payment records.</p></div><Suspense fallback={<section className="booking-card">Loading management tools…</section>}><AdminDashboard /></Suspense></main>;
}
