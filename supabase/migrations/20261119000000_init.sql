-- TEM Bakehouse: customers, orders, store settings and admin-editable product state.

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customers may edit their name and phone, never their admin flag or email.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- No signed-in user means SQL editor, seed or service key: trusted.
  if auth.uid() is not null and not public.is_admin() then
    new.is_admin := old.is_admin;
    new.email := old.email;
  end if;
  return new;
end;
$$;

create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

alter table public.profiles enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

create policy "profiles: update own or admin" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin());

-- Settings (single row) -------------------------------------------------------

create table public.settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "settings: public read" on public.settings
  for select to anon, authenticated using (true);

create policy "settings: admin write" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Product state (overrides on top of the catalogue in src/data/catalog.ts) ----

create table public.product_state (
  id text primary key,
  status text not null default 'available' check (status in ('available', 'soon')),
  featured boolean not null default false,
  enabled boolean not null default true,
  price numeric(10, 2),
  updated_at timestamptz not null default now()
);

alter table public.product_state enable row level security;

create policy "product_state: public read" on public.product_state
  for select to anon, authenticated using (true);

create policy "product_state: admin write" on public.product_state
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Orders ----------------------------------------------------------------------

create table public.orders (
  ref text primary key,
  customer_id uuid references public.profiles (id) on delete set null,
  created date not null default current_date,
  date date not null,
  slot text not null default '',
  method text not null default 'collection' check (method in ('collection', 'delivery')),
  location text,
  status text not null default 'pending_review',
  items jsonb not null default '[]'::jsonb,
  notes text not null default '',
  estimate numeric(10, 2),
  total numeric(10, 2),
  deposit_paid numeric(10, 2) not null default 0,
  balance_paid numeric(10, 2) not null default 0,
  log jsonb not null default '[]'::jsonb,
  internal text not null default '',
  contact_name text,
  phone text,
  email text,
  media_consent boolean not null default false,
  proof text,
  pay_ref text,
  pay_method text,
  pay_date text,
  proposal text,
  fail_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_date_idx on public.orders (date);
create index orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

create policy "orders: read own or admin" on public.orders
  for select to authenticated using (customer_id = auth.uid() or public.is_admin());

create policy "orders: update own or admin" on public.orders
  for update to authenticated using (customer_id = auth.uid() or public.is_admin());

create policy "orders: admin insert" on public.orders
  for insert to authenticated with check (public.is_admin());

create policy "orders: admin delete" on public.orders
  for delete to authenticated using (public.is_admin());

-- Customers can only: submit deposit details, approve a proposal, or cancel.
-- Every other column stays as it was.
create or replace function public.guard_order_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  approving boolean := old.status = 'awaiting_approval' and new.status = 'deposit_required';
begin
  new.updated_at := now();
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.status is distinct from old.status and not (
    (old.status in ('deposit_required', 'payment_failed') and new.status = 'deposit_submitted')
    or approving
    or (old.status in ('pending_review', 'changes_requested', 'awaiting_approval', 'deposit_required', 'payment_failed') and new.status = 'cancelled')
  ) then
    raise exception 'Order % cannot move from % to %', old.ref, old.status, new.status
      using errcode = '42501';
  end if;

  new.ref := old.ref;
  new.customer_id := old.customer_id;
  new.created := old.created;
  new.slot := old.slot;
  new.method := old.method;
  new.location := old.location;
  new.items := old.items;
  new.notes := old.notes;
  new.estimate := old.estimate;
  new.deposit_paid := old.deposit_paid;
  new.balance_paid := old.balance_paid;
  new.internal := old.internal;
  new.contact_name := old.contact_name;
  new.phone := old.phone;
  new.email := old.email;
  new.media_consent := old.media_consent;
  new.proposal := old.proposal;
  new.fail_note := old.fail_note;
  new.created_at := old.created_at;
  if not approving then
    new.date := old.date;
    new.total := old.total;
  end if;
  if new.status is distinct from 'deposit_submitted' then
    new.proof := old.proof;
    new.pay_ref := old.pay_ref;
    new.pay_method := old.pay_method;
    new.pay_date := old.pay_date;
  end if;
  return new;
end;
$$;

create trigger guard_order_update
  before update on public.orders
  for each row execute function public.guard_order_update();

-- Customers and guests submit through this function: it assigns the reference
-- (TEM-YYMM-NNN) and forces the starting status, totals and payments.
create or replace function public.submit_order(payload jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  prefix text := 'TEM-' || to_char(current_date, 'YYMM') || '-';
  next_num int;
  new_ref text;
begin
  if jsonb_typeof(payload -> 'items') is distinct from 'array' or jsonb_array_length(payload -> 'items') = 0 then
    raise exception 'An order needs at least one item' using errcode = '22023';
  end if;
  if coalesce(payload ->> 'date', '') = '' then
    raise exception 'An order needs a collection date' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('tem_order_ref'));
  select greatest(41, coalesce(max(nullif(substring(ref from length(prefix) + 1), '')::int), 0)) + 1
    into next_num
    from public.orders
    where ref like prefix || '%';
  new_ref := prefix || lpad(next_num::text, 3, '0');

  insert into public.orders (
    ref, customer_id, date, slot, method, location, status, items, notes, estimate,
    log, contact_name, phone, email, media_consent
  ) values (
    new_ref,
    auth.uid(),
    (payload ->> 'date')::date,
    coalesce(payload ->> 'slot', ''),
    case when payload ->> 'method' = 'delivery' then 'delivery' else 'collection' end,
    payload ->> 'location',
    'pending_review',
    payload -> 'items',
    coalesce(payload ->> 'notes', ''),
    nullif(payload ->> 'estimate', '')::numeric,
    jsonb_build_array(jsonb_build_object('s', 'pending_review', 't', to_char(current_date, 'YYYY-MM-DD'))),
    payload ->> 'contactName',
    payload ->> 'phone',
    payload ->> 'email',
    coalesce((payload ->> 'mediaConsent')::boolean, false)
  );
  return new_ref;
end;
$$;

revoke all on function public.submit_order(jsonb) from public;
grant execute on function public.submit_order(jsonb) to anon, authenticated;

-- Day-by-day booking counts, so the checkout calendar can show fully booked days
-- without exposing anyone's order.
create or replace function public.booked_days()
returns table (date date, count int)
language sql
stable
security definer
set search_path = ''
as $$
  select o.date, count(*)::int
  from public.orders o
  where o.date >= current_date
    and o.status not in ('declined', 'cancelled', 'expired')
  group by o.date;
$$;

grant execute on function public.booked_days() to anon, authenticated;

-- Realtime ----------------------------------------------------------------------

alter publication supabase_realtime add table public.orders, public.settings, public.product_state;
