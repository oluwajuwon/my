import { demoProfile } from "../data/demo";
import { exerciseById } from "../data/exercises";
import { compressWorkout, generateWorkout, rankSubstitutions, recommendProgression } from "./training";

describe("Vela training engine",()=>{
 test("generates a data-driven workout using available equipment",()=>{const workout=generateWorkout(demoProfile,0,new Date("2026-10-02T12:00:00Z"));expect(workout.exercises.length).toBeGreaterThanOrEqual(5);workout.exercises.forEach((item)=>exerciseById(item.exerciseId).equipment.forEach((equipment)=>expect(equipment==="bodyweight"||demoProfile.equipment.includes(equipment)).toBe(true)));});
 test("supports dumbbell-only profiles",()=>{const workout=generateWorkout({...demoProfile,equipment:["bodyweight","dumbbell"],daysPerWeek:3},0);workout.exercises.forEach((item)=>exerciseById(item.exerciseId).equipment.forEach((equipment)=>expect(["bodyweight","dumbbell"].includes(equipment)).toBe(true)));});
 test("compresses a session without dropping priority compounds",()=>{const workout=generateWorkout(demoProfile,0);const short=compressWorkout(workout,20);expect(short.estimatedMinutes).toBe(20);expect(short.exercises.length).toBe(3);expect(short.exercises[0].id).toBe(workout.exercises[0].id);});
 test("progresses only after the top of the rep range is owned",()=>{expect(recommendProgression([8,10],26,[10,10,10],2).action).toBe("increase");expect(recommendProgression([8,10],26,[10,9,8],2).action).toBe("hold");expect(recommendProgression([8,10],26,[6,5,5],0).action).toBe("reduce");});
 test("ranks substitutions by movement intent",()=>{const source=exerciseById("barbell-bench");const alternatives=rankSubstitutions(source,demoProfile);expect(alternatives.length).toBeGreaterThan(0);expect(alternatives[0].primaryMuscles).toContain("chest");});
});
