begin;

-- budget_month_id is the explicit planning period. transaction_date remains the
-- date money actually moved and continues to drive ledgers and account balances.
comment on column public.transactions.budget_month_id is
  'Planning period this income, expense, or refund counts toward; independent of transaction_date.';

-- Preserve legacy behaviour by assigning existing planning transactions to the
-- calendar month of their transaction date. No financial records are discarded.
insert into public.budget_months(household_id,year,month,savings_target_pence)
select distinct t.household_id,
  extract(year from t.transaction_date)::integer,
  extract(month from t.transaction_date)::integer,
  0
from public.transactions t
where t.type::text in ('expense','refund','income')
  and t.budget_month_id is null
on conflict(household_id,year,month) do nothing;

update public.transactions t
set budget_month_id=bm.id
from public.budget_months bm
where t.type::text in ('expense','refund','income')
  and t.budget_month_id is null
  and bm.household_id=t.household_id
  and bm.year=extract(year from t.transaction_date)::integer
  and bm.month=extract(month from t.transaction_date)::integer;

update public.transactions
set budget_month_id=null, budget_item_id=null, income_source_id=null
where type::text in ('transfer','credit_card_payment');

create index if not exists transactions_budget_month_idx
  on public.transactions(household_id,budget_month_id);

create or replace function public.validate_transaction_links() returns trigger
language plpgsql set search_path=public,pg_temp as $$
declare
  destination_type public.financial_account_type;
  selected_category public.category_type;
  goal_account uuid;
begin
  if new.account_id is not null and not exists(select 1 from public.financial_accounts where id=new.account_id and household_id=new.household_id) then raise exception 'Payment account must belong to the same household'; end if;
  if new.destination_account_id is not null and not exists(select 1 from public.financial_accounts where id=new.destination_account_id and household_id=new.household_id) then raise exception 'Destination account must belong to the same household'; end if;
  if new.budget_month_id is not null and not exists(select 1 from public.budget_months where id=new.budget_month_id and household_id=new.household_id) then raise exception 'Budget month must belong to the same household'; end if;
  if new.budget_item_id is not null and not exists(select 1 from public.budget_items where id=new.budget_item_id and household_id=new.household_id and budget_month_id=new.budget_month_id) then raise exception 'Budget allocation must belong to the same household and budget month'; end if;
  if new.income_source_id is not null and not exists(select 1 from public.income_sources where id=new.income_source_id and household_id=new.household_id and budget_month_id=new.budget_month_id) then raise exception 'Income source must belong to the same household and budget month'; end if;
  if new.savings_goal_id is not null then
    select funding_account_id into goal_account from public.savings_goals where id=new.savings_goal_id and household_id=new.household_id;
    if not found then raise exception 'Savings goal must belong to the same household'; end if;
  end if;
  if new.category_id is not null then select category_type into selected_category from public.categories where id=new.category_id and household_id=new.household_id; end if;

  if new.type::text in ('expense','refund') then
    if new.account_id is null then raise exception 'Expenses and refunds require an account'; end if;
    if new.budget_month_id is null then raise exception 'Choose the budget month this transaction counts toward'; end if;
    if selected_category is distinct from 'expense' then raise exception 'Expenses and refunds require an expense category'; end if;
    new.destination_account_id:=null; new.income_source_id:=null; new.savings_goal_id:=null;
  elsif new.type::text='income' then
    if new.account_id is null then raise exception 'Income requires a destination account'; end if;
    if new.budget_month_id is null then raise exception 'Choose the budget month this income counts toward'; end if;
    if new.category_id is null and tg_op='INSERT' then raise exception 'New income requires an income category'; end if;
    if new.category_id is not null and selected_category is distinct from 'income' then raise exception 'Income requires an income category'; end if;
    new.destination_account_id:=null; new.budget_item_id:=null; new.savings_goal_id:=null;
  elsif new.type::text in ('transfer','credit_card_payment') then
    if new.account_id is null or new.destination_account_id is null or new.account_id=new.destination_account_id then raise exception 'Transfers and card payments require two different accounts'; end if;
    new.budget_month_id:=null; new.category_id:=null; new.budget_item_id:=null; new.income_source_id:=null;
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

commit;
