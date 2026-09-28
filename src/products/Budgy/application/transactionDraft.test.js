import { clearTransactionDraft, hasTransactionDraft, readTransactionDraft, transactionDraftKey, writeTransactionDraft } from "./transactionDraft";

const key = transactionDraftKey("member-1", "household-1");
const draft = { id:"tx-1",type:"expense",amount:4250,description:"Tesco",category:"Groceries",owner:"household",date:"2026-09-28",accountId:"amex" };

beforeEach(() => localStorage.clear());

it("saves and restores a transaction draft", () => {
  writeTransactionDraft(key, draft);
  expect(readTransactionDraft(key)).toEqual(draft);
  expect(hasTransactionDraft(key)).toBe(true);
});

it("clears a completed or explicitly discarded draft", () => {
  writeTransactionDraft(key, draft);
  clearTransactionDraft(key);
  expect(readTransactionDraft(key)).toBeNull();
});

it("does not restore malformed local data", () => {
  localStorage.setItem(key, JSON.stringify({ version:1, value:{ description:"Incomplete" } }));
  expect(readTransactionDraft(key)).toBeNull();
});
