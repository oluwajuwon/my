begin;
create extension if not exists pgcrypto;

do $$ begin create type public.nest_household_role as enum ('owner','parent','caregiver'); exception when duplicate_object then null; end $$;

create table if not exists public.nest_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '', display_name text not null default '', avatar_url text,
  relationship_label text, onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.nest_households (
  id uuid primary key default gen_random_uuid(), name text not null check(char_length(trim(name)) between 1 and 100),
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.nest_household_members (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, role public.nest_household_role not null default 'parent',
  relationship_label text, joined_at timestamptz not null default now(), unique(household_id,user_id)
);
create table if not exists public.nest_household_invitations (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  email text not null check(email=lower(email)), role public.nest_household_role not null default 'parent', token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null, accepted_at timestamptz, invited_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.nest_children (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  name text not null check(char_length(trim(name)) between 1 and 80), date_of_birth date not null, photo_url text, sex text,
  feeding_methods jsonb not null default '[]'::jsonb check(jsonb_typeof(feeding_methods)='array'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,household_id)
);
create table if not exists public.nest_activities (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  child_id uuid not null, type text not null, occurred_at timestamptz not null,
  ended_at timestamptz, created_by uuid not null references auth.users(id), metadata jsonb not null default '{}'::jsonb check(jsonb_typeof(metadata)='object'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,household_id),
  foreign key(child_id,household_id) references public.nest_children(id,household_id) on delete cascade
);
create table if not exists public.nest_medicines (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  child_id uuid not null, name text not null, default_dose numeric not null,
  unit text not null, schedule text check(schedule in ('daily','as-needed')), active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id,household_id), foreign key(child_id,household_id) references public.nest_children(id,household_id) on delete cascade
);
create table if not exists public.nest_medicine_logs (
  id uuid primary key, household_id uuid not null references public.nest_households(id) on delete cascade,
  child_id uuid not null, medicine_id uuid not null,
  dose numeric not null, unit text not null, occurred_at timestamptz not null, created_by uuid not null references auth.users(id),
  foreign key(id,household_id) references public.nest_activities(id,household_id) on delete cascade,
  foreign key(child_id,household_id) references public.nest_children(id,household_id) on delete cascade,
  foreign key(medicine_id,household_id) references public.nest_medicines(id,household_id)
);
create table if not exists public.nest_supplies (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  child_id uuid, name text not null, category text not null,
  quantity numeric not null default 0 check(quantity>=0), unit text not null, estimated_daily_usage numeric, low_stock_threshold numeric not null default 0,
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id,household_id), foreign key(child_id,household_id) references public.nest_children(id,household_id) on delete cascade
);
create table if not exists public.nest_supply_transactions (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  supply_id uuid not null, quantity_delta numeric not null,
  reason text not null, activity_id uuid, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
  foreign key(supply_id,household_id) references public.nest_supplies(id,household_id) on delete cascade,
  foreign key(activity_id,household_id) references public.nest_activities(id,household_id) on delete set null (activity_id)
);
create table if not exists public.nest_shopping_items (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  child_id uuid, supply_id uuid,
  name text not null, reason text, completed boolean not null default false, created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(), completed_at timestamptz,
  foreign key(child_id,household_id) references public.nest_children(id,household_id) on delete cascade,
  foreign key(supply_id,household_id) references public.nest_supplies(id,household_id) on delete set null (supply_id)
);
create table if not exists public.nest_expenses (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  child_id uuid not null, amount_pence integer not null check(amount_pence>=0),
  category text not null, description text not null, occurred_at timestamptz not null, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
  foreign key(child_id,household_id) references public.nest_children(id,household_id) on delete cascade
);
create table if not exists public.nest_child_preferences (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.nest_households(id) on delete cascade,
  child_id uuid not null, category text not null, label text not null,
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(child_id,household_id) references public.nest_children(id,household_id) on delete cascade
);
create table if not exists public.nest_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade, selected_household_id uuid references public.nest_households(id) on delete set null,
  selected_child_id uuid references public.nest_children(id) on delete set null, preferred_quick_actions jsonb not null default '[]'::jsonb,
  dismissed_prompts jsonb not null default '[]'::jsonb, night_care_enabled boolean not null default false,
  preferred_units jsonb not null default '{"temperature":"celsius","volume":"ml"}'::jsonb,
  handover_viewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace function public.nest_is_household_member(target uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from public.nest_household_members where household_id=target and user_id=(select auth.uid()));
$$;
create or replace function public.nest_is_household_owner(target uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from public.nest_household_members where household_id=target and user_id=(select auth.uid()) and role='owner');
$$;
create or replace function public.nest_can_write_household(target uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from public.nest_household_members where household_id=target and user_id=(select auth.uid()) and role in ('owner','parent'));
$$;
revoke all on function public.nest_is_household_member(uuid), public.nest_is_household_owner(uuid), public.nest_can_write_household(uuid) from public;
grant execute on function public.nest_is_household_member(uuid), public.nest_is_household_owner(uuid), public.nest_can_write_household(uuid) to authenticated;

