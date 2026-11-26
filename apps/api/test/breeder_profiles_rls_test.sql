begin;
select relrowsecurity as rls_enabled,
  not has_table_privilege('service_role', 'public.breeder_profiles', 'select') as service_role_select_revoked
from pg_class
where oid = 'public.breeder_profiles'::regclass;
do $$
declare
  owner_id uuid;
  second_id uuid;
begin
  select user_id into owner_id from public.breeder_profiles limit 1;
  if owner_id is null then raise exception 'no owner profile exists for RLS verification'; end if;
  second_id := gen_random_uuid();
  while second_id = owner_id loop
    second_id := gen_random_uuid();
  end loop;
  insert into auth.users (id, email)
  values (second_id, 'rls-test-' || second_id::text || '@example.invalid');
  perform set_config(
    'litterly.rls_test_owner',
    owner_id::text,
    true
  );
  perform set_config('litterly.rls_test_second', second_id::text, true);
  perform set_config('request.jwt.claim.sub', current_setting('litterly.rls_test_owner'), true);
end;
$$;

set local role authenticated;
do $$
declare
  visible_count integer;
  changed_count integer;
begin
  select count(*) into visible_count from public.breeder_profiles;
  if visible_count <> 1 then raise exception 'owner read returned % profiles', visible_count; end if;

  update public.breeder_profiles
  set kennel_name = '__rls_owner_probe__'
  where user_id = auth.uid();
  get diagnostics changed_count = row_count;
  if changed_count <> 1 then raise exception 'owner update changed % profiles', changed_count; end if;
end;
$$;

do $$
begin
  perform set_config('request.jwt.claim.sub', current_setting('litterly.rls_test_second'), true);
end;
$$;
do $$
declare
  visible_count integer;
  changed_count integer;
begin
  select count(*) into visible_count from public.breeder_profiles;
  if visible_count <> 0 then raise exception 'non-owner read returned % profiles', visible_count; end if;

  update public.breeder_profiles
  set kennel_name = '__rls_stranger_probe__';
  get diagnostics changed_count = row_count;
  if changed_count <> 0 then raise exception 'non-owner update changed % profiles', changed_count; end if;

  perform set_config('request.jwt.claim.sub', current_setting('litterly.rls_test_owner'), true);
  select count(*) into visible_count
  from public.breeder_profiles
  where user_id = auth.uid() and kennel_name = '__rls_owner_probe__';
  if visible_count <> 1 then raise exception 'non-owner update changed the owner profile'; end if;
end;
$$;

select 'owner read/update passed; non-owner read/update denied' as result;

rollback;
