export type Goal = "lose-fat" | "build-muscle" | "get-stronger" | "general-fitness" | "athletic" | "maintain";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Equipment = "bodyweight" | "dumbbell" | "barbell" | "bench" | "cable" | "machine" | "band" | "kettlebell" | "pull-up-bar" | "cardio" | "smith-machine" | "ez-bar" | "trap-bar" | "plates" | "dip-station" | "rings" | "ab-wheel" | "stability-ball" | "plyo-box" | "suspension-trainer" | "battle-rope" | "jump-rope" | "sled" | "medicine-ball" | "climbing-rope" | "other";
export type MuscleGroup = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "quads" | "hamstrings" | "glutes" | "calves" | "core" | "forearms" | "full-body" | "cardio" | "mobility";
export type Muscle = "abductors" | "adductors" | "anterior-deltoid" | "biceps-brachii" | "brachialis" | "brachioradialis" | "erector-spinae" | "forearm-extensors" | "forearm-flexors" | "forearms" | "gastrocnemius" | "gluteus-maximus" | "gluteus-medius" | "hamstrings" | "hip-flexors" | "lateral-deltoid" | "latissimus-dorsi" | "obliques" | "pectoralis-major" | "posterior-deltoid" | "quadratus-lumborum" | "quadriceps" | "rectus-abdominis" | "rhomboids" | "serratus-anterior" | "soleus" | "supraspinatus" | "transverse-abdominis" | "trapezius" | "triceps-brachii";
export type MovementPattern = "push-horizontal" | "push-vertical" | "pull-horizontal" | "pull-vertical" | "squat" | "hinge" | "lunge" | "carry" | "isolation" | "core" | "cardio" | "mobility";
export type ProgressionType = "double" | "reps" | "weight" | "bodyweight" | "time";

export interface UserProfile { name:string; goal:Goal; experience:Experience; location:"full-gym"|"home-gym"|"home"|"outdoors"|"mixed"; equipment:Equipment[]; daysPerWeek:number; workoutMinutes:number; heightCm:number; weightKg:number; targetWeightKg?:number; age:number; sex:"female"|"male"|"other"; activity:"low"|"moderate"|"high"; styles:string[]; dislikedExercises:string[]; limitations:string[]; diet:"balanced"|"vegetarian"|"vegan"|"pescatarian"; restrictions:string[]; dislikedFoods:string[]; mealsPerDay:number; cooking:"minimal"|"some"|"enjoy"; unit:"kg"|"lb"; onboarded:boolean; }
export interface ExerciseMedia { start:string; end?:string; kind:"single"|"start-end"; }
export interface ExerciseSource { provider:"RepDB"|"Vela"; externalId:string; url:string; schemaVersion:number; }
export interface Exercise { id:string; slug:string; name:string; description:string; category:MuscleGroup; bodyParts:string[]; movementPattern:MovementPattern; primaryMuscles:Muscle[]; secondaryMuscles:Muscle[]; equipment:Equipment[]; difficulty:Experience; exerciseType:"cardio"|"olympic"|"plyometrics"|"strength"|"stretching"; forceType:"dynamic"|"pull"|"push"|"static"; mechanic:"compound"|"isolation"; instructions:string[]; cues:string[]; commonMistakes:string[]; goals:string[]; tags:string[]; unilateral:boolean; bodyweight:boolean; progressionType:ProgressionType; substitutionGroup:string; substitutions:string[]; catalogueTier:"core"|"standard"|"specialized"; media?:ExerciseMedia; source:ExerciseSource; }
export interface WorkoutSet { id:string; targetReps:[number,number]; targetWeightKg:number; completedReps?:number; completedWeightKg?:number; rir?:number; completedAt?:string; }
export interface WorkoutExercise { id:string; exerciseId:string; sets:WorkoutSet[]; restSeconds:number; priority:number; }
export interface Workout { id:string; title:string; focus:string; date:string; estimatedMinutes:number; exercises:WorkoutExercise[]; status:"planned"|"active"|"complete"|"skipped"; startedAt?:string; completedAt?:string; }
export interface Readiness { date:string; energy:number; sleep:number; soreness:number; stress:number; motivation:number; }
export interface MacroTarget { calories:number; protein:number; carbs:number; fat:number; }
export interface Recipe { id:string; name:string; mealType:"breakfast"|"lunch"|"dinner"|"snack"; ingredients:Array<{name:string; quantity:number; unit:string; category:"Protein"|"Produce"|"Carbohydrates"|"Dairy"|"Pantry"|"Other"}>; servings:number; calories:number; protein:number; carbs:number; fat:number; prepMinutes:number; cookMinutes:number; instructions:string[]; dietTags:string[]; allergens:string[]; visual:string; }
export interface PlannedMeal { id:string; recipeId:string; servings:number; eaten:boolean; date:string; }
export interface Measurement { id:string; date:string; weightKg:number; waistCm?:number; chestCm?:number; armsCm?:number; hipsCm?:number; thighsCm?:number; bodyFat?:number; }
export interface PersonalRecord { id:string; exerciseId:string; kind:"weight"|"reps"|"volume"|"estimated-1rm"; value:number; date:string; }
export interface NutritionDay { date:string; extraCalories:number; extraProtein:number; extraCarbs:number; extraFat:number; waterMl:number; }
export interface GroceryCheck { key:string; checked:boolean; }
export interface VelaData { version:number; profile:UserProfile; macros:MacroTarget; workouts:Workout[]; readiness:Readiness[]; meals:PlannedMeal[]; nutritionDays:NutritionDay[]; measurements:Measurement[]; records:PersonalRecord[]; groceryChecks:GroceryCheck[]; streak:number; }
export interface WorkoutRecommendation { weightKg:number; reps:number[]; reason:string; action:"increase"|"hold"|"reduce"; }

export interface HealthSnapshot { steps?:number; sleepHours?:number; restingHeartRate?:number; hrv?:number; }
export interface HealthDataProvider { getToday():Promise<HealthSnapshot>; }
export interface FormAnalysisResult { reps?:number; rangeOfMotion?:number; notes:string[]; }
export interface FormAnalysisService { analyse(exerciseId:string, source:Blob):Promise<FormAnalysisResult>; }
