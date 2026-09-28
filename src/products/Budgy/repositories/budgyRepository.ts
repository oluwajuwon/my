import { BudgyData, BudgetItem, FinancialAccount, HOUSEHOLD_OWNER, IncomeSource, MonthlyPlan, Scenario } from "../domain/types";
import { legacyOwner } from "../domain/ownership";
import { requireSupabase } from "../infrastructure/supabase/client";
import { BudgetItemRow, BudgetMonthRow, CategoryRow, FinancialAccountRow, IncomeSourceRow, SavingsGoalRow, ScenarioChangeRow, ScenarioRow, TransactionRow } from "../infrastructure/supabase/database.types";
import { HouseholdSession } from "./householdRepository";

const changed = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);
const monthKey = (row: Pick<BudgetMonthRow, "year" | "month">) => `${row.year}-${String(row.month).padStart(2, "0")}`;
const splitMonth = (key: string) => { const [year, month] = key.split("-").map(Number); return { year, month }; };
export const ownerFields = (owner: string, household: HouseholdSession) => {
  const member = household.members.find((entry) => entry.userId === owner);
  if (member) return { owner_user_id: member.userId, owner_label: null };
  if (owner === HOUSEHOLD_OWNER || owner === "Household") return { owner_user_id: null, owner_label: "Household" };
  return { owner_user_id: null, owner_label: owner.startsWith("legacy:") ? owner.slice(7) : owner };
};
export const ownerValue = (userId: string | null, label: string | null) => userId ?? (label && label !== "Household" ? legacyOwner(label) : HOUSEHOLD_OWNER);

const loadBudget = async (household: HouseholdSession) => {
  const client = requireSupabase();
  const id = household.household.id;
  const [monthsResult, categoriesResult, incomeResult, itemsResult] = await Promise.all([
    client.from("budget_months").select("*").eq("household_id", id),
    client.from("categories").select("*").eq("household_id", id).order("sort_order"),
    client.from("income_sources").select("*").eq("household_id", id),
    client.from("budget_items").select("*").eq("household_id", id),
  ]);
  const error = monthsResult.error ?? categoriesResult.error ?? incomeResult.error ?? itemsResult.error;
  if (error) throw error;
  const monthRows = monthsResult.data as BudgetMonthRow[];
  const categories = categoriesResult.data as CategoryRow[];
  const income = incomeResult.data as IncomeSourceRow[];
  const items = itemsResult.data as BudgetItemRow[];
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));
  const plans: Record<string, MonthlyPlan> = {};
  monthRows.forEach((row) => {
    const key = monthKey(row);
    plans[key] = {
      month: key, householdName: household.household.name, savings: Number(row.savings_target_pence),
      income: income.filter((entry) => entry.budget_month_id === row.id).map((entry) => ({ id: entry.id, name: entry.name, owner: ownerValue(entry.owner_user_id, entry.owner_label), amount: Number(entry.amount_pence), recurring: entry.recurring })),
      budget: items.filter((entry) => entry.budget_month_id === row.id).map((entry) => ({ id: entry.id, name: entry.name, group: categoryById.get(entry.category_id) ?? "Other", owner: ownerValue(entry.owner_user_id, entry.owner_label), amount: Number(entry.planned_amount_pence), recurring: entry.recurring, trackActuals: entry.track_actuals })),
    };
  });
  return { plans, categories: categories.map((entry) => entry.name), monthRows, categoriesRows: categories };
};

export const validScenario = (value: unknown): value is { plan: MonthlyPlan; oneOffExpenses: number; baseMonth: string } => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { plan?: MonthlyPlan; oneOffExpenses?: number; baseMonth?: string };
  return !!candidate.plan && Number.isInteger(candidate.plan.savings) && candidate.plan.savings >= 0
    && Array.isArray(candidate.plan.income) && candidate.plan.income.every((row) => typeof row.name === "string" && Number.isInteger(row.amount) && row.amount >= 0)
    && Array.isArray(candidate.plan.budget) && candidate.plan.budget.every((row) => typeof row.name === "string" && typeof row.group === "string" && Number.isInteger(row.amount) && row.amount >= 0)
    && typeof candidate.oneOffExpenses === "number" && Number.isInteger(candidate.oneOffExpenses) && candidate.oneOffExpenses >= 0 && typeof candidate.baseMonth === "string";
};

