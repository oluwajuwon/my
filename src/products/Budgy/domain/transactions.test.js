import{applyIncomeSource,categoriesForTransaction,isValidTransaction,sanitizeTransaction,switchTransactionType}from"./transactions";

const expenses=["Food","Transport"];const income=["Salary","Bonus"];
const bank={id:"bank",name:"Current",owner:"u1",type:"current_account",currency:"GBP",openingBalance:0,isActive:true};
const savings={...bank,id:"savings",name:"Savings",type:"savings_account"};
const card={...bank,id:"card",name:"Amex",type:"credit_card"};
const goal={id:"goal",name:"House",icon:"⌂",targetAmount:2500000,currentAmount:0,targetDate:"2027-09-01",monthlyContribution:50000,fundingAccountId:"savings"};
const base={id:"tx",type:"expense",amount:4250,description:"Tesco",category:"Food",owner:"u1",date:"2026-09-30",accountId:"bank",budgetItemId:"food-budget"};
const context={expenseCategories:expenses,incomeCategories:income,accounts:[bank,savings,card]};

it("exposes only categories appropriate to the movement",()=>{
  expect(categoriesForTransaction("expense",expenses,income)).toEqual(expenses);
  expect(categoriesForTransaction("income",expenses,income)).toEqual(income);
  expect(categoriesForTransaction("transfer",expenses,income)).toEqual([]);
  expect(categoriesForTransaction("credit_card_payment",expenses,income)).toEqual([]);
});

it("rejects expense categories on income and income categories on expenses",()=>{
  expect(isValidTransaction({...base,type:"income",category:"Food",budgetItemId:undefined},context)).toBe(false);
  expect(isValidTransaction({...base,category:"Salary"},context)).toBe(false);
});

it("rejects a stale monthly budget allocation",()=>{
  expect(isValidTransaction(base,{...context,budgetItems:[]})).toBe(false);
  expect(isValidTransaction(base,{...context,budgetItems:[{id:"food-budget",name:"Food",group:"Food",owner:"u1",amount:10000,recurring:true,trackActuals:true}]})).toBe(true);
  expect(isValidTransaction(base,{...context,budgetItems:[{id:"food-budget",name:"Amex payoff",group:"Debt payments",owner:"u1",amount:10000,recurring:true,trackActuals:true,purpose:"debt_payment",linkedAccountId:"card"}]})).toBe(false);
});

it("clears incompatible fields when the transaction type changes",()=>{
  const transfer=switchTransactionType({...base,incomeSourceId:"salary"},"transfer","Food","Salary");
  expect(transfer).toMatchObject({type:"transfer",description:"Transfer"});
  expect(transfer.category).toBeUndefined();expect(transfer.budgetItemId).toBeUndefined();expect(transfer.incomeSourceId).toBeUndefined();
});

it("ignores invalid hidden fields before persistence",()=>{
  expect(sanitizeTransaction({...base,type:"income",category:"Salary",incomeSourceId:"salary",destinationAccountId:"savings"})).toMatchObject({incomeSourceId:"salary",destinationAccountId:undefined,budgetItemId:undefined});
  expect(sanitizeTransaction({...base,type:"expense",incomeSourceId:"salary",destinationAccountId:"savings"})).toMatchObject({incomeSourceId:undefined,destinationAccountId:undefined,budgetItemId:"food-budget"});
});

it("validates transfers and card payments without categories",()=>{
  expect(isValidTransaction({...switchTransactionType(base,"transfer","Food","Salary"),accountId:"bank",destinationAccountId:"savings"},context)).toBe(true);
  expect(isValidTransaction({...switchTransactionType(base,"credit_card_payment","Food","Salary"),accountId:"bank",destinationAccountId:"card"},context)).toBe(true);
  expect(isValidTransaction({...switchTransactionType(base,"credit_card_payment","Food","Salary"),accountId:"bank",destinationAccountId:"savings"},context)).toBe(false);
});

it("only links goal contributions to the goal's savings account",()=>{
  const transfer={...switchTransactionType(base,"transfer","Food","Salary"),accountId:"bank",destinationAccountId:"savings",savingsGoalId:"goal"};
  expect(isValidTransaction(transfer,{...context,goals:[goal]})).toBe(true);
  expect(isValidTransaction({...transfer,destinationAccountId:"card"},{...context,goals:[goal]})).toBe(false);
  expect(isValidTransaction({...transfer,savingsGoalId:"missing"},{...context,goals:[goal]})).toBe(false);
});

it("links a planned income source and applies deterministic saved defaults",()=>{
  const source={id:"salary-source",name:"Employer",owner:"u1",amount:490000,recurring:true,category:"Salary",preferredAccountId:"bank"};
  expect(applyIncomeSource({...base,type:"income",category:"Salary",budgetItemId:undefined},source)).toMatchObject({incomeSourceId:"salary-source",category:"Salary",owner:"u1",amount:490000,accountId:"bank"});
});
