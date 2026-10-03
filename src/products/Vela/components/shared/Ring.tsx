import React from "react";
const Ring:React.FC<{value:number;max:number;label:string;detail:string;size?:"small"|"large"}>=({value,max,label,detail,size="small"})=>{const percentage=Math.max(0,Math.min(100,value/max*100));return <div className={`vela-ring-wrap ${size}`}><div className="vela-ring" style={{"--ring-value":`${percentage*3.6}deg`} as React.CSSProperties}><div><strong>{label}</strong><span>{detail}</span></div></div></div>;};
export default Ring;
