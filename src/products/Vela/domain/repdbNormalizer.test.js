const {mapEquipment,movementPattern,normalizeExercise}=require("../../../../scripts/vela-exercises/repdb/normalizer");
const {validateRepDbDataset,validateCatalogue}=require("../../../../scripts/vela-exercises/repdb/validation");

const fixture={id:"fixture-press",name_en:"Fixture Bench Press",description_en:"Fixture",category:"strength",force_type:"push",mechanic:"compound",difficulty:"beginner",equipment:"dumbbell",body_part:"chest",primary_muscles:["pectoralis_major"],secondary_muscles:["triceps_brachii"],goals:["hypertrophy"],tags:["requires_bench"],is_unilateral:false,is_bodyweight:false,instructions_en:["Set up."],tips_en:["Stay controlled."],images:{flat:{start:"images/flat/fixture-start.webp",peak:"images/flat/fixture-peak.webp"}}};

describe("RepDB normalizer",()=>{
 test("maps source equipment to Vela capabilities",()=>{expect(mapEquipment("lat_pulldown_machine",false)).toEqual(["machine"]);expect(mapEquipment("dumbbell",false,["requires_bench"])).toEqual(["dumbbell","bench"]);});
 test("derives movement patterns deterministically",()=>{expect(movementPattern(fixture)).toBe("push-horizontal");});
 test("produces a valid normalized record",()=>{expect(()=>validateCatalogue([normalizeExercise(fixture)])).not.toThrow();});
 test("rejects malformed records",()=>{expect(()=>validateCatalogue([{id:"bad"}])).toThrow(/validation failed/);});
 test("rejects duplicate source IDs",()=>{expect(()=>validateRepDbDataset({schema_version:3,exercises:[fixture,fixture]})).toThrow(/duplicate source id/);});
});
