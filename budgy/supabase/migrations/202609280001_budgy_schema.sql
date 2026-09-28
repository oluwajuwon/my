begin;

create extension if not exists pgcrypto;
create type public.household_role as enum ('owner', 'member');
create type public.budget_month_status as enum ('open', 'closed');
create type public.money_movement_type as enum ('income', 'expense');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.households (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(trim(name)) between 1 and 100),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.household_role not null default 'member', joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);
create index household_members_user_idx on public.household_members(user_id);

create or replace function public.is_household_member(target_household uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$ select exists(select 1 from public.household_members where household_id = target_household and user_id = auth.uid()) $$;
create or replace function public.is_household_owner(target_household uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$ select exists(select 1 from public.household_members where household_id = target_household and user_id = auth.uid() and role = 'owner') $$;
create or replace function public.shares_household_with(target_user uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$ select exists(select 1 from public.household_members mine join public.household_members theirs using (household_id) where mine.user_id = auth.uid() and theirs.user_id = target_user) $$;

create table public.budget_months (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  year smallint not null check (year between 2000 and 2200), month smallint not null check (month between 1 and 12),
  savings_target_pence bigint not null default 0 check (savings_target_pence >= 0),
  status public.budget_month_status not null default 'open', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (household_id, year, month), unique (id, household_id)
);
create index budget_months_household_idx on public.budget_months(household_id, year desc, month desc);
create table public.categories (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80), icon_key text, sort_order integer not null default 0,
  created_at timestamptz not null default now(), unique (household_id, name), unique (id, household_id)
);
create table public.income_sources (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  budget_month_id uuid not null, name text not null check (char_length(trim(name)) between 1 and 120),
  owner_user_id uuid references auth.users(id) on delete set null, owner_label text check (owner_label is null or char_length(owner_label) <= 80),
  amount_pence bigint not null check (amount_pence >= 0), recurring boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (budget_month_id, household_id) references public.budget_months(id, household_id) on delete cascade
);
create index income_sources_month_idx on public.income_sources(budget_month_id);
create table public.budget_items (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  budget_month_id uuid not null, category_id uuid not null, name text not null check (char_length(trim(name)) between 1 and 120),
  owner_user_id uuid references auth.users(id) on delete set null, owner_label text check (owner_label is null or char_length(owner_label) <= 80),
  planned_amount_pence bigint not null check (planned_amount_pence >= 0), recurring boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (budget_month_id, household_id) references public.budget_months(id, household_id) on delete cascade,
  foreign key (category_id, household_id) references public.categories(id, household_id) on delete restrict
);
create index budget_items_month_idx on public.budget_items(budget_month_id);
create table public.transactions (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  budget_month_id uuid, category_id uuid, type public.money_movement_type not null,
  amount_pence bigint not null check (amount_pence > 0), description text not null check (char_length(trim(description)) between 1 and 160),
  owner_user_id uuid references auth.users(id) on delete set null, owner_label text check (owner_label is null or char_length(owner_label) <= 80),
  transaction_date date not null, note text check (note is null or char_length(note) <= 1000),
  created_by uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (budget_month_id, household_id) references public.budget_months(id, household_id) on delete set null (budget_month_id),
  foreign key (category_id, household_id) references public.categories(id, household_id) on delete set null (category_id)
);
create index transactions_household_date_idx on public.transactions(household_id, transaction_date desc);
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120), icon_key text,
  target_amount_pence bigint not null check (target_amount_pence > 0), current_amount_pence bigint not null default 0 check (current_amount_pence >= 0),
  monthly_contribution_pence bigint not null default 0 check (monthly_contribution_pence >= 0), target_date date,
  description text check (description is null or char_length(description) <= 1000), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index savings_goals_household_idx on public.savings_goals(household_id);
create table public.scenarios (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120), base_budget_month_id uuid,
  created_by uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (base_budget_month_id, household_id) references public.budget_months(id, household_id) on delete set null (base_budget_month_id)
);
create index scenarios_household_idx on public.scenarios(household_id);
create table public.scenario_changes (
  id uuid primary key default gen_random_uuid(), scenario_id uuid not null references public.scenarios(id) on delete cascade,
  change_type text not null check (change_type in ('snapshot','create','update','delete')),
  entity_type text not null check (entity_type in ('plan','income_source','budget_item','savings','one_off_expense')),
  entity_id uuid, payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 1048576), created_at timestamptz not null default now()
);
create index scenario_changes_scenario_idx on public.scenario_changes(scenario_id);
create table public.activity_events (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null, event_type text not null, entity_type text not null,
  entity_id uuid, metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 32768),
  created_at timestamptz not null default now()
);
create index activity_events_household_idx on public.activity_events(household_id, created_at desc);
create table public.household_invites (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  email text not null check (email = lower(email) and char_length(email) between 3 and 320), token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  role public.household_role not null default 'member', expires_at timestamptz not null,
  accepted_at timestamptz, created_by uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now()
);
create index household_invites_household_idx on public.household_invites(household_id, created_at desc);
create table public.household_imports (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  dataset_hash text not null check (dataset_hash ~ '^[0-9a-f]{64}$'), imported_by uuid not null references auth.users(id) on delete restrict,
  imported_at timestamptz not null default now(), unique (household_id, dataset_hash)
);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public, pg_temp as $$ begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['profiles','households','budget_months','income_sources','budget_items','transactions','savings_goals','scenarios'] loop execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t); end loop; end $$;

