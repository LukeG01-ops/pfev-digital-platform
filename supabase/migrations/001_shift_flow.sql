-- Apply once to a dedicated Supabase project. Browser users have no table/RPC access.
begin;
create table public.sf_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  redeemed_at timestamptz,
  discount_used_at timestamptz
);
create table public.sf_code_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_at timestamptz not null default now(), attempts integer not null default 0
);
create table public.sf_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null check (product in ('planning','recupero','energia','bundle')),
  amount integer not null,
  discount boolean not null default false,
  state text not null default 'pending' check (state in ('pending','processing','paid','expired','failed','revoked')),
  session_id text unique, payment_intent text unique,
  created_at timestamptz not null default now(), paid_at timestamptz,
  check (amount = case when product='bundle' then 1190 when discount then 368 else 490 end),
  check (not discount or product <> 'bundle')
);
create index sf_orders_owner on public.sf_orders(user_id, created_at desc);
create unique index sf_one_reserved_discount on public.sf_orders(user_id) where discount and state in ('pending','processing');
create table public.sf_revocations (payment_intent text primary key, created_at timestamptz not null default now());
alter table public.sf_members enable row level security;
alter table public.sf_orders enable row level security;
alter table public.sf_code_attempts enable row level security;
alter table public.sf_revocations enable row level security;
revoke all on public.sf_members, public.sf_orders, public.sf_code_attempts, public.sf_revocations from public, anon, authenticated;
grant all on public.sf_members, public.sf_orders, public.sf_code_attempts, public.sf_revocations to service_role;

create function public.sf_allow_attempt(p_user uuid) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
declare a public.sf_code_attempts;
begin
  insert into sf_code_attempts(user_id) values(p_user) on conflict do nothing;
  select * into a from sf_code_attempts where user_id=p_user for update;
  if a.window_at < now()-interval '15 minutes' then
    update sf_code_attempts set window_at=now(), attempts=1 where user_id=p_user; return true;
  end if;
  if a.attempts >= 5 then return false; end if;
  update sf_code_attempts set attempts=attempts+1 where user_id=p_user;
  return true;
end $$;

create function public.sf_redeem(p_user uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into sf_members(user_id, redeemed_at) values(p_user,now())
  on conflict(user_id) do update set redeemed_at=coalesce(sf_members.redeemed_at,excluded.redeemed_at);
end $$;

create function public.sf_start_order(p_user uuid, p_product text, p_discount boolean) returns public.sf_orders
language plpgsql security definer set search_path = public, pg_temp as $$
declare m public.sf_members; o public.sf_orders;
begin
  if p_product not in ('planning','recupero','energia','bundle') then raise exception 'invalid_product'; end if;
  insert into sf_members(user_id) values(p_user) on conflict do nothing;
  select * into m from sf_members where user_id=p_user for update;
  if p_discount then
    if p_product='bundle' or m.redeemed_at is null or m.discount_used_at is not null then raise exception 'discount_unavailable'; end if;
    select * into o from sf_orders where user_id=p_user and discount and state in ('pending','processing') for update;
    if found then
      if o.product=p_product and o.state='pending' then return o; end if;
      raise exception 'discount_reserved';
    end if;
  else
    select * into o from sf_orders where user_id=p_user and product=p_product and not discount and state='pending' order by created_at desc limit 1 for update;
    if found then return o; end if;
  end if;
  insert into sf_orders(user_id,product,amount,discount) values(p_user,p_product,
    case when p_product='bundle' then 1190 when p_discount then 368 else 490 end,p_discount) returning * into o;
  return o;
end $$;

create function public.sf_attach_session(p_order uuid, p_session text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update sf_orders set session_id=p_session where id=p_order and (session_id is null or session_id=p_session);
  if not found then raise exception 'session_conflict'; end if;
end $$;

create function public.sf_transition(p_order uuid, p_session text, p_state text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_state not in ('processing','expired','failed') then raise exception 'invalid_transition'; end if;
  update sf_orders set state=p_state where id=p_order and session_id=p_session and state in ('pending','processing');
end $$;

create function public.sf_fulfill(p_order uuid, p_session text, p_intent text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare o public.sf_orders; m public.sf_members;
begin
  -- Keep the same lock order as checkout: member, then order.
  select * into o from sf_orders where id=p_order;
  if not found then raise exception 'order_missing'; end if;
  select * into m from sf_members where user_id=o.user_id for update;
  select * into o from sf_orders where id=p_order for update;
  if o.session_id <> p_session or o.session_id is null or p_intent is null then raise exception 'payment_conflict'; end if;
  if o.state in ('paid','revoked') then return; end if;
  if o.discount and m.discount_used_at is not null then raise exception 'discount_already_consumed'; end if;
  if exists(select 1 from sf_revocations where payment_intent=p_intent) then
    update sf_orders set state='revoked',payment_intent=p_intent where id=p_order;
    if o.discount then update sf_members set discount_used_at=now() where user_id=o.user_id; end if;
    return;
  end if;
  update sf_orders set state='paid',payment_intent=p_intent,paid_at=now() where id=p_order;
  if o.discount then update sf_members set discount_used_at=now() where user_id=o.user_id; end if;
end $$;

create function public.sf_revoke(p_intent text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_intent is null then raise exception 'intent_missing'; end if;
  insert into sf_revocations(payment_intent) values(p_intent) on conflict do nothing;
  update sf_orders set state='revoked' where payment_intent=p_intent;
end $$;

revoke all on function public.sf_allow_attempt(uuid), public.sf_redeem(uuid), public.sf_start_order(uuid,text,boolean), public.sf_attach_session(uuid,text), public.sf_transition(uuid,text,text), public.sf_fulfill(uuid,text,text), public.sf_revoke(text) from public, anon, authenticated;
grant execute on function public.sf_allow_attempt(uuid), public.sf_redeem(uuid), public.sf_start_order(uuid,text,boolean), public.sf_attach_session(uuid,text), public.sf_transition(uuid,text,text), public.sf_fulfill(uuid,text,text), public.sf_revoke(text) to service_role;
commit;
