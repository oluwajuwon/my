import { exercises,exerciseById } from "../data/exercises";
import { searchExercises } from "./exerciseSearch";

describe("Vela exercise catalogue",()=>{
 test("imports a validated full RepDB catalogue",()=>{expect(exercises).toHaveLength(609);expect(new Set(exercises.map(item=>item.id)).size).toBe(exercises.length);exercises.forEach(item=>{expect(item.instructions.length).toBeGreaterThan(0);expect(item.primaryMuscles.length).toBeGreaterThan(0);expect(item.source.provider).toBe("RepDB");});});
 test("preserves historical core IDs",()=>{expect(exerciseById("barbell-bench").source.externalId).toBe("bench-press");expect(exerciseById("back-squat").source.externalId).toBe("squat");});
 test("searches text and combines filters",()=>{const results=searchExercises(exercises,"press",{equipment:"dumbbell",difficulty:"beginner",muscleGroup:"chest"});expect(results.length).toBeGreaterThan(0);results.forEach(item=>{expect(item.equipment).toContain("dumbbell");expect(item.difficulty).toBe("beginner");expect(item.category).toBe("chest");});});
 test("keeps pose media inside the Vela RepDB asset directory",()=>{exercises.filter(item=>item.media).forEach(item=>expect(item.media.start).toMatch(/^\/vela\/exercises\/repdb\/[a-z0-9-]+\.webp$/));});
});
