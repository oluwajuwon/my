import{buildMonthlyReport,calculateAccountMovement,calculateActualIncome,calculateActualSavings,calculateActualSpending,calculateCategoryBreakdown,calculateMemberBreakdown,calculateMonthComparison}from"./reports";

const plan={month:"2026-09",householdName:"Home",income:[{id:"salary",name:"Salary",owner:"u1",amount:75000,recurring:true}],savings:20000,budget:[{id:"food-budget",name:"Groceries",group:"Food",owner:"household",amount:35000,recurring:true,trackActuals:true},{id:"personal-budget",name:"Personal",group:"Personal",owner:"u1",amount:25000,recurring:true,trackActuals:true}]};
const bank={id:"bank",name:"Current",owner:"u1",type:"current_account",currency:"GBP",openingBalance:100000,isActive:true};
const savings={id:"save",name:"Savings",owner:"household",type:"savings_account",currency:"GBP",openingBalance:0,isActive:true};
const card={id:"card",name:"Amex",owner:"u1",type:"credit_card",currency:"GBP",openingBalance:50000,creditLimit:200000,isActive:true};
const tx=(id,type,amount,overrides={})=>({id,type,amount,description:id,category:"Food",owner:"household",date:"2026-09-10",...overrides});
const transactions=[
  tx("salary","income",75000,{owner:"u1",accountId:"bank"}),
  tx("shop","expense",10000,{accountId:"card",budgetItemId:"food-budget"}),
  tx("lunch","expense",5000,{owner:"u1",category:"Personal",accountId:"bank",budgetItemId:"personal-budget"}),
  tx("refund","refund",2000,{accountId:"card",budgetItemId:"food-budget"}),
  tx("payment","credit_card_payment",30000,{owner:"u1",accountId:"bank",destinationAccountId:"card"}),
  tx("save","transfer",20000,{owner:"u1",accountId:"bank",destinationAccountId:"save"}),
];
const data={schemaVersion:1,householdName:"Home",members:[{id:"u1",displayName:"Juwon"}],categories:["Food","Personal"],months:{"2026-09":plan},transactions,accounts:[bank,savings,card],goals:[],scenarios:[]};
const name=(owner)=>owner==="household"?"Household":"Juwon";

it("aggregates recorded income",()=>expect(calculateActualIncome(transactions,"2026-09")).toBe(75000));
it("aggregates expenses once and subtracts refunds",()=>expect(calculateActualSpending(transactions,"2026-09")).toBe(13000));
it("excludes card payments and transfers from expenses",()=>expect(calculateActualSpending([transactions[4],transactions[5]],"2026-09")).toBe(0));
it("calculates actual transfers into savings",()=>expect(calculateActualSavings(transactions,[bank,savings,card],"2026-09")).toBe(20000));
it("builds actual category totals with planned differences",()=>expect(calculateCategoryBreakdown(transactions,plan,"2026-09").find((row)=>row.key==="Food")).toMatchObject({amount:8000,planned:35000,difference:27000}));
it("attributes spending to transaction owners rather than actors",()=>expect(calculateMemberBreakdown(transactions,"2026-09",name).find((row)=>row.label==="Household").amount).toBe(8000));
it("calculates bank opening, activity and closing balances",()=>expect(calculateAccountMovement(bank,transactions,"2026-09")).toMatchObject({opening:100000,moneyIn:75000,moneyOut:55000,closing:120000}));
it("calculates card purchases, refunds, payments and closing debt",()=>expect(calculateAccountMovement(card,transactions,"2026-09")).toMatchObject({opening:50000,purchases:10000,refunds:2000,payments:30000,closing:28000,availableCredit:172000}));
it("builds remaining budget and integer-pence summary",()=>{const report=buildMonthlyReport(data,"2026-09",name);expect(report.remainingBudget).toBe(47000);expect(report.netCashFlow).toBe(62000);expect(Number.isInteger(report.spending)).toBe(true);});
it("does not assume planned savings were actually saved",()=>{const report=buildMonthlyReport({...data,transactions:transactions.filter((row)=>row.type!=="transfer")},"2026-09",name);expect(report.plannedSavings).toBe(20000);expect(report.savings).toBe(0);});
it("compares months only when previous actual data exists",()=>{expect(calculateMonthComparison(data,"2026-09")).toBeUndefined();const withAugust={...data,transactions:[...transactions,tx("aug","expense",3000,{date:"2026-08-10"})]};expect(calculateMonthComparison(withAugust,"2026-09").spending).toBe(10000);});
it("handles an empty month without fabricated activity",()=>{const report=buildMonthlyReport(data,"2026-10",name);expect(report.transactionCount).toBe(0);expect(report.income).toBe(0);expect(report.spending).toBe(0);expect(report.categories.every((row)=>row.amount===0)).toBe(true);});
it("labels a partial month by its actual transaction count",()=>expect(buildMonthlyReport({...data,transactions:[transactions[1]]},"2026-09",name).transactionCount).toBe(1));
