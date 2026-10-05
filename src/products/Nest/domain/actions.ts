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
export interface RankedAction { id: QuickActionId; score: number; reasons: string[] }
const activityAction = (type: import("./types").Activity["type"]): QuickActionId => type === "breastfeed" || type === "bottle" ? "feed" : type === "tummyTime" ? "tummyTime" : type;
export const rankQuickActions = (input: { child: Child; userId: string; activities: import("./types").Activity[]; currentState: "awake" | "sleeping" | "feeding"; preferred?: string[]; now?: Date }): RankedAction[] => {
  const now = input.now ?? new Date(); const available = getAgeRelevantActions(input.child, now); const candidates = [...available.primary, ...available.more];
  return candidates.map((id) => { let score = available.primary.includes(id) ? 40 : 10; const reasons = [available.primary.includes(id) ? "age-relevant primary action" : "age-relevant action"];
    const recent = input.activities.filter((item) => item.childId === input.child.id && item.createdBy === input.userId && activityAction(item.type) === id && now.getTime() - new Date(item.occurredAt).getTime() < 14 * 86400000); score += Math.min(30, recent.length * 3); if (recent.length) reasons.push("frequently used by this parent");
    const last = recent[0]; if (last && now.getTime() - new Date(last.occurredAt).getTime() < 6 * 3600000) { score += 8; reasons.push("used recently"); }
    if (input.currentState === "awake" && id === "sleep") { score += 7; reasons.push("child is awake"); } if (input.currentState === "sleeping" && id === "sleep") score -= 30;
    const preferredIndex = input.preferred?.indexOf(id) ?? -1; if (preferredIndex >= 0) { score += 20 - preferredIndex; reasons.push("parent preference"); }
    return { id, score, reasons }; }).sort((a, b) => b.score - a.score || candidates.indexOf(a.id) - candidates.indexOf(b.id));
};

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
