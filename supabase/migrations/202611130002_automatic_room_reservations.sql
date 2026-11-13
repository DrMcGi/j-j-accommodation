-- Automatically quote, allocate and hold one physical room in a single transaction.
-- Inventory stays shared between overnight and monthly reservations.

alter table public.room_types
  add column if not exists bed_count integer not null default 1 check (bed_count > 0),
  add column if not exists overnight_rate_cents_per_bed integer not null default 85000 check (overnight_rate_cents_per_bed >= 0);

update public.room_types set bed_count = 1, overnight_rate_cents_per_bed = 85000 where slug = 'bachelor';
update public.room_types set bed_count = 2, overnight_rate_cents_per_bed = 85000 where slug = 'two-bedroom';

create table if not exists public.booking_policy (
  singleton boolean primary key default true check (singleton),
  lessor_legal_name text not null,
  bachelor_max_guests integer not null check (bachelor_max_guests between 1 and 20),
  two_bedroom_max_guests integer not null check (two_bedroom_max_guests between 1 and 20),
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  deposit_terms text not null default '',
  cancellation_terms text not null,
  additional_terms text not null default '',
  authorized_signer_id uuid not null references public.profiles(id),
  authorized_signer_name text not null,
  authorized_signer_email text not null,
  approved_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.booking_policy enable row level security;
revoke all on public.booking_policy from public, anon, authenticated;

create or replace function public.started_month_count(p_start date, p_end date)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_complete_months integer;
  v_anniversary date;
begin
  if p_start is null or p_end is null or p_end <= p_start then
    raise exception 'Invalid monthly booking dates' using errcode = '22023';
  end if;

  select max(n)::integer into v_complete_months
  from generate_series(0, 13) as months(n)
  cross join lateral (
    select make_date(
      (extract(year from p_start)::integer + ((extract(month from p_start)::integer - 1 + n) / 12))::integer,
      (((extract(month from p_start)::integer - 1 + n) % 12) + 1)::integer,
      least(
        extract(day from p_start)::integer,
        extract(day from (
          make_date(
            (extract(year from p_start)::integer + ((extract(month from p_start)::integer - 1 + n) / 12))::integer,
            (((extract(month from p_start)::integer - 1 + n) % 12) + 1)::integer,
            1
          ) + interval '1 month - 1 day'
        ))::integer
      )
    ) as date_value
  ) as anniversary
  where anniversary.date_value <= p_end;

  select make_date(
    (extract(year from p_start)::integer + ((extract(month from p_start)::integer - 1 + v_complete_months) / 12))::integer,
    (((extract(month from p_start)::integer - 1 + v_complete_months) % 12) + 1)::integer,
    least(
      extract(day from p_start)::integer,
      extract(day from (
        make_date(
          (extract(year from p_start)::integer + ((extract(month from p_start)::integer - 1 + v_complete_months) / 12))::integer,
          (((extract(month from p_start)::integer - 1 + v_complete_months) % 12) + 1)::integer,
          1
        ) + interval '1 month - 1 day'
      ))::integer
    )
  ) into v_anniversary;

  return greatest(1, v_complete_months + case when v_anniversary < p_end then 1 else 0 end);
end;
$$;

drop function if exists public.create_instant_booking(text,text,text,text,integer,date,date,text,uuid,text);

create function public.create_instant_booking(
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
returns table (
  booking_id uuid,
  booking_reference text,
  assigned_unit text,
  amount_cents integer,
  billable_months integer,
  hold_expires_at timestamptz,
  invoice_number text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type public.room_types%rowtype;
  v_unit public.room_units%rowtype;
  v_policy public.booking_policy%rowtype;
  v_booking_id uuid;
  v_invoice_number text;
  v_reference text;
  v_email text := lower(trim(p_guest_email));
  v_request_count integer;
  v_nights integer;
  v_months integer := 0;
  v_amount integer;
begin
  if auth.role() <> 'service_role' and p_customer_id is distinct from auth.uid() then
    raise exception 'Customer identity does not match the authenticated session' using errcode = '42501';
  end if;

  update public.bookings set status = 'expired', updated_at = now()
    where status = 'awaiting_payment' and hold_expires_at <= now();

  if p_start_date < current_date or p_end_date <= p_start_date or p_end_date - p_start_date > 366 then
    raise exception 'Invalid stay dates' using errcode = '22023';
  end if;
  if p_stay_period is null or p_stay_period not in ('night', 'month') then
    raise exception 'Invalid stay type' using errcode = '22023';
  end if;
  if p_guest_count < 1 or p_guest_count > 20 then
    raise exception 'Guest count must be between 1 and 20' using errcode = '22023';
  end if;
  if char_length(trim(p_guest_name)) not between 2 and 160
    or char_length(v_email) not between 5 and 254
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(trim(p_guest_phone)) not between 7 and 32 then
    raise exception 'Contact details are invalid' using errcode = '22023';
  end if;

  select * into v_type from public.room_types where slug = p_room_type_slug and is_active = true;
  if not found then raise exception 'This room type is not available for booking' using errcode = '22023'; end if;
  select * into v_policy from public.booking_policy where singleton = true;
  if not found or v_policy.approved_at is null then
    raise exception 'The property must finish its one-time booking and agreement setup before reservations can be accepted' using errcode = '55000';
  end if;
  if (v_type.slug = 'bachelor' and p_guest_count > v_policy.bachelor_max_guests)
    or (v_type.slug = 'two-bedroom' and p_guest_count > v_policy.two_bedroom_max_guests) then
    raise exception 'The selected accommodation cannot accept that many guests' using errcode = '22023';
  end if;

  insert into public.booking_request_limits (email, request_date, request_count)
  values (v_email, current_date, 1)
  on conflict (email, request_date) do update
    set request_count = public.booking_request_limits.request_count + 1
  returning request_count into v_request_count;
  if v_request_count > 5 then raise exception 'Daily booking limit reached. Please contact the property.' using errcode = 'P0001'; end if;

  -- Serialize allocation per room type so concurrent requests cannot select the same free unit.
  perform pg_advisory_xact_lock(hashtext(v_type.id::text));
  select * into v_unit
  from public.room_units u
  where u.room_type_id = v_type.id and u.is_active = true
    and not exists (
      select 1 from public.bookings b
      where b.room_unit_id = u.id
        and b.status in ('awaiting_payment', 'confirmed')
        and (b.status <> 'awaiting_payment' or b.hold_expires_at > now())
        and b.start_date < p_end_date and b.end_date > p_start_date
    )
    and not exists (
      select 1 from public.availability_blocks ab
      where ab.room_unit_id = u.id and ab.start_date < p_end_date and ab.end_date > p_start_date
    )
  order by u.unit_name
  limit 1
  for update;
  if not found then
    raise exception 'No rooms of this type are available for the selected dates. Please choose another date range.' using errcode = 'P0001';
  end if;

  v_nights := p_end_date - p_start_date;
  if p_stay_period = 'night' then
    v_amount := v_type.overnight_rate_cents_per_bed * v_type.bed_count * v_nights;
  else
    v_months := public.started_month_count(p_start_date, p_end_date);
    v_amount := v_type.rate_cents * v_months;
  end if;
  if v_amount <= 0 then raise exception 'The price for this stay is not configured' using errcode = '22023'; end if;

  v_reference := 'JJ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into public.bookings (
    reference, customer_id, room_type_id, room_unit_id, guest_name, guest_email, guest_phone,
    guest_count, stay_period, start_date, end_date, status, amount_cents, hold_expires_at, customer_notes
  ) values (
    v_reference, p_customer_id, v_type.id, v_unit.id, trim(p_guest_name), v_email, trim(p_guest_phone),
    p_guest_count, p_stay_period, p_start_date, p_end_date, 'awaiting_payment', v_amount,
    now() + interval '20 minutes', left(coalesce(p_customer_notes, ''), 2000)
  ) returning id, bookings.hold_expires_at into v_booking_id, hold_expires_at;

  v_invoice_number := 'JJ-INV-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 6, '0');
  insert into public.invoices (booking_id, invoice_number, kind, amount_cents, currency, status)
    values (v_booking_id, v_invoice_number, 'invoice', v_amount, 'ZAR', 'issued');

  booking_id := v_booking_id;
  booking_reference := v_reference;
  assigned_unit := v_unit.unit_name;
  amount_cents := v_amount;
  billable_months := v_months;
  invoice_number := v_invoice_number;
  return next;
end;
$$;

revoke all on function public.started_month_count(date,date) from public, anon, authenticated;
grant execute on function public.started_month_count(date,date) to service_role;
revoke all on function public.create_instant_booking(text,text,text,text,integer,date,date,text,uuid,text) from public, anon, authenticated;
grant execute on function public.create_instant_booking(text,text,text,text,integer,date,date,text,uuid,text) to service_role;
