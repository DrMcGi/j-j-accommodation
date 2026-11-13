"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import BookingPolicySetup from "./booking-policy-setup";

type RoomType = { id: string; slug: string; name: string; is_active: boolean };
type Unit = { id: string; unit_name: string; room_type_id: string; is_active: boolean; room_types: { name: string } };
type Contract = { id: string; status: string; document_body: string; document_sha256: string; contract_signatures?: { signer_role: string }[] };
type Booking = {
  id: string; reference: string; guest_name: string; guest_email: string; guest_phone: string;
  guest_count: number; room_type_id: string; start_date: string; end_date: string; stay_period: string;
  status: string; amount_cents: number | null; admin_notes: string;
  room_types: { name: string } | null; room_units: { unit_name: string } | null;
  contract_documents: Contract[];
};
type Block = { id: string; start_date: string; end_date: string; room_units: { unit_name: string; room_types: { name: string } } };
type Inventory = { roomTypes: RoomType[]; units: Unit[]; blocks: Block[] };
type Availability = { service_date: string; available_units: number; total_units: number }[];

const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

async function fetchDashboard() {
  const [bookingResponse, inventoryResponse] = await Promise.all([
    fetch("/api/admin/bookings", { cache: "no-store" }),
    fetch("/api/admin/inventory", { cache: "no-store" }),
  ]);
  return { bookingResponse, inventoryResponse, bookingData: await bookingResponse.json(), inventoryData: await inventoryResponse.json() };
}

