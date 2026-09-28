import {
  BudgetGroup,
  BudgetGroupTotal,
  HouseholdPlan,
  HouseholdSummary,
  Pence,
  SavingsProjectionPoint,
  Transaction,
  BudgetActual,
  ProjectionSummary,
  Scenario,
} from "./types";
import { sumPence } from "./money";

export const groupOrder: BudgetGroup[] = [
  "Home",
  "Food",
  "Transport",
  "Future plans",
  "Giving",
  "Personal",
  "Subscriptions",
  "Phones",
];

export const calculateHouseholdSummary = (
  plan: HouseholdPlan,
): HouseholdSummary => {
  const income = sumPence(plan.income.map((source) => source.amount));
  const spending = sumPence(plan.budget.map((item) => item.amount));
  const allocated = spending + plan.savings;
  const remaining = income - allocated;

  return {
    income,
    spending,
    savings: plan.savings,
    allocated,
    remaining,
    savingsRate: income === 0 ? 0 : plan.savings / income,
    spendingRate: income === 0 ? 0 : spending / income,
    remainingRate: income === 0 ? 0 : remaining / income,
  };
};

export const groupBudgetItems = (
  plan: HouseholdPlan,
): BudgetGroupTotal[] => {
  const spending = sumPence(plan.budget.map((item) => item.amount));
  const totals = new Map<BudgetGroup, Pence>();

  plan.budget.forEach((item) => {
    totals.set(item.group, (totals.get(item.group) ?? 0) + item.amount);
  });

  const orderedGroups = [...groupOrder, ...Array.from(totals.keys()).filter((group) => !groupOrder.includes(group))];

  return orderedGroups
    .filter((group) => totals.has(group))
    .map((group) => {
      const amount = totals.get(group) ?? 0;
      return {
        group,
        amount,
        shareOfSpending: spending === 0 ? 0 : amount / spending,
      };
    });
};

export const projectSavings = (
  monthlySavings: Pence,
  months: number,
  annualGrowthRate = 0,
): SavingsProjectionPoint[] =>
  Array.from({ length: months + 1 }).reduce<SavingsProjectionPoint[]>((points, _, month) => {
    if (month === 0) return [{ month: 0, contributions: 0, growth: 0, balance: 0 }];
    const previous = points[month - 1];
    const monthlyGrowth = Math.round(previous.balance * (annualGrowthRate / 100 / 12));
    const contributions = monthlySavings * month;
    const balance = previous.balance + monthlySavings + monthlyGrowth;
    points.push({ month, contributions, growth: balance - contributions, balance });
    return points;
  }, []);

export const calculateBudgetActuals = (
  plan: HouseholdPlan,
  transactions: Transaction[],
  month: string,
): BudgetActual[] => {
  const planned = groupBudgetItems(plan);
  const spent = new Map<string, Pence>();
  transactions
    .filter((transaction) => (transaction.type === "expense"||transaction.type==="refund") && transaction.date.startsWith(month))
    .forEach((transaction) => {
      const allocatedItem = plan.budget.find((item) => item.id === transaction.budgetItemId);
      const group = allocatedItem?.group ?? transaction.category;
      spent.set(group, (spent.get(group) ?? 0) + (transaction.type==="refund"?-transaction.amount:transaction.amount));
    });
  const groups = new Set([...planned.map((group) => group.group), ...Array.from(spent.keys())]);
  return Array.from(groups).map((group) => {
    const plannedAmount = planned.find((entry) => entry.group === group)?.amount ?? 0;
    const spentAmount = spent.get(group) ?? 0;
    return { group, planned: plannedAmount, spent: spentAmount, remaining: plannedAmount - spentAmount };
  });
};

export const calculateProjection = (
  plan: HouseholdPlan,
  months: number,
  annualGrowthRate = 0,
): ProjectionSummary => {
  const summary = calculateHouseholdSummary(plan);
  return {
    months,
    income: summary.income * months,
    spending: summary.spending * months,
    savings: summary.savings * months,
    surplus: summary.remaining * months,
    savingsRate: summary.savingsRate,
    points: projectSavings(summary.savings, months, annualGrowthRate),
  };
};

export const calculateScenarioSummary = (scenario: Scenario): HouseholdSummary => {
  const summary = calculateHouseholdSummary(scenario.plan);
  const spending = summary.spending + scenario.oneOffExpenses;
  const allocated = spending + summary.savings;
  return {
    ...summary,
    spending,
    allocated,
    remaining: summary.income - allocated,
    spendingRate: summary.income === 0 ? 0 : spending / summary.income,
    remainingRate: summary.income === 0 ? 0 : (summary.income - allocated) / summary.income,
  };
};
