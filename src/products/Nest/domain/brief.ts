import { durationMs, formatDuration } from "./insights";
import { getLowStockSupplies, estimateSupplyRunOut } from "./supplies";
import { Activity, Medicine, NestData } from "./types";

export interface BriefEvent { label: string; detail: string; occurredAt: string; createdBy: string }
export interface BriefAttention { id: string; label: string; detail: string; kind: "medicine" | "supply" }
export interface ChildBrief {
  currentState: "awake" | "sleeping" | "feeding";
  overnight: { duration: string; wakeCount: number } | null;
  lastFeed: BriefEvent | null;
  lastNappy: BriefEvent | null;
  attention: BriefAttention[];
}

const isToday = (iso: string, now: Date): boolean => { const value = new Date(iso); return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth() && value.getDate() === now.getDate(); };
export const getLastFeed = (activities: Activity[], childId: string): Activity | null => activities.find((item) => item.childId === childId && (item.type === "bottle" || item.type === "breastfeed")) ?? null;
export const getLastNappy = (activities: Activity[], childId: string): Extract<Activity, { type: "nappy" }> | null => activities.find((item): item is Extract<Activity, { type: "nappy" }> => item.childId === childId && item.type === "nappy") ?? null;
export const getLastMedicine = (activities: Activity[], childId: string, medicineId: string): Extract<Activity, { type: "medicine" }> | null => activities.find((item): item is Extract<Activity, { type: "medicine" }> => item.childId === childId && item.type === "medicine" && item.metadata.medicineId === medicineId) ?? null;
export const getCurrentChildState = (activities: Activity[], childId: string): ChildBrief["currentState"] => {
  const active = activities.find((item) => item.childId === childId && !item.endedAt && (item.type === "sleep" || item.type === "breastfeed"));
  return active?.type === "sleep" ? "sleeping" : active?.type === "breastfeed" ? "feeding" : "awake";
};
export const getOvernightSleepSummary = (activities: Activity[], childId: string, now = new Date()): ChildBrief["overnight"] => {
  const start = new Date(now); start.setHours(18, 0, 0, 0); start.setDate(start.getDate() - 1);
  const end = new Date(now); end.setHours(12, 0, 0, 0);
  const sleeps = activities.filter((item) => item.childId === childId && item.type === "sleep" && item.endedAt && new Date(item.occurredAt) >= start && new Date(item.occurredAt) <= end);
  if (!sleeps.length) return null;
  return { duration: formatDuration(sleeps.reduce((sum, item) => sum + durationMs(item, now), 0)), wakeCount: Math.max(0, sleeps.length - 1) };
};
export const getNeedsAttention = (data: NestData, childId: string, now = new Date()): BriefAttention[] => {
  const medicineNeeds = data.medicines.filter((item) => item.childId === childId && item.active && item.schedule === "daily").filter((medicine: Medicine) => {
    const last = getLastMedicine(data.activities, childId, medicine.id); return !last || !isToday(last.occurredAt, now);
  }).map((medicine) => ({ id: medicine.id, label: medicine.name, detail: "Not logged today", kind: "medicine" as const }));
  const supplyNeeds = getLowStockSupplies(data.supplies, childId).map((supply) => { const days = estimateSupplyRunOut(supply); return { id: supply.id, label: supply.name, detail: days === null ? `${supply.quantity} ${supply.unit} left` : `~${days} day${days === 1 ? "" : "s"} remaining`, kind: "supply" as const }; });
  return [...medicineNeeds, ...supplyNeeds];
};
export const generateChildBrief = (data: NestData, childId: string, now = new Date()): ChildBrief => {
  const feed = getLastFeed(data.activities, childId);
  const nappy = getLastNappy(data.activities, childId);
  return {
    currentState: getCurrentChildState(data.activities, childId),
    overnight: getOvernightSleepSummary(data.activities, childId, now),
    lastFeed: feed ? { label: feed.type === "bottle" ? `${feed.metadata.amountMl}ml ${feed.metadata.milk}` : "Breastfeed", detail: feed.type === "breastfeed" && feed.endedAt ? formatDuration(durationMs(feed)) : "", occurredAt: feed.occurredAt, createdBy: feed.createdBy } : null,
    lastNappy: nappy ? { label: nappy.metadata.kind === "both" ? "Wet + dirty" : `${nappy.metadata.kind[0].toUpperCase()}${nappy.metadata.kind.slice(1)}`, detail: "", occurredAt: nappy.occurredAt, createdBy: nappy.createdBy } : null,
    attention: getNeedsAttention(data, childId, now),
  };
};
