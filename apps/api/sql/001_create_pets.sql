-- Requires public.litters(id uuid, owner_id uuid) with owner-only SELECT RLS.
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  litter_id uuid not null references public.litters(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  sex text not null check (sex in ('male', 'female')),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pets_litter_id_created_at_idx on public.pets(litter_id, created_at, id);

create function public.set_pet_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pets_set_updated_at
before update on public.pets
for each row execute function public.set_pet_updated_at();

revoke all on function public.set_pet_updated_at() from public, anon, authenticated;

alter table public.pets enable row level security;

revoke all on public.pets from anon, authenticated;
grant select, insert on public.pets to authenticated;
grant update (name, sex, notes) on public.pets to authenticated;

create policy "Breeders can read pets in their litters"
on public.pets for select to authenticated
using (
  exists (
    select 1 from public.litters
    where litters.id = pets.litter_id
      and litters.owner_id = (select auth.uid())
  )
);

create policy "Breeders can add pets to their litters"
on public.pets for insert to authenticated
with check (
  exists (
    select 1 from public.litters
    where litters.id = pets.litter_id
      and litters.owner_id = (select auth.uid())
  )
);

create policy "Breeders can update pets in their litters"
on public.pets for update to authenticated
using (
  exists (
    select 1 from public.litters
    where litters.id = pets.litter_id
      and litters.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.litters
    where litters.id = pets.litter_id
      and litters.owner_id = (select auth.uid())
  )
);
