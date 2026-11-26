create table public.breeder_profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  kennel_name text check (
    kennel_name is null or char_length(btrim(kennel_name)) between 1 and 100
  )
);

alter table public.breeder_profiles enable row level security;

revoke all on public.breeder_profiles from anon, authenticated, service_role;
grant select on public.breeder_profiles to authenticated;
grant insert (kennel_name) on public.breeder_profiles to authenticated;
grant update (kennel_name) on public.breeder_profiles to authenticated;

create policy "Breeders can read their own profile"
on public.breeder_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Breeders can create their own profile"
on public.breeder_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Breeders can update their own profile"
on public.breeder_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
