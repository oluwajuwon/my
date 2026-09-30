import React from"react";
import{act}from"react";
import{createRoot}from"react-dom/client";

const mockCompleteOnboarding=jest.fn();
const mockSaveStep=jest.fn();
jest.mock("../repositories/profileRepository",()=>({profileRepository:{completeOnboarding:(...args)=>mockCompleteOnboarding(...args),saveOnboardingStep:(...args)=>mockSaveStep(...args)}}));
jest.mock("../components/OnboardingWalkthrough",()=>({displayName,onSkip,onFinish})=><div data-testid="walkthrough"><span>{displayName}</span><button onClick={onSkip}>skip</button><button onClick={onFinish}>finish</button></div>);
jest.mock("../components/GuidedOnboarding",()=>({displayName,onSkip,onFinish})=><div data-testid="walkthrough"><span>{displayName}</span><button onClick={onSkip}>skip</button><button onClick={onFinish}>finish</button></div>);
jest.mock("../store/BudgyStore",()=>({useBudgyStore:()=>({data:{accounts:[]},plan:{income:[],budget:[],savings:0}})}));
jest.mock("./HouseholdContext",()=>({useHousehold:()=>({household:{created_by:"user-a"}})}));

import{OnboardingProvider,useOnboarding}from"./OnboardingContext";

const incomplete={userId:"user-a",displayName:"Ada",completed:false,completedAt:null,version:1,step:0};
const completed={...incomplete,completed:true,completedAt:"2026-09-30T10:00:00Z"};
const Replay=()=>{const{replay}=useOnboarding();return <button onClick={replay}>replay</button>;};
let container;let root;
beforeAll(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;});
const mount=async(state=incomplete)=>{container=document.createElement("div");document.body.appendChild(container);root=createRoot(container);await act(async()=>{root.render(<OnboardingProvider initialState={state}><Replay/></OnboardingProvider>);});};
const click=async(label)=>{const button=Array.from(container.querySelectorAll("button")).find((entry)=>entry.textContent===label);await act(async()=>{button.click();});};
afterEach(async()=>{if(root)await act(async()=>root.unmount());container?.remove();root=null;sessionStorage.clear();jest.clearAllMocks();});

it("shows an incomplete user and closes immediately after successful persistence",async()=>{
  mockCompleteOnboarding.mockResolvedValue(completed);await mount();expect(container.querySelector("[data-testid=walkthrough]")).not.toBeNull();
  await click("finish");expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);expect(container.querySelector("[data-testid=walkthrough]")).toBeNull();
});

it("skip leaves the database untouched and does not reopen in the same session",async()=>{
  await mount();await click("skip");expect(mockCompleteOnboarding).not.toHaveBeenCalled();expect(container.querySelector("[data-testid=walkthrough]")).toBeNull();
  await act(async()=>root.unmount());root=null;container.remove();await mount();expect(container.querySelector("[data-testid=walkthrough]")).toBeNull();
});

it("a fresh session can show skipped onboarding again",async()=>{
  await mount();await click("skip");await act(async()=>root.unmount());root=null;container.remove();sessionStorage.clear();await mount();expect(container.querySelector("[data-testid=walkthrough]")).not.toBeNull();
});

it("does not reopen skipped onboarding when the window regains focus",async()=>{
  await mount();await click("skip");
  await act(async()=>window.dispatchEvent(new Event("focus")));
  expect(container.querySelector("[data-testid=walkthrough]")).toBeNull();expect(mockCompleteOnboarding).not.toHaveBeenCalled();
});

it("completed users only see replay and replay does not reset or rewrite completion",async()=>{
  await mount(completed);expect(container.querySelector("[data-testid=walkthrough]")).toBeNull();await click("replay");expect(container.querySelector("[data-testid=walkthrough]")).not.toBeNull();await click("finish");expect(mockCompleteOnboarding).not.toHaveBeenCalled();expect(container.querySelector("[data-testid=walkthrough]")).toBeNull();
});
