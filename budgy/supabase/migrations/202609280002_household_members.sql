begin;

alter table public.profiles add column email text;
alter table public.profiles add column avatar_url text check (avatar_url is null or char_length(avatar_url) <= 2048);
update public.profiles p set email=lower(u.email) from auth.users u where u.id=p.id;
alter table public.profiles alter column email set not null;
alter table public.profiles add constraint profiles_email_format check (email=lower(email) and char_length(email) between 3 and 320);

create or replace function public.sync_auth_profile() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.profiles(id,display_name,email,avatar_url)
  values(new.id,coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'New member'),lower(new.email),nullif(new.raw_user_meta_data->>'avatar_url',''))
  on conflict(id) do update set email=excluded.email;
  return new;
end $$;
create trigger sync_auth_profile after insert or update of email on auth.users for each row execute function public.sync_auth_profile();

create or replace function public.create_household(household_name text, member_display_name text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare new_id uuid; user_email text; begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(household_name)) not between 1 and 100 or char_length(trim(member_display_name)) not between 1 and 80 then raise exception 'Invalid household details'; end if;
  user_email:=lower(coalesce(auth.jwt()->>'email',''));
  insert into public.profiles(id,display_name,email) values(auth.uid(),trim(member_display_name),user_email)
  on conflict(id) do update set display_name=excluded.display_name,email=excluded.email;
  insert into public.households(name,created_by) values(trim(household_name),auth.uid()) returning id into new_id;
  insert into public.household_members(household_id,user_id,role) values(new_id,auth.uid(),'owner');
  return new_id;
end $$;

create or replace function public.accept_household_invite(invite_token_hash text, member_display_name text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare found public.household_invites; user_email text; begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  user_email:=lower(coalesce(auth.jwt()->>'email',''));
  select * into found from public.household_invites where token_hash=invite_token_hash and accepted_at is null and expires_at>now() for update;
  if found.id is null or found.email<>user_email then raise exception 'Invite is invalid, expired, or belongs to another email'; end if;
  insert into public.profiles(id,display_name,email) values(auth.uid(),trim(member_display_name),user_email)
  on conflict(id) do update set display_name=excluded.display_name,email=excluded.email;
  insert into public.household_members(household_id,user_id,role) values(found.household_id,auth.uid(),found.role) on conflict do nothing;
  update public.household_invites set accepted_at=now() where id=found.id;
  return found.household_id;
end $$;

create or replace function public.rename_household(target_household uuid,new_name text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$ begin
  if not public.is_household_owner(target_household) then raise exception 'Only a household owner can rename this household'; end if;
  if char_length(trim(new_name)) not between 1 and 100 then raise exception 'Invalid household name'; end if;
  update public.households set name=trim(new_name) where id=target_household;
end $$;

create or replace function public.update_my_profile(new_display_name text,new_avatar_url text default null) returns void
language plpgsql security definer set search_path=public,pg_temp as $$ begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(new_display_name)) not between 1 and 80 then raise exception 'Invalid display name'; end if;
  update public.profiles set display_name=trim(new_display_name),avatar_url=nullif(trim(new_avatar_url),'') where id=auth.uid();
end $$;

create or replace function public.cancel_household_invite(target_invite uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$ declare h uuid; begin
  select household_id into h from public.household_invites where id=target_invite and accepted_at is null;
  if h is null or not public.is_household_owner(h) then raise exception 'Only a household owner can cancel this invitation'; end if;
  delete from public.household_invites where id=target_invite;
end $$;

create or replace function public.remove_household_member(target_household uuid,target_user uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$ declare member_name text; target_role public.household_role; begin
  if not public.is_household_owner(target_household) then raise exception 'Only a household owner can remove members'; end if;
  select hm.role,p.display_name into target_role,member_name from public.household_members hm join public.profiles p on p.id=hm.user_id where hm.household_id=target_household and hm.user_id=target_user;
  if target_role is null then raise exception 'Member not found'; end if;
  if target_role='owner' and (select count(*) from public.household_members where household_id=target_household and role='owner')<=1 then raise exception 'A household must keep at least one owner'; end if;
  update public.income_sources set owner_user_id=null,owner_label=member_name where household_id=target_household and owner_user_id=target_user;
  update public.budget_items set owner_user_id=null,owner_label=member_name where household_id=target_household and owner_user_id=target_user;
  update public.transactions set owner_user_id=null,owner_label=member_name where household_id=target_household and owner_user_id=target_user;
  update public.scenario_changes sc set payload=replace(sc.payload::text,to_jsonb(target_user::text)::text,to_jsonb('legacy:'||member_name)::text)::jsonb
  where exists(select 1 from public.scenarios s where s.id=sc.scenario_id and s.household_id=target_household) and sc.payload::text like '%'||target_user::text||'%';
  delete from public.household_members where household_id=target_household and user_id=target_user;
end $$;

drop policy if exists members_delete on public.household_members;

revoke all on function public.rename_household(uuid,text),public.update_my_profile(text,text),public.cancel_household_invite(uuid),public.remove_household_member(uuid,uuid) from public;
grant execute on function public.rename_household(uuid,text),public.update_my_profile(text,text),public.cancel_household_invite(uuid),public.remove_household_member(uuid,uuid) to authenticated;

commit;
