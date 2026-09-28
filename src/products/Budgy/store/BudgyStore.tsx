import React,{createContext,useCallback,useContext,useEffect,useMemo,useRef,useState}from"react";
import{initialMonth}from"../data/household";
import{BudgyData,MonthlyPlan}from"../domain/types";
import{HouseholdSession}from"../repositories/householdRepository";
import{budgyRepository}from"../repositories/budgyRepository";
import{subscribeToHousehold}from"../infrastructure/supabase/realtime";
import{createId}from"../domain/id";

const clone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value))as T;
const inheritedMonth=(data:BudgyData,month:string):MonthlyPlan=>{const sourceKey=Object.keys(data.months).sort().reverse().find((key)=>key<month)??Object.keys(data.months).sort()[0];const source=data.months[sourceKey];return{month,householdName:data.householdName,savings:source?.savings??0,income:(source?.income??[]).filter((item)=>item.recurring).map((item)=>({...item,id:createId()})),budget:(source?.budget??[]).filter((item)=>item.recurring).map((item)=>({...item,id:createId()}))};};
interface BudgyStoreValue{data:BudgyData;month:string;plan:MonthlyPlan;saving:boolean;syncError:string;setMonth:(month:string)=>void;updateMonth:(updater:(plan:MonthlyPlan)=>MonthlyPlan)=>void;updateData:(updater:(data:BudgyData)=>BudgyData)=>void;replaceData:(data:BudgyData)=>void;resetData:()=>void;retry:()=>void;}
const BudgyStore=createContext<BudgyStoreValue|null>(null);

export const BudgyStoreProvider:React.FC<{children:React.ReactNode;initialData:BudgyData;household:HouseholdSession}>=({children,initialData,household})=>{
  const[data,setData]=useState(()=>clone(initialData));const[month,setActiveMonth]=useState(initialData.months[initialMonth]?initialMonth:Object.keys(initialData.months).sort().reverse()[0]??initialMonth);
  const[saving,setSaving]=useState(false);const[syncError,setSyncError]=useState("");const queue=useRef(Promise.resolve());const latest=useRef(data);const pendingWrites=useRef(0);const pendingRealtime=useRef(false);const householdRef=useRef(household);const householdId=household.household.id;latest.current=data;householdRef.current=household;
  const refresh=useCallback(async()=>{if(householdRef.current.household.id!==householdId)return;try{const next=await budgyRepository.load(householdRef.current);setData(next);setSyncError("");}catch(error){setSyncError(error instanceof Error?error.message:"Budgy could not refresh shared data.");}},[householdId]);
  const handleRealtime=useCallback(()=>{if(pendingWrites.current>0){pendingRealtime.current=true;return;}void refresh();},[refresh]);
  useEffect(()=>subscribeToHousehold(householdId,handleRealtime),[householdId,handleRealtime]);
  const commit=useCallback((updater:(current:BudgyData)=>BudgyData)=>{setData((current)=>{const next=updater(current);latest.current=next;pendingWrites.current+=1;setSaving(true);queue.current=queue.current.then(()=>budgyRepository.sync(current,next,householdRef.current)).then(()=>setSyncError("")).catch((error)=>setSyncError(error instanceof Error?error.message:"Your change could not be saved.")).finally(()=>{pendingWrites.current-=1;if(pendingWrites.current===0){setSaving(false);if(pendingRealtime.current){pendingRealtime.current=false;void refresh();}}});return next;});},[refresh]);
  const setMonth=useCallback((nextMonth:string)=>{if(!nextMonth)return;if(!latest.current.months[nextMonth])commit((current)=>({...current,months:{...current.months,[nextMonth]:inheritedMonth(current,nextMonth)}}));setActiveMonth(nextMonth);},[commit]);
  const updateMonth=useCallback((updater:(plan:MonthlyPlan)=>MonthlyPlan)=>commit((current)=>{const active=current.months[month]??inheritedMonth(current,month);return{...current,months:{...current.months,[month]:updater(active)}};}),[commit,month]);
  const updateData=useCallback((updater:(value:BudgyData)=>BudgyData)=>commit(updater),[commit]);
  const replaceData=useCallback((next:BudgyData)=>commit(()=>clone(next)),[commit]);
  const resetData=useCallback(()=>{pendingWrites.current+=1;setSaving(true);void budgyRepository.reset(householdRef.current,initialMonth).then((next)=>{setData(next);setActiveMonth(initialMonth);setSyncError("");}).catch((error)=>setSyncError(error instanceof Error?error.message:"Reset failed.")).finally(()=>{pendingWrites.current-=1;setSaving(false);pendingRealtime.current=false;});},[]);
  const plan=data.months[month]??inheritedMonth(data,month);
  const value=useMemo(()=>({data,month,plan,saving,syncError,setMonth,updateMonth,updateData,replaceData,resetData,retry:refresh}),[data,month,plan,saving,syncError,setMonth,updateMonth,updateData,replaceData,resetData,refresh]);
  return <BudgyStore.Provider value={value}>{children}</BudgyStore.Provider>;
};
export const useBudgyStore=()=>{const value=useContext(BudgyStore);if(!value)throw new Error("useBudgyStore must be used inside BudgyStoreProvider");return value;};
export const isBudgyData=(value:unknown):value is BudgyData=>{if(!value||typeof value!=="object")return false;const candidate=value as Partial<BudgyData>;return candidate.schemaVersion===1&&!!candidate.months&&Array.isArray(candidate.categories)&&Array.isArray(candidate.transactions)&&Array.isArray(candidate.goals)&&Array.isArray(candidate.scenarios);};
