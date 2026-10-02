import{BudgetItem,FinancialAccount,Goal,IncomeSource,Transaction}from"./types";
import{isBudgetMonthKey,isBudgetPlanningType,monthFromDate}from"./months";
import{allocationPurpose}from"./allocations";

export interface TransactionValidationContext{expenseCategories:string[];incomeCategories:string[];accounts:FinancialAccount[];goals?:Goal[];budgetItems?:BudgetItem[];}

export const categoriesForTransaction=(type:Transaction["type"],expenseCategories:string[],incomeCategories:string[])=>
  type==="income"?incomeCategories:type==="expense"||type==="refund"?expenseCategories:[];

export const sanitizeTransaction=(value:Transaction):Transaction=>{
  if(value.type==="income")return{...value,budgetMonth:value.budgetMonth??monthFromDate(value.date),budgetItemId:undefined,destinationAccountId:undefined,savingsGoalId:undefined};
  if(value.type==="expense"||value.type==="refund")return{...value,budgetMonth:value.budgetMonth??monthFromDate(value.date),incomeSourceId:undefined,destinationAccountId:undefined,savingsGoalId:undefined};
  if(value.type==="credit_card_payment")return{...value,budgetMonth:value.budgetMonth??monthFromDate(value.date),category:undefined,incomeSourceId:undefined,savingsGoalId:undefined};
  return{...value,budgetMonth:undefined,category:undefined,budgetItemId:undefined,incomeSourceId:undefined,savingsGoalId:value.type==="transfer"?value.savingsGoalId:undefined};
};

export const switchTransactionType=(current:Transaction,type:Transaction["type"],expenseCategory:string,incomeCategory:string):Transaction=>{
  const descriptive=type==="transfer"?"Transfer":type==="credit_card_payment"?"Credit card payment":current.type==="transfer"||current.type==="credit_card_payment"?"":current.description;
  return sanitizeTransaction({...current,type,description:descriptive,category:type==="income"?incomeCategory:type==="expense"||type==="refund"?expenseCategory:undefined,budgetMonth:isBudgetPlanningType(type)?current.budgetMonth??monthFromDate(current.date):undefined,destinationAccountId:undefined,budgetItemId:undefined,incomeSourceId:undefined,savingsGoalId:undefined});
};

export const applyIncomeSource=(current:Transaction,source:IncomeSource):Transaction=>({...current,incomeSourceId:source.id,category:source.category??current.category,owner:source.owner,amount:source.amount,accountId:source.preferredAccountId??current.accountId});

export const isValidTransaction=(value:Transaction,context:TransactionValidationContext)=>{
  if(!Number.isInteger(value.amount)||value.amount<=0||!value.date)return false;
  if(isBudgetPlanningType(value.type)&&!isBudgetMonthKey(value.budgetMonth??monthFromDate(value.date)))return false;
  const account=context.accounts.find((entry)=>entry.id===value.accountId&&entry.isActive);
  if(value.type==="expense"||value.type==="refund")return!!value.description.trim()&&!!account&&!!value.category&&context.expenseCategories.includes(value.category)&&(!value.budgetItemId||context.budgetItems===undefined||context.budgetItems.some((item)=>item.id===value.budgetItemId&&item.trackActuals!==false&&allocationPurpose(item)==="spending"))&&!value.incomeSourceId&&!value.destinationAccountId;
  if(value.type==="income")return!!value.description.trim()&&!!account&&account.type!=="credit_card"&&!!value.category&&context.incomeCategories.includes(value.category)&&!value.budgetItemId&&!value.destinationAccountId;
  const destination=context.accounts.find((entry)=>entry.id===value.destinationAccountId&&entry.isActive);
  if(!account||!destination||account.id===destination.id||value.category||value.incomeSourceId)return false;
  if(value.type==="transfer"){
    if(value.budgetItemId)return false;
    if(!value.savingsGoalId)return true;
    const goal=context.goals?.find((entry)=>entry.id===value.savingsGoalId);
    return!!goal&&!!goal.fundingAccountId&&goal.fundingAccountId===destination.id&&destination.type==="savings_account";
  }
  if(value.type!=="credit_card_payment"||destination.type!=="credit_card"||account.type==="credit_card")return false;
  if(!value.budgetItemId)return true;
  const allocation=context.budgetItems?.find((item)=>item.id===value.budgetItemId);
  return!!allocation&&allocationPurpose(allocation)==="debt_payment"&&allocation.linkedAccountId===destination.id;
};
