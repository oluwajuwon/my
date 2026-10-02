import { householdPlan } from "../data/household";
import {
  calculateHouseholdSummary,
  calculateBudgetActuals,
  calculateProjection,
  calculateScenarioSummary,
  groupBudgetItems,
  projectSavings,
} from "./budget";

it("calculates the household plan entirely in integer pence", () => {
  const summary = calculateHouseholdSummary(householdPlan);

  expect(summary).toEqual({
    income: 750000,
    spending: 469983,
    savings: 250000,
    debtPayments: 0,
    savingAllocations: 0,
    investing: 0,
    allocated: 719983,
    remaining: 30017,
    savingsRate: 1 / 3,
    spendingRate: 469983 / 750000,
    remainingRate: 30017 / 750000,
  });
  expect(Object.values(summary).every(Number.isFinite)).toBe(true);
});

it("groups every budget item without changing the total", () => {
  const grouped = groupBudgetItems(householdPlan);
  expect(grouped.reduce((total, group) => total + group.amount, 0)).toBe(469983);
  expect(grouped[0]).toMatchObject({ group: "Home", amount: 199700 });
});

it("projects savings without assuming investment growth", () => {
  const projection = projectSavings(householdPlan.savings, 60);
  expect(projection[12].balance).toBe(3000000);
  expect(projection[60].balance).toBe(15000000);
  expect(projection[60].growth).toBe(0);
});

it("compares planned and actual category spending in pence", () => {
  const actuals = calculateBudgetActuals(householdPlan, [
    { id: "one", type: "expense", amount: 21420, description: "Food shop", category: "Food", owner: "Household", date: "2026-09-12" },
    { id: "two", type: "expense", amount: 5000, description: "October shop", category: "Food", owner: "Household", date: "2026-10-01" },
  ], "2026-09");
  expect(actuals.find((entry) => entry.group === "Food")).toEqual({ group: "Food", planned: 35000, spent: 21420, remaining: 13580 });
});

it("calculates projections and rounds growth to integer pence", () => {
  const projection = calculateProjection(householdPlan, 12, 5);
  expect(projection.income).toBe(9000000);
  expect(projection.spending).toBe(5639796);
  expect(projection.savings).toBe(3000000);
  expect(projection.surplus).toBe(360204);
  expect(Number.isInteger(projection.points[12].growth)).toBe(true);
  expect(projection.points[12].balance).toBeGreaterThan(3000000);
});

it("calculates a scenario without mutating the current plan", () => {
  const scenario = {
    id: "move", name: "Move house", baseMonth: "2026-09", createdAt: "2026-09-01",
    oneOffExpenses: 100000,
    plan: { ...householdPlan, income: householdPlan.income.map((source) => ({ ...source })), budget: householdPlan.budget.map((item) => ({ ...item })) },
  };
  scenario.plan.income[0].amount += 50000;
  const result = calculateScenarioSummary(scenario);
  expect(result.income).toBe(800000);
  expect(result.spending).toBe(569983);
  expect(result.remaining).toBe(-19983);
  expect(calculateHouseholdSummary(householdPlan).income).toBe(750000);
});
