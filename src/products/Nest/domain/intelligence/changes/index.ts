import { Activity } from "../../types";
import { BaselineMetric, calculateChildBaseline, ChildBaseline } from "../baseline";

export interface DetectedChange { metric: "bedtime" | "night-sleep" | "feed-interval" | "bottle-amount" | "nappies"; recent: number; previous: number; difference: number; sampleSize: number; meaningful: boolean }
const compare = (metric: DetectedChange["metric"], recent: BaselineMetric | undefined, previous: BaselineMetric | undefined, threshold: number): DetectedChange | null => {
  if (!recent || !previous || recent.sampleSize < 4 || previous.sampleSize < 4) return null;
  const difference = recent.median - previous.median; return { metric, recent: recent.median, previous: previous.median, difference, sampleSize: recent.sampleSize + previous.sampleSize, meaningful: Math.abs(difference) >= threshold };
};
export const detectChanges = (activities: Activity[], childId: string, now = new Date()): DetectedChange[] => {
  const recent = calculateChildBaseline(activities, childId, now, 7);
  const previousEnd = new Date(now); previousEnd.setDate(previousEnd.getDate() - 7);
  const previous = calculateChildBaseline(activities, childId, previousEnd, 7);
  return [compare("bedtime", recent.bedtimeMinutes, previous.bedtimeMinutes, 20), compare("night-sleep", recent.nighttimeSleepMinutes, previous.nighttimeSleepMinutes, 25), compare("feed-interval", recent.feedIntervalMinutes, previous.feedIntervalMinutes, 20), compare("bottle-amount", recent.bottleAmountMl, previous.bottleAmountMl, 15), compare("nappies", recent.nappiesPerDay, previous.nappiesPerDay, 1)].filter((item): item is DetectedChange => Boolean(item?.meaningful));
};
export const compareBaselines = (recent: ChildBaseline, previous: ChildBaseline): DetectedChange[] => [compare("bedtime", recent.bedtimeMinutes, previous.bedtimeMinutes, 20), compare("night-sleep", recent.nighttimeSleepMinutes, previous.nighttimeSleepMinutes, 25), compare("feed-interval", recent.feedIntervalMinutes, previous.feedIntervalMinutes, 20)].filter((item): item is DetectedChange => Boolean(item?.meaningful));
