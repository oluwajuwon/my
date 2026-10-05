import { Exercise, Equipment, Experience, MovementPattern, MuscleGroup } from "./types";

export interface ExerciseFilters {
  equipment?:Equipment;
  difficulty?:Experience;
  movementPattern?:MovementPattern;
  muscleGroup?:MuscleGroup;
  tier?:Exercise["catalogueTier"];
}

const searchable=(exercise:Exercise)=>[
  exercise.name,exercise.description,exercise.category,exercise.movementPattern,
  ...exercise.primaryMuscles,...exercise.secondaryMuscles,...exercise.equipment,...exercise.tags,
].join(" ").toLowerCase();

export const searchExercises=(items:Exercise[],query="",filters:ExerciseFilters={}):Exercise[]=>{
  const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(exercise=>{
    if(filters.equipment&&!exercise.equipment.includes(filters.equipment))return false;
    if(filters.difficulty&&exercise.difficulty!==filters.difficulty)return false;
    if(filters.movementPattern&&exercise.movementPattern!==filters.movementPattern)return false;
    if(filters.muscleGroup&&exercise.category!==filters.muscleGroup)return false;
    if(filters.tier&&exercise.catalogueTier!==filters.tier)return false;
    const haystack=searchable(exercise);return terms.every(term=>haystack.includes(term));
  }).sort((a,b)=>(a.catalogueTier==="core"?-2:a.catalogueTier==="standard"?-1:0)-(b.catalogueTier==="core"?-2:b.catalogueTier==="standard"?-1:0)||a.name.localeCompare(b.name));
};
