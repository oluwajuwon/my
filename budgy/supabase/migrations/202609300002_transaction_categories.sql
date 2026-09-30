begin;

create type public.category_type as enum ('expense','income');

alter table public.categories
  add column category_type public.category_type not null default 'expense';

-- Every category created before this migration belonged to the expense budget.
update public.categories set category_type='expense';

alter table public.categories drop constraint categories_household_id_name_key;
alter table public.categories add constraint categories_household_type_name_unique
  unique(household_id,category_type,name);

insert into public.categories(household_id,name,category_type,sort_order)
select h.id,defaults.name,'income'::public.category_type,defaults.sort_order
from public.households h
cross join (values
  ('Salary',0),('Bonus',1),('Freelance / Side income',2),
  ('Investment income',3),('Benefits',4),('Gift',5),('Other income',6)
) as defaults(name,sort_order)
on conflict(household_id,category_type,name) do nothing;

alter table public.income_sources
  add constraint income_sources_id_household_unique unique(id,household_id),
  add column category_id uuid,
  add column preferred_account_id uuid;

alter table public.income_sources
  add constraint income_sources_category_household_fk
    foreign key(category_id,household_id) references public.categories(id,household_id) on delete set null(category_id),
  add constraint income_sources_account_household_fk
    foreign key(preferred_account_id,household_id) references public.financial_accounts(id,household_id) on delete set null(preferred_account_id);

alter table public.transactions add column income_source_id uuid;
alter table public.transactions add constraint transactions_income_source_household_fk
  foreign key(income_source_id,household_id) references public.income_sources(id,household_id) on delete set null(income_source_id);

-- Old income records may have been assigned an expense category by the old UI.
-- Preserve the transaction, but do not guess its income classification.
update public.transactions set category_id=null where type::text='income';
update public.transactions set category_id=null where type::text in ('transfer','credit_card_payment');

create or replace function public.validate_income_source_links() returns trigger
language plpgsql set search_path=public,pg_temp as $$
begin
  if new.category_id is not null and not exists(
    select 1 from public.categories
    where id=new.category_id and household_id=new.household_id and category_type='income'
  ) then raise exception 'Income source category must be an income category in the same household'; end if;
  if new.preferred_account_id is not null and not exists(
    select 1 from public.financial_accounts
    where id=new.preferred_account_id and household_id=new.household_id
  ) then raise exception 'Preferred income account must belong to the same household'; end if;
  return new;
end $$;
create trigger validate_income_source_links before insert or update on public.income_sources
for each row execute function public.validate_income_source_links();

create or replace function public.validate_budget_category() returns trigger
language plpgsql set search_path=public,pg_temp as $$
begin
  if not exists(
    select 1 from public.categories
    where id=new.category_id and household_id=new.household_id and category_type='expense'
  ) then raise exception 'Budget items require an expense category in the same household'; end if;
  return new;
end $$;
create trigger validate_budget_category before insert or update on public.budget_items
for each row execute function public.validate_budget_category();

create or replace function public.validate_transaction_links() returns trigger
language plpgsql set search_path=public,pg_temp as $$
declare destination_type public.financial_account_type; selected_category public.category_type;
begin
  if new.account_id is not null and not exists(select 1 from public.financial_accounts where id=new.account_id and household_id=new.household_id) then raise exception 'Payment account must belong to the same household'; end if;
  if new.destination_account_id is not null and not exists(select 1 from public.financial_accounts where id=new.destination_account_id and household_id=new.household_id) then raise exception 'Destination account must belong to the same household'; end if;
  if new.budget_item_id is not null and not exists(select 1 from public.budget_items where id=new.budget_item_id and household_id=new.household_id and (new.budget_month_id is null or budget_month_id=new.budget_month_id)) then raise exception 'Budget allocation must belong to the same household and month'; end if;
  if new.income_source_id is not null and not exists(select 1 from public.income_sources where id=new.income_source_id and household_id=new.household_id) then raise exception 'Income source must belong to the same household'; end if;
  if new.category_id is not null then select category_type into selected_category from public.categories where id=new.category_id and household_id=new.household_id; end if;

  if new.type::text in ('expense','refund') then
    if new.account_id is null then raise exception 'Expenses and refunds require an account'; end if;
    if selected_category is distinct from 'expense' then raise exception 'Expenses and refunds require an expense category'; end if;
    new.destination_account_id:=null; new.income_source_id:=null;
  elsif new.type::text='income' then
    if new.account_id is null then raise exception 'Income requires a destination account'; end if;
    if new.category_id is null and tg_op='INSERT' then raise exception 'New income requires an income category'; end if;
    if new.category_id is not null and selected_category is distinct from 'income' then raise exception 'Income requires an income category'; end if;
    new.destination_account_id:=null; new.budget_item_id:=null;
  elsif new.type::text in ('transfer','credit_card_payment') then
    if new.account_id is null or new.destination_account_id is null or new.account_id=new.destination_account_id then raise exception 'Transfers and card payments require two different accounts'; end if;
    new.category_id:=null; new.budget_item_id:=null; new.income_source_id:=null;
  end if;

  if new.type::text='credit_card_payment' then
    select type into destination_type from public.financial_accounts where id=new.destination_account_id;
    if destination_type is distinct from 'credit_card' then raise exception 'A credit-card payment must target a credit-card account'; end if;
  end if;
  return new;
end $$;

create or replace function public.audit_financial_change() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare row_data jsonb; old_data jsonb; h uuid; eid uuid; label text; begin
  row_data:=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end; old_data:=case when tg_op='UPDATE' then to_jsonb(old) else null end;
  h:=(row_data->>'household_id')::uuid; eid:=(row_data->>'id')::uuid; label:=coalesce(row_data->>'name',row_data->>'description','');
  insert into public.activity_events(household_id,actor_user_id,event_type,entity_type,entity_id,metadata)
  values(h,auth.uid(),lower(tg_table_name)||'.'||lower(tg_op),tg_table_name,eid,jsonb_strip_nulls(jsonb_build_object(
    'label',label,'old_amount_pence',coalesce(old_data->>'planned_amount_pence',old_data->>'amount_pence',old_data->>'current_amount_pence'),
    'new_amount_pence',coalesce(row_data->>'planned_amount_pence',row_data->>'amount_pence',row_data->>'current_amount_pence'),
    'category_id',row_data->>'category_id','type',row_data->>'type','owner_user_id',row_data->>'owner_user_id',
    'account_id',row_data->>'account_id','destination_account_id',row_data->>'destination_account_id',
    'budget_item_id',row_data->>'budget_item_id','income_source_id',row_data->>'income_source_id')));
  return case when tg_op='DELETE' then old else new end;
end $$;

commit;
