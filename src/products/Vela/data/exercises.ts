import catalogue from "./generated/exercises.json";
import { Exercise } from "../domain/types";

export const exercises = catalogue.exercises as Exercise[];

// These retired seed IDs had no exact RepDB equivalent. Resolve them to the
// closest maintained movement so saved workouts never become unreadable.
const retiredAliases:Record<string,string> = {
  "close-grip-pushup":"push-up",
  "world-stretch":"repdb-downward-dog-to-low-lunge",
};

const byId = new Map(exercises.map(exercise=>[exercise.id,exercise]));
const bySlug = new Map(exercises.map(exercise=>[exercise.slug,exercise]));

export const exerciseById = (id:string):Exercise => byId.get(id) ?? bySlug.get(id) ?? byId.get(retiredAliases[id]) ?? exercises[0];
export const exerciseCatalogueMeta = catalogue.source;
