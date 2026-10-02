import { Child, QuickLogDraft } from "./types";

export type QuickActionId = "feed" | "sleep" | "nappy" | "medicine" | "temperature" | "pump" | "meal" | "tummyTime" | "bath" | "mood" | "note" | "purchase" | "potty" | "activity";
export interface AgeRelevantActions { stage: "young-baby" | "older-baby" | "toddler"; primary: QuickActionId[]; more: QuickActionId[] }

export const getAgeRelevantActions = (child: Child, now = new Date()): AgeRelevantActions => {
  const ageMonths = (now.getTime() - new Date(child.birthday).getTime()) / (30.44 * 86400000);
  if (ageMonths < 6) return { stage: "young-baby", primary: ["feed", "sleep", "nappy"], more: ["pump", "medicine", "temperature", "tummyTime", "bath", "note", "purchase"] };
  if (ageMonths < 18) return { stage: "older-baby", primary: ["feed", "sleep", "nappy"], more: ["meal", "medicine", "temperature", "bath", "mood", "note", "purchase"] };
  return { stage: "toddler", primary: ["meal", "sleep", "potty"], more: ["medicine", "temperature", "mood", "bath", "activity", "note", "purchase"] };
};

export interface RepeatAction { key: string; label: string; draft: QuickLogDraft; kind: "feed" | "nappy" | "medicine" }

export const deriveRepeatActions = (activities: import("./types").Activity[], childId: string, limit = 4, now = new Date()): RepeatAction[] => {
  const seen = new Set<string>();
  const repeats: RepeatAction[] = [];
  activities.filter((item) => item.childId === childId).sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt)).forEach((item) => {
    let repeat: RepeatAction | null = null;
    if (item.type === "bottle") repeat = { key: `bottle-${item.metadata.amountMl}-${item.metadata.milk}`, label: `${item.metadata.amountMl}ml ${item.metadata.milk === "formula" ? "Formula" : "Expressed"}`, draft: { type: "bottle", amountMl: item.metadata.amountMl, milk: item.metadata.milk }, kind: "feed" };
    if (item.type === "nappy") repeat = { key: `nappy-${item.metadata.kind}`, label: item.metadata.kind === "both" ? "Wet + dirty" : `${item.metadata.kind[0].toUpperCase()}${item.metadata.kind.slice(1)} nappy`, draft: { type: "nappy", kind: item.metadata.kind }, kind: "nappy" };
    if (item.type === "medicine" && now.getTime() - new Date(item.occurredAt).getTime() >= 8 * 60 * 60 * 1000) repeat = { key: `medicine-${item.metadata.medicineId}`, label: item.metadata.name, draft: { type: "medicine", medicineId: item.metadata.medicineId }, kind: "medicine" };
    if (repeat && !seen.has(repeat.key) && repeats.length < limit) { seen.add(repeat.key); repeats.push(repeat); }
  });
  return repeats;
};
