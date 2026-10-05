import { Activity } from "../../types";
import { BaselineMetric, calculateChildBaseline, ChildBaseline } from "../baseline";
import { displayTime } from "../time";

export interface RhythmWindow { label: string; low: number; high: number; display: string; sampleSize: number }
export interface ChildRhythm { wakeWindow?: RhythmWindow; firstNapWindow?: RhythmWindow; feedInterval?: RhythmWindow; napDuration?: RhythmWindow; bedtimeWindow?: RhythmWindow; longestSleep?: RhythmWindow }
const windowFrom = (label: string, value: BaselineMetric | undefined, time = false): RhythmWindow | undefined => value && value.confidence !== "low" ? { label, low: value.low, high: value.high, sampleSize: value.sampleSize, display: time ? `${displayTime(value.low)}–${displayTime(value.high)}` : `${Math.round(value.low)}–${Math.round(value.high)} min` } : undefined;
export const generateChildRhythm = (baseline: ChildBaseline): ChildRhythm => ({
  wakeWindow: windowFrom("Morning wake", baseline.wakeMinutes, true), firstNapWindow: windowFrom("First nap after waking", baseline.firstNapAfterWakeMinutes),
  feedInterval: windowFrom("Feed interval", baseline.feedIntervalMinutes), napDuration: windowFrom("Nap duration", baseline.napDurationMinutes),
  bedtimeWindow: windowFrom("Bedtime", baseline.bedtimeMinutes, true), longestSleep: windowFrom("Longest overnight stretch", baseline.longestOvernightMinutes),
});
export const getLikelyNextFeed = (activities: Activity[], childId: string, baseline: ChildBaseline): { low: Date; high: Date } | null => {
  const interval = baseline.feedIntervalMinutes; if (!interval || interval.confidence === "low") return null;
  const last = activities.filter((item) => item.childId === childId && (item.type === "bottle" || item.type === "breastfeed")).sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt))[0];
  return last ? { low: new Date(+new Date(last.occurredAt) + interval.low * 60000), high: new Date(+new Date(last.occurredAt) + interval.high * 60000) } : null;
};
export const getLikelyBedtime = (baseline: ChildBaseline): RhythmWindow | null => windowFrom("Usual bedtime", baseline.bedtimeMinutes, true) ?? null;
export const getLikelyNapWindow = (activities: Activity[], childId: string, baseline: ChildBaseline, now = new Date()): { low: Date; high: Date } | null => {
  const offset = baseline.firstNapAfterWakeMinutes; if (!offset || offset.confidence === "low") return null;
  const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const wake = activities.filter((item) => item.childId === childId && item.type === "sleep" && item.endedAt).map((item) => new Date(item.endedAt!)).filter((date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` === today).sort((a, b) => +a - +b)[0];
  return wake ? { low: new Date(+wake + offset.low * 60000), high: new Date(+wake + offset.high * 60000) } : null;
};
export const buildRhythm = (activities: Activity[], childId: string, now = new Date()): { baseline: ChildBaseline; rhythm: ChildRhythm } => { const baseline = calculateChildBaseline(activities, childId, now); return { baseline, rhythm: generateChildRhythm(baseline) }; };
