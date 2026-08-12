-- ClearRail initial secure schema
-- Real payment execution is intentionally not included in this migration.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  legal_name text not null check (char_length(legal_name) between 1 and 200),
  display_name text not null check (char_length(display_name) between 1 and 120),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','verification_pending','verified','restricted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete restrict,
  invoice_number text not null,
  amount_cents bigint not null check (amount_cents > 0 and amount_cents <= 1000000000),
  currency text not null default 'USD' check (currency = 'USD'),
  memo text check (memo is null or char_length(memo) <= 500),
  status text not null default 'draft'
    check (status in ('draft','sent','viewed','payment_pending','paid','void')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(business_id, invoice_number)
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists businesses_owner_user_id_idx on public.businesses(owner_user_id);
create index if not exists customers_business_id_idx on public.customers(business_id);
create index if not exists invoices_business_id_idx on public.invoices(business_id);
create index if not exists invoices_customer_id_idx on public.invoices(customer_id);
create index if not exists audit_events_business_id_created_at_idx on public.audit_events(business_id, created_at desc);

alter table public.businesses enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.audit_events enable row level security;

-- Explicit grants because ClearRail does not automatically expose new tables.
grant select, insert, update on public.businesses to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update on public.invoices to authenticated;
grant select on public.audit_events to authenticated;
grant usage, select on sequence public.audit_events_id_seq to authenticated;

create policy "owners can read their business"
on public.businesses for select to authenticated
using ((select auth.uid()) is not null and owner_user_id = (select auth.uid()));

create policy "owners can create their business"
on public.businesses for insert to authenticated
with check ((select auth.uid()) is not null and owner_user_id = (select auth.uid()));

create policy "owners can update their business"
on public.businesses for update to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

create policy "owners can read their customers"
on public.customers for select to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = customers.business_id and b.owner_user_id = (select auth.uid())
));

create policy "owners can create their customers"
on public.customers for insert to authenticated
with check (exists (
  select 1 from public.businesses b
  where b.id = customers.business_id and b.owner_user_id = (select auth.uid())
));

create policy "owners can update their customers"
on public.customers for update to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = customers.business_id and b.owner_user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.businesses b
  where b.id = customers.business_id and b.owner_user_id = (select auth.uid())
));

create policy "owners can delete their customers"
on public.customers for delete to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = customers.business_id and b.owner_user_id = (select auth.uid())
));

create policy "owners can read their invoices"
on public.invoices for select to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = invoices.business_id and b.owner_user_id = (select auth.uid())
));

create policy "owners can create their invoices"
on public.invoices for insert to authenticated
with check (exists (
  select 1 from public.businesses b
  where b.id = invoices.business_id and b.owner_user_id = (select auth.uid())
));

create policy "owners can update their invoices"
on public.invoices for update to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = invoices.business_id and b.owner_user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.businesses b
  where b.id = invoices.business_id and b.owner_user_id = (select auth.uid())
));

create policy "owners can read their audit events"
on public.audit_events for select to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = audit_events.business_id and b.owner_user_id = (select auth.uid())
));

-- Audit records are generated by the database, not trusted browser input.
create or replace function private.log_invoice_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_events (business_id, actor_user_id, event_type, entity_type, entity_id, event_data)
    values (new.business_id, auth.uid(), 'invoice.created', 'invoice', new.id,
      jsonb_build_object('status', new.status, 'amount_cents', new.amount_cents));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_events (business_id, actor_user_id, event_type, entity_type, entity_id, event_data)
    values (new.business_id, auth.uid(), 'invoice.updated', 'invoice', new.id,
      jsonb_build_object('old_status', old.status, 'new_status', new.status));
    return new;
  end if;
  return null;
end;
$$;

revoke all on function private.log_invoice_audit() from public, anon, authenticated;

drop trigger if exists invoices_audit_trigger on public.invoices;
create trigger invoices_audit_trigger
after insert or update on public.invoices
for each row execute function private.log_invoice_audit();