create or replace function public.nest_create_household(household_name text, child_name text, child_birth_date date, feeding text[], relationship text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare hid uuid; begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.nest_households(name,created_by) values(trim(household_name),auth.uid()) returning id into hid;
  insert into public.nest_household_members(household_id,user_id,role,relationship_label) values(hid,auth.uid(),'owner',nullif(trim(relationship),''));
  insert into public.nest_children(household_id,name,date_of_birth,feeding_methods) values(hid,trim(child_name),child_birth_date,to_jsonb(feeding));
  update public.nest_profiles set onboarding_completed=true,relationship_label=nullif(trim(relationship),''),updated_at=now() where id=auth.uid();
  insert into public.nest_user_preferences(user_id,selected_household_id,selected_child_id)
    select auth.uid(),hid,id from public.nest_children where household_id=hid order by created_at limit 1
    on conflict(user_id) do update set selected_household_id=excluded.selected_household_id,selected_child_id=excluded.selected_child_id;
  return hid;
end $$;
create or replace function public.nest_create_invitation(target_household uuid, invite_email text, invite_role public.nest_household_role, invite_hash text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$ declare iid uuid; begin
  if not public.nest_is_household_owner(target_household) then raise exception 'Only an owner may invite household members'; end if;
  insert into public.nest_household_invitations(household_id,email,role,token_hash,expires_at,invited_by)
  values(target_household,lower(trim(invite_email)),invite_role,invite_hash,now()+interval '7 days',auth.uid()) returning id into iid; return iid;
end $$;
create or replace function public.nest_accept_invitation(invite_hash text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$ declare invitation public.nest_household_invitations; hid uuid; begin
  select * into invitation from public.nest_household_invitations where token_hash=invite_hash and accepted_at is null and expires_at>now() for update;
  if invitation.id is null or invitation.email<>lower(coalesce(auth.jwt()->>'email','')) then raise exception 'Invitation is invalid, expired, or belongs to another email'; end if;
  insert into public.nest_household_members(household_id,user_id,role) values(invitation.household_id,auth.uid(),invitation.role) on conflict do nothing;
  update public.nest_household_invitations set accepted_at=now() where id=invitation.id; hid:=invitation.household_id; return hid;
end $$;
revoke all on function public.nest_create_household(text,text,date,text[],text), public.nest_create_invitation(uuid,text,public.nest_household_role,text), public.nest_accept_invitation(text) from public;
grant execute on function public.nest_create_household(text,text,date,text[],text), public.nest_create_invitation(uuid,text,public.nest_household_role,text), public.nest_accept_invitation(text) to authenticated;

create or replace function public.nest_handle_new_user() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ begin
  insert into public.nest_profiles(id,email,display_name) values(new.id,coalesce(new.email,''),coalesce(new.raw_user_meta_data->>'display_name','')) on conflict(id) do nothing;
  insert into public.nest_user_preferences(user_id) values(new.id) on conflict(user_id) do nothing; return new;
end $$;
drop trigger if exists on_auth_user_created_nest on auth.users;
create trigger on_auth_user_created_nest after insert on auth.users for each row execute function public.nest_handle_new_user();

do $$ declare t text; begin foreach t in array array['nest_profiles','nest_households','nest_household_members','nest_household_invitations','nest_children','nest_activities','nest_medicines','nest_medicine_logs','nest_supplies','nest_supply_transactions','nest_shopping_items','nest_expenses','nest_child_preferences','nest_user_preferences'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;
create policy nest_profiles_select on public.nest_profiles for select to authenticated using(nest_profiles.id=(select auth.uid()) or exists(select 1 from public.nest_household_members mine join public.nest_household_members theirs on mine.household_id=theirs.household_id where mine.user_id=(select auth.uid()) and theirs.user_id=nest_profiles.id));
create policy nest_profiles_update on public.nest_profiles for update to authenticated using(nest_profiles.id=(select auth.uid())) with check(nest_profiles.id=(select auth.uid()));
create policy nest_households_select on public.nest_households for select to authenticated using(public.nest_is_household_member(id));
create policy nest_households_update on public.nest_households for update to authenticated using(public.nest_is_household_owner(id)) with check(public.nest_is_household_owner(id));
create policy nest_members_select on public.nest_household_members for select to authenticated using(public.nest_is_household_member(household_id));
create policy nest_invitations_select on public.nest_household_invitations for select to authenticated using(public.nest_is_household_owner(household_id));
create policy nest_invitations_delete on public.nest_household_invitations for delete to authenticated using(public.nest_is_household_owner(household_id));
create policy nest_user_preferences_all on public.nest_user_preferences for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
do $$ declare t text; begin foreach t in array array['nest_children','nest_activities','nest_medicines','nest_medicine_logs','nest_supplies','nest_supply_transactions','nest_shopping_items','nest_expenses','nest_child_preferences'] loop
  execute format('create policy %I_select on public.%I for select to authenticated using(public.nest_is_household_member(household_id))',t,t);
  execute format('create policy %I_insert on public.%I for insert to authenticated with check(public.nest_can_write_household(household_id))',t,t);
  execute format('create policy %I_update on public.%I for update to authenticated using(public.nest_can_write_household(household_id)) with check(public.nest_can_write_household(household_id))',t,t);
  execute format('create policy %I_delete on public.%I for delete to authenticated using(public.nest_can_write_household(household_id))',t,t);
end loop; end $$;
drop policy nest_activities_insert on public.nest_activities;
create policy nest_activities_insert on public.nest_activities for insert to authenticated with check(public.nest_can_write_household(household_id) and created_by=(select auth.uid()));
create index if not exists nest_activities_child_time_idx on public.nest_activities(child_id,occurred_at desc);
create index if not exists nest_members_user_idx on public.nest_household_members(user_id,household_id);
create index if not exists nest_children_household_idx on public.nest_children(household_id);
commit;
