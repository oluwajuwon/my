import fs from "fs";
import path from "path";
const migration=fs.readFileSync(path.join(process.cwd(),"nest/supabase/migrations/202610050001_nest_accounts.sql"),"utf8");

describe("Nest household RLS",()=>{
  it("enables RLS on every private household table",()=>{
    ["nest_profiles","nest_households","nest_household_members","nest_household_invitations","nest_children","nest_activities","nest_medicines","nest_medicine_logs","nest_supplies","nest_supply_transactions","nest_shopping_items","nest_expenses","nest_child_preferences","nest_user_preferences"].forEach((table)=>expect(migration).toContain(`'${table}'`));
    expect(migration).toContain("alter table public.%I enable row level security");
    expect(migration).toContain("foreach t in array array['nest_profiles','nest_households'");
  });
  it("scopes reads to membership and writes to owner or parent roles",()=>{
    expect(migration).toContain("public.nest_is_household_member(household_id)");
    expect(migration).toContain("public.nest_can_write_household(household_id)");
    expect(migration).toContain("role in ('owner','parent')");
    expect(migration).toContain("created_by=(select auth.uid())");
    expect(migration).not.toMatch(/using\s*\(\s*true\s*\)/i);
    expect(migration).toContain("foreign key(child_id,household_id)");
  });
  it("accepts only unexpired email-matched hashed invitations",()=>{
    expect(migration).toContain("token_hash text not null unique");
    expect(migration).toContain("expires_at>now()");
    expect(migration).toContain("invitation.email<>lower(coalesce(auth.jwt()->>'email',''))");
    expect(migration).not.toMatch(/\btoken text\b/);
  });
});
