begin;

create type public.allocation_purpose as enum ('spending','debt_payment','saving','investing');

alter table public.budget_items
  add column allocation_purpose public.allocation_purpose not null default 'spending',
  add column linked_account_id uuid,
  alter column category_id drop not null;

alter table public.budget_items
  add constraint budget_items_linked_account_household_fk
    foreign key(linked_account_id,household_id)
    references public.financial_accounts(id,household_id)
    on delete restrict,
  add constraint budget_items_purpose_shape check (
    (allocation_purpose='spending' and category_id is not null and linked_account_id is null)
    or (allocation_purpose='debt_payment' and category_id is null and linked_account_id is not null)
    or (allocation_purpose in ('saving','investing') and category_id is null and linked_account_id is null)
  );

create index budget_items_purpose_idx on public.budget_items(household_id,budget_month_id,allocation_purpose);
create index budget_items_linked_account_idx on public.budget_items(linked_account_id) where linked_account_id is not null;

drop trigger if exists validate_budget_category on public.budget_items;

create or replace function public.validate_budget_purpose() returns trigger
language plpgsql set search_path=public,pg_temp as $$
begin
  if new.allocation_purpose='debt_payment' and not exists(
    select 1 from public.financial_accounts
    where id=new.linked_account_id and household_id=new.household_id
      and type='credit_card' and is_active=true
  ) then raise exception 'Choose an active credit-card account for this payment plan'; end if;
  if new.allocation_purpose='spending' and not exists(
    select 1 from public.categories
    where id=new.category_id and household_id=new.household_id and category_type='expense'
  ) then raise exception 'Spending allocations require an expense category in the same household'; end if;
  return new;
end $$;
create trigger validate_budget_purpose before insert or update on public.budget_items
for each row execute function public.validate_budget_purpose();

-- Card payments may now fulfil a monthly debt-payment allocation. They remain
-- transfers between accounts and never become expense/spending transactions.
create or replace function public.validate_transaction_links() returns trigger
language plpgsql set search_path=public,pg_temp as $$
declare
  destination_type public.financial_account_type;
  selected_category public.category_type;
  selected_purpose public.allocation_purpose;
  linked_debt_account uuid;
  goal_account uuid;
begin
  if new.account_id is not null and not exists(select 1 from public.financial_accounts where id=new.account_id and household_id=new.household_id) then raise exception 'Payment account must belong to the same household'; end if;
  if new.destination_account_id is not null and not exists(select 1 from public.financial_accounts where id=new.destination_account_id and household_id=new.household_id) then raise exception 'Destination account must belong to the same household'; end if;
  if new.budget_month_id is not null and not exists(select 1 from public.budget_months where id=new.budget_month_id and household_id=new.household_id) then raise exception 'Budget month must belong to the same household'; end if;
  if new.budget_item_id is not null then
    select allocation_purpose,linked_account_id into selected_purpose,linked_debt_account
    from public.budget_items where id=new.budget_item_id and household_id=new.household_id and budget_month_id=new.budget_month_id;
    if not found then raise exception 'Budget allocation must belong to the same household and budget month'; end if;
  end if;
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
    if new.budget_item_id is not null and selected_purpose is distinct from 'spending' then raise exception 'Expenses can only count against an everyday-spending allocation'; end if;
    new.destination_account_id:=null; new.income_source_id:=null; new.savings_goal_id:=null;
  elsif new.type::text='income' then
    if new.account_id is null then raise exception 'Income requires a destination account'; end if;
    if new.budget_month_id is null then raise exception 'Choose the budget month this income counts toward'; end if;
    if new.category_id is null and tg_op='INSERT' then raise exception 'New income requires an income category'; end if;
    if new.category_id is not null and selected_category is distinct from 'income' then raise exception 'Income requires an income category'; end if;
    new.destination_account_id:=null; new.budget_item_id:=null; new.savings_goal_id:=null;
  elsif new.type::text='transfer' then
    if new.account_id is null or new.destination_account_id is null or new.account_id=new.destination_account_id then raise exception 'Transfers require two different accounts'; end if;
    new.budget_month_id:=null; new.category_id:=null; new.budget_item_id:=null; new.income_source_id:=null;
  elsif new.type::text='credit_card_payment' then
    if new.account_id is null or new.destination_account_id is null or new.account_id=new.destination_account_id then raise exception 'Card payments require two different accounts'; end if;
    select type into destination_type from public.financial_accounts where id=new.destination_account_id;
    if destination_type is distinct from 'credit_card' then raise exception 'A credit-card payment must target a credit-card account'; end if;
    if new.budget_item_id is not null then
      if new.budget_month_id is null then raise exception 'Choose the month this planned card payment counts toward'; end if;
      if selected_purpose is distinct from 'debt_payment' then raise exception 'Card payments can only fulfil a debt-payment allocation'; end if;
      if linked_debt_account is distinct from new.destination_account_id then raise exception 'This payment plan belongs to a different credit card'; end if;
    end if;
    new.category_id:=null; new.income_source_id:=null; new.savings_goal_id:=null;
  end if;

  if new.type::text='transfer' and new.savings_goal_id is not null then
    if goal_account is null then raise exception 'Connect the goal to a savings account before adding money'; end if;
    if new.destination_account_id is distinct from goal_account then raise exception 'Goal contributions must go to the account connected to the goal'; end if;
    select type into destination_type from public.financial_accounts where id=new.destination_account_id;
    if destination_type is distinct from 'savings_account' then raise exception 'Goal contributions must go to a savings account'; end if;
  end if;
  return new;
