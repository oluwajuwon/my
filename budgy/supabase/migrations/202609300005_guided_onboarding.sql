begin;

alter table public.profiles
  add column if not exists onboarding_step integer not null default 0;

alter table public.profiles
  add constraint profiles_onboarding_step_range check (onboarding_step between 0 and 5);

create or replace function public.set_my_onboarding_step(next_step integer) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if next_step not between 0 and 5 then raise exception 'Invalid onboarding step'; end if;
  update public.profiles
  set onboarding_step=greatest(onboarding_step,next_step)
  where id=auth.uid() and onboarding_completed=false;
  if not found and not exists(select 1 from public.profiles where id=auth.uid()) then
    raise exception 'Profile not found';
  end if;
end $$;

create or replace function public.complete_my_onboarding(current_version integer) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if current_version < 1 then raise exception 'Invalid onboarding version'; end if;
  update public.profiles
  set onboarding_completed=true,
      onboarding_completed_at=now(),
      onboarding_version=current_version,
      onboarding_step=5
  where id=auth.uid();
  if not found then raise exception 'Profile not found'; end if;
end $$;

revoke all on function public.set_my_onboarding_step(integer) from public;
grant execute on function public.set_my_onboarding_step(integer) to authenticated;

commit;
