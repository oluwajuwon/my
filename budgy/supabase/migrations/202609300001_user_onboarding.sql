begin;

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists onboarding_version integer not null default 1;

alter table public.profiles
  add constraint profiles_onboarding_version_positive check (onboarding_version >= 1);

create or replace function public.complete_my_onboarding(current_version integer) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if current_version < 1 then raise exception 'Invalid onboarding version'; end if;
  update public.profiles
  set onboarding_completed=true,
      onboarding_completed_at=now(),
      onboarding_version=current_version
  where id=auth.uid();
  if not found then raise exception 'Profile not found'; end if;
end $$;

revoke all on function public.complete_my_onboarding(integer) from public;
grant execute on function public.complete_my_onboarding(integer) to authenticated;

commit;
