begin;

alter type public.money_movement_type add value if not exists 'refund';

create or replace function public.validate_transaction_links() returns trigger
language plpgsql set search_path=public,pg_temp as $$ declare destination_type public.financial_account_type; begin
  if new.account_id is not null and not exists(select 1 from public.financial_accounts where id=new.account_id and household_id=new.household_id) then raise exception 'Payment account must belong to the same household'; end if;
  if new.destination_account_id is not null and not exists(select 1 from public.financial_accounts where id=new.destination_account_id and household_id=new.household_id) then raise exception 'Destination account must belong to the same household'; end if;
  if new.budget_item_id is not null and not exists(select 1 from public.budget_items where id=new.budget_item_id and household_id=new.household_id and (new.budget_month_id is null or budget_month_id=new.budget_month_id)) then raise exception 'Budget allocation must belong to the same household and month'; end if;
  if new.type::text in ('transfer','credit_card_payment') and (new.account_id is null or new.destination_account_id is null or new.account_id=new.destination_account_id) then raise exception 'Transfers and card payments require two different accounts'; end if;
  if new.type::text='credit_card_payment' then select type into destination_type from public.financial_accounts where id=new.destination_account_id; if destination_type is distinct from 'credit_card' then raise exception 'A credit-card payment must target a credit-card account'; end if; end if;
  if new.type::text not in ('expense','refund') then new.budget_item_id:=null; end if;
  return new;
end $$;

commit;