end $$;

create or replace function public.move_budget_money(
  target_household uuid,
  target_budget_month uuid,
  destination_item uuid,
  move_amount_pence bigint,
  source_item uuid default null,
  confirm_over_plan boolean default false
) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare source_row public.budget_items; destination_row public.budget_items; available bigint; actual bigint; begin
  if not public.is_household_member(target_household) then raise exception 'Household membership required'; end if;
  if move_amount_pence<=0 then raise exception 'Enter an amount greater than zero'; end if;
  select * into destination_row from public.budget_items where id=destination_item and household_id=target_household and budget_month_id=target_budget_month for update;
  if destination_row.id is null then raise exception 'Destination allocation was not found in this month'; end if;
  if source_item is not null then
    if source_item=destination_item then raise exception 'Choose two different purposes'; end if;
    select * into source_row from public.budget_items where id=source_item and household_id=target_household and budget_month_id=target_budget_month for update;
    if source_row.id is null then raise exception 'Source allocation was not found in this month'; end if;
    if source_row.planned_amount_pence<move_amount_pence then raise exception 'There is not enough planned money to move'; end if;
    select coalesce(sum(case when t.type::text='refund' then -t.amount_pence else t.amount_pence end),0) into actual
    from public.transactions t where t.budget_item_id=source_item and t.budget_month_id=target_budget_month
      and ((source_row.allocation_purpose='spending' and t.type::text in ('expense','refund')) or (source_row.allocation_purpose='debt_payment' and t.type::text='credit_card_payment'));
    if source_row.planned_amount_pence-move_amount_pence<actual and not confirm_over_plan then raise exception 'This move would put the source allocation over plan. Confirm the over-plan result to continue'; end if;
    update public.budget_items set planned_amount_pence=planned_amount_pence-move_amount_pence where id=source_item;
  else
    select coalesce(sum(i.amount_pence),0)-bm.savings_target_pence-coalesce((select sum(b.planned_amount_pence) from public.budget_items b where b.budget_month_id=target_budget_month),0)
      into available from public.budget_months bm left join public.income_sources i on i.budget_month_id=bm.id
      where bm.id=target_budget_month and bm.household_id=target_household group by bm.savings_target_pence;
    if coalesce(available,0)<move_amount_pence then raise exception 'There is not enough unallocated income to assign'; end if;
  end if;
  update public.budget_items set planned_amount_pence=planned_amount_pence+move_amount_pence where id=destination_item;
  insert into public.activity_events(household_id,actor_user_id,event_type,entity_type,entity_id,metadata)
  values(target_household,auth.uid(),'budget.reallocated','budget_items',destination_item,jsonb_build_object(
    'amount_pence',move_amount_pence,'from_item_id',source_item,'from_label',coalesce(source_row.name,'Unallocated'),
    'to_item_id',destination_item,'to_label',destination_row.name,'budget_month_id',target_budget_month));
end $$;

revoke all on function public.move_budget_money(uuid,uuid,uuid,bigint,uuid,boolean) from public;
grant execute on function public.move_budget_money(uuid,uuid,uuid,bigint,uuid,boolean) to authenticated;

comment on column public.budget_items.allocation_purpose is 'What planned household money is intended to do. Spending is consumption; debt payments fulfil card repayments without becoming new spending.';
comment on column public.transactions.budget_item_id is 'Confirmed monthly allocation fulfilled by this transaction, including spending items and debt-payment items.';

commit;
