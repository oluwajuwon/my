import { householdPlan, initialBudgyData } from "../data/household";
import { normaliseLocalData } from "../application/localMigration";
import { ownerFields, ownerValue, validScenario } from "./budgyRepository";

const household = {
  household: { id: "house-1", name: "Our home", created_by: "user-a", created_at: "", updated_at: "" },
  membership: { household_id: "house-1", user_id: "user-a", role: "owner", joined_at: "" },
  members: [
    { userId: "user-a", displayName: "Juwon", role: "owner" },
    { userId: "user-b", displayName: "Ada", role: "member" },
  ],
};

it("maps database owners to stable member ids and preserves explicit legacy labels", () => {
  expect(ownerValue("user-b", null)).toBe("user-b");
  expect(ownerFields("user-b", household)).toEqual({ owner_user_id: "user-b", owner_label: null });
  expect(ownerFields("legacy:Old label", household)).toEqual({ owner_user_id: null, owner_label: "Old label" });
});

it("regenerates local identifiers without changing integer-pence values", () => {
  const migrated = normaliseLocalData(initialBudgyData, household, { Juwon: "user-a", Wife: "user-b" });
  expect(migrated.householdName).toBe("Our home");
  expect(migrated.members).toEqual([{ id: "user-a", displayName: "Juwon" }, { id: "user-b", displayName: "Ada" }]);
  expect(migrated.months["2026-09"].income.map((row) => row.owner)).toEqual(["user-a", "user-b"]);
  expect(migrated.months["2026-09"].income[1].name).toBe("Ada salary");
  expect(migrated.months["2026-09"].budget.find((row) => row.id !== householdPlan.budget[0].id && row.group === "Phones" && row.owner === "user-b").name).toBe("Ada");
  expect(migrated.months["2026-09"].income.reduce((sum, row) => sum + row.amount, 0)).toBe(750000);
  expect(migrated.months["2026-09"].budget.reduce((sum, row) => sum + row.amount, 0)).toBe(469983);
  expect(migrated.months["2026-09"].budget[0].id).not.toBe(householdPlan.budget[0].id);
});

it("rejects unsafe or incomplete scenario JSON payloads", () => {
  expect(validScenario({ plan: householdPlan, oneOffExpenses: 10000, baseMonth: "2026-09" })).toBe(true);
  expect(validScenario({ plan: { income: [] }, oneOffExpenses: 0, baseMonth: "2026-09" })).toBe(false);
  expect(validScenario({ plan: householdPlan, oneOffExpenses: 12.5, baseMonth: "2026-09" })).toBe(false);
});
