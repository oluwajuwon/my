const allowedDifficulty=new Set(["beginner","intermediate","advanced"]);
const allowedTier=new Set(["core","standard","specialized"]);
const allowedPatterns=new Set(["push-horizontal","push-vertical","pull-horizontal","pull-vertical","squat","hinge","lunge","carry","isolation","core","cardio","mobility"]);

function validateRepDbDataset(raw) {
  const errors=[];const ids=new Set();
  if(!raw||raw.schema_version!==3||!Array.isArray(raw.exercises))throw new Error("Expected a RepDB schema_version 3 exercises document.");
  raw.exercises.forEach((item,index)=>{
    const at=`source[${index}]`;
    if(!item||typeof item!=="object")return errors.push(`${at}: must be an object`);
    if(typeof item.id!=="string"||!item.id)errors.push(`${at}: id is required`);
    else if(ids.has(item.id))errors.push(`${at}: duplicate source id ${item.id}`);else ids.add(item.id);
    if(typeof item.name_en!=="string"||!item.name_en)errors.push(`${at}: name_en is required`);
    if(!allowedDifficulty.has(item.difficulty))errors.push(`${at}: invalid difficulty`);
    if(!Array.isArray(item.primary_muscles)||!item.primary_muscles.length)errors.push(`${at}: primary_muscles are required`);
    if(!Array.isArray(item.instructions_en)||!item.instructions_en.length)errors.push(`${at}: instructions_en are required`);
  });
  if(errors.length)throw new Error(`RepDB source validation failed:\n${errors.slice(0,30).join("\n")}`);
  return true;
}

function validateCatalogue(items) {
  const errors=[]; const ids=new Set();
  items.forEach((item,index)=>{
    const at=`exercise[${index}] (${item && item.id || "missing id"})`;
    if (!item || typeof item !== "object") return errors.push(`${at}: must be an object`);
    if (!item.id || ids.has(item.id)) errors.push(`${at}: id is missing or duplicated`); else ids.add(item.id);
    if (!item.name || !item.slug) errors.push(`${at}: name and slug are required`);
    if (!allowedDifficulty.has(item.difficulty)) errors.push(`${at}: invalid difficulty`);
    if (!allowedTier.has(item.catalogueTier)) errors.push(`${at}: invalid curation tier`);
    if (!allowedPatterns.has(item.movementPattern)) errors.push(`${at}: invalid movement pattern`);
    if (!Array.isArray(item.instructions) || !item.instructions.length) errors.push(`${at}: instructions are required`);
    if (!Array.isArray(item.primaryMuscles) || !item.primaryMuscles.length) errors.push(`${at}: primary muscles are required`);
    if (!Array.isArray(item.equipment) || !item.equipment.length) errors.push(`${at}: equipment is required`);
    if (!item.source || item.source.provider !== "RepDB") errors.push(`${at}: source metadata is required`);
  });
  if (errors.length) throw new Error(`RepDB catalogue validation failed:\n${errors.slice(0,30).join("\n")}${errors.length>30?`\n…${errors.length-30} more`:""}`);
  return true;
}
module.exports={validateRepDbDataset,validateCatalogue};
