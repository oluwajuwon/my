import React,{createContext,useContext}from"react";
import{HouseholdMembershipSummary,HouseholdSession}from"../repositories/householdRepository";
export interface HouseholdContextValue extends HouseholdSession { households: HouseholdMembershipSummary[]; backgroundFetching:boolean; switchHousehold:(id:string)=>void; reload:()=>void; }
const Context=createContext<HouseholdContextValue|null>(null);
export const HouseholdProvider:React.FC<{value:HouseholdContextValue;children:React.ReactNode}>=({value,children})=><Context.Provider value={value}>{children}</Context.Provider>;
export const useHousehold=()=>{const value=useContext(Context);if(!value)throw new Error("useHousehold must be inside HouseholdProvider");return value;};
