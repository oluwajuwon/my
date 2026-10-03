export type AuthDestination="loading"|"public"|"reset-password"|"onboarding"|"app";
export const authDestination=(input:{loading:boolean;authenticated:boolean;recovery:boolean;onboardingComplete:boolean}):AuthDestination=>{
 if(input.loading)return "loading";
 if(input.recovery)return "reset-password";
 if(!input.authenticated)return "public";
 return input.onboardingComplete?"app":"onboarding";
};
