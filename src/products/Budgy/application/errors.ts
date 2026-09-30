interface ServiceErrorShape {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
}

const errorShape=(error:unknown):ServiceErrorShape=>error&&typeof error==="object"?error as ServiceErrorShape:{};
const text=(value:unknown)=>typeof value==="string"?value.trim():"";

export const serviceErrorMessage=(error:unknown):string=>{
  if(error instanceof Error&&error.message.trim())return error.message.trim();
  const value=errorShape(error);
  return text(value.message)||text(value.details)||text(value.hint);
};

export const describeBudgyError=(error:unknown,fallback="Something went wrong. Please try again."):string=>{
  const raw=serviceErrorMessage(error);
  const message=raw.toLowerCase();
  const code=text(errorShape(error).code).toUpperCase();

  if(message.includes("budget allocation must belong to the same household and month")||message.includes("budget allocation must belong to the same household and budget month"))return "This transaction is linked to a budget item from another month. Choose an allowance from the selected month, or select ‘No monthly allowance’, then save again.";
  if(message.includes("budget month must belong to the same household"))return "That budget month is not available in this household. Choose another month and try again.";
  if(message.includes("choose the budget month"))return "Choose which monthly budget this transaction should count toward.";
  if(message.includes("income source must belong to the same household"))return "That income source is no longer available in this household. Choose another source and try again.";
  if(message.includes("payment account must belong to the same household"))return "The selected payment account is no longer available in this household. Choose another account and try again.";
  if(message.includes("destination account must belong to the same household"))return "The destination account is no longer available in this household. Choose another account and try again.";
  if(message.includes("transfers and card payments require two different accounts"))return "Choose two different accounts: one to send money from and one to receive it.";
  if(message.includes("credit-card payment must target")||message.includes("credit card payment must target"))return "Choose a credit-card account as the payment destination.";
  if(message.includes("expenses and refunds require an account"))return "Choose the account used for this expense or refund.";
  if(message.includes("expenses and refunds require an expense category"))return "Choose an expense category before saving this transaction.";
  if(message.includes("income requires a destination account"))return "Choose the account that received this income.";
  if(message.includes("income requires an income category")||message.includes("new income requires an income category"))return "Choose an income category before saving this transaction.";
  if(message.includes("savings goal must belong to the same household"))return "That savings goal is no longer available. Choose another goal and try again.";
  if(message.includes("connect the goal to a savings account"))return "Connect this goal to a savings account before adding money.";
  if(message.includes("goal contributions must go to the account connected to the goal"))return "Send this contribution to the savings account connected to the goal.";
  if(message.includes("goal contributions must go to a savings account")||message.includes("goal must use an active savings account"))return "Choose an active savings account for this goal.";
  if(message.includes("only a household owner"))return "Only a household owner can make this change.";
  if(message.includes("invalid login credentials"))return "The email address or password is incorrect.";
  if(message.includes("email not confirmed"))return "Confirm your email address before signing in.";
  if(message.includes("user already registered"))return "An account already exists for this email address. Sign in instead.";
  if(message.includes("password")&&message.includes("characters"))return raw;
  if(message.includes("rate limit"))return "Too many attempts were made. Wait a moment, then try again.";
  if(message.includes("authentication required")||code==="PGRST301")return "Your session has expired. Sign in again, then retry the change.";
  if(message.includes("row-level security")||message.includes("permission denied")||code==="42501")return "You do not have permission to make this change in this household.";
  if(message.includes("duplicate key")||code==="23505")return "That item already exists. Use a different name or update the existing item.";
  if((message.includes("does not exist")&&message.includes("column"))||message.includes("schema cache"))return "Budgy’s database setup is out of date. Apply the latest Supabase migrations, then reload the app.";
  if(message.includes("failed to fetch")||message.includes("network")||message.includes("load failed"))return "Budgy could not reach the server. Check your connection and try again.";
  return raw?`Budgy could not complete the change: ${raw}`:fallback;
};
