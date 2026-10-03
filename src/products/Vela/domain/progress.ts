import { PersonalRecord, Workout } from "./types";
import { workoutVolume } from "./training";

export const detectPersonalRecords=(workout:Workout,existing:PersonalRecord[],date=workout.date):PersonalRecord[]=>{
 const next:PersonalRecord[]=[];
 workout.exercises.forEach((item)=>{
  const completed=item.sets.filter((set)=>set.completedReps!==undefined&&set.completedWeightKg!==undefined);
  if(!completed.length)return;
  const weight=Math.max(...completed.map((set)=>set.completedWeightKg??0));
  const reps=Math.max(...completed.map((set)=>set.completedReps??0));
  const priorWeight=Math.max(0,...existing.filter((record)=>record.exerciseId===item.exerciseId&&record.kind==="weight").map((record)=>record.value));
  const priorReps=Math.max(0,...existing.filter((record)=>record.exerciseId===item.exerciseId&&record.kind==="reps").map((record)=>record.value));
  if(weight>priorWeight)next.push({id:`pr-${item.exerciseId}-weight-${date}`,exerciseId:item.exerciseId,kind:"weight",value:weight,date});
  if(reps>priorReps)next.push({id:`pr-${item.exerciseId}-reps-${date}`,exerciseId:item.exerciseId,kind:"reps",value:reps,date});
 });
 return next;
};

export const finaliseWorkout=(workout:Workout,completedAt=new Date().toISOString()):Workout=>({...workout,status:"complete",completedAt});
export const completionSummary=(workout:Workout)=>({sets:workout.exercises.flatMap((item)=>item.sets).filter((set)=>set.completedAt).length,exercises:workout.exercises.filter((item)=>item.sets.some((set)=>set.completedAt)).length,volume:workoutVolume(workout)});
