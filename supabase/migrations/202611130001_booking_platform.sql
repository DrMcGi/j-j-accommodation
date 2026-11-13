create extension if not exists btree_gist with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create table if not exists public.room_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  description text not null default '',
  rate_period text not null check (rate_period in ('night', 'month')),
  rate_cents integer not null check (rate_cents >= 0),
  max_guests integer not null default 1 check (max_guests > 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.room_types (slug, name, description, rate_period, rate_cents, max_guests, is_active)
values
  ('bachelor', 'Bachelor', 'Furnished bachelor accommodation. Available for overnight and monthly stays.', 'month', 750000, 20, true),
  ('two-bedroom', 'Two bedroom', 'Furnished two-bedroom accommodation. Available for overnight and monthly stays.', 'month', 1350000, 20, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  rate_period = excluded.rate_period,
  rate_cents = excluded.rate_cents,
  max_guests = excluded.max_guests;

create table if not exists public.room_units (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id),
  unit_name text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (room_type_id, unit_name)
);

insert into public.room_units (room_type_id, unit_name, is_active)
select t.id, 'Bachelor ' || lpad(n::text, 2, '0'), true
from public.room_types t cross join generate_series(1, 9) n where t.slug = 'bachelor'
on conflict (room_type_id, unit_name) do nothing;

insert into public.room_units (room_type_id, unit_name, is_active)
select t.id, 'Two bedroom ' || lpad(n::text, 2, '0'), true
from public.room_types t cross join generate_series(1, 4) n where t.slug = 'two-bedroom'
on conflict (room_type_id, unit_name) do nothing;

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  room_unit_id uuid not null references public.room_units(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null default 'owner_block',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_id uuid references public.profiles(id) on delete set null,
  room_type_id uuid not null references public.room_types(id),
  room_unit_id uuid references public.room_units(id),
  guest_name text not null check (char_length(guest_name) between 2 and 160),
  guest_email text not null check (char_length(guest_email) between 5 and 254),
  guest_phone text not null check (char_length(guest_phone) between 7 and 32),
  guest_count integer not null check (guest_count > 0),
  stay_period text not null default 'month' check (stay_period in ('night', 'month')),
  start_date date not null,
  end_date date not null,
  status text not null default 'requested' check (status in ('requested', 'awaiting_payment', 'confirmed', 'declined', 'cancelled', 'expired')),
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  currency char(3) not null default 'ZAR' check (currency = 'ZAR'),
  hold_expires_at timestamptz,
  customer_notes text not null default '',
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date > start_date),
  check (end_date - start_date <= 366)
);

alter table public.bookings drop constraint if exists bookings_no_overlapping_confirmed_stays;
alter table public.bookings add constraint bookings_no_overlapping_confirmed_stays
  exclude using gist (
    room_unit_id with =,
    daterange(start_date, end_date, '[)') with &&
  ) where (room_unit_id is not null and status in ('awaiting_payment', 'confirmed'));

create index if not exists bookings_customer_created_idx on public.bookings (customer_id, created_at desc);
create index if not exists bookings_room_dates_idx on public.bookings (room_type_id, start_date, end_date);
create index if not exists bookings_expired_hold_idx on public.bookings (hold_expires_at) where status = 'awaiting_payment';

create table if not exists public.booking_request_limits (
  email text not null,
  request_date date not null default current_date,
  request_count integer not null default 0,
  primary key (email, request_date)
);

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
  provider text not null check (provider in ('ozow')),
  provider_payment_id text,
  merchant_reference text not null unique,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'created' check (status in ('created', 'pending', 'paid', 'failed', 'cancelled', 'refunded')),
  checkout_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

create table if not exists public.contract_documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
  provider text not null default 'internal',
  provider_envelope_id text unique,
  template_version text not null,
  document_body text not null default '',
  document_sha256 text not null default '',
  status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'signed', 'declined', 'voided')),
  document_url text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists contract_documents_one_per_booking_idx on public.contract_documents (booking_id) where status not in ('voided', 'declined');

