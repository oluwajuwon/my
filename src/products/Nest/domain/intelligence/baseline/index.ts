import { Activity } from "../../types";
import { confidenceFor, Confidence } from "../confidence";
import { circularTimeMinutes, localDayKey, minutesSinceMidnight, subtractDays } from "../time";

export interface BaselineMetric { median: number; low: number; high: number; sampleSize: number; activeDays: number; confidence: Confidence }
export interface ChildBaseline {
  childId: string; windowDays: number; generatedAt: string;
  feedIntervalMinutes?: BaselineMetric; bottleAmountMl?: BaselineMetric; bedtimeMinutes?: BaselineMetric; wakeMinutes?: BaselineMetric;
  firstNapAfterWakeMinutes?: BaselineMetric; napDurationMinutes?: BaselineMetric; daytimeSleepMinutes?: BaselineMetric;
  nighttimeSleepMinutes?: BaselineMetric; longestOvernightMinutes?: BaselineMetric; nappiesPerDay?: BaselineMetric;
}
const quantile = (sorted: number[], q: number): number => { if (!sorted.length) return 0; const index = (sorted.length - 1) * q; const lower = Math.floor(index); const rest = index - lower; return sorted[lower + 1] === undefined ? sorted[lower] : sorted[lower] + rest * (sorted[lower + 1] - sorted[lower]); };
const metric = (values: number[], days: string[]): BaselineMetric | undefined => { if (!values.length) return undefined; const sorted = [...values].sort((a, b) => a - b); const median = quantile(sorted, .5); const low = quantile(sorted, .25); const high = quantile(sorted, .75); const activeDays = new Set(days).size; return { median, low, high, sampleSize: values.length, activeDays, confidence: confidenceFor(values.length, activeDays, median ? (high - low) / median : 1) }; };
const durationMinutes = (activity: Activity): number => activity.endedAt ? Math.max(0, (+new Date(activity.endedAt) - +new Date(activity.occurredAt)) / 60000) : 0;

export const calculateChildBaseline = (activities: Activity[], childId: string, now = new Date(), windowDays = 14): ChildBaseline => {
  const from = subtractDays(now, windowDays);
  const items = activities.filter((item) => item.childId === childId && new Date(item.occurredAt) >= from && new Date(item.occurredAt) <= now).sort((a, b) => +new Date(a.occurredAt) - +new Date(b.occurredAt));
  const feeds = items.filter((item) => item.type === "bottle" || item.type === "breastfeed");
  const feedIntervals: number[] = []; const feedDays: string[] = [];
  feeds.slice(1).forEach((feed, index) => { const interval = (+new Date(feed.occurredAt) - +new Date(feeds[index].occurredAt)) / 60000; if (interval >= 30 && interval <= 8 * 60) { feedIntervals.push(interval); feedDays.push(localDayKey(feed.occurredAt)); } });
  const bottles = items.filter((item): item is Extract<Activity, { type: "bottle" }> => item.type === "bottle");
  const sleeps = items.filter((item): item is Extract<Activity, { type: "sleep" }> => item.type === "sleep" && Boolean(item.endedAt));
  const nights = sleeps.filter((item) => item.metadata.sleepType === "night" || minutesSinceMidnight(item.occurredAt) >= 18 * 60);
  const naps = sleeps.filter((item) => !nights.includes(item));
  const dailyNappies = new Map<string, number>(); items.filter((item) => item.type === "nappy").forEach((item) => dailyNappies.set(localDayKey(item.occurredAt), (dailyNappies.get(localDayKey(item.occurredAt)) ?? 0) + 1));
  const daySleep = new Map<string, number>(); naps.forEach((item) => daySleep.set(localDayKey(item.occurredAt), (daySleep.get(localDayKey(item.occurredAt)) ?? 0) + durationMinutes(item)));
  const wakeByDay = new Map<string, Date>(); nights.forEach((item) => { const wake = new Date(item.endedAt!); wakeByDay.set(localDayKey(wake), wake); });
  const firstNapOffsets: number[] = []; const firstNapDays: string[] = [];
  wakeByDay.forEach((wake, day) => { const first = naps.find((nap) => localDayKey(nap.occurredAt) === day && new Date(nap.occurredAt) > wake); if (first) { firstNapOffsets.push((+new Date(first.occurredAt) - +wake) / 60000); firstNapDays.push(day); } });
  return {
    childId, windowDays, generatedAt: now.toISOString(),
    feedIntervalMinutes: metric(feedIntervals, feedDays),
    bottleAmountMl: metric(bottles.map((item) => item.metadata.amountMl), bottles.map((item) => localDayKey(item.occurredAt))),
    bedtimeMinutes: metric(nights.map((item) => circularTimeMinutes(minutesSinceMidnight(item.occurredAt))), nights.map((item) => localDayKey(item.occurredAt))),
    wakeMinutes: metric(nights.map((item) => minutesSinceMidnight(item.endedAt!)), nights.map((item) => localDayKey(item.endedAt!))),
    firstNapAfterWakeMinutes: metric(firstNapOffsets, firstNapDays),
    napDurationMinutes: metric(naps.map(durationMinutes), naps.map((item) => localDayKey(item.occurredAt))),
    daytimeSleepMinutes: metric(Array.from(daySleep.values()), Array.from(daySleep.keys())),
    nighttimeSleepMinutes: metric(nights.map(durationMinutes), nights.map((item) => localDayKey(item.occurredAt))),
    longestOvernightMinutes: metric(nights.map(durationMinutes), nights.map((item) => localDayKey(item.occurredAt))),
    nappiesPerDay: metric(Array.from(dailyNappies.values()), Array.from(dailyNappies.keys())),
  };
};