export default function AdminPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [availability, setAvailability] = useState<Availability>([]);
  const [roomTypeId, setRoomTypeId] = useState("");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [tab, setTab] = useState("calendar");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    const [bookingResponse, inventoryResponse] = await Promise.all([
      fetch("/api/admin/bookings", { cache: "no-store" }),
      fetch("/api/admin/inventory", { cache: "no-store" }),
    ]);
    const [bookingData, inventoryData] = await Promise.all([bookingResponse.json(), inventoryResponse.json()]);
    if (!bookingResponse.ok || !inventoryResponse.ok) { setError(bookingData.error ?? inventoryData.error ?? "Sign in with an administrator account to continue."); return; }
    setBookings(bookingData.bookings); setInventory(inventoryData);
    setRoomTypeId((value) => value || inventoryData.roomTypes[0]?.id || "");
  }

  useEffect(() => {
    let active = true;
    fetchDashboard().then(({ bookingResponse, inventoryResponse, bookingData, inventoryData }) => {
      if (!active) return;
      if (!bookingResponse.ok || !inventoryResponse.ok) { setError(bookingData.error ?? inventoryData.error ?? "Sign in with an administrator account to continue."); return; }
      setBookings(bookingData.bookings); setInventory(inventoryData);
      setRoomTypeId(inventoryData.roomTypes[0]?.id ?? "");
    }).catch(() => { if (active) setError("Could not load the booking dashboard."); });
    return () => { active = false; };
  }, []);
  const selectedType = inventory?.roomTypes.find((item) => item.id === roomTypeId);
  useEffect(() => {
    if (!selectedType) return;
    let active = true;
    const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    const params = new URLSearchParams({ roomType: selectedType.slug, startDate: iso(month), endDate: iso(next) });
    fetch(`/api/availability?${params}`, { cache: "no-store" }).then(async (response) => {
      const data = await response.json(); if (active && response.ok) setAvailability(data.availability);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [selectedType, month]);

  const dates = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - offset + 1));
  }, [month]);
  const availabilityByDate = new Map(availability.map((day) => [day.service_date, day]));
  const units = inventory?.units ?? [];
  const types = inventory?.roomTypes ?? [];

  async function post(path: string, method: "POST" | "PATCH" | "DELETE", body: unknown) {
    setError(""); setSuccess(""); setBusy(true);
    try {
      const response = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "The operation could not be completed."); return false; }
      setSuccess("Saved successfully."); await load(); return true;
    } catch { setError("The operation could not be completed. Check your connection and try again."); return false; }
    finally { setBusy(false); }
  }

  async function decide(booking: Booking, decision: "accept" | "decline", values: FormData) {
    const amount = Number(values.get("amount"));
    await post("/api/admin/bookings", "PATCH", {
      bookingId: booking.id, decision, roomUnitId: values.get("unitId"),
      amountCents: Math.round(amount * 100), adminNotes: values.get("notes"),
    });
  }

  return <section className="booking-card admin-card">
    <div className="admin-tabs" role="tablist">
      {[["calendar", "Calendar"], ["requests", "Reservations"], ["inventory", "Rooms & availability"], ["setup", "Booking setup"]].map(([id, label]) => <button aria-selected={tab === id} className={tab === id ? "is-active" : ""} key={id} onClick={() => setTab(id)} role="tab">{label}</button>)}
    </div>
    {error && <p className="form-message is-error" role="alert">{error} {error.includes("Sign in") && <a href="/account">Sign in</a>}</p>}
    {success && <p className="form-message is-success" role="status">{success}</p>}
    {!inventory ? <button className="button button-light" onClick={() => void load()}>Reload</button> : <>
      {tab === "calendar" && <section>
        <div className="calendar-toolbar"><button className="button button-light" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Previous</button><h2>{month.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}</h2><button className="button button-light" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next</button></div>
        <label>Room type<select value={roomTypeId} onChange={(event) => setRoomTypeId(event.target.value)}>{types.map((type) => <option value={type.id} key={type.id}>{type.name}</option>)}</select></label>
        <div className="availability-calendar"><div className="calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-days">{dates.map((date) => { const current = date.getMonth() === month.getMonth(); const item = availabilityByDate.get(iso(date)); return <div className={`calendar-day ${current ? "" : "is-outside"}`} key={iso(date)}><strong>{date.getDate()}</strong>{item && <span>{item.available_units}/{item.total_units} free</span>}</div>; })}</div></div>
        <div className="calendar-legend"><span><i className="legend-free" /> Available</span><span><i className="legend-full" /> Fully booked or blocked</span><span>{bookings.filter((booking) => ["requested", "awaiting_payment", "confirmed"].includes(booking.status)).length} active booking records</span></div>
      </section>}
      {tab === "requests" && <section className="admin-requests"><h2>Booking requests</h2>{bookings.length === 0 ? <p>No booking requests have been received.</p> : bookings.map((booking) => <article className="admin-request" key={booking.id}>
        <div className="admin-request-head"><div><span>{booking.reference} · {booking.status.replaceAll("_", " ")}</span><h3>{booking.guest_name} · {booking.room_types?.name}</h3><p>{booking.start_date} to {booking.end_date} · {booking.stay_period} · {booking.guest_count} guest(s)</p><p><a href={`mailto:${booking.guest_email}`}>{booking.guest_email}</a> · <a href={`tel:${booking.guest_phone}`}>{booking.guest_phone}</a></p>{booking.admin_notes && <p>Note: {booking.admin_notes}</p>}</div>{booking.room_units && <strong>{booking.room_units.unit_name}</strong>}</div>
        {booking.status === "requested" && <form className="review-form" onSubmit={(event) => { event.preventDefault(); void decide(booking, "accept", new FormData(event.currentTarget)); }}>
          <label>Assign unit<select name="unitId" required defaultValue="">{units.filter((unit) => unit.is_active && unit.room_type_id === booking.room_type_id).map((unit) => <option value={unit.id} key={unit.id}>{unit.unit_name}</option>)}</select></label>
          <label>Final price (ZAR)<input name="amount" type="number" min="1" step="0.01" required defaultValue={booking.stay_period === "night" ? "850" : undefined} /></label>
          <label>Admin notes<input name="notes" maxLength={2000} defaultValue={booking.admin_notes} /></label>
          <button className="button button-dark" disabled={busy}>Approve and reserve for payment</button>
          <button className="button button-light" disabled={busy} type="button" onClick={(event) => { const form = event.currentTarget.form; if (form) void decide(booking, "decline", new FormData(form)); }}>Decline</button>
        </form>}
        {booking.status === "awaiting_payment" && <AgreementTools booking={booking} post={post} busy={busy} />}
      </article>)}</section>}
      {tab === "inventory" && <section className="admin-inventory"><h2>Room inventory</h2><p>There are 9 bachelor units and 4 two-bedroom units. Overnight and monthly requests share the same physical rooms.</p>
        <div className="inventory-type-grid">{types.map((type) => <article className="inventory-type" key={type.id}><div><strong>{type.name}</strong><span>{units.filter((unit) => unit.room_type_id === type.id && unit.is_active).length} active units</span></div><label className="toggle"><input type="checkbox" checked={type.is_active} onChange={(event) => void post("/api/admin/inventory", "PATCH", { kind: "type", id: type.id, isActive: event.target.checked })} /> Accepting requests</label></article>)}</div>
        <h3>Physical units</h3><div className="inventory-unit-list">{units.map((unit) => <label key={unit.id}><input type="checkbox" checked={unit.is_active} onChange={(event) => void post("/api/admin/inventory", "PATCH", { kind: "unit", id: unit.id, isActive: event.target.checked })} /><span>{unit.unit_name}<small>{unit.room_types.name}</small></span></label>)}</div>
        <form className="admin-inline-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); void post("/api/admin/inventory", "POST", { action: "unit", roomTypeId: values.get("roomTypeId"), unitName: values.get("unitName") }).then((ok) => { if (ok) form.reset(); }); }}><h3>Add a room</h3><select name="roomTypeId" required>{types.map((type) => <option value={type.id} key={type.id}>{type.name}</option>)}</select><input name="unitName" placeholder="Unit name" required maxLength={100} /><button className="button button-light" disabled={busy}>Add unit</button></form>
        <BlockDates units={units.filter((unit) => unit.is_active)} post={post} busy={busy} />
        <h3>Maintenance and owner-use blocks</h3>{inventory.blocks.length ? inventory.blocks.map((block) => <div className="maintenance-block" key={block.id}><span>{block.room_units.room_types.name} · {block.room_units.unit_name}: {block.start_date} to {block.end_date} (end date exclusive)</span><button className="button button-light" disabled={busy} onClick={() => void post("/api/admin/inventory", "DELETE", { blockId: block.id })}>Release block</button></div>) : <p>No upcoming maintenance blocks.</p>}
      </section>}
      {tab === "setup" && <BookingPolicySetup />}
    </>}
  </section>;
}

