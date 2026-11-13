"use client";

import { createBrowserClient } from "@supabase/ssr";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { PUBLIC_ROOM_CATALOG, type PublicRoomType } from "@/lib/room-catalog";

type Availability = { service_date: string; available_units: number; total_units: number }[];

function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createBrowserClient(url, key) : null;
}

export default function BookingForm() {
  const [rooms, setRooms] = useState<PublicRoomType[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [roomType, setRoomType] = useState("");
  const [stayPeriod, setStayPeriod] = useState<"night" | "month">("night");
  const [availability, setAvailability] = useState<Availability>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch("/api/booking-catalog", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      const requested = new URLSearchParams(window.location.search);
      const roomOptions: PublicRoomType[] = Array.isArray(data.roomTypes) ? data.roomTypes : [];
      const choices = response.ok && data.onlineBookingEnabled ? roomOptions : (roomOptions.length ? roomOptions : PUBLIC_ROOM_CATALOG);
      setRooms(choices);
      setBookingEnabled(response.ok && data.onlineBookingEnabled === true);
      const requestedRoom = requested.get("roomType");
      setRoomType(choices.some((room) => room.slug === requestedRoom) ? requestedRoom! : choices[0]?.slug ?? "");
      if (requested.get("stayPeriod") === "month" || requested.get("stayPeriod") === "night") {
        setStayPeriod(requested.get("stayPeriod") as "night" | "month");
      }
      setCatalogLoading(false);
    }).catch(() => {
      setRooms(PUBLIC_ROOM_CATALOG);
      setBookingEnabled(false);
      setRoomType(new URLSearchParams(window.location.search).get("roomType") ?? PUBLIC_ROOM_CATALOG[0].slug);
      setCatalogLoading(false);
    });

    const client = supabaseBrowser();
    if (client) client.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  const chosenRoom = useMemo(() => rooms.find((room) => room.slug === roomType), [rooms, roomType]);
  async function checkAvailability() {
    setError(""); setMessage(""); setAvailability([]);
    if (!roomType || !startDate || !endDate || endDate <= startDate) { setError("Choose a room type and valid dates first."); return; }
    if (!bookingEnabled) { setError("Live room availability is not connected yet. Call or WhatsApp J & J to confirm your dates."); return; }
    try {
      const params = new URLSearchParams({ roomType, startDate, endDate });
      const response = await fetch(`/api/availability?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Live availability could not be loaded."); return; }
      setAvailability(data.availability);
    } catch { setError("Live availability could not be loaded. Please try again or contact J & J."); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (!bookingEnabled) { setError("Online booking is not connected yet, so no request has been submitted. Please contact J & J to book."); return; }
    setLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomType, stayPeriod, name: form.get("name"), email: form.get("email"), phone: form.get("phone"), guests: Number(form.get("guests")), startDate, endDate, notes: form.get("notes") }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error); return; }
      setMessage(`Request ${data.booking.booking_reference} received. ${data.message}`);
      formElement.reset();
    } catch { setError("The request could not be sent. Please try again or contact J & J."); }
    finally { setLoading(false); }
  }

  const availableAllDates = availability.length > 0 && availability.every((day) => day.available_units > 0);
  return <section className="booking-card">
    {catalogLoading ? <div className="booking-empty" role="status"><h2>Loading room options</h2><p>One moment while we load the accommodation choices.</p></div> : rooms.length === 0 ? <div className="booking-empty"><h2>No rooms are accepting requests right now</h2><p>Call or message us on <a href="https://wa.me/27715440744">WhatsApp 071 544 0744</a> to ask about a stay.</p></div> : <>
      <div className="booking-topline"><span>YOUR STAY</span><span>South Africa · ZAR</span></div>
      {!bookingEnabled && <div className="booking-setup-notice" role="status"><strong>Room options and published prices</strong><span>Live availability and online requests are not connected yet. Call <a href="tel:+27715440744">071 544 0744</a> or <a href="https://wa.me/27715440744">WhatsApp us</a> to check dates and book.</span></div>}
      <form onSubmit={submit}>
        <label>Accommodation<select value={roomType} onChange={(event) => { setRoomType(event.target.value); setAvailability([]); }} required>{rooms.map((room) => <option key={room.slug} value={room.slug}>{room.name}</option>)}</select></label>
        <label>Stay type<select value={stayPeriod} onChange={(event) => { setStayPeriod(event.target.value as "night" | "month"); setAvailability([]); }}><option value="month">Monthly · R{(chosenRoom?.rate_cents ?? 0) / 100} per month; final total confirmed</option><option value="night">Overnight · R850 per night; final total confirmed</option></select></label>
        {chosenRoom && <p className="booking-room-description">{chosenRoom.description} Overnight and monthly bookings share these same rooms; management confirms the final room and occupancy details.</p>}
        <div className="booking-fields"><label>Arrival<input type="date" value={startDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => { setStartDate(event.target.value); setAvailability([]); }} required /></label><label>Departure<input type="date" value={endDate} min={startDate || new Date().toISOString().slice(0, 10)} onChange={(event) => { setEndDate(event.target.value); setAvailability([]); }} required /></label></div>
        <button className="button button-light" type="button" onClick={checkAvailability}>Check live availability</button>
        {availability.length > 0 && <div className={`availability-result ${availableAllDates ? "is-available" : "is-unavailable"}`}><strong>{availableAllDates ? "Available to request" : "Not available for every selected date"}</strong><div>{availability.map((day) => <span key={day.service_date}>{new Date(`${day.service_date}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}: {day.available_units} of {day.total_units}</span>)}</div></div>}
        <div className="booking-fields"><label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={160} required /></label><label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label></div>
        <div className="booking-fields"><label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={32} required /></label><label>Guests<input name="guests" type="number" min="1" max="20" defaultValue="1" required /></label></div>
        <label>Anything we should know? <span className="optional-label">Optional</span><textarea name="notes" rows={3} maxLength={2000} /></label>
        {!signedIn && <p className="booking-account-note">You can submit a request as a guest. Create an account or sign in before checkout to track your booking and pay online. <a href="/account">Sign in or create account</a>.</p>}
        <button className="button button-dark booking-submit" disabled={!bookingEnabled || loading || (availability.length > 0 && !availableAllDates)} type="submit">{loading ? "Sending request…" : bookingEnabled ? "Request this stay" : "Online request unavailable"}</button>
      </form>
      {error && <p className="form-message is-error" role="alert">{error}</p>}{message && <p className="form-message is-success" role="status">{message}</p>}
      <p className="booking-terms-note">An availability check is a live snapshot, not a reservation. We’ll confirm the physical room, exact dates and price before payment. No payment is collected with this request.</p>
    </>}
  </section>;
}
