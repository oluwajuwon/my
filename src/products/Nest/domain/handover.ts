import { durationMs } from "./insights";
import { generateChildBrief, getNeedsAttention } from "./brief";
import { Activity, NestData } from "./types";

export type HandoverRange = "since-last" | "4-hours" | "8-hours" | "overnight" | "today";
export const getHandoverStart = (range: HandoverRange, data: NestData, now = new Date()): Date => {
  if (range === "since-last" && data.handoverViewedAt) return new Date(data.handoverViewedAt);
  if (range === "4-hours" || range === "8-hours") return new Date(now.getTime() - Number.parseInt(range, 10) * 60 * 60 * 1000);
  const start = new Date(now);
  if (range === "overnight") { start.setDate(start.getDate() - (start.getHours() < 12 ? 1 : 0)); start.setHours(19, 0, 0, 0); }
  else start.setHours(0, 0, 0, 0);
  return start;
};

export interface HandoverSummary {
  from: string;
  eventCount: number;
  currentState: "awake" | "sleeping" | "feeding";
  lastFeed: ReturnType<typeof generateChildBrief>["lastFeed"];
  lastNappy: ReturnType<typeof generateChildBrief>["lastNappy"];
  feeds: { count: number; bottleMl: number };
  sleep: { count: number; totalMs: number };
  nappies: { count: number; wet: number; dirty: number; both: number };
  medicines: Array<Extract<Activity, { type: "medicine" }>>;
  attention: ReturnType<typeof getNeedsAttention>;
}

export const generateHandoverSummary = (data: NestData, childId: string, range: HandoverRange, now = new Date()): HandoverSummary => {
  const start = getHandoverStart(range, data, now);
  const events = data.activities.filter((item) => item.childId === childId && new Date(item.occurredAt) <= now && (new Date(item.occurredAt) >= start || (item.type === "sleep" && item.endedAt !== undefined && new Date(item.endedAt) >= start)));
  const feeds = events.filter((item) => item.type === "bottle" || item.type === "breastfeed");
  const sleeps = events.filter((item) => item.type === "sleep");
  const nappies = events.filter((item): item is Extract<Activity, { type: "nappy" }> => item.type === "nappy");
  const brief = generateChildBrief(data, childId, now);
  return {
    from: start.toISOString(), eventCount: events.length, currentState: brief.currentState, lastFeed: brief.lastFeed, lastNappy: brief.lastNappy,
    feeds: { count: feeds.length, bottleMl: feeds.reduce((sum, item) => sum + (item.type === "bottle" ? item.metadata.amountMl : 0), 0) },
    sleep: { count: sleeps.length, totalMs: sleeps.reduce((sum, item) => sum + durationMs(item, now), 0) },
    nappies: { count: nappies.length, wet: nappies.filter((item) => item.metadata.kind === "wet").length, dirty: nappies.filter((item) => item.metadata.kind === "dirty").length, both: nappies.filter((item) => item.metadata.kind === "both").length },
    medicines: events.filter((item): item is Extract<Activity, { type: "medicine" }> => item.type === "medicine"),
    attention: getNeedsAttention(data, childId, now),
  };
};
