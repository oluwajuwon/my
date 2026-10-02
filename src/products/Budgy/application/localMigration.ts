import { BudgyData, HOUSEHOLD_OWNER, Owner } from "../domain/types";
import { isBudgyData } from "../store/BudgyStore";
import { requireSupabase } from "../infrastructure/supabase/client";
import { HouseholdSession } from "../repositories/householdRepository";
import { budgyRepository } from "../repositories/budgyRepository";
import { createId } from "../domain/id";
import { isBudgetPlanningType, monthFromDate } from "../domain/months";

const STORAGE_KEY="budgy.household.v1";
const EMPTY = (household: HouseholdSession): BudgyData => ({schemaVersion:1,householdName:household.household.name,members:household.members.map((member)=>({id:member.userId,displayName:member.displayName})),categories:[],incomeCategories:[],months:{},transactions:[],accounts:[],goals:[],scenarios:[]});
const rawOwnerLabel=(owner:Owner)=>owner.startsWith("legacy:")?owner.slice(7):owner;
const mapOwner=(owner:Owner,mapping:Record<string,string>)=>owner===HOUSEHOLD_OWNER||owner==="Household"?HOUSEHOLD_OWNER:mapping[rawOwnerLabel(owner)]??`legacy:${rawOwnerLabel(owner)}`;
const mapLegacyName=(name:string,mapping:Record<string,string>,household:HouseholdSession)=>Object.entries(mapping).reduce((value,[oldLabel,userId])=>{const displayName=household.members.find((member)=>member.userId===userId)?.displayName;if(!displayName||displayName===oldLabel)return value;const escaped=oldLabel.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return value.replace(new RegExp(`\\b${escaped}\\b`,"gi"),displayName);},name);
export const normaliseLocalData=(source:BudgyData,household:HouseholdSession,mapping:Record<string,string>={}):BudgyData=>{
  const budgetIds=new Map<string,string>();const accountIds=new Map<string,string>();const goalIds=new Map<string,string>();
  const accounts=(source.accounts??[]).map((row)=>{const id=createId();accountIds.set(row.id,id);return{...row,id,owner:mapOwner(row.owner,mapping)};});
  const goals=source.goals.map((row)=>{const id=createId();goalIds.set(row.id,id);return{...row,id,fundingAccountId:row.fundingAccountId?accountIds.get(row.fundingAccountId):undefined};});
  const months=Object.fromEntries(Object.entries(source.months).map(([key,plan])=>[key,{...plan,householdName:household.household.name,income:plan.income.map((row)=>({...row,id:createId(),name:mapLegacyName(row.name,mapping,household),owner:mapOwner(row.owner,mapping)})),budget:plan.budget.map((row)=>{const id=createId();budgetIds.set(row.id,id);return{...row,id,name:mapLegacyName(row.name,mapping,household),owner:mapOwner(row.owner,mapping),purpose:row.purpose??"spending",linkedAccountId:row.linkedAccountId?accountIds.get(row.linkedAccountId):undefined};})}]));
  return{...source,incomeCategories:source.incomeCategories??[],householdName:household.household.name,members:household.members.map((member)=>({id:member.userId,displayName:member.displayName})),accounts,months,
    transactions:source.transactions.map((row)=>({...row,id:createId(),owner:mapOwner(row.owner,mapping),budgetMonth:isBudgetPlanningType(row.type)?row.budgetMonth??monthFromDate(row.date):undefined,accountId:row.accountId?accountIds.get(row.accountId):undefined,destinationAccountId:row.destinationAccountId?accountIds.get(row.destinationAccountId):undefined,budgetItemId:row.budgetItemId?budgetIds.get(row.budgetItemId):undefined,savingsGoalId:row.savingsGoalId?goalIds.get(row.savingsGoalId):undefined})),goals,
    scenarios:source.scenarios.map((row)=>({...row,id:createId(),plan:{...row.plan,income:row.plan.income.map((entry)=>({...entry,id:createId(),name:mapLegacyName(entry.name,mapping,household),owner:mapOwner(entry.owner,mapping)})),budget:row.plan.budget.map((entry)=>({...entry,id:createId(),name:mapLegacyName(entry.name,mapping,household),owner:mapOwner(entry.owner,mapping),purpose:entry.purpose??"spending",linkedAccountId:entry.linkedAccountId?accountIds.get(entry.linkedAccountId):undefined}))}})),
  };
};
const sha256=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))).map((byte)=>byte.toString(16).padStart(2,"0")).join("");

const collectOwnerLabels=(data:BudgyData)=>Array.from(new Set([
  ...Object.values(data.months).flatMap((plan)=>[...plan.income,...plan.budget].map((row)=>rawOwnerLabel(row.owner))),
  ...data.transactions.map((row)=>rawOwnerLabel(row.owner)),
  ...data.scenarios.flatMap((scenario)=>[...scenario.plan.income,...scenario.plan.budget].map((row)=>rawOwnerLabel(row.owner))),
].filter((label)=>label!=="Household"&&label!==HOUSEHOLD_OWNER))).sort();
export interface LocalMigrationCandidate { data: BudgyData; hash: string; income: number; spending: number; months: number; ownerLabels: string[]; }
export const localMigration = {
  async candidate(householdId:string):Promise<LocalMigrationCandidate|null>{
    const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return null;
    try{const parsed:unknown=JSON.parse(raw);if(!isBudgyData(parsed))return null;const hash=await sha256(raw);const{data}=await requireSupabase().from("household_imports").select("id").eq("household_id",householdId).eq("dataset_hash",hash).maybeSingle();if(data)return null;const plans=Object.values(parsed.months);return{data:parsed,hash,income:plans.reduce((sum,plan)=>sum+plan.income.reduce((total,row)=>total+row.amount,0),0),spending:plans.reduce((sum,plan)=>sum+plan.budget.reduce((total,row)=>total+row.amount,0),0),months:plans.length,ownerLabels:collectOwnerLabels(parsed)};}catch{return null;}
  },
  async import(candidate:LocalMigrationCandidate,household:HouseholdSession,mapping:Record<string,string>):Promise<void>{
    if(candidate.ownerLabels.some((label)=>!mapping[label]))throw new Error("Choose a household member for every legacy owner before importing.");
    const client=requireSupabase();const mappingHash=await sha256(JSON.stringify(mapping));const stagingKey=`budgy.migration.staging.${candidate.hash}.${mappingHash}`;const staged=localStorage.getItem(stagingKey);const migrated=staged?JSON.parse(staged) as BudgyData:normaliseLocalData(candidate.data,household,mapping);
    if(!staged)localStorage.setItem(stagingKey,JSON.stringify(migrated));
    localStorage.setItem(`budgy.household.backup.${Date.now()}`,JSON.stringify(candidate.data));
    await budgyRepository.sync(EMPTY(household),migrated,household);
    const{data:user}=await client.auth.getUser();const{error}=await client.from("household_imports").insert({household_id:household.household.id,dataset_hash:candidate.hash,imported_by:user.user!.id});if(error)throw error;
    localStorage.removeItem(stagingKey);
    localStorage.removeItem(STORAGE_KEY);
  },
};
