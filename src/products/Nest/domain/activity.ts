import { Activity, NappyKind, NestData, QuickLogDraft } from "./types";
import { createId } from "./id";

const makeId = createId;

export const createActivity = (draft: QuickLogDraft, data: NestData, childId: string, userId: string, now = new Date()): Activity => {
  const base = { id: makeId(), householdId: data.household.id, childId, occurredAt: now.toISOString(), createdBy: userId, createdAt: now.toISOString(), updatedAt: now.toISOString() };
  if (draft.type === "nappy") return { ...base, type: "nappy", metadata: { kind: draft.kind } };
  if (draft.type === "sleep") return { ...base, type: "sleep", metadata: { sleepType: now.getHours() >= 19 || now.getHours() < 7 ? "night" : "nap" } };
  if (draft.type === "breastfeed") return { ...base, type: "breastfeed", metadata: { side: draft.side, switches: 0 } };
  if (draft.type === "bottle") return { ...base, type: "bottle", metadata: { amountMl: draft.amountMl, milk: draft.milk } };
  if (draft.type === "medicine") {
    const medicine = data.medicines.find((item) => item.id === draft.medicineId);
    if (!medicine) throw new Error("Medicine is no longer available");
    return { ...base, type: "medicine", metadata: { medicineId: medicine.id, name: medicine.name, dose: medicine.defaultDose, unit: medicine.unit } };
  }
  if (draft.type === "temperature") return { ...base, type: "temperature", metadata: { valueCelsius: draft.valueCelsius } };
  if (draft.type === "pump") return { ...base, type: "pump", metadata: { durationMinutes: draft.durationMinutes } };
  if (draft.type === "tummyTime") return { ...base, type: "tummyTime", metadata: { durationMinutes: draft.durationMinutes } };
  if (draft.type === "bath") return { ...base, type: "bath", metadata: {} };
  if (draft.type === "mood") return { ...base, type: "mood", metadata: { mood: draft.mood } };
  return { ...base, type: "note", metadata: { text: draft.text } };
};

const inventoryCategory = (activity: Activity): "nappies" | "medicine" | null => {
  if (activity.type === "nappy" && activity.metadata.kind !== "dry") return "nappies";
  if (activity.type === "medicine") return "medicine";
  return null;
};

export const applyActivity = (data: NestData, activity: Activity): NestData => ({
  ...data,
  activities: [activity, ...data.activities],
  supplies: inventoryCategory(activity)
    ? data.supplies.map((supply) => supply.childId === activity.childId && supply.category === inventoryCategory(activity) && supply.active ? { ...supply, quantity: Math.max(0, supply.quantity - 1), updatedAt: activity.occurredAt } : supply)
    : data.supplies,
});

export const undoActivity = (data: NestData, activity: Activity): NestData => ({
  ...data,
  activities: data.activities.filter((item) => item.id !== activity.id),
  supplies: inventoryCategory(activity)
    ? data.supplies.map((supply) => supply.childId === activity.childId && supply.category === inventoryCategory(activity) && supply.active ? { ...supply, quantity: supply.quantity + 1, updatedAt: new Date().toISOString() } : supply)
    : data.supplies,
});

export const nappyLabel = (kind: NappyKind): string => ({ wet: "Wet", dirty: "Dirty", both: "Wet + dirty", dry: "Dry" })[kind];
