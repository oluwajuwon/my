import { Activity, Child } from "./types";

const MS_HOUR = 60 * 60 * 1000;

export const durationMs = (activity: Activity, now = new Date()): number => {
  if (!activity.endedAt) return Math.max(0, now.getTime() - new Date(activity.occurredAt).getTime());
  return Math.max(0, new Date(activity.endedAt).getTime() - new Date(activity.occurredAt).getTime());
};

export const formatDuration = (milliseconds: number): string => {
  const minutes = Math.max(0, Math.floor(milliseconds / 60000));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder}m`;
  return `${hours}h ${remainder.toString().padStart(2, "0")}m`;
};

export const childAge = (child: Child, now = new Date()): string => {
  const days = Math.max(0, Math.floor((now.getTime() - new Date(child.birthday).getTime()) / 86400000));
  if (days < 84) return `${Math.floor(days / 7)} weeks`;
  if (days < 730) return `${Math.floor(days / 30.44)} months`;
  const years = Math.floor(days / 365.25);
  const months = Math.floor((days % 365.25) / 30.44);
  return `${years} year${years === 1 ? "" : "s"}${months ? ` ${months} months` : ""}`;
};

export interface ChildSummary {
  feedsToday: number;
  nappiesToday: number;
  sleepTodayMs: number;
  averageFeedIntervalMs: number | null;
  averageBottleMl: number | null;
  nappiesPerDay: number;
  longestSleepMs: number;
}

export const calculateChildSummary = (activities: Activity[], childId: string, now = new Date()): ChildSummary => {
  const childActivities = activities.filter((item) => item.childId === childId);
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const today = childActivities.filter((item) => new Date(item.occurredAt) >= todayStart);
  const feeds = childActivities.filter((item) => item.type === "breastfeed" || item.type === "bottle").sort((a, b) => +new Date(a.occurredAt) - +new Date(b.occurredAt));
  const intervals = feeds.slice(1).map((feed, index) => +new Date(feed.occurredAt) - +new Date(feeds[index].occurredAt)).filter((value) => value < 8 * MS_HOUR);
  const bottles = childActivities.filter((item): item is Extract<Activity, { type: "bottle" }> => item.type === "bottle");
  const sleeps = childActivities.filter((item) => item.type === "sleep");
  const nappyCount = childActivities.filter((item) => item.type === "nappy" && +new Date(item.occurredAt) > now.getTime() - 7 * 86400000).length;
  return {
    feedsToday: today.filter((item) => item.type === "breastfeed" || item.type === "bottle").length,
    nappiesToday: today.filter((item) => item.type === "nappy").length,
    sleepTodayMs: today.filter((item) => item.type === "sleep").reduce((total, item) => total + durationMs(item, now), 0),
    averageFeedIntervalMs: intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : null,
    averageBottleMl: bottles.length ? bottles.reduce((total, item) => total + item.metadata.amountMl, 0) / bottles.length : null,
    nappiesPerDay: nappyCount / 7,
    longestSleepMs: sleeps.reduce((longest, item) => Math.max(longest, durationMs(item, now)), 0),
  };
};
