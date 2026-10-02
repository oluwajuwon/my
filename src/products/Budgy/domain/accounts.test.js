import { accountBalances, budgetItemActual, monthlyControl, spendingPace, suggestBudgetItem, transactionDefaults } from "./accounts";

const personal={id:"personal",name:"Personal Spending",group:"Personal",owner:"user-a",amount:25000,recurring:true,trackActuals:true};
const transport={id:"transport",name:"Transport",group:"Transport",owner:"user-a",amount:42000,recurring:true,trackActuals:true};
const groceries={id:"groceries",name:"Groceries",group:"Food",owner:"household",amount:35000,recurring:true,trackActuals:true};
const current={id:"bank",name:"Current",owner:"user-a",type:"current_account",currency:"GBP",openingBalance:100000,isActive:true};
const card={id:"card",name:"Amex",owner:"user-a",type:"credit_card",currency:"GBP",openingBalance:50000,creditLimit:200000,isActive:true};
const expense=(overrides={})=>({id:"tx",type:"expense",amount:6740,description:"Purchase",category:"Personal",owner:"user-a",date:"2026-09-10",accountId:"bank",budgetItemId:"personal",...overrides});

it("calculates budget spending and remaining, including negative overspending",()=>{
  expect(budgetItemActual(personal,[expense()],"2026-09")).toMatchObject({spent:6740,remaining:18260});
  expect(budgetItemActual(personal,[expense({amount:30000})],"2026-09").remaining).toBe(-5000);
});

it("a credit-card purchase increases debt and reduces its allocated monthly budget",()=>{
  const purchase=expense({amount:10000,accountId:"card"});
  expect(accountBalances([card],[purchase])[0].balance).toBe(60000);
  expect(budgetItemActual(personal,[purchase],"2026-09").spent).toBe(10000);
});

it("a credit-card payment reduces debt without increasing monthly spending",()=>{
  const payment=expense({id:"pay",type:"credit_card_payment",amount:30000,accountId:"bank",destinationAccountId:"card",budgetItemId:undefined});
  expect(accountBalances([card],[payment])[0].balance).toBe(20000);
  expect(budgetItemActual(personal,[payment],"2026-09").spent).toBe(0);
});

it("transfers change account balances but do not count as expenses",()=>{
  const savings={...current,id:"save",name:"Savings",openingBalance:0,type:"savings_account"};
  const transfer=expense({type:"transfer",amount:12500,accountId:"bank",destinationAccountId:"save",budgetItemId:undefined});
  const balances=accountBalances([current,savings],[transfer]);
  expect(balances.map((entry)=>entry.balance)).toEqual([87500,12500]);
  expect(budgetItemActual(personal,[transfer],"2026-09").spent).toBe(0);
});

it("calculates available credit in integer pence",()=>{
  expect(accountBalances([card],[expense({amount:10000,accountId:"card"})])[0].availableCredit).toBe(140000);
});

it("calculates household left-to-spend from tracked allowances only",()=>{
  expect(monthlyControl([personal,transport],[expense()],"2026-09",750000,250000)).toEqual({planned:67000,spent:6740,leftToSpend:60260,unallocatedIncome:433000});
  const debt={id:"debt",name:"Amex payoff",group:"Debt payments",owner:"household",amount:60000,recurring:true,trackActuals:true,purpose:"debt_payment",linkedAccountId:"card"};
  expect(monthlyControl([personal,transport,debt],[expense()],"2026-09",750000,250000)).toEqual({planned:67000,spent:6740,leftToSpend:60260,unallocatedIncome:373000});
});

it("defaults ownership and payment source to the current user",()=>{
  expect(transactionDefaults("user-a",[personal],[current],"Personal")).toEqual({owner:"user-a",accountId:"bank",budgetItemId:"personal"});
});

it("suggests budgets deterministically from owner and category",()=>{
  expect(suggestBudgetItem("user-a","Transport",[personal,transport,groceries])?.id).toBe("transport");
  expect(suggestBudgetItem("user-a","Shopping",[personal,transport,groceries])?.id).toBe("personal");
  expect(suggestBudgetItem("household","Food",[personal,transport,groceries])?.id).toBe("groceries");
});

it("does not include transactions outside the selected month",()=>{
  expect(budgetItemActual(personal,[expense({date:"2026-10-01"})],"2026-09").spent).toBe(0);
});

it("uses the explicit budget month instead of the payment date",()=>{
  const early=expense({date:"2026-09-28",budgetMonth:"2026-10"});
  expect(budgetItemActual(personal,[early],"2026-09").spent).toBe(0);
  expect(budgetItemActual(personal,[early],"2026-10").spent).toBe(6740);
});

it("classifies factual monthly pace using a conservative 15-point tolerance",()=>{
  expect(spendingPace(30000,42000,new Date(2026,8,10)).status).toBe("Watch spending");
  expect(spendingPace(43000,42000,new Date(2026,8,10)).status).toBe("Over budget");
});

it("keeps all money calculations in integer pence",()=>{
  const result=accountBalances([current],[expense({amount:1851})])[0].balance;
  expect(result).toBe(98149);expect(Number.isInteger(result)).toBe(true);
});
