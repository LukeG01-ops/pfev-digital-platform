-- Applied migration version returned by Supabase: 20261013171828.
-- Supabase may grant ALL to service_role through default privileges.
-- Restrict only the Shift Flow tables; preserve every pre-existing object.
begin;
revoke all on public.sf_members, public.sf_orders, public.sf_code_attempts, public.sf_revocations from service_role;
grant select, insert, update on public.sf_members, public.sf_orders, public.sf_code_attempts to service_role;
grant select, insert on public.sf_revocations to service_role;
commit;
