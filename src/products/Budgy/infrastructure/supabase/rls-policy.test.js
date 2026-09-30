import fs from "fs";
import path from "path";

const migration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609280001_budgy_schema.sql"), "utf8");
const memberMigration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609280002_household_members.sql"), "utf8");
const moneyMigration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609280003_money_accounts.sql"), "utf8");
const refundMigration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609280005_refunds.sql"), "utf8");
const onboardingMigration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609300001_user_onboarding.sql"), "utf8");
const transactionCategoryMigration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609300002_transaction_categories.sql"), "utf8");
const transactionMonthMigration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609300004_transaction_budget_month.sql"), "utf8");
const guidedOnboardingMigration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609300005_guided_onboarding.sql"), "utf8");

it("enables RLS and bases household access on authenticated membership", () => {
  ["households", "household_members", "budget_months", "income_sources", "categories", "budget_items", "transactions", "savings_goals", "scenarios", "scenario_changes", "activity_events", "household_invites", "household_imports"].forEach((table) => {
    expect(migration).toContain(`alter table public.${table} enable row level security`);
  });
  expect(migration).toContain("user_id = auth.uid()");
  expect(migration).toContain("public.is_household_member(household_id)");
  expect(migration).toContain("Owner must belong to the same household");
});

it("secures accounts, transaction actors and cross-household allocations",()=>{
  expect(moneyMigration).toContain("alter table public.financial_accounts enable row level security");
  expect(moneyMigration).toContain("new.created_by:=auth.uid()");
  expect(moneyMigration).toContain("Payment account must belong to the same household");
  expect(moneyMigration).toContain("Budget allocation must belong to the same household and month");
  expect(moneyMigration).toContain("if new.type::text<>'expense' then new.budget_item_id:=null");
  expect(refundMigration).toContain("add value if not exists 'refund'");
  expect(refundMigration).toContain("if new.type::text not in ('expense','refund') then new.budget_item_id:=null");
});

it("keeps profile and membership management scoped to the current user or an owner RPC", () => {
  expect(memberMigration).toContain("update public.profiles set display_name=trim(new_display_name)");
  expect(memberMigration).toContain("if not public.is_household_owner(target_household)");
  expect(memberMigration).toContain("drop policy if exists members_delete");
  expect(memberMigration).toContain("A household must keep at least one owner");
});

it("prevents duplicate months and stores invite hashes instead of raw tokens", () => {
  expect(migration).toContain("unique (household_id, year, month)");
  expect(migration).toContain("token_hash text not null unique");
  expect(migration).not.toMatch(/token text not null/);
});

it("stores per-user onboarding defaults and only completes the authenticated profile",()=>{
  expect(onboardingMigration).toContain("onboarding_completed boolean not null default false");
  expect(onboardingMigration).toContain("onboarding_completed_at timestamptz");
  expect(onboardingMigration).toContain("onboarding_version integer not null default 1");
  expect(onboardingMigration).toContain("where id=auth.uid()");
  expect(onboardingMigration).not.toContain("target_user");
  expect(onboardingMigration).not.toMatch(/complete_my_onboarding\s*\([^)]*uuid/i);
  expect(migration).toContain("profiles_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid())");
});

it("stores monotonic resumable onboarding progress on only the authenticated profile",()=>{
  expect(guidedOnboardingMigration).toContain("onboarding_step integer not null default 0");
  expect(guidedOnboardingMigration).toContain("onboarding_step=greatest(onboarding_step,next_step)");
  expect(guidedOnboardingMigration).toContain("where id=auth.uid() and onboarding_completed=false");
  expect(guidedOnboardingMigration).toContain("onboarding_step=5");
  expect(guidedOnboardingMigration).not.toContain("target_user");
});

it("types transaction categories without guessing legacy income classification",()=>{
  expect(transactionCategoryMigration).toContain("create type public.category_type as enum ('expense','income')");
  expect(transactionCategoryMigration).toContain("update public.categories set category_type='expense'");
  expect(transactionCategoryMigration).toContain("update public.transactions set category_id=null where type::text='income'");
  expect(transactionCategoryMigration).toContain("Income requires an income category");
  expect(transactionCategoryMigration).toContain("Expenses and refunds require an expense category");
  expect(transactionCategoryMigration).toContain("income_source_id");
  expect(transactionCategoryMigration).toContain("('Salary',0)");
});

it("separates transaction dates from household-scoped budget months",()=>{
  expect(transactionMonthMigration).toContain("independent of transaction_date");
  expect(transactionMonthMigration).toContain("bm.household_id=t.household_id");
  expect(transactionMonthMigration).toContain("id=new.budget_month_id and household_id=new.household_id");
  expect(transactionMonthMigration).toContain("budget_month_id=new.budget_month_id");
  expect(transactionMonthMigration).toContain("Choose the budget month this transaction counts toward");
  expect(transactionMonthMigration).toContain("new.budget_month_id:=null");
});
