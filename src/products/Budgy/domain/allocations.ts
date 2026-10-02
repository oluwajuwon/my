import { transactionBudgetMonth } from "./months";
import { AllocationPurpose, BudgetItem, MonthlyPlan, Pence, Transaction } from "./types";

const spendingEffect=(transaction:Transaction)=>transaction.type==="expense"?transaction.amount:transaction.type==="refund"?-transaction.amount:0;

export const allocationPurpose=(item:BudgetItem):AllocationPurpose=>item.purpose??"spending";
export const allocationsForPurpose=(plan:Pick<MonthlyPlan,"budget">,purpose:AllocationPurpose)=>plan.budget.filter((item)=>allocationPurpose(item)===purpose);
export const calculatePlannedPurpose=(plan:Pick<MonthlyPlan,"budget">,purpose:AllocationPurpose)=>allocationsForPurpose(plan,purpose).reduce((sum,item)=>sum+item.amount,0);
export const calculatePlannedSpending=(plan:Pick<MonthlyPlan,"budget">)=>calculatePlannedPurpose(plan,"spending");
export const calculatePlannedDebtPayments=(plan:Pick<MonthlyPlan,"budget">)=>calculatePlannedPurpose(plan,"debt_payment");
export const calculateActualSpending=(transactions:Transaction[],month:string)=>transactions.filter((row)=>transactionBudgetMonth(row)===month&&(row.type==="expense"||row.type==="refund")).reduce((sum,row)=>sum+spendingEffect(row),0);
export const calculateActualDebtPayments=(transactions:Transaction[],month:string,allocationId?:string)=>transactions.filter((row)=>row.type==="credit_card_payment"&&transactionBudgetMonth(row)===month&&(!allocationId||row.budgetItemId===allocationId)).reduce((sum,row)=>sum+row.amount,0);

export interface AllocationProgress{allocationId:string;planned:Pence;actual:Pence;remaining:Pence;usedRate:number;}
export const calculateAllocationProgress=(item:BudgetItem,transactions:Transaction[],month:string):AllocationProgress=>{
  const purpose=allocationPurpose(item);
  const actual=purpose==="debt_payment"?calculateActualDebtPayments(transactions,month,item.id):transactions.filter((row)=>transactionBudgetMonth(row)===month&&row.budgetItemId===item.id&&(row.type==="expense"||row.type==="refund")).reduce((sum,row)=>sum+spendingEffect(row),0);
  return{allocationId:item.id,planned:item.amount,actual,remaining:item.amount-actual,usedRate:item.amount?actual/item.amount:actual?1:0};
};
export const calculateLeftToSpend=(plan:MonthlyPlan,transactions:Transaction[],month:string)=>calculatePlannedSpending(plan)-calculateActualSpending(transactions,month);
export const calculateLeftToAllocate=(plan:MonthlyPlan)=>{
  const income=plan.income.reduce((sum,row)=>sum+row.amount,0);
  return income-plan.savings-plan.budget.reduce((sum,row)=>sum+row.amount,0);
};

export interface ReallocationPreview{from?:BudgetItem;to:BudgetItem;amount:Pence;fromBefore:Pence;fromAfter?:Pence;toBefore:Pence;toAfter:Pence;fromActual:Pence;wouldPutSourceOverPlan:boolean;totalBefore:Pence;totalAfter:Pence;}
export const calculateReallocationPreview=(plan:MonthlyPlan,transactions:Transaction[],month:string,fromId:string|undefined,toId:string,amount:Pence):ReallocationPreview=>{
  const from=fromId?plan.budget.find((item)=>item.id===fromId):undefined;const to=plan.budget.find((item)=>item.id===toId);
  if(!to)throw new Error("Choose where to move the money.");
  if(fromId===toId)throw new Error("Choose two different purposes.");
  if(!Number.isInteger(amount)||amount<=0)throw new Error("Enter an amount greater than zero.");
  const available=from?from.amount:calculateLeftToAllocate(plan);
  if(amount>available)throw new Error(`Only ${available} pence is available to move.`);
  const fromActual=from?calculateAllocationProgress(from,transactions,month).actual:0;
  return{from,to,amount,fromBefore:from?.amount??available,fromAfter:from?from.amount-amount:undefined,toBefore:to.amount,toAfter:to.amount+amount,fromActual,wouldPutSourceOverPlan:Boolean(from&&from.amount-amount<fromActual),totalBefore:plan.budget.reduce((sum,item)=>sum+item.amount,0),totalAfter:plan.budget.reduce((sum,item)=>sum+item.amount,0)+(from?0:amount)};
};
export const validateReallocation=(preview:ReallocationPreview,confirmOverPlan=false)=>preview.wouldPutSourceOverPlan&&!confirmOverPlan?{valid:false,message:`${preview.from?.name} would become over plan. Confirm to continue without changing recorded transactions.`}:{valid:true,message:""};
export const applyReallocation=(plan:MonthlyPlan,preview:ReallocationPreview):MonthlyPlan=>({...plan,budget:plan.budget.map((item)=>item.id===preview.to.id?{...item,amount:preview.toAfter}:item.id===preview.from?.id?{...item,amount:preview.fromAfter??item.amount}:item)});
export const matchDebtPaymentAllocation=(plan:MonthlyPlan,destinationAccountId:string|undefined)=>plan.budget.find((item)=>allocationPurpose(item)==="debt_payment"&&item.linkedAccountId===destinationAccountId);
