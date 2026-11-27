-- Requires public.pets from 001_create_pets.sql.
alter table public.pets
  add column added_order bigint generated always as identity;

do $$
declare
  insertion_sequence regclass := pg_get_serial_sequence('public.pets', 'added_order')::regclass;
begin
  execute format('revoke all on sequence %s from anon, authenticated, service_role', insertion_sequence);
  execute format('grant usage on sequence %s to authenticated', insertion_sequence);
end;
$$;

drop index if exists public.pets_litter_id_created_at_idx;

create index pets_litter_id_created_at_added_order_idx
  on public.pets(litter_id, created_at, added_order);