function AgreementTools({ booking, post, busy }: { booking: Booking; post: (path: string, method: "POST" | "PATCH" | "DELETE", body: unknown) => Promise<boolean>; busy: boolean }) {
  const [document, setDocument] = useState<{ id: string; document_body: string } | null>(null);
  const [signerName, setSignerName] = useState("");
  const [terms, setTerms] = useState("");
  const [lessor, setLessor] = useState("J AND J GROOTBOOM FARM ACCOMMODATION");
  async function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: booking.id, lessorName: lessor, confirmedOccupancy: Number(form.get("occupancyLimit")), depositCents: Math.round(Number(form.get("deposit")) * 100), depositTerms: form.get("depositTerms"), cancellationTerms: terms, additionalTerms: form.get("additionalTerms") }) });
    const data = await response.json(); if (!response.ok) { window.alert(data.error); return; }
    setDocument({ id: data.document.id, document_body: data.document.document_body });
  }
  const existing = booking.contract_documents?.find((item) => item.status !== "signed");
  const signed = booking.contract_documents?.find((item) => item.status === "signed");
  const managementSigned = existing?.contract_signatures?.some((signature) => signature.signer_role === "management") ?? false;
  return <div className="agreement-tools"><h4>Agreement and signatures</h4>
    {signed ? <p>This agreement is fully signed.</p> : document ? <><pre className="admin-contract-preview">{document.document_body}</pre><p>Check the full draft above, then sign for management.</p></> : existing ? <details className="admin-contract-preview"><summary>Agreement sent to guest · {existing.status}</summary><pre>{existing.document_body}</pre><small>SHA-256 {existing.document_sha256}</small></details> : <form className="review-form" onSubmit={(event) => void prepare(event)}>
      <label>Lessor legal name<input value={lessor} onChange={(event) => setLessor(event.target.value)} required minLength={2} /></label>
      <label>Confirmed maximum occupants for this unit<input name="occupancyLimit" type="number" min={booking.guest_count} max="20" step="1" required /></label>
      <label>Deposit (ZAR)<input name="deposit" type="number" min="0" step="0.01" placeholder="Enter amount (enter 0 if none)" required /></label>
      <label>Deposit handling and refund terms<textarea name="depositTerms" rows={3} placeholder="If a deposit applies, state how it is held, permitted deductions and refund timing." /></label>
      <label>Cancellation / refund terms<textarea value={terms} onChange={(event) => setTerms(event.target.value)} minLength={20} rows={3} required /></label>
      <label>Other agreed terms<textarea name="additionalTerms" rows={2} maxLength={2000} placeholder="Optional" /></label>
      <p className="form-message">Draft for management/legal review. Confirm this unit&apos;s occupancy limit and all financial terms before sending.</p>
      <button className="button button-light" disabled={busy}>Prepare agreement for guest signature</button>
    </form>}
    {existing?.status === "sent" && managementSigned && <p>Management has signed and the agreement is ready for the guest.</p>}
    {!signed && (document || (existing?.status === "draft" && !managementSigned)) && <div className="review-form"><label>Management signer name<input value={signerName} onChange={(event) => setSignerName(event.target.value)} required /></label><button className="button button-dark" disabled={busy || signerName.trim().length < 2} onClick={async () => { const id = document?.id ?? existing?.id; if (id) { const ok = await post("/api/admin/contracts", "PATCH", { documentId: id, signerName }); if (ok) setDocument(null); } }}>Review, sign and send agreement</button></div>}
  </div>;
}

function BlockDates({ units, post, busy }: { units: Unit[]; post: (path: string, method: "POST" | "PATCH" | "DELETE", body: unknown) => Promise<boolean>; busy: boolean }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form);
    const ok = await post("/api/admin/inventory", "POST", { action: "block", unitId: values.get("unitId"), startDate: values.get("startDate"), endDate: values.get("endDate") });
    if (ok) form.reset();
  }
  return <form className="admin-inline-form" onSubmit={(event) => void submit(event)}><h3>Block a room for maintenance or owner use</h3><select name="unitId" required>{units.map((unit) => <option value={unit.id} key={unit.id}>{unit.unit_name}</option>)}</select><label>From<input type="date" name="startDate" required /></label><label>Until (exclusive)<input type="date" name="endDate" required /></label><button className="button button-light" disabled={busy}>Block dates</button></form>;
}
