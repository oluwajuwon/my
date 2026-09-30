import React,{createContext,useContext,useState}from"react";
import{profileRepository,UserOnboardingState}from"../repositories/profileRepository";
import{dismissOnboardingForSession,isOnboardingDismissed,onboardingShouldOpen,recordOnboardingEvent}from"./onboardingState";
import OnboardingWalkthrough from"../components/OnboardingWalkthrough";
import GuidedOnboarding from"../components/GuidedOnboarding";
import{useBudgyStore}from"../store/BudgyStore";
import{useHousehold}from"./HouseholdContext";

interface OnboardingContextValue{replay:()=>void;completed:boolean;}
const Context=createContext<OnboardingContextValue|null>(null);

export const OnboardingProvider:React.FC<{initialState:UserOnboardingState;children:React.ReactNode}>=({initialState,children})=>{
  const[state,setState]=useState(initialState);
  const[open,setOpen]=useState(()=>onboardingShouldOpen(initialState,isOnboardingDismissed(initialState.userId)));
  const[replaying,setReplaying]=useState(false);
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState("");
  const{data,plan}=useBudgyStore();const household=useHousehold();
  const hasFinancialSetup=plan.income.length>0||plan.budget.length>0||plan.savings>0||data.accounts.length>0;
  const orientation=household.household.created_by!==state.userId&&hasFinancialSetup;
  const replay=()=>{setReplaying(true);setOpen(true);setError("");recordOnboardingEvent("onboarding_replayed");};
  const skip=()=>{if(!replaying)dismissOnboardingForSession(state.userId);setOpen(false);setReplaying(false);recordOnboardingEvent("onboarding_skipped");};
  const finish=async()=>{
    if(replaying&&state.completed){setOpen(false);setReplaying(false);recordOnboardingEvent("onboarding_completed",5);return;}
    setBusy(true);setError("");
    try{const completed=await profileRepository.completeOnboarding();setState(completed);setOpen(false);setReplaying(false);recordOnboardingEvent("onboarding_completed",5);}
    catch(reason){setError(reason instanceof Error?reason.message:"Budgy could not save your onboarding progress.");}
    finally{setBusy(false);}
  };
  const saveStep=async(step:number,save?:()=>Promise<void>)=>{setBusy(true);setError("");try{if(save)await save();await profileRepository.saveOnboardingStep(step);setState((current)=>({...current,step:Math.max(current.step,step)}));recordOnboardingEvent("onboarding_step_viewed",step+1);}catch(reason){setError(reason instanceof Error?reason.message:"Budgy could not save this step.");throw reason;}finally{setBusy(false);}};
  return <Context.Provider value={{replay,completed:state.completed}}>{children}{open&&(replaying?<OnboardingWalkthrough displayName={state.displayName} replaying busy={busy} error={error} onSkip={skip} onFinish={()=>void finish()}/>:<GuidedOnboarding displayName={state.displayName} initialStep={state.step} orientation={orientation} busy={busy} error={error} onSaveStep={saveStep} onSkip={skip} onFinish={()=>void finish()}/>)}</Context.Provider>;
};

export const useOnboarding=()=>{const value=useContext(Context);if(!value)throw new Error("useOnboarding must be inside OnboardingProvider");return value;};
