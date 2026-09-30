import { Transaction } from "./types";
import { transactionBudgetMonth } from "./months";

export interface TransactionViewFilter {
  ledgerMonth: string;
  budgetMonth?: string;
  budgetItemId?: string;
}

/** Ledger views follow the money date; budget drill-downs follow the assigned plan month. */
export const transactionMatchesView = (transaction: Transaction, filter: TransactionViewFilter) => {
  const monthMatches = filter.budgetMonth
    ? transactionBudgetMonth(transaction) === filter.budgetMonth
    : transaction.date.startsWith(filter.ledgerMonth);
  return monthMatches && (!filter.budgetItemId || transaction.budgetItemId === filter.budgetItemId);
};
