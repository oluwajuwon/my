import React,{createContext,useCallback,useContext,useEffect,useMemo,useRef,useState}from"react";
import{BudgyData,MonthlyPlan}from"../domain/types";
import{HouseholdSession}from"../repositories/householdRepository";
import{budgyRepository}from"../repositories/budgyRepository";
import{subscribeToHousehold}from"../infrastructure/supabase/realtime";
import{describeBudgyError}from"../application/errors";
import{currentLocalMonth,inheritedMonth}from"../domain/months";

const clone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value))as T;
interface BudgyStoreValue{data:BudgyData;month:string;plan:MonthlyPlan;saving:boolean;syncError:string;setMonth:(month:string)=>void;updateMonth:(updater:(plan:MonthlyPlan)=>MonthlyPlan)=>void;updateData:(updater:(data:BudgyData)=>BudgyData)=>void;saveData:(updater:(data:BudgyData)=>BudgyData)=>Promise<void>;replaceData:(data:BudgyData)=>void;resetData:()=>void;retry:()=>void;}
const BudgyStore=createContext<BudgyStoreValue|null>(null);

export const BudgyStoreProvider:React.FC<{children:React.ReactNode;initialData:BudgyData;household:HouseholdSession}>=({children,initialData,household})=>{
  const[data,setData]=useState(()=>clone(initialData));const localMonth=currentLocalMonth();const[month,setActiveMonth]=useState(initialData.months[localMonth]?localMonth:Object.keys(initialData.months).sort().reverse()[0]??localMonth);
  const[saving,setSaving]=useState(false);const[syncError,setSyncError]=useState("");const queue=useRef(Promise.resolve());const latest=useRef(data);const pendingWrites=useRef(0);const pendingRealtime=useRef(false);const householdRef=useRef(household);const householdId=household.household.id;latest.current=data;householdRef.current=household;
  const refresh=useCallback(async()=>{if(householdRef.current.household.id!==householdId)return;try{const next=await budgyRepository.load(householdRef.current);setData(next);setSyncError("");}catch(error){setSyncError(describeBudgyError(error,"Budgy could not refresh shared data."));}},[householdId]);
  const handleRealtime=useCallback(()=>{if(pendingWrites.current>0){pendingRealtime.current=true;return;}void refresh();},[refresh]);
  useEffect(()=>subscribeToHousehold(householdId,handleRealtime),[householdId,handleRealtime]);
  const saveData=useCallback((updater:(current:BudgyData)=>BudgyData)=>{const current=latest.current;const next=updater(current);latest.current=next;setData(next);pendingWrites.current+=1;setSaving(true);const task=queue.current.then(()=>budgyRepository.sync(current,next,householdRef.current));queue.current=task.then(()=>setSyncError("")).catch((error)=>setSyncError(describeBudgyError(error,"Your change could not be saved."))).finally(()=>{pendingWrites.current-=1;if(pendingWrites.current===0){setSaving(false);if(pendingRealtime.current){pendingRealtime.current=false;void refresh();}}});return task;},[refresh]);
  const commit=useCallback((updater:(current:BudgyData)=>BudgyData)=>{void saveData(updater).catch(()=>{/* The persistent error banner provides retry and details. */});},[saveData]);
  const setMonth=useCallback((nextMonth:string)=>{if(!nextMonth)return;if(!latest.current.months[nextMonth])commit((current)=>({...current,months:{...current.months,[nextMonth]:inheritedMonth(current,nextMonth)}}));setActiveMonth(nextMonth);},[commit]);
  const updateMonth=useCallback((updater:(plan:MonthlyPlan)=>MonthlyPlan)=>commit((current)=>{const active=current.months[month]??inheritedMonth(current,month);return{...current,months:{...current.months,[month]:updater(active)}};}),[commit,month]);
  const updateData=useCallback((updater:(value:BudgyData)=>BudgyData)=>commit(updater),[commit]);
  const replaceData=useCallback((next:BudgyData)=>commit(()=>clone(next)),[commit]);
  const resetData=useCallback(()=>{const resetMonth=currentLocalMonth();pendingWrites.current+=1;setSaving(true);void budgyRepository.reset(householdRef.current,resetMonth).then((next)=>{setData(next);setActiveMonth(resetMonth);setSyncError("");}).catch((error)=>setSyncError(describeBudgyError(error,"Budgy could not reset your data."))).finally(()=>{pendingWrites.current-=1;setSaving(false);pendingRealtime.current=false;});},[]);
  const plan=data.months[month]??inheritedMonth(data,month);
  const value=useMemo(()=>({data,month,plan,saving,syncError,setMonth,updateMonth,updateData,saveData,replaceData,resetData,retry:refresh}),[data,month,plan,saving,syncError,setMonth,updateMonth,updateData,saveData,replaceData,resetData,refresh]);
  return <BudgyStore.Provider value={value}>{children}</BudgyStore.Provider>;
};
export const useBudgyStore=()=>{const value=useContext(BudgyStore);if(!value)throw new Error("useBudgyStore must be used inside BudgyStoreProvider");return value;};
export const isBudgyData=(value:unknown):value is BudgyData=>{if(!value||typeof value!=="object")return false;const candidate=value as Partial<BudgyData>;return candidate.schemaVersion===1&&!!candidate.months&&Array.isArray(candidate.categories)&&(candidate.incomeCategories===undefined||Array.isArray(candidate.incomeCategories))&&Array.isArray(candidate.transactions)&&Array.isArray(candidate.goals)&&Array.isArray(candidate.scenarios);};
