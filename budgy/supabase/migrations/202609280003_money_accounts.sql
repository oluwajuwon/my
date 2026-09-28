begin;

alter type public.money_movement_type add value if not exists 'transfer';
alter type public.money_movement_type add value if not exists 'credit_card_payment';

create type public.financial_account_type as enum ('current_account','savings_account','credit_card','cash','other');

create table public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 120),
  type public.financial_account_type not null,
  currency text not null default 'GBP' check (currency ~ '^[A-Z]{3}$'),
  opening_balance_pence bigint not null default 0,
  credit_limit_pence bigint check (credit_limit_pence is null or credit_limit_pence >= 0),
  statement_balance_pence bigint check (statement_balance_pence is null or statement_balance_pence >= 0),
  payment_due_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(id,household_id),
  check (type='credit_card' or (credit_limit_pence is null and statement_balance_pence is null and payment_due_date is null))
);
create index financial_accounts_household_idx on public.financial_accounts(household_id,is_active);

alter table public.budget_items add column track_actuals boolean not null default true;
alter table public.budget_items add constraint budget_items_id_household_unique unique(id,household_id);
alter table public.transactions add column account_id uuid;
alter table public.transactions add column destination_account_id uuid;
alter table public.transactions add column budget_item_id uuid;
alter table public.transactions add constraint transactions_account_household_fk foreign key(account_id,household_id) references public.financial_accounts(id,household_id) on delete set null(account_id);
alter table public.transactions add constraint transactions_destination_account_household_fk foreign key(destination_account_id,household_id) references public.financial_accounts(id,household_id) on delete set null(destination_account_id);
alter table public.transactions add constraint transactions_budget_item_household_fk foreign key(budget_item_id,household_id) references public.budget_items(id,household_id) on delete set null(budget_item_id);

-- Preserve old transactions and allocate only unambiguous same-month/category/owner matches.
update public.transactions t set budget_item_id=(
  select bi.id from public.budget_items bi
  where bi.household_id=t.household_id and bi.budget_month_id=t.budget_month_id and bi.category_id=t.category_id
    and bi.owner_user_id is not distinct from t.owner_user_id
    and coalesce(bi.owner_label,'Household')=coalesce(t.owner_label,'Household')
  order by bi.created_at limit 1
) where t.type::text='expense' and t.budget_item_id is null;

create trigger set_financial_accounts_updated_at before update on public.financial_accounts for each row execute function public.set_updated_at();
create trigger validate_financial_account_owner before insert or update on public.financial_accounts for each row execute function public.validate_financial_owner();

