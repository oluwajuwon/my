import { calculateChildBaseline } from "./baseline";
import { detectChanges } from "./changes";
import { generateInsights } from "./insights";
import { getLikelyNextFeed } from "./rhythms";
import { confidenceFor } from "./confidence";
import { createDemoData } from "../../data/demoData";

const activity = (id, childId, type, occurredAt, metadata, endedAt) => ({ id, householdId: "h1", childId, type, occurredAt, endedAt, metadata, createdBy: "u1", createdAt: occurredAt, updatedAt: occurredAt });
describe("Nest Intelligence", () => {
  it("builds a robust feed interval baseline that resists an outlier", () => {
    const feeds = ["2026-10-01T06:00:00Z","2026-10-01T08:30:00Z","2026-10-01T11:00:00Z","2026-10-02T06:00:00Z","2026-10-02T08:40:00Z","2026-10-03T06:00:00Z","2026-10-03T08:30:00Z","2026-10-04T06:00:00Z","2026-10-04T08:30:00Z"].map((time,index)=>activity(`f${index}`,"a","bottle",time,{amountMl:index===4?300:120,milk:"formula"}));
    const baseline=calculateChildBaseline(feeds,"a",new Date("2026-10-05T00:00:00Z"));
    expect(baseline.feedIntervalMinutes.median).toBeLessThan(170);
    expect(baseline.bottleAmountMl.median).toBe(120);
  });
  it("handles sleep crossing midnight and derives bedtime/wake windows",()=>{
    const sleeps=[1,2,3,4,5].map((day)=>activity(`s${day}`,"a","sleep",`2026-09-${20+day}T20:0${day}:00Z`,{sleepType:"night"},`2026-09-${21+day}T06:1${day}:00Z`));
    const baseline=calculateChildBaseline(sleeps,"a",new Date("2026-09-28T12:00:00Z"));
    expect(baseline.nighttimeSleepMinutes.median).toBeGreaterThan(590);
    expect(baseline.bedtimeMinutes.median).toBeGreaterThan(20*60);
    expect(baseline.wakeMinutes.median).toBeLessThan(8*60);
  });
  it("returns low confidence and no prediction with insufficient data",()=>{
    const one=[activity("f","a","bottle","2026-10-04T08:00:00Z",{amountMl:120,milk:"formula"})];
    const baseline=calculateChildBaseline(one,"a",new Date("2026-10-05T00:00:00Z"));
    expect(baseline.feedIntervalMinutes).toBeUndefined();
    expect(getLikelyNextFeed(one,"a",baseline)).toBeNull();
  });
  it("raises confidence with enough samples and predicts from the child's own rhythm",()=>{
    expect(confidenceFor(2,2)).toBe("low"); expect(confidenceFor(7,4,.18)).toBe("medium"); expect(confidenceFor(12,7,.15)).toBe("high");
    const feeds=[]; for(let day=1;day<=4;day+=1){feeds.push(activity(`p${day}a`,"a","bottle",`2026-10-0${day}T06:00:00Z`,{amountMl:120,milk:"formula"}),activity(`p${day}b`,"a","bottle",`2026-10-0${day}T09:00:00Z`,{amountMl:120,milk:"formula"}));}
    const baseline=calculateChildBaseline(feeds,"a",new Date("2026-10-04T10:00:00Z")); const prediction=getLikelyNextFeed(feeds,"a",baseline);
    expect(prediction).not.toBeNull(); expect(prediction.low.toISOString()).toBe("2026-10-04T12:00:00.000Z"); expect(baseline.feedIntervalMinutes.sampleSize).toBe(4);
  });
  it("detects meaningful changes and ignores trivial ones",()=>{
    const changed=[]; const stable=[];
    for(let day=1;day<=14;day+=1){const date=new Date("2026-10-15T20:00:00Z");date.setUTCDate(date.getUTCDate()-day);const recent=day<=7;changed.push(activity(`c${day}`,"a","sleep",date.toISOString(),{sleepType:"night"},new Date(+date+(recent?600:510)*60000).toISOString()));stable.push(activity(`t${day}`,"a","sleep",date.toISOString(),{sleepType:"night"},new Date(+date+(recent?542:540)*60000).toISOString()));}
    expect(detectChanges(changed,"a",new Date("2026-10-15T23:00:00Z")).some((item)=>item.metric==="night-sleep")).toBe(true);
    expect(detectChanges(stable,"a",new Date("2026-10-15T23:00:00Z"))).toHaveLength(0);
  });
  it("generates explainable insights only from the selected child",()=>{
    const now=new Date("2026-10-02T12:00:00Z"); const data=createDemoData(now); const maya=data.children[0];
    const result=generateInsights(data.activities,maya,now);
    expect(result.learning.ready).toBe(true); expect(result.insights.length).toBeGreaterThan(0); expect(result.insights[0].sampleSize).toBeGreaterThan(0);
    const other={...maya,id:"child-b",name:"Noah"}; const isolated=generateInsights(data.activities,other,now);
    expect(isolated.learning.activityCount).toBe(0); expect(isolated.insights).toHaveLength(0);
  });
});
