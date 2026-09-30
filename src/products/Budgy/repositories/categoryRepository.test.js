const mockOrder=jest.fn();
const mockTypeEq=jest.fn(()=>({order:mockOrder}));
const mockHouseholdEq=jest.fn(()=>({eq:mockTypeEq}));
const mockSelect=jest.fn(()=>({eq:mockHouseholdEq}));
jest.mock("../infrastructure/supabase/client",()=>({requireSupabase:()=>({from:()=>({select:mockSelect})})}));

import{getCategories}from"./budgyRepository";

beforeEach(()=>{jest.clearAllMocks();mockOrder.mockResolvedValue({data:[],error:null});mockTypeEq.mockReturnValue({order:mockOrder});mockHouseholdEq.mockReturnValue({eq:mockTypeEq});mockSelect.mockReturnValue({eq:mockHouseholdEq});});

it.each(["expense","income"])("queries only %s categories for the household",async(type)=>{
  await getCategories("household-a",type);
  expect(mockHouseholdEq).toHaveBeenCalledWith("household_id","household-a");
  expect(mockTypeEq).toHaveBeenCalledWith("category_type",type);
  expect(mockOrder).toHaveBeenCalledWith("sort_order");
});
