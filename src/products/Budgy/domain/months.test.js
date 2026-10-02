import { availableBudgetMonths, changeTransactionDate, chooseBudgetMonth, currentLocalMonth, transactionBudgetMonth } from "./months";

const expense={id:"rent",type:"expense",amount:160000,description:"October rent",category:"Home",owner:"household",date:"2026-09-28",budgetMonth:"2026-09"};

it("updates an automatic budget month when the transaction date changes",()=>{
  expect(changeTransactionDate(expense,"2026-10-02","auto").budgetMonth).toBe("2026-10");
});

it("preserves a manually selected budget month when the transaction date changes",()=>{
  const manual=chooseBudgetMonth(expense,"2026-10");
  expect(changeTransactionDate(manual,"2026-09-29","manual").budgetMonth).toBe("2026-10");
});

it("falls back to the transaction date for legacy records and offers adjacent months",()=>{
  expect(transactionBudgetMonth({...expense,budgetMonth:undefined})).toBe("2026-09");
  expect(availableBudgetMonths({months:{},householdName:"Home"},"2026-09-28")).toEqual(["2026-08","2026-09","2026-10"]);
});

it("does not assign planning months to transfers but supports planned card payments",()=>{
  expect(transactionBudgetMonth({...expense,type:"transfer"})).toBeUndefined();
  expect(changeTransactionDate({...expense,type:"credit_card_payment"},"2026-10-01","auto").budgetMonth).toBe("2026-10");
});

it("uses the local calendar month instead of a UTC date slice",()=>{
  expect(currentLocalMonth(new Date(2026,8,30,23,30))).toBe("2026-09");
});
