import React,{useEffect,useState} from "react";
import { LuPause,LuPlay } from "react-icons/lu";
import { exerciseById } from "../../data/exercises";

const ExerciseAnimation:React.FC<{exerciseId:string;compact?:boolean}>=({exerciseId,compact})=>{
 const[playing,setPlaying]=useState(true);const[pose,setPose]=useState<"start"|"end">("start");const[failed,setFailed]=useState(false);const[loaded,setLoaded]=useState(false);
 const exercise=exerciseById(exerciseId);const canAlternate=Boolean(exercise.media?.end);
 useEffect(()=>{setPose("start");setFailed(false);setLoaded(false);},[exerciseId]);
 useEffect(()=>{if(!playing||!canAlternate||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const timer=window.setInterval(()=>{setLoaded(false);setPose(value=>value==="start"?"end":"start");},1400);return()=>window.clearInterval(timer);},[playing,canAlternate,exerciseId]);
 const image=pose==="end"&&exercise.media?.end?exercise.media.end:exercise.media?.start;
 return <figure className={`vela-exercise-visual vela-pose-guide ${compact?"is-compact":""}`} aria-label={`Start and end pose guide for ${exercise.name}`}>
  {image&&!failed?<img className={loaded?"is-loaded":""} src={image} alt={`${exercise.name}: ${pose} position`} loading={compact?"eager":"lazy"} onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)}/>:<div className="vela-media-fallback"><strong>{exercise.name.slice(0,1)}</strong><span>Illustration unavailable</span></div>}
  <figcaption><span>{canAlternate?`${pose} position`:"reference position"}</span><small>Pose guide · follow the written steps</small></figcaption>
  <span className="vela-muscle-tag">{exercise.category.replace(/-/g," ")}</span>
  {canAlternate&&<button type="button" onClick={()=>setPlaying(value=>!value)} aria-label={playing?"Pause pose guide":"Play pose guide"}>{playing?<LuPause/>:<LuPlay/>}</button>}
 </figure>;
};
export default ExerciseAnimation;
