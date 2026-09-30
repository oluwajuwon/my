import { BudgetItem, BudgetItemActual, FinancialAccount, Pence, Transaction } from "./types";
import { transactionBudgetMonth } from "./months";

export interface AccountBalance extends FinancialAccount { balance: Pence; availableCredit?: Pence; }

export const isMonthlyExpense = (transaction: Transaction) => transaction.type === "expense";
export const spendingEffect = (transaction: Transaction) => transaction.type === "expense" ? transaction.amount : transaction.type === "refund" ? -transaction.amount : 0;

export const budgetItemActual = (item: BudgetItem, transactions: Transaction[], month: string): BudgetItemActual => {
  const spent = transactions
    .filter((transaction) => (transaction.type === "expense"||transaction.type==="refund") && transactionBudgetMonth(transaction)===month && transaction.budgetItemId === item.id)
    .reduce((sum, transaction) => sum + spendingEffect(transaction), 0);
  return { budgetItemId: item.id, planned: item.amount, spent, remaining: item.amount - spent, usedRate: item.amount === 0 ? (spent ? 1 : 0) : spent / item.amount };
};

export const suggestBudgetItem = (owner: string, category: string, items: BudgetItem[]) => {
  const normal = category.trim().toLowerCase();
  const desired = ["shopping", "eating out"].includes(normal) ? "personal" : normal;
  const tracked = items.filter((item) => item.trackActuals !== false);
  return tracked.find((item) => item.owner === owner && (item.group.toLowerCase() === desired || item.name.toLowerCase() === desired))
    ?? tracked.find((item) => item.owner === owner && item.group.toLowerCase().includes(desired))
    ?? tracked.find((item) => item.group.toLowerCase() === desired);
};

export const accountBalances = (accounts: FinancialAccount[], transactions: Transaction[]): AccountBalance[] => accounts.map((account) => {
  let balance = account.openingBalance;
  transactions.forEach((transaction) => {
    if (account.type === "credit_card") {
      if (transaction.type === "expense" && transaction.accountId === account.id) balance += transaction.amount;
      if (transaction.type === "refund" && transaction.accountId === account.id) balance -= transaction.amount;
      if (transaction.type === "credit_card_payment" && transaction.destinationAccountId === account.id) balance -= transaction.amount;
      return;
    }
    if (transaction.type === "income" && transaction.accountId === account.id) balance += transaction.amount;
    if (transaction.type === "refund" && transaction.accountId === account.id) balance += transaction.amount;
    if ((transaction.type === "expense" || transaction.type === "transfer" || transaction.type === "credit_card_payment") && transaction.accountId === account.id) balance -= transaction.amount;
    if (transaction.type === "transfer" && transaction.destinationAccountId === account.id) balance += transaction.amount;
  });
  return { ...account, balance, availableCredit: account.type === "credit_card" && account.creditLimit !== undefined ? account.creditLimit - balance : undefined };
});

export const monthlyControl = (items: BudgetItem[], transactions: Transaction[], month: string, plannedIncome: Pence, savings: Pence) => {
  const actuals = items.filter((item) => item.trackActuals !== false).map((item) => budgetItemActual(item, transactions, month));
  const planned = actuals.reduce((sum, item) => sum + item.planned, 0);
  const spent = actuals.reduce((sum, item) => sum + item.spent, 0);
  return { planned, spent, leftToSpend: planned - spent, unallocatedIncome: plannedIncome - planned - savings };
};

export type PaceStatus = "On track" | "Watch spending" | "Over budget";
export const spendingPace = (spent: Pence, planned: Pence, date: Date) => {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const elapsedRate = date.getDate() / daysInMonth;
  const spentRate = planned === 0 ? (spent > 0 ? 1 : 0) : spent / planned;
  const status: PaceStatus = spentRate > 1 ? "Over budget" : spentRate > elapsedRate + 0.15 ? "Watch spending" : "On track";
  return { elapsedRate, spentRate, daysRemaining: daysInMonth - date.getDate(), status };
};

export const transactionDefaults = (userId: string, items: BudgetItem[], accounts: FinancialAccount[], category = items[0]?.group ?? "Other") => ({
  owner: userId,
  accountId: accounts.find((account) => account.owner === userId && account.isActive)?.id ?? accounts.find((account) => account.isActive)?.id,
  budgetItemId: suggestBudgetItem(userId, category, items)?.id,
});
