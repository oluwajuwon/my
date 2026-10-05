import { Activity, NestData } from "../domain/types";

const ago = (now: Date, minutes: number): string => new Date(now.getTime() - minutes * 60000).toISOString();
const id = (label: string, index: number): string => `demo-${label}-${index}`;

export const createDemoData = (now = new Date()): NestData => {
  const householdId = "household-williams";
  const childId = "child-maya";
  const parents = [
    { id: "user-ama", displayName: "Ama" },
    { id: "user-daniel", displayName: "Daniel" },
  ];
  const raw: Array<{ type: Activity["type"]; start: number; duration?: number; metadata: Activity["metadata"]; by: string }> = [
    { type: "sleep", start: 31, metadata: { sleepType: "nap" }, by: "user-daniel" },
    { type: "nappy", start: 47, metadata: { kind: "wet" }, by: "user-ama" },
    { type: "bottle", start: 92, metadata: { amountMl: 120, milk: "formula" }, by: "user-daniel" },
    { type: "nappy", start: 131, metadata: { kind: "both" }, by: "user-ama" },
    { type: "breastfeed", start: 190, duration: 16, metadata: { side: "left", switches: 0 }, by: "user-ama" },
    { type: "medicine", start: 260, metadata: { medicineId: "medicine-vitamin-d", name: "Vitamin D", dose: 1, unit: "drop" }, by: "user-daniel" },
    { type: "sleep", start: 250, duration: 76, metadata: { sleepType: "nap" }, by: "user-daniel" },
    { type: "bottle", start: 340, metadata: { amountMl: 120, milk: "expressed" }, by: "user-ama" },
    { type: "nappy", start: 720, metadata: { kind: "wet" }, by: "user-daniel" },
    { type: "breastfeed", start: 850, duration: 14, metadata: { side: "right", switches: 1 }, by: "user-ama" },
  ];
  const activities = raw.map((item, index) => {
    const occurredAt = ago(now, item.start);
    return {
      id: id(item.type, index), householdId, childId, type: item.type, occurredAt,
      ...(item.duration ? { endedAt: ago(now, item.start - item.duration) } : {}),
      createdBy: item.by, metadata: item.metadata, createdAt: occurredAt, updatedAt: occurredAt,
    } as Activity;
  });
  for (let day = 1; day <= 18; day += 1) {
    [7, 10, 13, 16, 19, 22].forEach((hour, index) => {
      const at = new Date(now); at.setDate(at.getDate() - day); at.setHours(hour, index * 3, 0, 0);
      activities.push({ id: id("bottle-history", day * 10 + index), householdId, childId, type: "bottle", occurredAt: at.toISOString(), createdBy: index % 2 ? "user-ama" : "user-daniel", metadata: { amountMl: [90, 120, 120, 150][index % 4], milk: index % 3 ? "formula" : "expressed" }, createdAt: at.toISOString(), updatedAt: at.toISOString() });
    });
    [8, 11, 15, 18, 21, 23].forEach((hour, index) => {
      const at = new Date(now); at.setDate(at.getDate() - day); at.setHours(hour, index, 0, 0);
      activities.push({ id: id("nappy-history", day * 10 + index), householdId, childId, type: "nappy", occurredAt: at.toISOString(), createdBy: index % 2 ? "user-daniel" : "user-ama", metadata: { kind: index % 3 === 0 ? "both" : "wet" }, createdAt: at.toISOString(), updatedAt: at.toISOString() });
    });
    const sleepAt = new Date(now); sleepAt.setDate(sleepAt.getDate() - day); sleepAt.setHours(20, 8 + day * 2 + (day % 3) * 4, 0, 0);
    const wakeAt = new Date(sleepAt.getTime() + (8 * 60 + 40 + (18 - day) * 4 + (day % 4) * 5) * 60000);
    activities.push({ id: id("sleep-history", day), householdId, childId, type: "sleep", occurredAt: sleepAt.toISOString(), endedAt: wakeAt.toISOString(), createdBy: "user-ama", metadata: { sleepType: "night" }, createdAt: sleepAt.toISOString(), updatedAt: sleepAt.toISOString() });
    [8, 13].forEach((hour, napIndex) => {
      const napAt = new Date(now); napAt.setDate(napAt.getDate() - day); napAt.setHours(hour, 5 + (day % 4) * 4 + napIndex * 25, 0, 0);
      const napEnd = new Date(napAt.getTime() + (48 + napIndex * 22 + (day % 5) * 4) * 60000);
      activities.push({ id: id(`nap-history-${napIndex}`, day), householdId, childId, type: "sleep", occurredAt: napAt.toISOString(), endedAt: napEnd.toISOString(), createdBy: napIndex ? "user-daniel" : "user-ama", metadata: { sleepType: "nap" }, createdAt: napAt.toISOString(), updatedAt: napAt.toISOString() });
    });
  }
  return {
    version: 3,
    users: parents,
    household: { id: householdId, name: "The Williams family", createdBy: "user-ama", members: [{ userId: "user-ama", role: "owner", relationshipLabel: "Mum" }, { userId: "user-daniel", role: "parent", relationshipLabel: "Dad" }] },
    households: [{ id: householdId, name: "The Williams family", createdBy: "user-ama", members: [{ userId: "user-ama", role: "owner", relationshipLabel: "Mum" }, { userId: "user-daniel", role: "parent", relationshipLabel: "Dad" }] }],
    invitations: [],
    userPreferences: { userId: "user-ama", selectedHouseholdId: householdId, selectedChildId: childId, preferredQuickActions: [], dismissedPrompts: [], nightCareEnabled: false, preferredUnits: { temperature: "celsius", volume: "ml" } },
    children: [{
      id: childId, householdId, name: "Maya", birthday: ago(now, 8 * 7 * 24 * 60), initials: "M",
      preferences: [
        { id: "pref-1", childId, category: "like", label: "Warm baths" },
        { id: "pref-2", childId, category: "like", label: "Being carried upright" },
        { id: "pref-3", childId, category: "soothing", label: "Shoulder rocking" },
        { id: "pref-4", childId, category: "soothing", label: "White noise" },
        { id: "pref-5", childId, category: "dislike", label: "Cold wipes" },
        { id: "pref-6", childId, category: "routine", label: "Bath, feed, white noise" },
      ],
    }],
    activities: activities.sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt)),
    supplies: [
      { id: "supply-nappies", householdId, childId, name: "Pampers Size 2", category: "nappies", quantity: 18, unit: "nappies", estimatedDailyUsage: 6.8, lowStockThreshold: 15, active: true, createdAt: ago(now, 30 * 24 * 60), updatedAt: ago(now, 47) },
      { id: "supply-formula", householdId, childId, name: "Aptamil First Infant Formula", category: "feeding", quantity: 360, unit: "g", estimatedDailyUsage: 82, lowStockThreshold: 220, active: true, createdAt: ago(now, 18 * 24 * 60), updatedAt: ago(now, 92) },
      { id: "supply-wipes", householdId, childId, name: "Water wipes", category: "hygiene", quantity: 6, unit: "packs", estimatedDailyUsage: .45, lowStockThreshold: 2, active: true, createdAt: ago(now, 18 * 24 * 60), updatedAt: ago(now, 3 * 24 * 60) },
      { id: "supply-vitamin-d", householdId, childId, name: "Vitamin D", category: "medicine", quantity: 9, unit: "doses", estimatedDailyUsage: 1, lowStockThreshold: 5, active: true, createdAt: ago(now, 14 * 24 * 60), updatedAt: ago(now, 260) },
      { id: "supply-cream", householdId, childId, name: "Sudocrem", category: "hygiene", quantity: 1, unit: "tub", lowStockThreshold: .25, active: true, createdAt: ago(now, 20 * 24 * 60), updatedAt: ago(now, 5 * 24 * 60) },
    ],
    medicines: [{ id: "medicine-vitamin-d", childId, name: "Vitamin D", defaultDose: 1, unit: "drop", schedule: "daily", active: true }],
    shoppingItems: [{ id: "shopping-nappies", householdId, childId, supplyId: "supply-nappies", name: "Pampers Size 2", reason: "Running low", completed: false, createdAt: ago(now, 24 * 60) }],
    expenses: [
      { id: "expense-1", householdId, childId, amountPence: 4200, category: "essentials", description: "Nappies and wipes", occurredAt: ago(now, 2 * 24 * 60) },
      { id: "expense-2", householdId, childId, amountPence: 1899, category: "feeding", description: "Formula", occurredAt: ago(now, 4 * 24 * 60) },
    ],
    milestones: [],
    handoverViewedAt: ago(now, 8 * 60),
  };
};
