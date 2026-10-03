import { VelaData } from "../domain/types";
import { createDemoData } from "../data/demo";
export interface VelaRepository { load():VelaData; save(data:VelaData):void; clear():void; }
const KEY="vela-fitness-data-v1";
export class LocalVelaRepository implements VelaRepository {
 load(){try{const value=window.localStorage.getItem(KEY);if(value)return {...createDemoData(),...(JSON.parse(value) as Partial<VelaData>)};}catch{/* keep demo available */}return createDemoData();}
 save(data:VelaData){try{window.localStorage.setItem(KEY,JSON.stringify(data));}catch{/* live session remains usable */}}
 clear(){try{window.localStorage.removeItem(KEY);}catch{/* no-op */}}
}
