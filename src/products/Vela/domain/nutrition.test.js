import { calculateMacroTarget, findMealReplacements } from "./nutrition";
import { demoProfile } from "../data/demo";
import { recipeById, recipes } from "../data/recipes";

describe("Vela nutrition",()=>{
 test("calculates safeguarded calorie and macro targets",()=>{const target=calculateMacroTarget(demoProfile);expect(target.calories).toBeGreaterThanOrEqual(1500);expect(target.protein).toBe(Math.round(demoProfile.weightKg*2));expect(target.carbs).toBeGreaterThan(50);});
 test("meal replacements stay within calorie tolerance and meal type",()=>{const original=recipeById("salmon-potato");const matches=findMealReplacements(original,recipes,demoProfile,.25);expect(matches.length).toBeGreaterThan(0);matches.forEach((recipe)=>{expect(recipe.mealType).toBe(original.mealType);expect(Math.abs(recipe.calories-original.calories)).toBeLessThanOrEqual(original.calories*.25);});});
});
