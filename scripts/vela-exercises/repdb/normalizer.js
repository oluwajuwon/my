const { equipmentMap, cardioEquipment, muscleGroupMap, legacyByRepDbId } = require("./mappings");

const machinePattern = /machine$|_machine$|leg_(curl|extension|press)|pec_deck/;
const words = value => value.replace(/_/g, "-");

function mapEquipment(value, bodyweight, tags=[]) {
  const result=[];
  if (bodyweight || !value) result.push("bodyweight");
  else if (equipmentMap[value]) result.push(equipmentMap[value]);
  else if (cardioEquipment.has(value)) result.push("cardio");
  else if (machinePattern.test(value)) result.push("machine");
  else result.push("other");
  if (tags.includes("requires_bench") && !result.includes("bench")) result.push("bench");
  return result;
}

function broadGroup(item) {
  if (item.category === "cardio") return "cardio";
  if (item.category === "stretching") return "mobility";
  if (item.body_part === "full_body") return "full-body";
  return muscleGroupMap[item.primary_muscles[0]] || words(item.body_part || "full_body");
}

function movementPattern(item) {
  const n=item.name_en.toLowerCase(); const tags=item.tags || []; const body=item.body_part;
  if (item.category === "cardio") return "cardio";
  if (item.category === "stretching") return "mobility";
  if (/carry|farmer|suitcase/.test(n)) return "carry";
  if (/lunge|split squat|step-up|step up/.test(n)) return "lunge";
  if (/deadlift|hip thrust|glute bridge|good morning|swing/.test(n)) return "hinge";
  if (/squat|leg press/.test(n)) return "squat";
  if (body === "core" || tags.some(t=>/core|anti_rotation/.test(t)) || /plank|crunch|sit-up|rollout|pallof/.test(n)) return "core";
  if (/pull[- ]?ups?|pulldown|chin[- ]?ups?/.test(n)) return "pull-vertical";
  if (/row|face pull|reverse fly/.test(n)) return "pull-horizontal";
  if (/overhead press|shoulder press|military press|arnold press|handstand push/.test(n)) return "push-vertical";
  if (/bench press|chest press|push-up|dip|chest fly|cable fly/.test(n)) return "push-horizontal";
  if (item.mechanic === "isolation") return "isolation";
  if (item.force_type === "pull") return "pull-horizontal";
  if (item.force_type === "push") return "push-horizontal";
  return "isolation";
}

function progressionType(item) {
  if (item.force_type === "static" || item.category === "stretching" || item.category === "cardio") return "time";
  if (item.is_bodyweight) return "bodyweight";
  return "double";
}

function tier(item) {
  if (legacyByRepDbId[item.id]) return "core";
  if (item.difficulty === "advanced" || item.category === "olympic" || /machine$|_machine$/.test(item.equipment || "")) return "specialized";
  return "standard";
}

function media(item) {
  const flat=item.images && item.images.flat;
  if (!flat) return undefined;
  const toPublic=value=>value ? `/vela/exercises/repdb/${value.split("/").pop()}` : undefined;
  return { start:toPublic(flat.start || flat.main), end:toPublic(flat.peak), kind:flat.peak ? "start-end" : "single" };
}

function normalizeExercise(item) {
  const group=broadGroup(item);
  return {
    id:legacyByRepDbId[item.id] || `repdb-${item.id}`,
    slug:item.id, name:item.name_en, description:item.description_en || "", category:group,
    bodyParts:[words(item.body_part)], movementPattern:movementPattern(item),
    primaryMuscles:(item.primary_muscles || []).map(words), secondaryMuscles:(item.secondary_muscles || []).map(words),
    equipment:mapEquipment(item.equipment,item.is_bodyweight,item.tags), difficulty:item.difficulty,
    exerciseType:item.category, forceType:item.force_type, mechanic:item.mechanic,
    instructions:item.instructions_en || [], cues:item.tips_en || [], commonMistakes:[], goals:item.goals || [],
    tags:item.tags || [], unilateral:item.is_unilateral, bodyweight:item.is_bodyweight,
    progressionType:progressionType(item), substitutionGroup:`${movementPattern(item)}:${group}`,
    substitutions:[], catalogueTier:tier(item), media:media(item),
    source:{provider:"RepDB",externalId:item.id,url:"https://repdb.co",schemaVersion:3},
  };
}

module.exports={ mapEquipment, broadGroup, movementPattern, normalizeExercise };
