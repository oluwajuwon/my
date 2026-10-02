import { accountBalances, spendingEffect } from "./accounts";
import { calculateHouseholdSummary, projectSavings } from "./budget";
import { currentLocalMonth, transactionBudgetMonth } from "./months";
import { formatMoney } from "./money";
import { calculateActualSavings } from "./reports";
import { BudgyData, FinancialAccount, MonthlyPlan, Pence, Transaction } from "./types";
import { allocationPurpose, calculateActualDebtPayments, calculatePlannedDebtPayments, calculatePlannedSpending } from "./allocations";

export type MonthLifecycle="setup"|"ready"|"active"|"complete"|"future";
export type SpendingPaceStatus="below"|"close"|"ahead";
export type CategoryProgressStatus="remaining"|"nearly-used"|"used"|"over";
export type AttentionKind="over-plan"|"nearly-used"|"uncategorised"|"card-due";

export interface HomeCategoryProgress{key:string;planned:Pence;spent:Pence;remaining:Pence;usedRate:number;status:CategoryProgressStatus;transactionIds:string[];}
export interface HomeAttentionItem{kind:AttentionKind;title:string;detail:string;to:string;priority:number;}
export interface HomePacing{elapsedRate:number;spentRate:number;difference:number;status:SpendingPaceStatus;label:string;}
export interface HomeMonthCopy{statusLabel:string;headline:string;supporting:string;}
export interface HomeViewModel{
  month:string;monthName:string;lifecycle:MonthLifecycle;copy:HomeMonthCopy;plan:ReturnType<typeof calculateHouseholdSummary>;
  spendingPlan:Pence;actualSpending:Pence;leftToSpend:Pence;spendingUsedRate:number;budgetTransactionCount:number;
  actualSavings:Pence;creditCardDebt:Pence;daysRemaining:number|null;pacing:HomePacing|null;
  plannedDebtPayments:Pence;actualDebtPayments:Pence;
  categories:HomeCategoryProgress[];actualCategories:HomeCategoryProgress[];attention:HomeAttentionItem[];
  earlyTransactions:Transaction[];primaryAction:{label:string;to:string};hasPlan:boolean;hasActualSpending:boolean;
  allocation:{spendingRate:number;debtRate:number;savingsRate:number;unallocatedRate:number};projection:{twelveMonths:Pence;fiveYears:Pence};
}

const sum=(values:number[])=>values.reduce((total,value)=>total+value,0);
const planningRows=(transactions:Transaction[],month:string)=>transactions.filter((row)=>transactionBudgetMonth(row)===month&&(row.type==="expense"||row.type==="refund"||row.type==="income"||row.type==="credit_card_payment"));
const spendingRows=(transactions:Transaction[],month:string)=>transactions.filter((row)=>transactionBudgetMonth(row)===month&&(row.type==="expense"||row.type==="refund"));
const monthName=(month:string)=>{const[year,index]=month.split("-").map(Number);return new Intl.DateTimeFormat("en-GB",{month:"long",year:"numeric"}).format(new Date(year,index-1,1));};
const shortMonthName=(month:string)=>{const[year,index]=month.split("-").map(Number);return new Intl.DateTimeFormat("en-GB",{month:"long"}).format(new Date(year,index-1,1));};
const monthEndDate=(month:string)=>{const[year,index]=month.split("-").map(Number);return new Date(year,index,0);};
const trackedPlan=(plan:MonthlyPlan)=>plan.budget.filter((item)=>item.trackActuals!==false&&allocationPurpose(item)==="spending");

export const calculateBudgetSpending=(transactions:Transaction[],month:string)=>sum(spendingRows(transactions,month).map(spendingEffect));
export const calculateBudgetRemaining=(plan:MonthlyPlan,transactions:Transaction[],month:string)=>sum(trackedPlan(plan).map((item)=>item.amount))-calculateBudgetSpending(transactions,month);

export const deriveMonthLifecycle=(plan:MonthlyPlan,transactions:Transaction[],month:string,today=new Date()):MonthLifecycle=>{
  const hasPlan=plan.income.length>0&&plan.budget.length>0;
  if(!hasPlan)return"setup";
  const current=currentLocalMonth(today);
  if(month<current)return"complete";
  if(month>current)return"future";
  return planningRows(transactions,month).length?"active":"ready";
};

