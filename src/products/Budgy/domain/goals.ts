import { Goal, Pence, Transaction } from "./types";

export const goalContributions = (goalId: string, transactions: Transaction[]): Pence => transactions
  .filter((transaction) => transaction.type === "transfer" && transaction.savingsGoalId === goalId)
  .reduce((total, transaction) => total + transaction.amount, 0);

/** currentAmount is the starting balance entered when a goal is created or migrated. */
export const goalBalance = (goal: Goal, transactions: Transaction[]): Pence =>
  goal.currentAmount + goalContributions(goal.id, transactions);

export const goalContributionsForMonth = (goalId: string, transactions: Transaction[], month: string): Pence =>
  goalContributions(goalId, transactions.filter((transaction) => transaction.date.startsWith(month)));
