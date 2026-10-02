import{buildHomeViewModel,calculateBudgetSpending,deriveMonthLifecycle,deriveSpendingPace}from"./home";

const plan=(month="2026-10")=>({month,householdName:"Home",income:[{id:"salary",name:"Salary",owner:"member",amount:750000,recurring:true}],savings:250000,budget:[{id:"home",name:"Rent",group:"Home",owner:"household",amount:202970,recurring:true},{id:"food",name:"Groceries",group:"Food",owner:"household",amount:35000,recurring:true},{id:"transport",name:"Transport",group:"Transport",owner:"household",amount:67300,recurring:true},{id:"other",name:"Other",group:"Personal",owner:"household",amount:167983,recurring:true}]});
const data=(month="2026-10",transactions=[])=>({schemaVersion:1,householdName:"Home",members:[],categories:["Home","Food","Transport","Personal"],incomeCategories:["Salary"],months:{[month]:plan(month)},transactions,accounts:[],goals:[],scenarios:[]});
const expense=(overrides={})=>({id:"expense",type:"expense",amount:288300,description:"Spending",category:"Home",owner:"household",date:"2026-10-10",budgetMonth:"2026-10",budgetItemId:"home",...overrides});
const today=new Date(2026,9,18,12);

it("derives setup without presenting a zero-filled dashboard",()=>{
  const empty={...plan(),income:[],budget:[],savings:0};
  expect(deriveMonthLifecycle(empty,[],"2026-10",today)).toBe("setup");
});

it("makes actual spending and left-to-spend primary for the active month",()=>{
  const model=buildHomeViewModel(data("2026-10",[expense()]),"2026-10",today);
  expect(model.lifecycle).toBe("active");
  expect(model.spendingPlan).toBe(473253);
  expect(model.actualSpending).toBe(288300);
  expect(model.leftToSpend).toBe(184953);
});

it("keeps debt-payment allocations out of left to spend while including them in plan allocation",()=>{
  const input=data();input.accounts=[{id:"card",name:"Amex",owner:"household",type:"credit_card",currency:"GBP",openingBalance:449115,isActive:true},{id:"bank",name:"Lloyds",owner:"household",type:"current_account",currency:"GBP",openingBalance:500000,isActive:true}];
  input.months["2026-10"]={...input.months["2026-10"],budget:[...input.months["2026-10"].budget,{id:"debt",name:"Amex payoff",group:"Debt payments",owner:"household",amount:60000,recurring:true,purpose:"debt_payment",linkedAccountId:"card"}]};
  const payment={id:"payment",type:"credit_card_payment",amount:40000,description:"Amex payment",owner:"household",date:"2026-10-12",budgetMonth:"2026-10",budgetItemId:"debt",accountId:"bank",destinationAccountId:"card"};
  const model=buildHomeViewModel({...input,transactions:[expense(),payment]},"2026-10",today);
  expect(model.spendingPlan).toBe(473253);expect(model.leftToSpend).toBe(184953);expect(model.plannedDebtPayments).toBe(60000);expect(model.actualDebtPayments).toBe(40000);expect(model.plan.remaining).toBe(-33253);
});

it("counts purchases once while excluding transfers and card repayments",()=>{
  const rows=[expense({amount:5000,accountId:"card"}),expense({id:"transfer",type:"transfer",amount:5000,accountId:"bank",destinationAccountId:"savings",budgetItemId:undefined,category:undefined}),expense({id:"payment",type:"credit_card_payment",amount:5000,accountId:"bank",destinationAccountId:"card",budgetItemId:undefined,category:undefined})];
  expect(calculateBudgetSpending(rows,"2026-10")).toBe(5000);
});

it("subtracts refunds from actual and category spending",()=>{
  const rows=[expense({amount:5000}),expense({id:"refund",type:"refund",amount:1250})];
  const model=buildHomeViewModel(data("2026-10",rows),"2026-10",today);
  expect(model.actualSpending).toBe(3750);
  expect(model.categories.find((row)=>row.key==="Home")).toMatchObject({spent:3750,remaining:199220});
});