export const budgyRepository = {
  async load(household: HouseholdSession): Promise<BudgyData> {
    const client = requireSupabase();
    const id = household.household.id;
    const budget = await loadBudget(household);
    const [transactionsResult, accountsResult, goalsResult, scenariosResult] = await Promise.all([
      client.from("transactions").select("*").eq("household_id", id).order("transaction_date", { ascending: false }),
      client.from("financial_accounts").select("*").eq("household_id", id).order("created_at"),
      client.from("savings_goals").select("*").eq("household_id", id),
      client.from("scenarios").select("*").eq("household_id", id),
    ]);
    const error = transactionsResult.error ?? accountsResult.error ?? goalsResult.error ?? scenariosResult.error;
    if (error) throw error;
    const categoryById = new Map(budget.categoriesRows.map((category) => [category.id, category.name]));
    const scenarioRows = scenariosResult.data as ScenarioRow[];
    const scenarioIds = scenarioRows.map((entry) => entry.id);
    const changesResult = scenarioIds.length ? await client.from("scenario_changes").select("*").in("scenario_id", scenarioIds).eq("change_type", "snapshot") : { data: [], error: null };
    if (changesResult.error) throw changesResult.error;
    const snapshots = changesResult.data as ScenarioChangeRow[];
    const scenarios: Scenario[] = scenarioRows.flatMap((row) => {
      const snapshot = snapshots.find((entry) => entry.scenario_id === row.id);
      if (!snapshot || !validScenario(snapshot.payload)) return [];
      return [{ id: row.id, name: row.name, baseMonth: snapshot.payload.baseMonth, plan: snapshot.payload.plan, oneOffExpenses: snapshot.payload.oneOffExpenses, createdAt: row.created_at }];
    });
    return {
      schemaVersion: 1, householdName: household.household.name,
      members: household.members.map((member) => ({ id: member.userId, displayName: member.displayName })), categories: budget.categories,
      months: budget.plans,
      transactions: (transactionsResult.data as TransactionRow[]).map((row) => ({ id: row.id, type: row.type, amount: Number(row.amount_pence), description: row.description, category: categoryById.get(row.category_id ?? "") ?? "Other", owner: ownerValue(row.owner_user_id, row.owner_label), date: row.transaction_date, note: row.note ?? undefined, actorUserId: row.created_by, accountId: row.account_id ?? undefined, destinationAccountId: row.destination_account_id ?? undefined, budgetItemId: row.budget_item_id ?? undefined })),
      accounts: (accountsResult.data as FinancialAccountRow[]).map((row) => ({ id:row.id,name:row.name,owner:row.owner_user_id??HOUSEHOLD_OWNER,type:row.type,currency:row.currency,openingBalance:Number(row.opening_balance_pence),creditLimit:row.credit_limit_pence===null?undefined:Number(row.credit_limit_pence),statementBalance:row.statement_balance_pence===null?undefined:Number(row.statement_balance_pence),paymentDueDate:row.payment_due_date??undefined,isActive:row.is_active })),
      goals: (goalsResult.data as SavingsGoalRow[]).map((row) => ({ id: row.id, name: row.name, icon: row.icon_key ?? "◎", targetAmount: Number(row.target_amount_pence), currentAmount: Number(row.current_amount_pence), monthlyContribution: Number(row.monthly_contribution_pence), targetDate: row.target_date ?? "", description: row.description ?? undefined })),
      scenarios,
    };
  },

  async ensureBaseline(household: HouseholdSession, month: string): Promise<void> {
    const client = requireSupabase(); const id = household.household.id; const { year, month: monthNumber } = splitMonth(month);
    const defaults = ["Home","Food","Transport","Subscriptions","Phones","Future plans","Giving","Personal"];
    const { error: categoryError } = await client.from("categories").upsert(defaults.map((name, sort_order) => ({ household_id: id, name, sort_order })), { onConflict: "household_id,name", ignoreDuplicates: true });
    if (categoryError) throw categoryError;
    const { error: monthError } = await client.from("budget_months").upsert({ household_id: id, year, month: monthNumber, savings_target_pence: 0 }, { onConflict: "household_id,year,month", ignoreDuplicates: true });
    if (monthError) throw monthError;
  },

  async reset(household: HouseholdSession, month: string): Promise<BudgyData> {
    const client=requireSupabase();const id=household.household.id;
    const{data:scenarios}=await client.from("scenarios").select("id").eq("household_id",id);
    const scenarioIds=(scenarios as Array<{id:string}>|null)?.map((row)=>row.id)??[];
    if(scenarioIds.length){const{error}=await client.from("scenario_changes").delete().in("scenario_id",scenarioIds);if(error)throw error;}
    for(const table of ["transactions","financial_accounts","savings_goals","scenarios","income_sources","budget_items","budget_months","categories"]){const{error}=await client.from(table).delete().eq("household_id",id);if(error)throw error;}
    await this.ensureBaseline(household,month);return this.load(household);
  },

  async sync(previous: BudgyData, next: BudgyData, household: HouseholdSession): Promise<void> {
    const client = requireSupabase(); const householdId = household.household.id;
    if (changed(previous.categories, next.categories)) {
      const additions = next.categories.filter((name) => !previous.categories.includes(name));
      if (additions.length) { const { error } = await client.from("categories").upsert(additions.map((name, index) => ({ household_id: householdId, name, sort_order: next.categories.indexOf(name) + index })), { onConflict: "household_id,name" }); if (error) throw error; }
    }
    const { data: categoryData, error: categoryError } = await client.from("categories").select("id,name").eq("household_id", householdId);
    if (categoryError) throw categoryError;
    const categoryIds = new Map((categoryData as Array<Pick<CategoryRow,"id"|"name">>).map((row) => [row.name,row.id]));
    const { data: userData } = await client.auth.getUser();

    if(changed(previous.accounts,next.accounts))await this.syncAccounts(previous.accounts,next.accounts,household);

    for (const [key, plan] of Object.entries(next.months)) {
      const oldPlan = previous.months[key]; if (oldPlan && !changed(oldPlan, plan)) continue;
      const { year, month } = splitMonth(key);
      const { data: monthData, error: monthError } = await client.from("budget_months").upsert({ household_id: householdId, year, month, savings_target_pence: plan.savings }, { onConflict: "household_id,year,month" }).select("id").single();
      if (monthError) throw monthError; const budgetMonthId = (monthData as { id: string }).id;
      await this.syncIncome(oldPlan?.income ?? [], plan.income, household, budgetMonthId);
      await this.syncBudget(oldPlan?.budget ?? [], plan.budget, household, budgetMonthId, categoryIds);
    }
    if (changed(previous.transactions, next.transactions)) {
      const oldIds = new Set(previous.transactions.map((entry) => entry.id)); const nextIds = new Set(next.transactions.map((entry) => entry.id));
      for (const id of Array.from(oldIds)) if (!nextIds.has(id)) { const { error } = await client.from("transactions").delete().eq("id", id); if (error) throw error; }
      for (const row of next.transactions) if (!oldIds.has(row.id) || changed(previous.transactions.find((entry) => entry.id === row.id), row)) {
        const key = row.date.slice(0,7); const { year, month } = splitMonth(key); const { data: monthRow } = await client.from("budget_months").select("id").eq("household_id",householdId).eq("year",year).eq("month",month).maybeSingle();
        const { error } = await client.from("transactions").upsert({ id: row.id, household_id: householdId, budget_month_id: (monthRow as {id:string}|null)?.id ?? null, category_id: categoryIds.get(row.category) ?? null, type: row.type, amount_pence: row.amount, description: row.description, ...ownerFields(row.owner,household), transaction_date: row.date, note: row.note ?? null, created_by: userData.user!.id, account_id:row.accountId??null,destination_account_id:row.destinationAccountId??null,budget_item_id:row.type==="expense"||row.type==="refund"?row.budgetItemId??null:null }); if (error) throw error;
      }
    }
    if (changed(previous.goals, next.goals)) {
      const nextIds = new Set(next.goals.map((entry) => entry.id));
      for (const row of previous.goals) if (!nextIds.has(row.id)) { const { error } = await client.from("savings_goals").delete().eq("id",row.id); if(error) throw error; }
      for (const row of next.goals) if (!previous.goals.some((old) => old.id === row.id) || changed(previous.goals.find((old) => old.id === row.id),row)) { const { error } = await client.from("savings_goals").upsert({ id:row.id, household_id:householdId, name:row.name, icon_key:row.icon, target_amount_pence:row.targetAmount, current_amount_pence:row.currentAmount, monthly_contribution_pence:row.monthlyContribution, target_date:row.targetDate || null, description:row.description ?? null }); if(error) throw error; }
    }
    if (changed(previous.scenarios, next.scenarios)) await this.syncScenarios(previous.scenarios,next.scenarios,household,userData.user!.id);
  },

  async syncIncome(previous: IncomeSource[], next: IncomeSource[], household: HouseholdSession, budgetMonthId: string) {
    const client=requireSupabase(); const nextIds=new Set(next.map((row)=>row.id));
    for(const row of previous) if(!nextIds.has(row.id)){const {error}=await client.from("income_sources").delete().eq("id",row.id);if(error)throw error;}
    for(const row of next) if(!previous.some((old)=>old.id===row.id)||changed(previous.find((old)=>old.id===row.id),row)){const {error}=await client.from("income_sources").upsert({id:row.id,household_id:household.household.id,budget_month_id:budgetMonthId,name:row.name,...ownerFields(row.owner,household),amount_pence:row.amount,recurring:row.recurring});if(error)throw error;}
  },
  async syncBudget(previous: BudgetItem[], next: BudgetItem[], household: HouseholdSession, budgetMonthId: string, categoryIds: Map<string,string>) {
    const client=requireSupabase(); const nextIds=new Set(next.map((row)=>row.id));
    for(const row of previous) if(!nextIds.has(row.id)){const {error}=await client.from("budget_items").delete().eq("id",row.id);if(error)throw error;}
    for(const row of next) if(!previous.some((old)=>old.id===row.id)||changed(previous.find((old)=>old.id===row.id),row)){const {error}=await client.from("budget_items").upsert({id:row.id,household_id:household.household.id,budget_month_id:budgetMonthId,category_id:categoryIds.get(row.group),name:row.name,...ownerFields(row.owner,household),planned_amount_pence:row.amount,recurring:row.recurring,track_actuals:row.trackActuals!==false});if(error)throw error;}
  },
  async syncAccounts(previous:FinancialAccount[],next:FinancialAccount[],household:HouseholdSession){
    const client=requireSupabase();const nextIds=new Set(next.map((row)=>row.id));
    for(const row of previous)if(!nextIds.has(row.id)){const{error}=await client.from("financial_accounts").delete().eq("id",row.id);if(error)throw error;}
    for(const row of next)if(!previous.some((old)=>old.id===row.id)||changed(previous.find((old)=>old.id===row.id),row)){const member=household.members.find((entry)=>entry.userId===row.owner);const{error}=await client.from("financial_accounts").upsert({id:row.id,household_id:household.household.id,owner_user_id:member?.userId??null,name:row.name,type:row.type,currency:row.currency,opening_balance_pence:row.openingBalance,credit_limit_pence:row.type==="credit_card"?row.creditLimit??null:null,statement_balance_pence:row.type==="credit_card"?row.statementBalance??null:null,payment_due_date:row.type==="credit_card"?row.paymentDueDate??null:null,is_active:row.isActive});if(error)throw error;}
  },
  async syncScenarios(previous: Scenario[],next: Scenario[],household: HouseholdSession,userId:string){
    const client=requireSupabase();const nextIds=new Set(next.map((row)=>row.id));
    for(const row of previous)if(!nextIds.has(row.id)){const{error}=await client.from("scenarios").delete().eq("id",row.id);if(error)throw error;}
    for(const row of next)if(!previous.some((old)=>old.id===row.id)||changed(previous.find((old)=>old.id===row.id),row)){
      const{error}=await client.from("scenarios").upsert({id:row.id,household_id:household.household.id,name:row.name,base_budget_month_id:null,created_by:userId});if(error)throw error;
      const{error:deleteError}=await client.from("scenario_changes").delete().eq("scenario_id",row.id);if(deleteError)throw deleteError;
      const{error:insertError}=await client.from("scenario_changes").insert({scenario_id:row.id,change_type:"snapshot",entity_type:"plan",payload:{plan:row.plan,oneOffExpenses:row.oneOffExpenses,baseMonth:row.baseMonth}});if(insertError)throw insertError;
    }
  },
};