create table if not exists public.contract_signatures (
  id uuid primary key default gen_random_uuid(),
  contract_document_id uuid not null references public.contract_documents(id),
  signer_role text not null check (signer_role in ('customer', 'management')),
  signer_user_id uuid references public.profiles(id),
  signer_name text not null check (char_length(signer_name) between 2 and 160),
  signer_email text not null,
  accepted_text text not null,
  signed_at timestamptz not null default now(),
  document_sha256 text not null,
  unique (contract_document_id, signer_role)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
  invoice_number text not null unique,
  kind text not null check (kind in ('invoice', 'receipt')),
  amount_cents integer not null check (amount_cents >= 0),
  currency char(3) not null default 'ZAR',
  status text not null check (status in ('issued', 'paid', 'void')),
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  recipient text not null,
  channel text not null check (channel in ('email', 'sms', 'whatsapp')),
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'processing', 'sent', 'failed')),
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create or replace function public.claim_notification_batch(p_limit integer default 20)
returns setof public.notification_outbox
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  update public.notification_outbox set status = case when attempts >= 5 then 'failed' else 'queued' end, updated_at = now()
    where status = 'processing' and updated_at < now() - interval '10 minutes';
  return query
    with next_rows as (
      select id from public.notification_outbox
      where status = 'queued' and attempts < 5 and channel = 'email'
      order by created_at for update skip locked limit greatest(1, least(p_limit, 50))
    )
    update public.notification_outbox n set status = 'processing', attempts = attempts + 1, updated_at = now()
    from next_rows where n.id = next_rows.id returning n.*;
end;
$$;

