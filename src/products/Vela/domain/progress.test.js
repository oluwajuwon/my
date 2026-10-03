import { demoProfile } from "../data/demo";
import { generateWorkout } from "./training";
import { completionSummary, detectPersonalRecords, finaliseWorkout } from "./progress";

describe("Vela workout completion",()=>{
 test("finalises completed workout state and summarises logged work",()=>{const workout=generateWorkout(demoProfile,0);const set=workout.exercises[0].sets[0];set.completedReps=10;set.completedWeightKg=30;set.completedAt="2026-10-02T10:00:00Z";const complete=finaliseWorkout(workout,"2026-10-02T11:00:00Z");expect(complete.status).toBe("complete");expect(completionSummary(complete)).toMatchObject({sets:1,exercises:1,volume:300});});
 test("detects meaningful weight and rep records",()=>{const workout=generateWorkout(demoProfile,0);workout.exercises[0].sets[0]={...workout.exercises[0].sets[0],completedReps:12,completedWeightKg:35,completedAt:"2026-10-02T10:00:00Z"};const records=detectPersonalRecords(workout,[]);expect(records.map((record)=>record.kind)).toEqual(expect.arrayContaining(["weight","reps"]));});
});
