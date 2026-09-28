import { Transaction } from "../domain/types";

const PREFIX = "budgy:draft:new-transaction";

export const transactionDraftKey = (userId: string, householdId: string) =>
  `${PREFIX}:${userId}:${householdId}`;

const isTransaction = (value: unknown): value is Transaction => {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<Transaction>;
  return typeof draft.id === "string"
    && typeof draft.type === "string"
    && Number.isInteger(draft.amount)
    && typeof draft.description === "string"
    && typeof draft.category === "string"
    && typeof draft.owner === "string"
    && typeof draft.date === "string";
};

export const readTransactionDraft = (key: string): Transaction | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version?: number; value?: unknown };
    return parsed.version === 1 && isTransaction(parsed.value) ? parsed.value : null;
  } catch {
    return null;
  }
};

export const writeTransactionDraft = (key: string, value: Transaction) => {
  try { localStorage.setItem(key, JSON.stringify({ version: 1, value })); } catch { /* Storage can be unavailable in private browsing. */ }
};

export const clearTransactionDraft = (key: string) => {
  try { localStorage.removeItem(key); } catch { /* Storage can be unavailable in private browsing. */ }
};

export const hasTransactionDraft = (key: string) => readTransactionDraft(key) !== null;
