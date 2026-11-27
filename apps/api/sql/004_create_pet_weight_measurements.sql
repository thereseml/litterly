-- Requires public.pets(litter_id) with owner-only SELECT RLS.
create table public.pet_weight_measurements (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  weight_grams integer not null check (weight_grams > 0),
  measured_on date not null,
  created_at timestamptz not null default now()
);

create index pet_weight_measurements_pet_date_idx
  on public.pet_weight_measurements(pet_id, measured_on, created_at, id);

alter table public.pet_weight_measurements enable row level security;

revoke all on public.pet_weight_measurements from anon, authenticated, service_role;
grant select, insert on public.pet_weight_measurements to authenticated;

create policy "Breeders can read weights for pets in their litters"
on public.pet_weight_measurements for select to authenticated
using (
  exists (
    select 1
    from public.pets
    join public.litters on litters.id = pets.litter_id
    where pets.id = pet_weight_measurements.pet_id
      and litters.owner_id = (select auth.uid())
  )
);

create policy "Breeders can add weights for pets in their litters"
on public.pet_weight_measurements for insert to authenticated
with check (
  exists (
    select 1
    from public.pets
    join public.litters on litters.id = pets.litter_id
    where pets.id = pet_weight_measurements.pet_id
      and litters.owner_id = (select auth.uid())
  )
);