create or replace function public.create_household(household_name text, member_display_name text) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare new_id uuid; begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(household_name)) not between 1 and 100 or char_length(trim(member_display_name)) not between 1 and 80 then raise exception 'Invalid household details'; end if;
  insert into public.profiles(id, display_name) values(auth.uid(), trim(member_display_name)) on conflict(id) do update set display_name=excluded.display_name;
  insert into public.households(name, created_by) values(trim(household_name), auth.uid()) returning id into new_id;
  insert into public.household_members(household_id,user_id,role) values(new_id,auth.uid(),'owner');
  return new_id;
end $$;
create or replace function public.create_household_invite(target_household uuid, invite_email text, invite_token_hash text) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare invite_id uuid; begin
  if not public.is_household_owner(target_household) then raise exception 'Only a household owner can invite members'; end if;
  if invite_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'Invalid invite token'; end if;
  insert into public.household_invites(household_id,email,token_hash,role,expires_at,created_by)
  values(target_household,lower(trim(invite_email)),invite_token_hash,'member',now()+interval '7 days',auth.uid()) returning id into invite_id;
  return invite_id;
end $$;
create or replace function public.accept_household_invite(invite_token_hash text, member_display_name text) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare found public.household_invites; user_email text; begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  user_email := lower(coalesce(auth.jwt()->>'email',''));
  select * into found from public.household_invites where token_hash=invite_token_hash and accepted_at is null and expires_at>now() for update;
  if found.id is null or found.email<>user_email then raise exception 'Invite is invalid, expired, or belongs to another email'; end if;
  insert into public.profiles(id,display_name) values(auth.uid(),trim(member_display_name)) on conflict(id) do update set display_name=excluded.display_name;
  insert into public.household_members(household_id,user_id,role) values(found.household_id,auth.uid(),found.role) on conflict do nothing;
  update public.household_invites set accepted_at=now() where id=found.id;
  return found.household_id;
end $$;
revoke all on function public.create_household(text,text), public.create_household_invite(uuid,text,text), public.accept_household_invite(text,text) from public;
grant execute on function public.create_household(text,text), public.create_household_invite(uuid,text,text), public.accept_household_invite(text,text) to authenticated;

create or replace function public.audit_financial_change() returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare row_data jsonb; old_data jsonb; h uuid; eid uuid; label text; begin
  row_data := case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end; old_data := case when tg_op='UPDATE' then to_jsonb(old) else null end;
  h := (row_data->>'household_id')::uuid; eid := (row_data->>'id')::uuid; label := coalesce(row_data->>'name',row_data->>'description','');
  insert into public.activity_events(household_id,actor_user_id,event_type,entity_type,entity_id,metadata)
  values(h,auth.uid(),lower(tg_table_name)||'.'||lower(tg_op),tg_table_name,eid,
    jsonb_strip_nulls(jsonb_build_object('label',label,'old_amount_pence',coalesce(old_data->>'planned_amount_pence',old_data->>'amount_pence',old_data->>'current_amount_pence'),'new_amount_pence',coalesce(row_data->>'planned_amount_pence',row_data->>'amount_pence',row_data->>'current_amount_pence'),'category_id',row_data->>'category_id','type',row_data->>'type')));
  return case when tg_op='DELETE' then old else new end;