create or replace function public.remove_household_member(target_household uuid,target_user uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$ declare member_name text; target_role public.household_role; begin
  if not public.is_household_owner(target_household) then raise exception 'Only a household owner can remove members'; end if;
  select hm.role,p.display_name into target_role,member_name from public.household_members hm join public.profiles p on p.id=hm.user_id where hm.household_id=target_household and hm.user_id=target_user;
  if target_role is null then raise exception 'Member not found'; end if;
  if target_role='owner' and (select count(*) from public.household_members where household_id=target_household and role='owner')<=1 then raise exception 'A household must keep at least one owner'; end if;
  update public.income_sources set owner_user_id=null,owner_label=member_name where household_id=target_household and owner_user_id=target_user;
  update public.budget_items set owner_user_id=null,owner_label=member_name where household_id=target_household and owner_user_id=target_user;
  update public.transactions set owner_user_id=null,owner_label=member_name where household_id=target_household and owner_user_id=target_user;
  update public.financial_accounts set owner_user_id=null where household_id=target_household and owner_user_id=target_user;
  update public.scenario_changes sc set payload=replace(sc.payload::text,to_jsonb(target_user::text)::text,to_jsonb('legacy:'||member_name)::text)::jsonb where exists(select 1 from public.scenarios s where s.id=sc.scenario_id and s.household_id=target_household) and sc.payload::text like '%'||target_user::text||'%';
  delete from public.household_members where household_id=target_household and user_id=target_user;
end $$;

create or replace function public.secure_transaction_actor() returns trigger
language plpgsql set search_path=public,pg_temp as $$ begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if tg_op='INSERT' then new.created_by:=auth.uid(); else new.created_by:=old.created_by; end if;
  return new;
end $$;
create trigger secure_transaction_actor before insert or update on public.transactions for each row execute function public.secure_transaction_actor();

create or replace function public.validate_transaction_links() returns trigger
language plpgsql set search_path=public,pg_temp as $$ declare destination_type public.financial_account_type; begin
  if new.account_id is not null and not exists(select 1 from public.financial_accounts where id=new.account_id and household_id=new.household_id) then raise exception 'Payment account must belong to the same household'; end if;
  if new.destination_account_id is not null and not exists(select 1 from public.financial_accounts where id=new.destination_account_id and household_id=new.household_id) then raise exception 'Destination account must belong to the same household'; end if;
  if new.budget_item_id is not null and not exists(select 1 from public.budget_items where id=new.budget_item_id and household_id=new.household_id and (new.budget_month_id is null or budget_month_id=new.budget_month_id)) then raise exception 'Budget allocation must belong to the same household and month'; end if;
  if new.type::text in ('transfer','credit_card_payment') and (new.account_id is null or new.destination_account_id is null or new.account_id=new.destination_account_id) then raise exception 'Transfers and card payments require two different accounts'; end if;
  if new.type::text='credit_card_payment' then select type into destination_type from public.financial_accounts where id=new.destination_account_id; if destination_type is distinct from 'credit_card' then raise exception 'A credit-card payment must target a credit-card account'; end if; end if;
  if new.type::text<>'expense' then new.budget_item_id:=null; end if;
  return new;
end $$;
create trigger validate_transaction_links before insert or update on public.transactions for each row execute function public.validate_transaction_links();

create or replace function public.audit_financial_change() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare row_data jsonb; old_data jsonb; h uuid; eid uuid; label text; begin
  row_data:=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end; old_data:=case when tg_op='UPDATE' then to_jsonb(old) else null end;
  h:=(row_data->>'household_id')::uuid; eid:=(row_data->>'id')::uuid; label:=coalesce(row_data->>'name',row_data->>'description','');
  insert into public.activity_events(household_id,actor_user_id,event_type,entity_type,entity_id,metadata)
  values(h,auth.uid(),lower(tg_table_name)||'.'||lower(tg_op),tg_table_name,eid,jsonb_strip_nulls(jsonb_build_object(
    'label',label,'old_amount_pence',coalesce(old_data->>'planned_amount_pence',old_data->>'amount_pence',old_data->>'current_amount_pence'),
    'new_amount_pence',coalesce(row_data->>'planned_amount_pence',row_data->>'amount_pence',row_data->>'current_amount_pence'),
    'category_id',row_data->>'category_id','type',row_data->>'type','owner_user_id',row_data->>'owner_user_id',
    'account_id',row_data->>'account_id','destination_account_id',row_data->>'destination_account_id','budget_item_id',row_data->>'budget_item_id')));
  return case when tg_op='DELETE' then old else new end;
end $$;
create trigger audit_financial_accounts after insert or update or delete on public.financial_accounts for each row execute function public.audit_financial_change();

alter table public.financial_accounts enable row level security;
create policy financial_accounts_select on public.financial_accounts for select to authenticated using(public.is_household_member(household_id));
create policy financial_accounts_insert on public.financial_accounts for insert to authenticated with check(public.is_household_member(household_id));
create policy financial_accounts_update on public.financial_accounts for update to authenticated using(public.is_household_member(household_id)) with check(public.is_household_member(household_id));
create policy financial_accounts_delete on public.financial_accounts for delete to authenticated using(public.is_household_member(household_id));

alter publication supabase_realtime add table public.financial_accounts;

commit;
