import fs from "fs";
import path from "path";

const migration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609280001_budgy_schema.sql"), "utf8");
const memberMigration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609280002_household_members.sql"), "utf8");
const moneyMigration = fs.readFileSync(path.join(process.cwd(), "budgy/supabase/migrations/202609280003_money_accounts.sql"), "utf8");

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
