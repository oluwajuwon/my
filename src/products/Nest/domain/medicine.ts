import { Activity } from "./types";

export const findRecentMedicineLog = (activities: Activity[], medicineId: string, childId: string, now = new Date(), windowHours = 8): Extract<Activity, { type: "medicine" }> | null => {
  const cutoff = now.getTime() - windowHours * 60 * 60 * 1000;
  return activities.find((item): item is Extract<Activity, { type: "medicine" }> => item.type === "medicine" && item.childId === childId && item.metadata.medicineId === medicineId && new Date(item.occurredAt).getTime() >= cutoff) ?? null;
};
