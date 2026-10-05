import { createDemoData } from "./demoData";
import { NestData } from "../domain/types";

export interface NestRepository {
  load(): NestData;
  save(data: NestData): void | Promise<void>;
  clear(): void | Promise<void>;
}

const STORAGE_KEY = "nest-family-data-v1";

interface LegacySupply {
  id: string; householdId: string; childId?: string; name: string;
  category: "nappies" | "formula" | "wipes" | "medicine" | "other";
  currentQuantity: number; unit: string; averageUsage?: number; lowStockThreshold: number; active: boolean;
}

type StoredData = Omit<Partial<NestData>, "supplies"> & { supplies?: Array<NestData["supplies"][number] | LegacySupply> };

const migrate = (stored: StoredData): NestData => {
  const fallback = createDemoData();
  const now = new Date().toISOString();
  const supplies = (stored.supplies ?? fallback.supplies).map((supply) => {
    if ("quantity" in supply) return supply;
    const categories = { formula: "feeding", wipes: "hygiene" } as const;
    return { id: supply.id, householdId: supply.householdId, childId: supply.childId, name: supply.name, category: supply.category === "formula" || supply.category === "wipes" ? categories[supply.category] : supply.category, quantity: supply.currentQuantity, unit: supply.unit, estimatedDailyUsage: supply.averageUsage, lowStockThreshold: supply.lowStockThreshold, active: supply.active, createdAt: now, updatedAt: now };
  });
  return {
    version: 3,
    users: stored.users ?? fallback.users,
    household: stored.household ?? fallback.household,
    households: stored.households ?? [stored.household ?? fallback.household],
    invitations: stored.invitations ?? [],
    userPreferences: stored.userPreferences ?? fallback.userPreferences,
    children: stored.children ?? fallback.children,
    activities: stored.activities ?? fallback.activities,
    supplies,
    shoppingItems: stored.shoppingItems ?? fallback.shoppingItems,
    medicines: stored.medicines ?? fallback.medicines,
    expenses: stored.expenses ?? fallback.expenses,
    milestones: stored.milestones ?? [],
    handoverViewedAt: stored.handoverViewedAt ?? fallback.handoverViewedAt,
  };
};

export class LocalNestRepository implements NestRepository {
  load(): NestData {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (value) return migrate(JSON.parse(value) as StoredData);
    } catch { /* Storage can be unavailable in private browsing. */ }
    return createDemoData();
  }

  save(data: NestData): void {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* Keep the live session usable. */ }
  }

  clear(): void {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
  }
}
