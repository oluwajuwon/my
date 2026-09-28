import React,{useCallback,useEffect,useRef,useState}from"react";
import{BudgyData}from"../domain/types";
import{useAuth}from"../auth/AuthProvider";
import{AuthPage,NewPassword}from"../auth/AuthPage";
import{Onboarding}from"../auth/Onboarding";
import{HouseholdProvider}from"./HouseholdContext";
import{HouseholdMembershipSummary,HouseholdSession,householdRepository}from"../repositories/householdRepository";
import{budgyRepository}from"../repositories/budgyRepository";
import{LocalMigrationCandidate,localMigration}from"./localMigration";
import{BudgyStoreProvider}from"../store/BudgyStore";
import LegacyImport from"./LegacyImport";

const Loading=()=> <main className="budgy-loading" aria-live="polite"><div className="budgy-brand"><span className="budgy-brand-mark">B</span><span className="budgy-brand-name">budgy</span></div><div className="budgy-skeleton-card"><span/><span/><span/></div><p>Opening your household…</p></main>;

export const BudgyBootstrap:React.FC<{children:React.ReactNode}>=({children})=>{
  const{session,initialLoading}=useAuth();
  const userId=session?.user.id;
  const[household,setHousehold]=useState<HouseholdSession|null|undefined>(undefined);
  const[households,setHouseholds]=useState<HouseholdMembershipSummary[]>([]);
  const[data,setData]=useState<BudgyData|null>(null);
  const[candidate,setCandidate]=useState<LocalMigrationCandidate|null|undefined>(undefined);
  const[error,setError]=useState("");
  const[backgroundFetching,setBackgroundFetching]=useState(false);
  const loaded=useRef(false);

  const load=useCallback(async(preferredId?:string,resetVisibleState=false)=>{
    setError("");
    if(resetVisibleState||!loaded.current){setHousehold(undefined);setData(null);}else setBackgroundFetching(true);
    try{
      const available=await householdRepository.list();
      setHouseholds(available);
      const saved=userId?localStorage.getItem(`budgy.activeHousehold.${userId}`)??undefined:undefined;
      const next=await householdRepository.current(preferredId??saved);
      setHousehold(next);
      if(!next){setData(null);loaded.current=false;return;}
      if(userId)localStorage.setItem(`budgy.activeHousehold.${userId}`,next.household.id);
      await budgyRepository.ensureBaseline(next,"2026-09");
      const migration=await localMigration.candidate(next.household.id);
      const skipped=migration&&localStorage.getItem(`budgy.migration.skipped.${next.household.id}.${migration.hash}`);
      setCandidate(skipped?null:migration);
      if(!migration||skipped){setData(await budgyRepository.load(next));loaded.current=true;}
    }catch(reason){setError(reason instanceof Error?reason.message:"Budgy could not load your household.");}
    finally{setBackgroundFetching(false);}
  },[userId]);

  useEffect(()=>{
    if(userId)void load(undefined,true);
    else{loaded.current=false;setHousehold(undefined);setData(null);setCandidate(undefined);}
  },[userId,load]);

  if(initialLoading)return <Loading/>;
  if(!session)return <AuthPage/>;
  if(window.location.pathname.endsWith("/reset-password"))return <NewPassword/>;
  if(error&&!data)return <main className="budgy-state-page"><h1>We couldn’t open Budgy</h1><p>{error}</p><button className="budgy-button budgy-button--primary" onClick={()=>void load(undefined,true)}>Try again</button></main>;
  if(household===undefined)return <Loading/>;
  if(household===null)return <Onboarding onComplete={()=>load(undefined,true)}/>;
  if(candidate)return <LegacyImport candidate={candidate} household={household} onRefreshMembers={()=>void load(household.household.id)} onError={setError} onSkip={async()=>{localStorage.setItem(`budgy.migration.skipped.${household.household.id}.${candidate.hash}`,"true");setCandidate(null);setData(await budgyRepository.load(household));loaded.current=true;}} onImport={async(mapping)=>{await localMigration.import(candidate,household,mapping);setCandidate(null);setData(await budgyRepository.load(household));loaded.current=true;}}/>;
  if(!data)return <Loading/>;
  const householdContext={...household,households,backgroundFetching,switchHousehold:(id:string)=>void load(id,true),reload:()=>void load(household.household.id)};
  return <HouseholdProvider value={householdContext}><BudgyStoreProvider initialData={data} household={household}>{children}</BudgyStoreProvider></HouseholdProvider>;
};
