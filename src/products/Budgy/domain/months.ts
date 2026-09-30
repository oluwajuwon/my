import { createId } from "./id";
import { BudgyData, MonthlyPlan, Transaction } from "./types";

export type BudgetMonthMode="auto"|"manual";

export const monthFromDate=(date:string)=>date.slice(0,7);
export const currentLocalMonth=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
export const isBudgetMonthKey=(value:unknown):value is string=>typeof value==="string"&&/^\d{4}-(0[1-9]|1[0-2])$/.test(value);
export const isBudgetPlanningType=(type:Transaction["type"])=>type==="expense"||type==="refund"||type==="income";
export const transactionBudgetMonth=(transaction:Transaction)=>isBudgetPlanningType(transaction.type)?transaction.budgetMonth??monthFromDate(transaction.date):undefined;

export const shiftMonthKey=(month:string,amount:number)=>{
  const[year,index]=month.split("-").map(Number);
  const date=new Date(year,index-1+amount,1);
  return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
};

export const inheritedMonth=(data:BudgyData,month:string):MonthlyPlan=>{
  const keys=Object.keys(data.months).sort();
  const sourceKey=[...keys].reverse().find((key)=>key<month)??keys[0];
  const source=sourceKey?data.months[sourceKey]:undefined;
  return{month,householdName:data.householdName,savings:source?.savings??0,
    income:(source?.income??[]).filter((item)=>item.recurring).map((item)=>({...item,id:createId()})),
    budget:(source?.budget??[]).filter((item)=>item.recurring).map((item)=>({...item,id:createId()}))};
};

export const ensureBudgetMonth=(data:BudgyData,month:string,prepared?:MonthlyPlan):BudgyData=>data.months[month]?data:{...data,months:{...data.months,[month]:prepared??inheritedMonth(data,month)}};

export const availableBudgetMonths=(data:BudgyData,date:string)=>{
  const current=monthFromDate(date);
  return Array.from(new Set([...Object.keys(data.months),shiftMonthKey(current,-1),current,shiftMonthKey(current,1)])).sort();
};

export const changeTransactionDate=(transaction:Transaction,date:string,mode:BudgetMonthMode):Transaction=>({
  ...transaction,date,budgetMonth:isBudgetPlanningType(transaction.type)?mode==="auto"&&isBudgetMonthKey(monthFromDate(date))?monthFromDate(date):transactionBudgetMonth(transaction):undefined,
});

export const chooseBudgetMonth=(transaction:Transaction,budgetMonth:string):Transaction=>({
  ...transaction,budgetMonth:isBudgetPlanningType(transaction.type)?budgetMonth:undefined,
});