export const calculateMonthElapsedPercentage=(month:string,today=new Date())=>{
  const current=currentLocalMonth(today);if(month<current)return 1;if(month>current)return 0;
  const days=monthEndDate(month).getDate();return Math.min(1,Math.max(0,today.getDate()/days));
};

/** Differences of five percentage points or less are described as close to pace. */
export const deriveSpendingPace=(spent:Pence,planned:Pence,month:string,today=new Date()):HomePacing=>{
  const elapsedRate=calculateMonthElapsedPercentage(month,today);const spentRate=planned?spent/planned:spent>0?1:0;const difference=spentRate-elapsedRate;
  const status:SpendingPaceStatus=Math.abs(difference)<=.05?"close":difference>.05?"ahead":"below";
  return{elapsedRate,spentRate,difference,status,label:status==="close"?"Spending is close to this month’s pace.":status==="ahead"?"Spending is ahead of this month’s pace.":"Spending is below this month’s pace."};
};

export const calculateCategoryProgress=(plan:MonthlyPlan,transactions:Transaction[],month:string):HomeCategoryProgress[]=>{
  const items=trackedPlan(plan);const rows=spendingRows(transactions,month);const groups=new Map<string,{planned:number;spent:number;ids:string[]}>();
  items.forEach((item)=>{const value=groups.get(item.group)??{planned:0,spent:0,ids:[]};value.planned+=item.amount;groups.set(item.group,value);});
  rows.forEach((row)=>{const item=items.find((candidate)=>candidate.id===row.budgetItemId);const key=item?.group??row.category??"Uncategorised";const value=groups.get(key)??{planned:0,spent:0,ids:[]};value.spent+=spendingEffect(row);value.ids.push(row.id);groups.set(key,value);});
  return Array.from(groups.entries()).map(([key,value])=>{const remaining=value.planned-value.spent;const usedRate=value.planned?value.spent/value.planned:value.spent>0?1:0;const status:CategoryProgressStatus=remaining<0?"over":remaining===0&&value.spent>0?"used":usedRate>=.9?"nearly-used":"remaining";return{key,planned:value.planned,spent:value.spent,remaining,usedRate,status,transactionIds:value.ids};}).sort((a,b)=>{const rank=(row:HomeCategoryProgress)=>row.status==="over"?3:row.status==="used"?2:row.status==="nearly-used"?1:0;return rank(b)-rank(a)||b.spent-a.spent||b.planned-a.planned||a.key.localeCompare(b.key);});
};

const dateOnly=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
export const deriveAttentionItems=(categories:HomeCategoryProgress[],transactions:Transaction[],accounts:FinancialAccount[],month:string,today=new Date(),plan?:MonthlyPlan):HomeAttentionItem[]=>{
  const items:HomeAttentionItem[]=[];
  categories.filter((row)=>row.key!=="Uncategorised"&&(row.status==="over"||row.status==="used"||row.status==="nearly-used")).forEach((row)=>items.push({kind:row.status==="over"?"over-plan":"nearly-used",title:row.key,detail:row.remaining<0?`${formatMoney(Math.abs(row.remaining))} over plan`:row.remaining===0?"Nothing remaining in this category":`${formatMoney(row.remaining)} remaining`,to:`/budgy/transactions?category=${encodeURIComponent(row.key)}&budgetMonth=${month}`,priority:row.status==="over"?100:row.status==="used"?80:50+row.usedRate}));
  const uncategorised=spendingRows(transactions,month).filter((row)=>!row.category&&!row.budgetItemId).length;if(uncategorised)items.push({kind:"uncategorised",title:`${uncategorised} transaction${uncategorised===1?"":"s"}`,detail:"Need a category",to:`/budgy/transactions?budgetMonth=${month}`,priority:90});
  const todayKey=dateOnly(today);const soon=new Date(today);soon.setDate(soon.getDate()+7);const soonKey=dateOnly(soon);
  accountBalances(accounts,transactions.filter((row)=>row.date<=todayKey)).filter((account)=>account.type==="credit_card"&&account.balance>0&&account.paymentDueDate&&account.paymentDueDate>=todayKey&&account.paymentDueDate<=soonKey).forEach((account)=>{const paymentPlan=plan?.budget.find((item)=>allocationPurpose(item)==="debt_payment"&&item.linkedAccountId===account.id);const remaining=paymentPlan?paymentPlan.amount-calculateActualDebtPayments(transactions,month,paymentPlan.id):0;items.push({kind:"card-due",title:account.name,detail:`${paymentPlan&&remaining>0?`${formatMoney(remaining)} of planned payment remaining · `:""}Due ${new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short"}).format(new Date(`${account.paymentDueDate}T12:00:00`))}`,to:"/budgy/money",priority:70});});
  return items.sort((a,b)=>b.priority-a.priority).slice(0,3);
};

