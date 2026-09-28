import { isMoreRoute, quickAddOptions } from "./mobileNavigation";

it.each(["/budgy/transactions","/budgy/reports","/budgy/goals","/budgy/projections","/budgy/scenarios","/budgy/settings","/budgy/settings/household"])("marks %s as More",(path)=>expect(isMoreRoute(path)).toBe(true));
it.each(["/budgy","/budgy/budget","/budgy/money"])("does not mark %s as More",(path)=>expect(isMoreRoute(path)).toBe(false));

it("maps Quick Add actions onto existing transaction flows",()=>{
  expect(quickAddOptions.map((option)=>option.type)).toEqual(["expense","income","transfer","credit_card_payment"]);
  expect(quickAddOptions[0]).toMatchObject({label:"Transaction",primary:true});
});
