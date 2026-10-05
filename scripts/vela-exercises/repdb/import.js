#!/usr/bin/env node
const fs=require("fs"); const path=require("path");
const {normalizeExercise}=require("./normalizer"); const {validateRepDbDataset,validateCatalogue}=require("./validation");

const root=path.resolve(__dirname,"../../..");
const argIndex=process.argv.indexOf("--source");
const source=path.resolve(argIndex>=0 ? process.argv[argIndex+1] : process.env.REPDB_SOURCE_DIR || "../exercise-dataset");
const input=path.join(source,"exercises.json");
if (!fs.existsSync(input)) throw new Error(`RepDB source not found at ${input}. Clone https://github.com/RepDB/exercise-dataset and pass --source <directory>.`);
const raw=JSON.parse(fs.readFileSync(input,"utf8"));
validateRepDbDataset(raw);
const catalogue=raw.exercises.map(normalizeExercise).sort((a,b)=>a.name.localeCompare(b.name));
const byGroup=new Map(); catalogue.forEach(x=>{if(!byGroup.has(x.substitutionGroup))byGroup.set(x.substitutionGroup,[]);byGroup.get(x.substitutionGroup).push(x);});
catalogue.forEach(item=>{item.substitutions=(byGroup.get(item.substitutionGroup)||[]).filter(x=>x.id!==item.id).sort((a,b)=>(a.catalogueTier===item.catalogueTier?0:1)-(b.catalogueTier===item.catalogueTier?0:1)||a.name.localeCompare(b.name)).slice(0,8).map(x=>x.id);});
validateCatalogue(catalogue);
const output=path.join(root,"src/products/Vela/data/generated/exercises.json"); fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify({schemaVersion:1,source:{provider:"RepDB",schemaVersion:raw.schema_version,homepage:raw.homepage,exerciseCount:catalogue.length},exercises:catalogue}));
const mediaDir=path.join(root,"public/vela/exercises/repdb"); fs.mkdirSync(mediaDir,{recursive:true});
const wanted=new Set(catalogue.flatMap(x=>x.media?[x.media.start,x.media.end].filter(Boolean).map(x=>path.basename(x)):[]));
for (const file of wanted) { const from=path.join(source,"images/flat",file); if(!fs.existsSync(from)) throw new Error(`Missing referenced free-tier image: ${from}`); fs.copyFileSync(from,path.join(mediaDir,file)); }
for (const file of fs.readdirSync(mediaDir)) if(!wanted.has(file)) fs.unlinkSync(path.join(mediaDir,file));
const counts=catalogue.reduce((a,x)=>(a[x.catalogueTier]=(a[x.catalogueTier]||0)+1,a),{});const withMedia=catalogue.filter(x=>x.media).length;
console.log([`Source: ${raw.exercises.length}`,`Imported: ${catalogue.length}`,"Skipped: 0","Invalid: 0","Duplicates: 0",`With imagery: ${withMedia}`,`Missing imagery: ${catalogue.length-withMedia}`,`Core: ${counts.core||0}`,`Standard: ${counts.standard||0}`,`Specialized: ${counts.specialized||0}`,`Media files: ${wanted.size}`].join("\n"));
