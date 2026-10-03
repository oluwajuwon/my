import {authDestination} from "./routing";
describe("Vela protected routing",()=>{
 test("waits for session resolution without flashing public auth",()=>expect(authDestination({loading:true,authenticated:false,recovery:false,onboardingComplete:false})).toBe("loading"));
 test("routes anonymous users to public account screens",()=>expect(authDestination({loading:false,authenticated:false,recovery:false,onboardingComplete:false})).toBe("public"));
 test("routes a new authenticated account to onboarding",()=>expect(authDestination({loading:false,authenticated:true,recovery:false,onboardingComplete:false})).toBe("onboarding"));
 test("routes an onboarded account to the protected app",()=>expect(authDestination({loading:false,authenticated:true,recovery:false,onboardingComplete:true})).toBe("app"));
 test("prioritises password recovery destination",()=>expect(authDestination({loading:false,authenticated:true,recovery:true,onboardingComplete:true})).toBe("reset-password"));
});
