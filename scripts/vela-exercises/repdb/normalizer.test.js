const {mapEquipment,movementPattern,normalizeExercise}=require("./normalizer");
const {validateCatalogue}=require("./validation");

const fixture={id:"fixture-press",name_en:"Fixture Bench Press",description_en:"Fixture",category:"strength",force_type:"push",mechanic:"compound",difficulty:"beginner",equipment:"dumbbell",body_part:"chest",primary_muscles:["pectoralis_major"],secondary_muscles:["triceps_brachii"],goals:["hypertrophy"],tags:["requires_bench"],is_unilateral:false,is_bodyweight:false,instructions_en:["Set up."],tips_en:["Stay controlled."],images:{flat:{start:"images/flat/fixture-start.webp",peak:"images/flat/fixture-peak.webp"}}};

describe("RepDB normalizer",()=>{
 test("maps detailed source equipment to Vela capabilities",()=>{expect(mapEquipment("lat_pulldown_machine",false)).toEqual(["machine"]);expect(mapEquipment("dumbbell",false,["requires_bench"])).toEqual(["dumbbell","bench"]);});
 test("derives a movement pattern deterministically",()=>{expect(movementPattern(fixture)).toBe("push-horizontal");});
 test("produces a record accepted by runtime validation",()=>{expect(()=>validateCatalogue([normalizeExercise(fixture)])).not.toThrow();});
 test("rejects malformed records",()=>{expect(()=>validateCatalogue([{id:"bad"}])).toThrow(/validation failed/);});
});
