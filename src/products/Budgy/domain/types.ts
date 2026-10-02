export type Pence = number;
/** A member user id, or the explicit shared-household sentinel. */
export type Owner = string;
export type BudgetGroup = string;
export type CategoryType = "expense" | "income";
export type AllocationPurpose = "spending" | "debt_payment" | "saving" | "investing";
export const HOUSEHOLD_OWNER = "household";

export interface HouseholdMemberIdentity { id: string; displayName: string; }

export interface IncomeSource { id: string; name: string; owner: Owner; amount: Pence; recurring: boolean; category?: string; preferredAccountId?: string; }
export interface BudgetItem { id: string; name: string; group: BudgetGroup; owner: Owner; amount: Pence; recurring: boolean; trackActuals?: boolean; purpose?: AllocationPurpose; linkedAccountId?: string; }
export interface HouseholdPlan { householdName: string; income: IncomeSource[]; savings: Pence; budget: BudgetItem[]; }
export interface MonthlyPlan extends HouseholdPlan { month: string; }

export interface Transaction {
  id: string; type: "expense" | "income" | "refund" | "transfer" | "credit_card_payment"; amount: Pence; description: string;
  category?: string; owner: Owner; date: string; note?: string; actorUserId?: string;
  accountId?: string; destinationAccountId?: string; budgetItemId?: string; incomeSourceId?: string; savingsGoalId?: string;
  /** YYYY-MM key for the normalized budget_month_id relation. Falls back to the date month for legacy local data. */
  budgetMonth?: string;
}

export type FinancialAccountType = "current_account" | "savings_account" | "credit_card" | "cash" | "other";
export interface FinancialAccount {
  id: string; name: string; owner: Owner; type: FinancialAccountType; currency: string;
  openingBalance: Pence; creditLimit?: Pence; statementBalance?: Pence; paymentDueDate?: string; isActive: boolean;
}

export interface Goal {
  id: string; name: string; icon: string; targetAmount: Pence; currentAmount: Pence;
  targetDate: string; monthlyContribution: Pence; description?: string; fundingAccountId?: string;
}

export interface Scenario {
  id: string; name: string; baseMonth: string; plan: MonthlyPlan;
  oneOffExpenses: Pence; createdAt: string;
}

export interface BudgyData {
  schemaVersion: 1; householdName: string; categories: string[]; incomeCategories: string[];
  members: HouseholdMemberIdentity[];
  months: Record<string, MonthlyPlan>; transactions: Transaction[];
  accounts: FinancialAccount[]; goals: Goal[]; scenarios: Scenario[];
}

export interface HouseholdSummary {
  income: Pence; spending: Pence; savings: Pence; allocated: Pence; remaining: Pence;
  debtPayments: Pence; savingAllocations: Pence; investing: Pence;
  savingsRate: number; spendingRate: number; remainingRate: number;
}

export interface BudgetGroupTotal { group: BudgetGroup; amount: Pence; shareOfSpending: number; }
export interface BudgetActual { group: string; planned: Pence; spent: Pence; remaining: Pence; }
export interface BudgetItemActual { budgetItemId: string; planned: Pence; spent: Pence; remaining: Pence; usedRate: number; }
export interface SavingsProjectionPoint { month: number; contributions: Pence; growth: Pence; balance: Pence; }
export interface ProjectionSummary {
  months: number; income: Pence; spending: Pence; savings: Pence; surplus: Pence;
  savingsRate: number; points: SavingsProjectionPoint[];
}