end $$;
create trigger audit_income after insert or update or delete on public.income_sources for each row execute function public.audit_financial_change();
create trigger audit_budget after insert or update or delete on public.budget_items for each row execute function public.audit_financial_change();
create trigger audit_transactions after insert or update or delete on public.transactions for each row execute function public.audit_financial_change();
create trigger audit_goals after insert or update or delete on public.savings_goals for each row execute function public.audit_financial_change();

create or replace function public.validate_financial_owner() returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if new.owner_user_id is not null and not exists(select 1 from public.household_members where household_id=new.household_id and user_id=new.owner_user_id) then
    raise exception 'Owner must belong to the same household';
  end if;
  return new;
end $$;
create trigger validate_income_owner before insert or update on public.income_sources for each row execute function public.validate_financial_owner();
create trigger validate_budget_owner before insert or update on public.budget_items for each row execute function public.validate_financial_owner();
create trigger validate_transaction_owner before insert or update on public.transactions for each row execute function public.validate_financial_owner();

alter table public.profiles enable row level security; alter table public.households enable row level security; alter table public.household_members enable row level security;
alter table public.budget_months enable row level security; alter table public.income_sources enable row level security; alter table public.categories enable row level security;
alter table public.budget_items enable row level security; alter table public.transactions enable row level security; alter table public.savings_goals enable row level security;
alter table public.scenarios enable row level security; alter table public.scenario_changes enable row level security; alter table public.activity_events enable row level security;
alter table public.household_invites enable row level security; alter table public.household_imports enable row level security;

create policy profiles_select on public.profiles for select to authenticated using (id=auth.uid() or public.shares_household_with(id));
create policy profiles_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy households_select on public.households for select to authenticated using(public.is_household_member(id));
create policy households_update on public.households for update to authenticated using(public.is_household_owner(id)) with check(public.is_household_owner(id));
create policy members_select on public.household_members for select to authenticated using(public.is_household_member(household_id));
create policy members_delete on public.household_members for delete to authenticated using(user_id=auth.uid() or public.is_household_owner(household_id));

do $$ declare t text; begin foreach t in array array['budget_months','income_sources','categories','budget_items','transactions','savings_goals','scenarios'] loop
  execute format('create policy %I_select on public.%I for select to authenticated using(public.is_household_member(household_id))',t,t);
  execute format('create policy %I_insert on public.%I for insert to authenticated with check(public.is_household_member(household_id))',t,t);
  execute format('create policy %I_update on public.%I for update to authenticated using(public.is_household_member(household_id)) with check(public.is_household_member(household_id))',t,t);
  execute format('create policy %I_delete on public.%I for delete to authenticated using(public.is_household_member(household_id))',t,t);
end loop; end $$;
drop policy transactions_insert on public.transactions;
create policy transactions_insert on public.transactions for insert to authenticated with check(public.is_household_member(household_id) and created_by=auth.uid());
drop policy scenarios_insert on public.scenarios;
create policy scenarios_insert on public.scenarios for insert to authenticated with check(public.is_household_member(household_id) and created_by=auth.uid());
create policy scenario_changes_select on public.scenario_changes for select to authenticated using(exists(select 1 from public.scenarios s where s.id=scenario_id and public.is_household_member(s.household_id)));
create policy scenario_changes_insert on public.scenario_changes for insert to authenticated with check(exists(select 1 from public.scenarios s where s.id=scenario_id and public.is_household_member(s.household_id)));
create policy scenario_changes_update on public.scenario_changes for update to authenticated using(exists(select 1 from public.scenarios s where s.id=scenario_id and public.is_household_member(s.household_id))) with check(exists(select 1 from public.scenarios s where s.id=scenario_id and public.is_household_member(s.household_id)));
create policy scenario_changes_delete on public.scenario_changes for delete to authenticated using(exists(select 1 from public.scenarios s where s.id=scenario_id and public.is_household_member(s.household_id)));
create policy activity_select on public.activity_events for select to authenticated using(public.is_household_member(household_id));
create policy invites_select on public.household_invites for select to authenticated using(public.is_household_owner(household_id));
create policy invites_delete on public.household_invites for delete to authenticated using(public.is_household_owner(household_id));
create policy imports_select on public.household_imports for select to authenticated using(public.is_household_member(household_id));
create policy imports_insert on public.household_imports for insert to authenticated with check(public.is_household_member(household_id) and imported_by=auth.uid());

alter publication supabase_realtime add table public.budget_months, public.income_sources, public.categories, public.budget_items, public.transactions, public.savings_goals, public.scenarios, public.activity_events;
commit;
