-- Development-only seed helper. This file is intentionally not a migration and never runs automatically.
-- After creating a test user and household, run:
--   select public.seed_budgy_example('<household uuid>');
-- Then optionally: drop function public.seed_budgy_example(uuid);

create or replace function public.seed_budgy_example(target_household uuid) returns void
language plpgsql security invoker set search_path = public, pg_temp as $$
declare month_id uuid; category_ids jsonb; member_one uuid; member_two uuid; member_one_name text; member_two_name text; begin
  if not exists(select 1 from public.households where id=target_household) then raise exception 'Household not found'; end if;
  select hm.user_id,p.display_name into member_one,member_one_name from public.household_members hm join public.profiles p on p.id=hm.user_id where hm.household_id=target_household order by hm.joined_at limit 1;
  select hm.user_id,p.display_name into member_two,member_two_name from public.household_members hm join public.profiles p on p.id=hm.user_id where hm.household_id=target_household order by hm.joined_at offset 1 limit 1;
  if member_two is null then raise exception 'The example seed requires two real household members'; end if;
  insert into public.categories(household_id,name,category_type,sort_order) values
    (target_household,'Home','expense',0),(target_household,'Food','expense',1),(target_household,'Transport','expense',2),(target_household,'Subscriptions','expense',3),
    (target_household,'Phones','expense',4),(target_household,'Future plans','expense',5),(target_household,'Giving','expense',6),(target_household,'Personal','expense',7),
    (target_household,'Salary','income',0),(target_household,'Bonus','income',1),(target_household,'Freelance / Side income','income',2),(target_household,'Investment income','income',3),(target_household,'Benefits','income',4),(target_household,'Gift','income',5),(target_household,'Other income','income',6)
  on conflict(household_id,category_type,name) do nothing;
  select jsonb_object_agg(name,id) into category_ids from public.categories where household_id=target_household and category_type='expense';
  insert into public.budget_months(household_id,year,month,savings_target_pence) values(target_household,2026,9,250000)
  on conflict(household_id,year,month) do update set savings_target_pence=excluded.savings_target_pence returning id into month_id;
  delete from public.income_sources where budget_month_id=month_id; delete from public.budget_items where budget_month_id=month_id; delete from public.financial_accounts where household_id=target_household;
  insert into public.income_sources(household_id,budget_month_id,name,owner_user_id,amount_pence,recurring,category_id) values
    (target_household,month_id,member_one_name||' salary',member_one,490000,true,(select id from public.categories where household_id=target_household and category_type='income' and name='Salary')),
    (target_household,month_id,member_two_name||' salary',member_two,260000,true,(select id from public.categories where household_id=target_household and category_type='income' and name='Salary'));
  insert into public.budget_items(household_id,budget_month_id,category_id,name,owner_user_id,owner_label,planned_amount_pence,recurring) values
    (target_household,month_id,(category_ids->>'Home')::uuid,'Rent',null,'Household',160000,true),
    (target_household,month_id,(category_ids->>'Home')::uuid,'Council Tax',null,'Household',20000,true),
    (target_household,month_id,(category_ids->>'Home')::uuid,'Electricity',null,'Household',10300,true),
    (target_household,month_id,(category_ids->>'Home')::uuid,'Water',null,'Household',4000,true),
    (target_household,month_id,(category_ids->>'Home')::uuid,'WiFi',null,'Household',5400,true),
    (target_household,month_id,(category_ids->>'Food')::uuid,'Groceries',null,'Household',35000,true),
    (target_household,month_id,(category_ids->>'Transport')::uuid,member_one_name,member_one,null,42000,true),
    (target_household,month_id,(category_ids->>'Transport')::uuid,member_two_name,member_two,null,25300,true),
    (target_household,month_id,(category_ids->>'Subscriptions')::uuid,'Apple One',null,'Household',3695,true),
    (target_household,month_id,(category_ids->>'Subscriptions')::uuid,'Disney',null,'Household',1499,true),
    (target_household,month_id,(category_ids->>'Subscriptions')::uuid,'Prime',null,'Household',799,true),
    (target_household,month_id,(category_ids->>'Subscriptions')::uuid,'Netflix',null,'Household',650,true),
    (target_household,month_id,(category_ids->>'Phones')::uuid,member_one_name,member_one,null,2340,true),
    (target_household,month_id,(category_ids->>'Phones')::uuid,member_two_name,member_two,null,1000,true),
    (target_household,month_id,(category_ids->>'Future plans')::uuid,'Investments',null,'Household',25000,true),
    (target_household,month_id,(category_ids->>'Future plans')::uuid,'Holidays / Travel',null,'Household',25000,true),
    (target_household,month_id,(category_ids->>'Giving')::uuid,'Family support / gifts',null,'Household',8000,true),
    (target_household,month_id,(category_ids->>'Giving')::uuid,'Tithe',null,'Household',50000,true),
    (target_household,month_id,(category_ids->>'Personal')::uuid,member_two_name,member_two,null,25000,true),
    (target_household,month_id,(category_ids->>'Personal')::uuid,member_one_name,member_one,null,25000,true);
  insert into public.financial_accounts(household_id,owner_user_id,name,type,currency,opening_balance_pence,credit_limit_pence,statement_balance_pence,payment_due_date) values
    (target_household,member_one,member_one_name||' current account','current_account','GBP',0,null,null,null),
    (target_household,member_two,member_two_name||' current account','current_account','GBP',0,null,null,null),
    (target_household,member_one,'Example credit card','credit_card','GBP',0,200000,0,current_date+14);
end $$;
revoke all on function public.seed_budgy_example(uuid) from public, anon, authenticated;