export const getMonthCopy=(lifecycle:MonthLifecycle,month:string,hasActivity:boolean):HomeMonthCopy=>{const name=shortMonthName(month);switch(lifecycle){case"setup":return{statusLabel:`${name} setup`,headline:`Let’s build ${name}.`,supporting:"Start with what comes in, then decide where it should go."};case"future":return hasActivity?{statusLabel:`${name} plan`,headline:`${name} is already taking shape.`,supporting:"Some money has already been recorded against this future month."}:{statusLabel:`${name} plan`,headline:`Your ${name} plan is ready.`,supporting:"Nothing has been recorded against this month yet."};case"ready":return{statusLabel:name,headline:`${name} is underway.`,supporting:"Your plan is ready — record spending as it happens."};case"complete":return{statusLabel:`${name} complete`,headline:`Here’s how ${name} finished.`,supporting:"A summary based on the activity recorded in Budgy."};default:return{statusLabel:name,headline:`Here’s where ${name} stands.`,supporting:"Your recorded spending compared with the monthly plan."};}};

const debtAtMonthEnd=(data:BudgyData,month:string)=>accountBalances(data.accounts,data.transactions.filter((row)=>row.date<=`${month}-31`)).filter((account)=>account.type==="credit_card").reduce((total,account)=>total+account.balance,0);
export const buildHomeViewModel=(data:BudgyData,month:string,today=new Date()):HomeViewModel=>{
  const plan=data.months[month];if(!plan)throw new Error(`Missing budget month ${month}`);
  const planSummary=calculateHouseholdSummary(plan);const rows=planningRows(data.transactions,month);const actualSpending=calculateBudgetSpending(data.transactions,month);const spendingPlan=calculatePlannedSpending(plan);const plannedDebtPayments=calculatePlannedDebtPayments(plan);const actualDebtPayments=calculateActualDebtPayments(data.transactions,month);const categories=calculateCategoryProgress(plan,data.transactions,month);const lifecycle=deriveMonthLifecycle(plan,data.transactions,month,today);const hasActivity=rows.length>0||actualDebtPayments>0;const current=currentLocalMonth(today);const end=monthEndDate(month);const daysRemaining=month===current?Math.max(0,end.getDate()-today.getDate()):null;const projection=projectSavings(plan.savings,60);
  const primaryAction=lifecycle==="setup"?{label:"Set up this month",to:"/budgy/budget"}:lifecycle==="complete"?{label:`View ${shortMonthName(month)} report`,to:`/budgy/reports?month=${month}`}:lifecycle==="active"?{label:"Add transaction",to:"/budgy/transactions?add=transaction"}:{label:"Review budget",to:"/budgy/budget"};
  const earlyTransactions=spendingRows(data.transactions,month).filter((row)=>!row.date.startsWith(month)).sort((a,b)=>b.date.localeCompare(a.date));
  return{month,monthName:monthName(month),lifecycle,copy:getMonthCopy(lifecycle,month,hasActivity),plan:planSummary,spendingPlan,actualSpending,leftToSpend:spendingPlan-actualSpending,spendingUsedRate:spendingPlan?actualSpending/spendingPlan:actualSpending>0?1:0,budgetTransactionCount:rows.length,actualSavings:calculateActualSavings(data.transactions,data.accounts,month),creditCardDebt:debtAtMonthEnd(data,month),plannedDebtPayments,actualDebtPayments,daysRemaining,pacing:lifecycle==="active"?deriveSpendingPace(actualSpending,spendingPlan,month,today):null,categories,actualCategories:categories.filter((row)=>row.spent>0),attention:lifecycle==="active"?deriveAttentionItems(categories,data.transactions,data.accounts,month,today,plan):[],earlyTransactions,primaryAction,hasPlan:plan.income.length>0&&plan.budget.length>0,hasActualSpending:actualSpending>0,allocation:{spendingRate:planSummary.spendingRate,debtRate:planSummary.income?plannedDebtPayments/planSummary.income:0,savingsRate:planSummary.savingsRate,unallocatedRate:planSummary.remainingRate},projection:{twelveMonths:projection[12].balance,fiveYears:projection[60].balance}};
};