it("assigns an early September rent payment to future October performance",()=>{
  const row=expense({amount:160000,date:"2026-09-28"});const model=buildHomeViewModel(data("2026-10",[row]),"2026-10",new Date(2026,8,28,12));
  expect(model.lifecycle).toBe("future");
  expect(model.actualSpending).toBe(160000);
  expect(model.leftToSpend).toBe(313253);
  expect(model.earlyTransactions[0].date).toBe("2026-09-28");
});

it("adapts selected past, current and future months without persisted flags",()=>{
  expect(deriveMonthLifecycle(plan("2026-09"),[],"2026-09",today)).toBe("complete");
  expect(deriveMonthLifecycle(plan("2026-10"),[],"2026-10",today)).toBe("ready");
  expect(deriveMonthLifecycle(plan("2026-11"),[],"2026-11",today)).toBe("future");
});

it("uses completed-month variance language and never exposes days remaining",()=>{
  const model=buildHomeViewModel(data("2026-09",[expense({date:"2026-09-12",budgetMonth:"2026-09",amount:442000})]),"2026-09",today);
  expect(model.lifecycle).toBe("complete");
  expect(model.leftToSpend).toBe(31253);
  expect(model.daysRemaining).toBeNull();
  expect(model.copy.headline).toContain("finished");
});

it("represents an over-plan result as spending variance, not savings",()=>{
  const model=buildHomeViewModel(data("2026-09",[expense({date:"2026-09-12",budgetMonth:"2026-09",amount:490000})]),"2026-09",today);
  expect(model.leftToSpend).toBe(-16747);
  expect(model.actualSavings).toBe(0);
});

it("uses a five-point pacing tolerance",()=>{
  expect(deriveSpendingPace(6100,10000,"2026-10",new Date(2026,9,18,12)).status).toBe("close");
  expect(deriveSpendingPace(7000,10000,"2026-10",new Date(2026,9,18,12)).status).toBe("ahead");
  expect(deriveSpendingPace(4500,10000,"2026-10",new Date(2026,9,18,12)).status).toBe("below");
});

it("distinguishes actual savings transfers from the savings target",()=>{
  const transfer={id:"save",type:"transfer",amount:40000,description:"Save",owner:"household",date:"2026-10-10",accountId:"bank",destinationAccountId:"savings"};
  const input=data("2026-10",[expense({amount:1000}),transfer]);input.accounts=[{id:"bank",name:"Bank",owner:"household",type:"current_account",currency:"GBP",openingBalance:0,isActive:true},{id:"savings",name:"Savings",owner:"household",type:"savings_account",currency:"GBP",openingBalance:0,isActive:true}];
  const model=buildHomeViewModel(input,"2026-10",today);
  expect(model.plan.savings).toBe(250000);expect(model.actualSavings).toBe(40000);
});

it("keeps the current month in a ready empty-actual state until activity is recorded",()=>{
  const model=buildHomeViewModel(data(),"2026-10",today);
  expect(model.lifecycle).toBe("ready");expect(model.hasActualSpending).toBe(false);expect(model.copy.headline).toBe("October is underway.");
});

it("derives factual attention items without financial judgement",()=>{
  const input=data("2026-10",[expense({amount:210000}),expense({id:"unknown",amount:1200,budgetItemId:undefined,category:undefined})]);
  input.accounts=[{id:"card",name:"Amex",owner:"household",type:"credit_card",currency:"GBP",openingBalance:40000,paymentDueDate:"2026-10-22",isActive:true}];
  const model=buildHomeViewModel(input,"2026-10",today);
  expect(model.attention.map((item)=>item.kind)).toEqual(expect.arrayContaining(["over-plan","uncategorised","card-due"]));
  expect(model.attention.every((item)=>!item.detail.match(/bad|danger|failure/i))).toBe(true);
});
