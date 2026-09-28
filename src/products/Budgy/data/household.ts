import { BudgyData, MonthlyPlan } from "../domain/types";

// Phase 2 compatibility fixture. Its historical owner labels are never used as identities;
// localMigration requires the user to map them to real household member IDs.

export const initialMonth = "2026-09";

export const householdPlan: MonthlyPlan = {
  month: initialMonth,
  householdName: "Our household",
  income: [
    { id: "income-juwon", name: "Juwon salary", owner: "Juwon", amount: 490_000, recurring: true },
    { id: "income-wife", name: "Wife salary", owner: "Wife", amount: 260_000, recurring: true },
  ],
  savings: 250_000,
  budget: [
    { id: "rent", name: "Rent", group: "Home", owner: "Household", amount: 160_000, recurring: true },
    { id: "apple-one", name: "Apple One", group: "Subscriptions", owner: "Household", amount: 3_695, recurring: true },
    { id: "disney", name: "Disney", group: "Subscriptions", owner: "Household", amount: 1_499, recurring: true },
    { id: "prime", name: "Prime", group: "Subscriptions", owner: "Household", amount: 799, recurring: true },
    { id: "netflix", name: "Netflix", group: "Subscriptions", owner: "Household", amount: 650, recurring: true },
    { id: "council-tax", name: "Council Tax", group: "Home", owner: "Household", amount: 20_000, recurring: true },
    { id: "electricity", name: "Electricity", group: "Home", owner: "Household", amount: 10_300, recurring: true },
    { id: "water", name: "Water", group: "Home", owner: "Household", amount: 4_000, recurring: true },
    { id: "wifi", name: "WiFi", group: "Home", owner: "Household", amount: 5_400, recurring: true },
    { id: "phone-juwon", name: "Juwon", group: "Phones", owner: "Juwon", amount: 2_340, recurring: true },
    { id: "phone-wife", name: "Wife", group: "Phones", owner: "Wife", amount: 1_000, recurring: true },
    { id: "transport-juwon", name: "Juwon", group: "Transport", owner: "Juwon", amount: 42_000, recurring: true },
    { id: "transport-wife", name: "Wife", group: "Transport", owner: "Wife", amount: 25_300, recurring: true },
    { id: "groceries", name: "Groceries", group: "Food", owner: "Household", amount: 35_000, recurring: true },
    { id: "investments", name: "Investments", group: "Future plans", owner: "Household", amount: 25_000, recurring: true },
    { id: "travel", name: "Holidays / Travel", group: "Future plans", owner: "Household", amount: 25_000, recurring: true },
    { id: "family-support", name: "Family support / gifts", group: "Giving", owner: "Household", amount: 8_000, recurring: true },
    { id: "personal-wife", name: "Wife", group: "Personal", owner: "Wife", amount: 25_000, recurring: true },
    { id: "personal-husband", name: "Juwon", group: "Personal", owner: "Juwon", amount: 25_000, recurring: true },
    { id: "tithe", name: "Tithe", group: "Giving", owner: "Household", amount: 50_000, recurring: true },
  ],
};

export const defaultCategories = ["Home", "Food", "Transport", "Subscriptions", "Phones", "Future plans", "Giving", "Personal"];

export const initialBudgyData: BudgyData = {
  schemaVersion: 1,
  householdName: "Our household",
  members: [],
  categories: defaultCategories,
  months: { [initialMonth]: householdPlan },
  transactions: [], accounts: [], goals: [], scenarios: [],
};
