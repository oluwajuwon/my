begin;

alter table public.savings_goals
  add constraint savings_goals_id_household_unique unique(id,household_id),
  add column funding_account_id uuid;

alter table public.savings_goals
  add constraint savings_goals_funding_account_household_fk
    foreign key(funding_account_id,household_id)
    references public.financial_accounts(id,household_id)
    on delete set null(funding_account_id);

alter table public.transactions add column savings_goal_id uuid;
alter table public.transactions
  add constraint transactions_savings_goal_household_fk
    foreign key(savings_goal_id,household_id)
    references public.savings_goals(id,household_id)
    on delete set null(savings_goal_id);

create index transactions_savings_goal_idx on public.transactions(savings_goal_id)
  where savings_goal_id is not null;

create or replace function public.validate_savings_goal_account() returns trigger
language plpgsql set search_path=public,pg_temp as $$
begin
  if new.funding_account_id is not null and not exists(
    select 1 from public.financial_accounts
    where id=new.funding_account_id
      and household_id=new.household_id
      and type='savings_account'
      and is_active=true
  ) then raise exception 'A goal must use an active savings account in the same household'; end if;
  return new;
end $$;

create trigger validate_savings_goal_account before insert or update on public.savings_goals
for each row execute function public.validate_savings_goal_account();

create or replace function public.validate_transaction_links() returns trigger
language plpgsql set search_path=public,pg_temp as $$
declare
  destination_type public.financial_account_type;
  selected_category public.category_type;
  goal_account uuid;
begin
  if new.account_id is not null and not exists(select 1 from public.financial_accounts where id=new.account_id and household_id=new.household_id) then raise exception 'Payment account must belong to the same household'; end if;
  if new.destination_account_id is not null and not exists(select 1 from public.financial_accounts where id=new.destination_account_id and household_id=new.household_id) then raise exception 'Destination account must belong to the same household'; end if;
  if new.budget_item_id is not null and not exists(select 1 from public.budget_items where id=new.budget_item_id and household_id=new.household_id and (new.budget_month_id is null or budget_month_id=new.budget_month_id)) then raise exception 'Budget allocation must belong to the same household and month'; end if;
  if new.income_source_id is not null and not exists(select 1 from public.income_sources where id=new.income_source_id and household_id=new.household_id) then raise exception 'Income source must belong to the same household'; end if;
  if new.savings_goal_id is not null then
    select funding_account_id into goal_account from public.savings_goals where id=new.savings_goal_id and household_id=new.household_id;
    if not found then raise exception 'Savings goal must belong to the same household'; end if;
  end if;
  if new.category_id is not null then select category_type into selected_category from public.categories where id=new.category_id and household_id=new.household_id; end if;

  if new.type::text in ('expense','refund') then
    if new.account_id is null then raise exception 'Expenses and refunds require an account'; end if;
    if selected_category is distinct from 'expense' then raise exception 'Expenses and refunds require an expense category'; end if;
    new.destination_account_id:=null; new.income_source_id:=null; new.savings_goal_id:=null;
  elsif new.type::text='income' then
    if new.account_id is null then raise exception 'Income requires a destination account'; end if;
    if new.category_id is null and tg_op='INSERT' then raise exception 'New income requires an income category'; end if;
    if new.category_id is not null and selected_category is distinct from 'income' then raise exception 'Income requires an income category'; end if;
    new.destination_account_id:=null; new.budget_item_id:=null; new.savings_goal_id:=null;
  elsif new.type::text in ('transfer','credit_card_payment') then
    if new.account_id is null or new.destination_account_id is null or new.account_id=new.destination_account_id then raise exception 'Transfers and card payments require two different accounts'; end if;
    new.category_id:=null; new.budget_item_id:=null; new.income_source_id:=null;
    if new.type::text='credit_card_payment' then new.savings_goal_id:=null; end if;
  end if;

  if new.type::text='credit_card_payment' then
    select type into destination_type from public.financial_accounts where id=new.destination_account_id;
    if destination_type is distinct from 'credit_card' then raise exception 'A credit-card payment must target a credit-card account'; end if;
  elsif new.type::text='transfer' and new.savings_goal_id is not null then
    if goal_account is null then raise exception 'Connect the goal to a savings account before adding money'; end if;
    if new.destination_account_id is distinct from goal_account then raise exception 'Goal contributions must go to the account connected to the goal'; end if;
    select type into destination_type from public.financial_accounts where id=new.destination_account_id;
    if destination_type is distinct from 'savings_account' then raise exception 'Goal contributions must go to a savings account'; end if;
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
    'budget_item_id',row_data->>'budget_item_id','income_source_id',row_data->>'income_source_id',
    'savings_goal_id',row_data->>'savings_goal_id','funding_account_id',row_data->>'funding_account_id')));
  return case when tg_op='DELETE' then old else new end;
end $$;

commit;
