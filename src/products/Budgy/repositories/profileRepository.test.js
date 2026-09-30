const mockSingle=jest.fn();
const mockEq=jest.fn(()=>({single:mockSingle}));
const mockSelect=jest.fn(()=>({eq:mockEq}));
const mockRpc=jest.fn();
const mockGetUser=jest.fn();
jest.mock("../infrastructure/supabase/client",()=>({requireSupabase:()=>({auth:{getUser:mockGetUser},from:()=>({select:mockSelect}),rpc:mockRpc})}));

import{CURRENT_ONBOARDING_VERSION,profileRepository}from"./profileRepository";

beforeEach(()=>{jest.clearAllMocks();mockGetUser.mockResolvedValue({data:{user:{id:"user-a"}},error:null});mockEq.mockReturnValue({single:mockSingle});mockSelect.mockReturnValue({eq:mockEq});});

it("loads onboarding from the authenticated user's profile",async()=>{
  mockSingle.mockResolvedValue({data:{id:"user-a",display_name:"Ada",onboarding_completed:false,onboarding_completed_at:null,onboarding_version:1,onboarding_step:2},error:null});
  await expect(profileRepository.getOnboardingState()).resolves.toEqual({userId:"user-a",displayName:"Ada",completed:false,completedAt:null,version:1,step:2});
  expect(mockEq).toHaveBeenCalledWith("id","user-a");
});

it("persists completion, timestamp and current version through the guarded RPC",async()=>{
  mockRpc.mockResolvedValue({error:null});
  mockSingle.mockResolvedValue({data:{id:"user-a",display_name:"Ada",onboarding_completed:true,onboarding_completed_at:"2026-09-30T10:00:00Z",onboarding_version:1,onboarding_step:5},error:null});
  const result=await profileRepository.completeOnboarding();
  expect(mockRpc).toHaveBeenCalledWith("complete_my_onboarding",{current_version:CURRENT_ONBOARDING_VERSION});
  expect(result).toMatchObject({completed:true,completedAt:"2026-09-30T10:00:00Z",version:1});
});

it("persists resumable progress through the authenticated profile RPC",async()=>{
  mockRpc.mockResolvedValue({error:null});
  await profileRepository.saveOnboardingStep(3);
  expect(mockRpc).toHaveBeenCalledWith("set_my_onboarding_step",{next_step:3});
});
