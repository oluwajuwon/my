import { requireSupabase } from "../infrastructure/supabase/client";
import { ProfileRow } from "../infrastructure/supabase/database.types";

export const CURRENT_ONBOARDING_VERSION = 1;

export interface UserOnboardingState {
  userId:string;
  displayName:string;
  completed:boolean;
  completedAt:string|null;
  version:number;
  step:number;
}

type OnboardingProfile=Pick<ProfileRow,"id"|"display_name"|"onboarding_completed"|"onboarding_completed_at"|"onboarding_version"|"onboarding_step">;
const toState=(profile:OnboardingProfile):UserOnboardingState=>({
  userId:profile.id,
  displayName:profile.display_name,
  completed:profile.onboarding_completed,
  completedAt:profile.onboarding_completed_at,
  version:profile.onboarding_version,
  step:profile.onboarding_step,
});

export const profileRepository={
  async getOnboardingState():Promise<UserOnboardingState>{
    const client=requireSupabase();
    const{data:userData,error:userError}=await client.auth.getUser();
    if(userError)throw userError;
    if(!userData.user)throw new Error("Authentication required");
    const{data,error}=await client.from("profiles").select("id,display_name,onboarding_completed,onboarding_completed_at,onboarding_version,onboarding_step").eq("id",userData.user.id).single();
    if(error)throw error;
    return toState(data as OnboardingProfile);
  },
  async saveOnboardingStep(step:number):Promise<void>{
    const{error}=await requireSupabase().rpc("set_my_onboarding_step",{next_step:step});
    if(error)throw error;
  },
  async completeOnboarding():Promise<UserOnboardingState>{
    const{error}=await requireSupabase().rpc("complete_my_onboarding",{current_version:CURRENT_ONBOARDING_VERSION});
    if(error)throw error;
    return this.getOnboardingState();
  },
};
