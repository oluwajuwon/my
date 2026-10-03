import { Exercise, Readiness, UserProfile, Workout, WorkoutExercise, WorkoutRecommendation } from "./types";
import { exercises } from "../data/exercises";

const splits:Record<number,Array<{title:string;focus:string;muscles:string[]}>> = {
  2:[{title:"Full Body A",focus:"Strength foundation",muscles:["quads","chest","back","hamstrings","shoulders","core"]},{title:"Full Body B",focus:"Balanced strength",muscles:["glutes","back","chest","quads","shoulders","core"]}],
  3:[{title:"Full Body A",focus:"Strength",muscles:["quads","chest","back","hamstrings","core"]},{title:"Full Body B",focus:"Hypertrophy",muscles:["glutes","shoulders","back","chest","quads"]},{title:"Full Body C",focus:"Athletic base",muscles:["hamstrings","chest","back","quads","core"]}],
  4:[{title:"Upper Strength",focus:"Chest · Back · Shoulders",muscles:["chest","back","shoulders","biceps","triceps"]},{title:"Lower Strength",focus:"Quads · Glutes · Hamstrings",muscles:["quads","hamstrings","glutes","calves","core"]},{title:"Upper Volume",focus:"Upper body volume",muscles:["back","chest","shoulders","biceps","triceps"]},{title:"Lower Volume",focus:"Lower body volume",muscles:["glutes","quads","hamstrings","calves","core"]}],
  5:[{title:"Push",focus:"Chest · Shoulders · Triceps",muscles:["chest","shoulders","triceps"]},{title:"Pull",focus:"Back · Biceps",muscles:["back","biceps"]},{title:"Legs",focus:"Quads · Hamstrings · Glutes",muscles:["quads","hamstrings","glutes","calves"]},{title:"Upper",focus:"Upper balance",muscles:["chest","back","shoulders","biceps"]},{title:"Lower",focus:"Lower balance",muscles:["quads","glutes","hamstrings","core"]}],
};
const makeSet=(exerciseId:string,index:number,profile:UserProfile)=>({id:`${exerciseId}-set-${index}`,targetReps:[profile.goal==="get-stronger"?5:8,profile.goal==="get-stronger"?8:12] as [number,number],targetWeightKg:exerciseId.includes("squat")?60:exerciseId.includes("rdl")?70:exerciseId.includes("bench")?26:exerciseId.includes("row")?42:exerciseId.includes("raise")?8:20});

export const generateWorkout = (profile:UserProfile, dayIndex=0, date=new Date()):Workout => {
  const strategy=splits[Math.min(5,Math.max(2,profile.daysPerWeek))] ?? splits[4]; const day=strategy[dayIndex%strategy.length];
  const allowed=(exercise:Exercise)=>exercise.equipment.every((item)=>item==="bodyweight"||profile.equipment.includes(item))&&!profile.dislikedExercises.includes(exercise.id);
  const chosen:Exercise[]=[];
  day.muscles.forEach((muscle)=>{const match=exercises.find((item)=>item.category===muscle&&allowed(item)&&!chosen.includes(item));if(match)chosen.push(match);});
  exercises.filter(allowed).forEach((item)=>{if(chosen.length<7&&!chosen.includes(item)&&day.muscles.includes(item.category))chosen.push(item);});
  const workoutExercises:WorkoutExercise[]=chosen.slice(0,profile.workoutMinutes<=30?5:7).map((exercise,index)=>({id:`we-${dayIndex}-${index}`,exerciseId:exercise.id,restSeconds:index<3?120:75,priority:index+1,sets:Array.from({length:index<3?3:2},(_,set)=>makeSet(exercise.id,set,profile))}));
  return {id:`workout-${date.toISOString().slice(0,10)}-${dayIndex}`,title:day.title,focus:day.focus,date:date.toISOString().slice(0,10),estimatedMinutes:profile.workoutMinutes,exercises:workoutExercises,status:"planned"};
};

export const compressWorkout=(workout:Workout,minutes:number):Workout=>{
  const budget=Math.max(20,minutes); const maxExercises=budget<=20?3:budget<=30?4:budget<=45?5:workout.exercises.length;
  return {...workout,estimatedMinutes:budget,exercises:workout.exercises.sort((a,b)=>a.priority-b.priority).slice(0,maxExercises).map((item,index)=>({...item,sets:index<2?item.sets:item.sets.slice(0,Math.max(2,item.sets.length-1)),restSeconds:Math.min(item.restSeconds,budget<=30?75:item.restSeconds)}))};
};
export const adaptForReadiness=(workout:Workout,readiness:Readiness):Workout=>{
  const score=(readiness.energy+readiness.sleep+readiness.motivation+(6-readiness.soreness)+(6-readiness.stress))/5;
  if(score>=3)return workout;
  return {...workout,estimatedMinutes:Math.max(25,workout.estimatedMinutes-10),exercises:workout.exercises.map((item)=>({...item,sets:item.priority>3?item.sets.slice(0,Math.max(2,item.sets.length-1)):item.sets,restSeconds:item.restSeconds+15}))};
};
export const recommendProgression=(target:[number,number],weightKg:number,lastReps:number[],lastRir?:number):WorkoutRecommendation=>{
  if(!lastReps.length)return {weightKg,reps:Array(3).fill(target[0]),reason:"Start conservatively and leave 2–3 good reps in reserve.",action:"hold"};
  const allTop=lastReps.every((rep)=>rep>=target[1]); const failed=lastReps.some((rep)=>rep<target[0]-1);
  if(allTop&&(lastRir===undefined||lastRir>=1))return {weightKg:Math.round((weightKg+2)*2)/2,reps:Array(lastReps.length).fill(target[0]),reason:`You reached ${target[1]} on every set with control. Add a small load.`,action:"increase"};
  if(failed)return {weightKg:lastReps.filter((rep)=>rep<target[0]-1).length>1?Math.max(0,weightKg-2):weightKg,reps:lastReps.map((rep)=>Math.max(target[0],rep)),reason:"Performance dipped below the range. Consolidate technique before adding load.",action:lastReps.filter((rep)=>rep<target[0]-1).length>1?"reduce":"hold"};
  return {weightKg,reps:lastReps.map((rep)=>Math.min(target[1],rep+1)),reason:"Keep the load and add reps across the sets.",action:"hold"};
};
export const rankSubstitutions=(source:Exercise,profile:UserProfile):Exercise[]=>exercises.filter((item)=>item.id!==source.id&&item.equipment.every((eq)=>eq==="bodyweight"||profile.equipment.includes(eq))&&!profile.dislikedExercises.includes(item.id)).map((item)=>({item,score:(item.movementPattern===source.movementPattern?5:0)+(item.primaryMuscles.some((m)=>source.primaryMuscles.includes(m))?3:0)+(item.difficulty===source.difficulty?1:0)})).filter(({score})=>score>=3).sort((a,b)=>b.score-a.score).slice(0,6).map(({item})=>item);
export const workoutVolume=(workout:Workout)=>workout.exercises.flatMap((item)=>item.sets).reduce((sum,set)=>sum+(set.completedReps??0)*(set.completedWeightKg??set.targetWeightKg),0);
