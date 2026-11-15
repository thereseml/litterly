create table public.litters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  species text not null check (species in ('cat', 'dog')),
  name text not null check (
    name = btrim(name) and char_length(name) between 1 and 100
  ),
  -- Compare DATE to DATE in UTC, never to a session-local timestamp or CURRENT_DATE.
  born_on date not null check (
    born_on >= date '0001-01-01'
    and born_on <= (now() at time zone 'UTC')::date
  ),
  count integer not null check (count between 1 and 30),
  mother_name text check (char_length(mother_name) <= 100),
  father_name text check (char_length(father_name) <= 100),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);

create index litters_owner_id_born_on_idx on public.litters (owner_id, born_on desc);

alter table public.litters enable row level security;

create policy litters_select_own on public.litters
  for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy litters_insert_own on public.litters
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

revoke all on table public.litters from public, anon, authenticated;
grant select, insert on table public.litters to authenticated;
