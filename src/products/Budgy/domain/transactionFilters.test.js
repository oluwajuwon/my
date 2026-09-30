import { transactionMatchesView } from "./transactionFilters";

const rent={id:"rent",type:"expense",amount:160000,description:"October rent",category:"Home",owner:"household",date:"2026-09-28",budgetMonth:"2026-10",budgetItemId:"oct-rent"};

it("keeps the ledger on the actual transaction date",()=>{
  expect(transactionMatchesView(rent,{ledgerMonth:"2026-09"})).toBe(true);
  expect(transactionMatchesView(rent,{ledgerMonth:"2026-10"})).toBe(false);
});

it("includes an early payment in its assigned budget drill-down",()=>{
  expect(transactionMatchesView(rent,{ledgerMonth:"2026-09",budgetMonth:"2026-10",budgetItemId:"oct-rent"})).toBe(true);
  expect(transactionMatchesView(rent,{ledgerMonth:"2026-10",budgetMonth:"2026-09",budgetItemId:"oct-rent"})).toBe(false);
});

it("moving the assigned month moves budget impact without changing the cash date",()=>{
  const edited={...rent,budgetMonth:"2026-09"};
  expect(edited.date).toBe("2026-09-28");
  expect(transactionMatchesView(edited,{ledgerMonth:"2026-10",budgetMonth:"2026-10"})).toBe(false);
  expect(transactionMatchesView(edited,{ledgerMonth:"2026-10",budgetMonth:"2026-09"})).toBe(true);
});
