import React from "react";
import { LuBatteryLow,LuClock3,LuGauge,LuRefreshCw,LuWrench } from "react-icons/lu";
import { exerciseById } from "../../data/exercises";
import Modal from "../shared/Modal";
import { useVela } from "../../store/VelaStore";

const equipmentSwaps:Record<string,string>={"barbell-bench":"db-bench","barbell-row":"one-arm-row","back-squat":"goblet-squat","rdl":"db-rdl","ohp":"db-shoulder"};
const AdjustModal:React.FC<{open:boolean;onClose():void}>=({open,onClose})=>{
 const{adjustTime,updateWorkout,today}=useVela();
 const action=(fn:()=>void)=>{fn();onClose();};
 const easier={...today,exercises:today.exercises.map((item,index)=>index>3?{...item,sets:item.sets.slice(0,2)}:item)};
 const tired={...today,estimatedMinutes:Math.max(30,today.estimatedMinutes-10),exercises:today.exercises.map((item)=>({...item,sets:item.sets.slice(0,Math.max(2,item.sets.length-1))}))};
 const sore={...today,exercises:today.exercises.map((item)=>["chest","shoulders"].includes(exerciseById(item.exerciseId).category)?{...item,sets:item.sets.slice(0,2),restSeconds:item.restSeconds+30}:item)};
 const swapped={...today,exercises:today.exercises.map((item)=>equipmentSwaps[item.exerciseId]?{...item,exerciseId:equipmentSwaps[item.exerciseId]}:item)};
 return <Modal open={open} title="Adjust today" eyebrow="Keep the training intent" onClose={onClose}><p className="vela-modal-intro">Vela protects priority work first, then adjusts accessory volume and rest.</p><div className="vela-adjust-grid"><button onClick={()=>action(()=>adjustTime(30))}><LuClock3/><strong>I have less time</strong><span>Compress to 30 minutes</span></button><button onClick={()=>action(()=>updateWorkout(tired))}><LuBatteryLow/><strong>I’m tired</strong><span>Reduce volume, keep quality</span></button><button onClick={()=>action(()=>updateWorkout(easier))}><LuGauge/><strong>Make it easier</strong><span>Leave more in reserve</span></button><button onClick={()=>action(()=>updateWorkout({...today,exercises:today.exercises.map((item,index)=>index<2?{...item,sets:[...item.sets,{...item.sets[item.sets.length-1],id:`${item.id}-bonus`}]}:item)}))}><LuGauge/><strong>Make it harder</strong><span>Add one priority set</span></button><button onClick={()=>action(()=>updateWorkout(swapped))}><LuWrench/><strong>Equipment unavailable</strong><span>Swap barbell work for dumbbells</span></button><button onClick={()=>action(()=>updateWorkout(sore))}><LuRefreshCw/><strong>I’m sore</strong><span>Reduce pressing volume and add rest</span></button></div></Modal>;
};
export default AdjustModal;
