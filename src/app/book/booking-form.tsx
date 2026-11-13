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
  const [availabilityEnabled, setAvailabilityEnabled] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [roomType, setRoomType] = useState("");
  const [stayPeriod, setStayPeriod] = useState<"night" | "month">("night");
  const [availability, setAvailability] = useState<Availability>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch("/api/booking-catalog", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      const requested = new URLSearchParams(window.location.search);
      const roomOptions: PublicRoomType[] = Array.isArray(data.roomTypes) ? data.roomTypes : [];
      const choices = response.ok && (data.availabilityEnabled || data.onlineBookingEnabled) ? roomOptions : (roomOptions.length ? roomOptions : PUBLIC_ROOM_CATALOG);
      setRooms(choices);
      setAvailabilityEnabled(response.ok && data.availabilityEnabled === true);
      setBookingEnabled(response.ok && data.onlineBookingEnabled === true);
      const requestedRoom = requested.get("roomType");
      setRoomType(choices.some((room) => room.slug === requestedRoom) ? requestedRoom! : choices[0]?.slug ?? "");
      if (requested.get("stayPeriod") === "month" || requested.get("stayPeriod") === "night") {
        setStayPeriod(requested.get("stayPeriod") as "night" | "month");
      }
      setCatalogLoading(false);
    }).catch(() => {
      setRooms(PUBLIC_ROOM_CATALOG);
      setAvailabilityEnabled(false);
      setBookingEnabled(false);
      setRoomType(new URLSearchParams(window.location.search).get("roomType") ?? PUBLIC_ROOM_CATALOG[0].slug);
      setCatalogLoading(false);
    });

    const client = supabaseBrowser();
    if (client) client.auth.getUser().then(({ data }) => {
      const confirmed = Boolean(data.user?.email_confirmed_at && data.user.email);
      setSignedIn(confirmed);
      setSignedInEmail(confirmed ? data.user!.email! : "");
    });
  }, []);

  const chosenRoom = useMemo(() => rooms.find((room) => room.slug === roomType), [rooms, roomType]);
  async function checkAvailability() {
    setError(""); setMessage(""); setAvailability([]);
    if (!roomType || !startDate || !endDate || endDate <= startDate) { setError("Choose a room type and valid dates first."); return; }
    if (!availabilityEnabled) { setError("Live room availability is not connected yet. Call or WhatsApp J & J to confirm your dates."); return; }
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
    if (!bookingEnabled) { setError("Room availability is live, but payment and property booking setup are not complete. No room has been held. Please contact J & J to book."); return; }
    if (!signedIn) { setError("Create an account, confirm your email and sign in before reserving a room."); return; }
    setLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomType, stayPeriod, name: form.get("name"), email: form.get("email"), phone: form.get("phone"), guests: Number(form.get("guests")), startDate, endDate, notes: form.get("notes") }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error); return; }
      const amount = (data.booking.amount_cents / 100).toLocaleString("en-ZA", { style: "currency", currency: "ZAR" });
      const holdTime = new Date(data.booking.hold_expires_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
      setMessage(`Reservation ${data.booking.booking_reference}: ${data.booking.room_unit} assigned for ${amount}. This room is held until ${holdTime}. Sign the agreement and pay from your account to confirm the stay.`);
      formElement.reset();
    } catch { setError("The request could not be sent. Please try again or contact J & J."); }
    finally { setLoading(false); }
  }

  const availableAllDates = availability.length > 0 && availability.every((day) => day.available_units > 0);
  return <section className="booking-card">
    {catalogLoading ? <div className="booking-empty" role="status"><h2>Loading room options</h2><p>One moment while we load the accommodation choices.</p></div> : rooms.length === 0 ? <div className="booking-empty"><h2>No rooms are accepting requests right now</h2><p>Call or message us on <a href="https://wa.me/27715440744">WhatsApp 071 544 0744</a> to ask about a stay.</p></div> : <>
      <div className="booking-topline"><span>YOUR STAY</span><span>South Africa · ZAR</span></div>
      {!availabilityEnabled && <div className="booking-setup-notice" role="status"><strong>Room options and published prices</strong><span>Live availability is not connected yet. Call <a href="tel:+27715440744">071 544 0744</a> or <a href="https://wa.me/27715440744">WhatsApp us</a> to check dates and book.</span></div>}
      {availabilityEnabled && !bookingEnabled && <div className="booking-setup-notice" role="status"><strong>Live availability is connected</strong><span>Choose your dates to see available room counts. Instant reservations will open when the one-time property policy, secure payments and booking notifications are configured.</span></div>}
      <form onSubmit={submit}>
        <label>Accommodation<select value={roomType} onChange={(event) => { setRoomType(event.target.value); setAvailability([]); }} required>{rooms.map((room) => <option key={room.slug} value={room.slug}>{room.name}</option>)}</select></label>
        <label>Stay type<select value={stayPeriod} onChange={(event) => { setStayPeriod(event.target.value as "night" | "month"); setAvailability([]); }}><option value="month">Monthly · R{((chosenRoom?.rate_cents ?? 0) / 100).toLocaleString("en-ZA")} per started month</option><option value="night">Overnight · R{(((chosenRoom?.bed_count ?? 1) * (chosenRoom?.overnight_rate_cents_per_bed ?? 85_000)) / 100).toLocaleString("en-ZA")} per night ({chosenRoom?.bed_count ?? 1} bed{(chosenRoom?.bed_count ?? 1) === 1 ? "" : "s"})</option></select></label>
        {chosenRoom && <p className="booking-room-description">The selected room&apos;s dates are shared inventory across overnight and monthly stays. Monthly charges round up to each started month; only the selected dates are blocked.</p>}
        <div className="booking-fields"><label>Arrival<input type="date" value={startDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => { setStartDate(event.target.value); setAvailability([]); }} required /></label><label>Departure<input type="date" value={endDate} min={startDate || new Date().toISOString().slice(0, 10)} onChange={(event) => { setEndDate(event.target.value); setAvailability([]); }} required /></label></div>
        <button className="button button-light" type="button" onClick={checkAvailability}>Check live availability</button>
        {availability.length > 0 && <div className={`availability-result ${availableAllDates ? "is-available" : "is-unavailable"}`}><strong>{availableAllDates ? `${Math.min(...availability.map((day) => day.available_units))} ${roomType === "bachelor" ? "bachelor" : "two-bedroom"} room${Math.min(...availability.map((day) => day.available_units)) === 1 ? "" : "s"} available for the full stay` : "Fully booked for at least one selected date"}</strong><div>{availability.map((day) => <span key={day.service_date}>{new Date(`${day.service_date}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}: {day.available_units} of {day.total_units} available</span>)}</div></div>}
        <div className="booking-fields"><label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={160} required /></label><label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label></div>
        <div className="booking-fields"><label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={32} required /></label><label>Guests<input name="guests" type="number" min="1" max={chosenRoom?.max_guests ?? 20} defaultValue="1" required /></label></div>
        <label>Anything we should know? <span className="optional-label">Optional</span><textarea name="notes" rows={3} maxLength={2000} /></label>
        {!signedIn ? <p className="booking-account-note">A confirmed account is required to reserve a room and continue to agreement and payment. <a href="/account">Create an account or sign in</a>.</p> : <p className="booking-account-note">Booking as {signedInEmail}. The system will assign the first available physical room and calculate your total.</p>}
        <button className="button button-dark booking-submit" disabled={!bookingEnabled || !signedIn || loading || (availability.length > 0 && !availableAllDates)} type="submit">{loading ? "Reserving room…" : bookingEnabled ? "Reserve room and continue" : "Online booking setup incomplete"}</button>
      </form>
      {error && <p className="form-message is-error" role="alert">{error}</p>}{message && <p className="form-message is-success" role="status">{message} <a href="/account">Open your account to sign and pay.</a></p>}
      <p className="booking-terms-note">Availability is checked again inside the reservation transaction. One physical room is held for 20 minutes; your stay becomes confirmed only after agreement and payment are complete.</p>
    </>}
  </section>;
}
