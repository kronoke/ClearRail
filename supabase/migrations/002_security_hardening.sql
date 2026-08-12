-- ClearRail security hardening migration
-- Run after 001_initial_secure_schema.sql.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Durable serverless-safe rate limiting. Only the SECURITY DEFINER function below is exposed.
create table if not exists private.auth_rate_limits (
  bucket text not null,
  key_hash text not null,
  window_started_at timestamptz not null default clock_timestamp(),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (bucket, key_hash)
);

revoke all on private.auth_rate_limits from public, anon, authenticated;

create or replace function public.check_auth_rate_limit(
  p_bucket text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count integer;
begin
  if p_bucket !~ '^[a-z0-9_.-]{1,40}$'
     or p_key_hash !~ '^[a-f0-9]{64}$'
     or p_limit < 1 or p_limit > 100
     or p_window_seconds < 10 or p_window_seconds > 86400 then
    raise exception 'invalid rate-limit parameters';
  end if;

  insert into private.auth_rate_limits(bucket, key_hash, window_started_at, request_count)
  values (p_bucket, p_key_hash, v_now, 1)
  on conflict (bucket, key_hash) do update
  set request_count = case
        when private.auth_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds)
          then 1
        else private.auth_rate_limits.request_count + 1
      end,
      window_started_at = case
        when private.auth_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds)
          then v_now
        else private.auth_rate_limits.window_started_at
      end
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.check_auth_rate_limit(text,text,integer,integer) from public;
grant execute on function public.check_auth_rate_limit(text,text,integer,integer) to anon, authenticated;

-- Durable replay/idempotency protection for authenticated mutating endpoints.
create table if not exists private.idempotency_keys (
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null,
  key uuid not null,
  created_at timestamptz not null default clock_timestamp(),
  primary key (user_id, scope, key)
);

revoke all on private.idempotency_keys from public, anon, authenticated;

create or replace function public.claim_idempotency_key(p_scope text, p_key uuid)
returns boolean
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then return false; end if;
  if p_scope !~ '^[a-z0-9_.-]{1,60}$' then raise exception 'invalid scope'; end if;

  delete from private.idempotency_keys
  where created_at < clock_timestamp() - interval '24 hours';

  insert into private.idempotency_keys(user_id, scope, key)
  values (v_user, p_scope, p_key)
  on conflict do nothing;

  return found;
end;
$$;

revoke all on function public.claim_idempotency_key(text,uuid) from public, anon;
grant execute on function public.claim_idempotency_key(text,uuid) to authenticated;

-- Audit events remain application-read-only. Database triggers own writes.
revoke insert, update, delete, truncate on public.audit_events from anon, authenticated;

-- Sensitive merchant writes require an MFA-authenticated AAL2 session at the DATABASE layer.
drop policy if exists "owners can create their business" on public.businesses;
create policy "owners can create their business"
on public.businesses for insert to authenticated
with check (
  owner_user_id = (select auth.uid())
  and coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
);

drop policy if exists "owners can update their business" on public.businesses;
create policy "owners can update their business"
on public.businesses for update to authenticated
using (
  owner_user_id = (select auth.uid())
  and coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
)
with check (
  owner_user_id = (select auth.uid())
  and coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
);

drop policy if exists "owners can create their customers" on public.customers;
create policy "owners can create their customers"
on public.customers for insert to authenticated
with check (
  coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
  and exists (select 1 from public.businesses b where b.id = customers.business_id and b.owner_user_id = (select auth.uid()))
);

drop policy if exists "owners can update their customers" on public.customers;
create policy "owners can update their customers"
on public.customers for update to authenticated
using (
  coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
  and exists (select 1 from public.businesses b where b.id = customers.business_id and b.owner_user_id = (select auth.uid()))
)
with check (
  coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
  and exists (select 1 from public.businesses b where b.id = customers.business_id and b.owner_user_id = (select auth.uid()))
);

drop policy if exists "owners can delete their customers" on public.customers;
create policy "owners can delete their customers"
on public.customers for delete to authenticated
using (
  coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
  and exists (select 1 from public.businesses b where b.id = customers.business_id and b.owner_user_id = (select auth.uid()))
);

drop policy if exists "owners can create their invoices" on public.invoices;
create policy "owners can create their invoices"
on public.invoices for insert to authenticated
with check (
  coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
  and exists (select 1 from public.businesses b where b.id = invoices.business_id and b.owner_user_id = (select auth.uid()))
);

drop policy if exists "owners can update their invoices" on public.invoices;
create policy "owners can update their invoices"
on public.invoices for update to authenticated
using (
  coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
  and exists (select 1 from public.businesses b where b.id = invoices.business_id and b.owner_user_id = (select auth.uid()))
)
with check (
  coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
  and exists (select 1 from public.businesses b where b.id = invoices.business_id and b.owner_user_id = (select auth.uid()))
);
