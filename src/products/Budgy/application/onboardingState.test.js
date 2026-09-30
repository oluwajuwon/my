import{clearOnboardingSessionDismissal,dismissOnboardingForSession,isOnboardingDismissed,onboardingShouldOpen}from"./onboardingState";

const state=(completed=false)=>({userId:"user-a",displayName:"Ada",completed,completedAt:null,version:1,step:0});
beforeEach(()=>sessionStorage.clear());

it("shows onboarding for an incomplete user and not a completed user",()=>{
  expect(onboardingShouldOpen(state(false),false)).toBe(true);
  expect(onboardingShouldOpen(state(true),false)).toBe(false);
});

it("dismisses only the current user's current browser session",()=>{
  dismissOnboardingForSession("user-a");
  expect(isOnboardingDismissed("user-a")).toBe(true);
  expect(isOnboardingDismissed("user-b")).toBe(false);
  expect(onboardingShouldOpen(state(false),true)).toBe(false);
  clearOnboardingSessionDismissal("user-a");
  expect(onboardingShouldOpen(state(false),isOnboardingDismissed("user-a"))).toBe(true);
});

it("keeps onboarding independent for two household members",()=>{
  const completedMember={...state(true),userId:"user-a"};
  const invitedMember={...state(false),userId:"user-b",displayName:"Bisi"};
  expect(onboardingShouldOpen(completedMember,false)).toBe(false);
  expect(onboardingShouldOpen(invitedMember,false)).toBe(true);
});

it("replay eligibility never changes persisted completion",()=>{
  const completed=state(true);
  expect({...completed}).toEqual(completed);
  expect(onboardingShouldOpen(completed,false)).toBe(false);
});
