import { UserOnboardingState } from "../repositories/profileRepository";

const DISMISSAL_PREFIX="budgy:onboarding-dismissed-session";
export const onboardingDismissalKey=(userId:string)=>`${DISMISSAL_PREFIX}:${userId}`;

export const onboardingShouldOpen=(state:UserOnboardingState,sessionDismissed:boolean)=>!state.completed&&!sessionDismissed;
export const isOnboardingDismissed=(userId:string)=>{try{return sessionStorage.getItem(onboardingDismissalKey(userId))==="true";}catch{return false;}};
export const dismissOnboardingForSession=(userId:string)=>{try{sessionStorage.setItem(onboardingDismissalKey(userId),"true");}catch{/* Session storage can be unavailable. */}};
export const clearOnboardingSessionDismissal=(userId:string)=>{try{sessionStorage.removeItem(onboardingDismissalKey(userId));}catch{/* Session storage can be unavailable. */}};

export type OnboardingEventName="onboarding_started"|"onboarding_step_viewed"|"onboarding_skipped"|"onboarding_completed"|"onboarding_replayed";
export const recordOnboardingEvent=(name:OnboardingEventName,step?:number)=>{
  if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent("budgy:onboarding",{detail:{name,step}}));
};
