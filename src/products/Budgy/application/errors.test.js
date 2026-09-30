import { describeBudgyError, serviceErrorMessage } from "./errors";

it("reads messages from plain Supabase error objects",()=>{
  const error={code:"P0001",details:null,hint:null,message:"Budget allocation must belong to the same household and month"};
  expect(serviceErrorMessage(error)).toBe(error.message);
  expect(describeBudgyError(error)).toContain("budget item from another month");
});

it("turns common database and network failures into actionable copy",()=>{
  expect(describeBudgyError({code:"42501",message:"permission denied"})).toContain("permission");
  expect(describeBudgyError({message:"Failed to fetch"})).toContain("connection");
  expect(describeBudgyError({code:"PGRST204",message:"Could not find the column in the schema cache"})).toContain("migrations");
});

it("retains an unknown server reason instead of hiding it",()=>{
  expect(describeBudgyError({message:"A useful server reason"})).toContain("A useful server reason");
});
