import { Activity, Child } from "../../types";
import { calculateChildBaseline } from "../baseline";
import { DetectedChange, detectChanges } from "../changes";
import { Confidence, confidenceFor, confidenceLanguage } from "../confidence";
import { generateChildRhythm, getLikelyBedtime, getLikelyNextFeed } from "../rhythms";

export type InsightCategory = "sleep" | "feeding" | "nappies" | "routine" | "supplies" | "care";
export interface Insight { id: string; childId: string; category: InsightCategory; type: string; title: string; observation: string; period: string; currentValue?: number; baselineValue?: number; difference?: number; sampleSize: number; confidence: Confidence; supportingData: Record<string, number | string>; generatedAt: string; priority: number }
const changeInsight = (child: Child, change: DetectedChange, now: Date): Insight => {
  const growing = change.difference > 0; const minutes = Math.abs(Math.round(change.difference));
  const copy = change.metric === "night-sleep" ? { category: "sleep" as const, title: growing ? "Her nights are getting longer." : "Nighttime sleep has been shorter recently.", observation: `${child.name}’s nighttime sleep has ${growing ? "increased" : "decreased"} by about ${minutes} minutes compared with the previous week.` }
    : change.metric === "bedtime" ? { category: "routine" as const, title: `Bedtime has shifted ${growing ? "later" : "earlier"}.`, observation: `${confidenceLanguage(confidenceFor(change.sampleSize, 7))} bedtime has moved about ${minutes} minutes ${growing ? "later" : "earlier"}.` }
    : change.metric === "feed-interval" ? { category: "feeding" as const, title: growing ? "Feeds have been further apart." : "Feeds have been closer together.", observation: `Recent feed intervals are about ${minutes} minutes ${growing ? "longer" : "shorter"} than the previous week.` }
    : change.metric === "bottle-amount" ? { category: "feeding" as const, title: growing ? "Bottle amounts have increased." : "Bottle amounts have been smaller.", observation: `Recent bottles differ by about ${minutes}ml from the previous week.` }
    : { category: "nappies" as const, title: "Nappy rhythm has changed.", observation: `Daily nappy logs differ by about ${Math.abs(change.difference).toFixed(1)} from the previous week.` };
  return { id: `${child.id}-${change.metric}-change`, childId: child.id, category: copy.category, type: "change", title: copy.title, observation: copy.observation, period: "Recent 7 days vs previous 7 days", currentValue: change.recent, baselineValue: change.previous, difference: change.difference, sampleSize: change.sampleSize, confidence: confidenceFor(change.sampleSize, 7), supportingData: { metric: change.metric }, generatedAt: now.toISOString(), priority: 80 + Math.min(15, minutes / 5) };
};
export interface IntelligenceResult { baseline: ReturnType<typeof calculateChildBaseline>; rhythm: ReturnType<typeof generateChildRhythm>; insights: Insight[]; likelyNextFeed: ReturnType<typeof getLikelyNextFeed>; likelyBedtime: ReturnType<typeof getLikelyBedtime>; learning: { activeDays: number; activityCount: number; ready: boolean } }
export const generateInsights = (activities: Activity[], child: Child, now = new Date()): IntelligenceResult => {
  const childActivities = activities.filter((item) => item.childId === child.id);
  const days = new Set(childActivities.map((item) => new Date(item.occurredAt).toDateString())).size;
  const baseline = calculateChildBaseline(activities, child.id, now, 14); const rhythm = generateChildRhythm(baseline);
  const insights = detectChanges(activities, child.id, now).map((change) => changeInsight(child, change, now)).sort((a, b) => b.priority - a.priority).slice(0, 4);
  if (!insights.length && baseline.bedtimeMinutes?.confidence === "high") insights.push({ id: `${child.id}-bedtime-consistency`, childId: child.id, category: "routine", type: "baseline", title: "Bedtime is becoming consistent.", observation: `${confidenceLanguage(baseline.bedtimeMinutes.confidence)} most recent bedtimes fall within a ${Math.round(baseline.bedtimeMinutes.high - baseline.bedtimeMinutes.low)} minute window.`, period: "Last 14 days", sampleSize: baseline.bedtimeMinutes.sampleSize, confidence: baseline.bedtimeMinutes.confidence, supportingData: { low: baseline.bedtimeMinutes.low, high: baseline.bedtimeMinutes.high }, generatedAt: now.toISOString(), priority: 65 });
  return { baseline, rhythm, insights, likelyNextFeed: getLikelyNextFeed(activities, child.id, baseline), likelyBedtime: getLikelyBedtime(baseline), learning: { activeDays: days, activityCount: childActivities.length, ready: days >= 3 && childActivities.length >= 12 } };
};