create or replace function public.finish_notification(p_notification_id uuid, p_success boolean, p_error text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  update public.notification_outbox set status = case when p_success then 'sent' when attempts >= 5 then 'failed' else 'queued' end,
    last_error = case when p_success then null else left(coalesce(p_error, 'Delivery failed'), 500) end,
    sent_at = case when p_success then now() else sent_at end, updated_at = now()
  where id = p_notification_id and status = 'processing';
end;
$$;

create table if not exists public.provider_webhook_events (
  provider text not null,
  event_id text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  primary key (provider, event_id)
);

create sequence if not exists public.invoice_number_seq;

create or replace function public.process_ozow_transaction(
  p_event_id text,
  p_reference text,
  p_provider_payment_id text,
  p_amount_cents integer,
  p_status text,
  p_paid_at timestamptz default now()
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payment_records%rowtype;
  v_booking public.bookings%rowtype;
  v_inserted integer;
  v_invoice_number text;
begin
  if auth.role() <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  insert into public.provider_webhook_events (provider, event_id)
  values ('ozow', p_event_id) on conflict do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then return true; end if;

  select * into v_payment from public.payment_records where merchant_reference = p_reference for update;
  if not found or v_payment.amount_cents <> p_amount_cents then
    raise exception 'Payment reference or amount mismatch' using errcode = '22023';
  end if;
  if v_payment.status = 'paid' then
    update public.provider_webhook_events set processed_at = now() where provider = 'ozow' and event_id = p_event_id;
    return true;
  end if;
  select * into v_booking from public.bookings where id = v_payment.booking_id for update;
  if p_status = 'Successful' then
    update public.payment_records set status = 'paid', provider_payment_id = p_provider_payment_id,
      paid_at = coalesce(p_paid_at, now()), updated_at = now() where id = v_payment.id;
    update public.bookings set status = 'confirmed', hold_expires_at = null, updated_at = now()
      where id = v_booking.id and status in ('awaiting_payment', 'expired');
    if not found then raise exception 'Booking is no longer held for payment' using errcode = 'P0001'; end if;
    v_invoice_number := 'JJ-RCP-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 6, '0');
    insert into public.invoices (booking_id, invoice_number, kind, amount_cents, currency, status)
      values (v_booking.id, v_invoice_number, 'receipt', v_payment.amount_cents, 'ZAR', 'paid');
    insert into public.notification_outbox (booking_id, recipient, channel, template, payload)
      values (v_booking.id, v_booking.guest_email, 'email', 'booking-payment-confirmed', jsonb_build_object('reference', v_booking.reference, 'invoice', v_invoice_number, 'amount_cents', v_payment.amount_cents));
  elsif p_status = 'Error' then
    update public.payment_records set status = 'failed', provider_payment_id = p_provider_payment_id, updated_at = now() where id = v_payment.id;
    insert into public.notification_outbox (booking_id, recipient, channel, template, payload)
      values (v_booking.id, v_booking.guest_email, 'email', 'booking-payment-failed', jsonb_build_object('reference', v_booking.reference));
  else
    update public.payment_records set status = 'pending', provider_payment_id = p_provider_payment_id, updated_at = now() where id = v_payment.id;
  end if;
  update public.provider_webhook_events set processed_at = now() where provider = 'ozow' and event_id = p_event_id;
  return true;
end;
$$;

create or replace function public.sign_contract(
  p_document_id uuid,
  p_signer_role text,
  p_signer_user_id uuid,
  p_signer_name text,
  p_signer_email text,
  p_accepted_text text,
  p_document_sha256 text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_document public.contract_documents%rowtype;
  v_booking public.bookings%rowtype;
  v_signature_count integer;
  v_signature_inserted integer;
begin
  if auth.role() <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  select * into v_document from public.contract_documents where id = p_document_id for update;
  if not found or v_document.status in ('declined', 'voided') or v_document.document_sha256 <> p_document_sha256 then
    raise exception 'This agreement is no longer valid for signing' using errcode = '22023';
  end if;
  if p_signer_role not in ('customer', 'management') or char_length(trim(p_signer_name)) not between 2 and 160
    or char_length(trim(p_signer_email)) not between 5 and 254 or char_length(p_accepted_text) < 40 then
    raise exception 'Signer details are incomplete' using errcode = '22023';
  end if;
  if p_signer_role = 'customer' and v_document.status <> 'sent' then
    raise exception 'Management must review and send this agreement before the customer can sign' using errcode = '22023';
  end if;
  if p_signer_role = 'management' and v_document.status <> 'draft' then
    raise exception 'This agreement is no longer awaiting its management review' using errcode = '22023';
  end if;
  select * into v_booking from public.bookings where id = v_document.booking_id for update;
  if p_signer_role = 'customer' and (p_signer_user_id is null or v_booking.customer_id is distinct from p_signer_user_id) then
    raise exception 'Only the booking customer may sign as guest' using errcode = '42501';
  end if;
  insert into public.contract_signatures (contract_document_id, signer_role, signer_user_id, signer_name, signer_email, accepted_text, document_sha256)
    values (v_document.id, p_signer_role, p_signer_user_id, trim(p_signer_name), lower(trim(p_signer_email)), p_accepted_text, p_document_sha256)
    on conflict (contract_document_id, signer_role) do nothing;
  get diagnostics v_signature_inserted = row_count;
  if v_signature_inserted = 0 then return false; end if;
  select count(*) into v_signature_count from public.contract_signatures where contract_document_id = v_document.id;
  if v_signature_count = 2 then
    update public.contract_documents set status = 'signed', signed_at = now(), updated_at = now() where id = v_document.id;
    insert into public.notification_outbox (booking_id, recipient, channel, template, payload)
      values (v_booking.id, v_booking.guest_email, 'email', 'agreement-signed', jsonb_build_object('reference', v_booking.reference));
    return true;
  end if;
  if p_signer_role = 'management' then
    update public.contract_documents set status = 'sent', updated_at = now() where id = v_document.id;
    insert into public.notification_outbox (booking_id, recipient, channel, template, payload)
      values (v_booking.id, v_booking.guest_email, 'email', 'agreement-ready', jsonb_build_object('reference', v_booking.reference));
  end if;
  return false;
end;
$$;

drop function if exists public.create_booking_request(text,text,text,text,integer,date,date,text,uuid);

create or replace function public.create_booking_request(
  p_room_type_slug text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guest_count integer,
  p_start_date date,
  p_end_date date,
  p_customer_notes text default '',
  p_customer_id uuid default null,
  p_stay_period text default 'month'
)
returns table (booking_id uuid, booking_reference text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type public.room_types%rowtype;
  v_id uuid;
  v_reference text;
  v_email text := lower(trim(p_guest_email));
  v_request_count integer;
begin
  if auth.role() <> 'service_role' and p_customer_id is distinct from auth.uid() then
    raise exception 'Customer identity does not match the authenticated session' using errcode = '42501';
  end if;
  update public.bookings set status = 'expired', updated_at = now()
    where status = 'awaiting_payment' and hold_expires_at <= now();
  if p_start_date < current_date or p_end_date <= p_start_date or p_end_date - p_start_date > 366 then
    raise exception 'Invalid stay dates' using errcode = '22023';
  end if;
  if p_stay_period is null or p_stay_period not in ('night', 'month') then raise exception 'Invalid stay period' using errcode = '22023'; end if;
  select * into v_type from public.room_types where slug = p_room_type_slug and is_active = true;
  if not found then raise exception 'This stay type is not currently accepting requests' using errcode = '22023'; end if;
  if p_guest_count < 1 or p_guest_count > 20 then
    raise exception 'Guest count must be between 1 and 20' using errcode = '22023';
  end if;
  if char_length(trim(p_guest_name)) not between 2 and 160
    or char_length(v_email) not between 5 and 254
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(trim(p_guest_phone)) not between 7 and 32 then
    raise exception 'Contact details are invalid' using errcode = '22023';
  end if;

  insert into public.booking_request_limits (email, request_date, request_count)
  values (v_email, current_date, 1)
  on conflict (email, request_date) do update
    set request_count = public.booking_request_limits.request_count + 1
  returning request_count into v_request_count;
  if v_request_count > 5 then raise exception 'Request limit reached. Please contact us to continue.' using errcode = 'P0001'; end if;

  v_reference := 'JJ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into public.bookings (
    reference, customer_id, room_type_id, stay_period, guest_name, guest_email, guest_phone,
    guest_count, start_date, end_date, customer_notes
  ) values (
    v_reference, p_customer_id, v_type.id, p_stay_period, trim(p_guest_name), v_email,
    trim(p_guest_phone), p_guest_count, p_start_date, p_end_date,
    left(coalesce(p_customer_notes, ''), 2000)
  ) returning id into booking_id;
  booking_reference := v_reference;
  return next;
end;
$$;

create or replace function public.get_room_availability(
  p_room_type_slug text,
  p_start_date date,
  p_end_date date
)
returns table (service_date date, available_units integer, total_units integer)
language sql
stable
security definer
set search_path = ''
as $$
  with selected_type as (
    select id from public.room_types where slug = p_room_type_slug and is_active = true
  ), dates as (
    select d::date as service_date
    from generate_series(p_start_date, p_end_date - 1, interval '1 day') d
  )
  select dates.service_date,
    count(distinct u.id) filter (where b.id is null and ab.id is null)::integer as available_units,
    count(distinct u.id)::integer as total_units
  from dates cross join selected_type
  left join public.room_units u on u.room_type_id = selected_type.id and u.is_active = true
  left join public.bookings b on b.room_unit_id = u.id
    and b.status in ('awaiting_payment', 'confirmed')
    and b.start_date <= dates.service_date and b.end_date > dates.service_date
    and (b.status <> 'awaiting_payment' or b.hold_expires_at > now())
  left join public.availability_blocks ab on ab.room_unit_id = u.id
    and ab.start_date <= dates.service_date and ab.end_date > dates.service_date
  group by dates.service_date;
$$;

create or replace function public.admin_review_booking(
  p_booking_id uuid,
  p_decision text,
  p_room_unit_id uuid default null,
  p_amount_cents integer default null,
  p_admin_notes text default ''
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking public.bookings%rowtype;
  v_unit public.room_units%rowtype;
begin
  update public.bookings set status = 'expired', updated_at = now()
    where status = 'awaiting_payment' and hold_expires_at <= now();
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'Booking request not found' using errcode = 'P0002'; end if;
  if v_booking.status <> 'requested' then raise exception 'Booking is no longer awaiting review' using errcode = 'P0001'; end if;

  if p_decision = 'decline' then
    update public.bookings set status = 'declined', admin_notes = left(coalesce(p_admin_notes, ''), 2000), updated_at = now()
      where id = p_booking_id returning * into v_booking;
    insert into public.notification_outbox (booking_id, recipient, channel, template, payload)
      values (v_booking.id, v_booking.guest_email, 'email', 'booking-declined', jsonb_build_object('reference', v_booking.reference));
    return v_booking;
  end if;

  if p_decision <> 'accept' or p_room_unit_id is null or coalesce(p_amount_cents, 0) <= 0 then
    raise exception 'Accepted bookings need an assigned unit and positive quoted amount' using errcode = '22023';
  end if;
  select * into v_unit from public.room_units where id = p_room_unit_id and room_type_id = v_booking.room_type_id and is_active = true for update;
  if not found then
    raise exception 'Selected unit does not match this room type' using errcode = '22023';
  end if;
  if exists (select 1 from public.availability_blocks where room_unit_id = v_unit.id
    and start_date < v_booking.end_date and end_date > v_booking.start_date) then
    raise exception 'Selected room is blocked for part of these dates' using errcode = '23P01';
  end if;
  update public.bookings set room_unit_id = p_room_unit_id, amount_cents = p_amount_cents,
    status = 'awaiting_payment', hold_expires_at = now() + interval '24 hours',
    admin_notes = left(coalesce(p_admin_notes, ''), 2000), updated_at = now()
    where id = p_booking_id returning * into v_booking;
  insert into public.invoices (booking_id, invoice_number, kind, amount_cents, currency, status)
    values (v_booking.id, 'JJ-INV-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 6, '0'), 'invoice', p_amount_cents, 'ZAR', 'issued');
  insert into public.notification_outbox (booking_id, recipient, channel, template, payload)
    values (v_booking.id, v_booking.guest_email, 'email', 'booking-approved', jsonb_build_object('reference', v_booking.reference, 'amount_cents', p_amount_cents));
  return v_booking;
end;
$$;

create or replace function public.create_availability_block(
  p_room_unit_id uuid,
  p_start_date date,
  p_end_date date,
  p_created_by uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit public.room_units%rowtype;
  v_block_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  if p_start_date < current_date or p_end_date <= p_start_date then raise exception 'Invalid block dates' using errcode = '22023'; end if;
  update public.bookings set status = 'expired', updated_at = now()
    where status = 'awaiting_payment' and hold_expires_at <= now();
  select * into v_unit from public.room_units where id = p_room_unit_id and is_active = true for update;
  if not found then raise exception 'Room is not active' using errcode = '22023'; end if;
  if exists (select 1 from public.bookings where room_unit_id = v_unit.id
    and status in ('awaiting_payment', 'confirmed') and start_date < p_end_date and end_date > p_start_date) then
    raise exception 'Room has a booking during these dates' using errcode = '23P01';
  end if;
  insert into public.availability_blocks (room_unit_id, start_date, end_date, created_by)
    values (v_unit.id, p_start_date, p_end_date, p_created_by) returning id into v_block_id;
  return v_block_id;
end;
$$;

create or replace function public.set_room_unit_active(p_room_unit_id uuid, p_is_active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit public.room_units%rowtype;
begin
  if auth.role() <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  update public.bookings set status = 'expired', updated_at = now()
    where status = 'awaiting_payment' and hold_expires_at <= now();
  select * into v_unit from public.room_units where id = p_room_unit_id for update;
  if not found then raise exception 'Room not found' using errcode = 'P0002'; end if;
  if not p_is_active and exists (select 1 from public.bookings where room_unit_id = v_unit.id
    and status in ('awaiting_payment', 'confirmed')) then
    raise exception 'Room has a booking or payment hold; cancel or resolve it before deactivating this room' using errcode = 'P0001';
  end if;
  update public.room_units set is_active = p_is_active where id = v_unit.id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.room_types enable row level security;
alter table public.room_units enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.bookings enable row level security;
alter table public.payment_records enable row level security;
alter table public.contract_documents enable row level security;
alter table public.contract_signatures enable row level security;
alter table public.invoices enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.provider_webhook_events enable row level security;

drop policy if exists room_types_public_active on public.room_types;
create policy room_types_public_active on public.room_types for select to anon, authenticated using (is_active = true);
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()) and role = 'customer');
drop policy if exists bookings_select_self on public.bookings;
create policy bookings_select_self on public.bookings for select to authenticated using (customer_id = (select auth.uid()));
drop policy if exists payments_select_self on public.payment_records;
create policy payments_select_self on public.payment_records for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id and b.customer_id = (select auth.uid())));
drop policy if exists invoices_select_self on public.invoices;
create policy invoices_select_self on public.invoices for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id and b.customer_id = (select auth.uid())));

revoke all on public.room_units, public.availability_blocks, public.bookings, public.payment_records,
  public.contract_documents, public.invoices, public.notification_outbox, public.provider_webhook_events,
  public.contract_signatures,
  public.booking_request_limits from anon, authenticated;
grant select on public.room_types to anon, authenticated;
grant select on public.profiles, public.bookings, public.payment_records, public.invoices to authenticated;
revoke all on function public.create_booking_request(text,text,text,text,integer,date,date,text,uuid,text) from public, anon, authenticated;
grant execute on function public.create_booking_request(text,text,text,text,integer,date,date,text,uuid,text) to service_role;
revoke all on function public.get_room_availability(text,date,date) from public;
revoke all on function public.get_room_availability(text,date,date) from anon, authenticated;
grant execute on function public.get_room_availability(text,date,date) to service_role;
revoke all on function public.admin_review_booking(uuid,text,uuid,integer,text) from public, anon, authenticated;
grant execute on function public.admin_review_booking(uuid,text,uuid,integer,text) to service_role;
revoke all on function public.create_availability_block(uuid,date,date,uuid) from public, anon, authenticated;
grant execute on function public.create_availability_block(uuid,date,date,uuid) to service_role;
revoke all on function public.set_room_unit_active(uuid,boolean) from public, anon, authenticated;
grant execute on function public.set_room_unit_active(uuid,boolean) to service_role;
revoke all on function public.process_ozow_transaction(text,text,text,integer,text,timestamptz) from public, anon, authenticated;
grant execute on function public.process_ozow_transaction(text,text,text,integer,text,timestamptz) to service_role;
revoke all on function public.sign_contract(uuid,text,uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.sign_contract(uuid,text,uuid,text,text,text,text) to service_role;
revoke all on function public.claim_notification_batch(integer) from public, anon, authenticated;
grant execute on function public.claim_notification_batch(integer) to service_role;
revoke all on function public.finish_notification(uuid,boolean,text) from public, anon, authenticated;
grant execute on function public.finish_notification(uuid,boolean,text) to service_role;
