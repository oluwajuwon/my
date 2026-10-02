export type ActivityType = "breastfeed" | "bottle" | "sleep" | "nappy" | "medicine" | "temperature" | "pump" | "tummyTime" | "bath" | "mood" | "note";
export type NappyKind = "wet" | "dirty" | "both" | "dry";

export interface User { id: string; displayName: string }
export interface HouseholdMember { userId: string; role: "owner" | "parent" | "caregiver" }
export interface Household { id: string; name: string; members: HouseholdMember[] }

export type PreferenceCategory = "like" | "dislike" | "soothing" | "routine" | "note";
export interface ChildPreference { id: string; childId: string; category: PreferenceCategory; label: string }
export interface Child { id: string; householdId: string; name: string; birthday: string; initials: string; preferences: ChildPreference[] }

interface ActivityBase { id: string; householdId: string; childId: string; occurredAt: string; endedAt?: string; createdBy: string; createdAt: string; updatedAt: string }
export interface BreastfeedActivity extends ActivityBase { type: "breastfeed"; metadata: { side: "left" | "right"; switches: number } }
export interface BottleActivity extends ActivityBase { type: "bottle"; metadata: { amountMl: number; milk: "formula" | "expressed" } }
export interface SleepActivity extends ActivityBase { type: "sleep"; metadata: { sleepType: "nap" | "night" } }
export interface NappyActivity extends ActivityBase { type: "nappy"; metadata: { kind: NappyKind } }
export interface MedicineActivity extends ActivityBase { type: "medicine"; metadata: { medicineId: string; name: string; dose: number; unit: string } }
export interface TemperatureActivity extends ActivityBase { type: "temperature"; metadata: { valueCelsius: number } }
export interface PumpActivity extends ActivityBase { type: "pump"; metadata: { durationMinutes: number; amountMl?: number } }
export interface TummyTimeActivity extends ActivityBase { type: "tummyTime"; metadata: { durationMinutes: number } }
export interface BathActivity extends ActivityBase { type: "bath"; metadata: Record<string, never> }
export interface MoodActivity extends ActivityBase { type: "mood"; metadata: { mood: "settled" | "fussy" | "happy" | "tired" } }
export interface NoteActivity extends ActivityBase { type: "note"; metadata: { text: string } }
export type Activity = BreastfeedActivity | BottleActivity | SleepActivity | NappyActivity | MedicineActivity | TemperatureActivity | PumpActivity | TummyTimeActivity | BathActivity | MoodActivity | NoteActivity;

export type SupplyCategory = "nappies" | "feeding" | "medicine" | "hygiene" | "clothing" | "other";
export interface Supply { id: string; householdId: string; childId?: string; name: string; category: SupplyCategory; quantity: number; unit: string; estimatedDailyUsage?: number; lowStockThreshold: number; active: boolean; createdAt: string; updatedAt: string }
export interface ShoppingItem { id: string; householdId: string; childId?: string; supplyId?: string; name: string; reason?: string; completed: boolean; createdAt: string; completedAt?: string }
export interface Medicine { id: string; childId: string; name: string; defaultDose: number; unit: string; schedule?: "daily" | "as-needed"; active: boolean }
export interface Expense { id: string; householdId: string; childId: string; amountPence: number; category: "essentials" | "clothing" | "healthcare" | "feeding" | "activities" | "childcare" | "other"; description: string; occurredAt: string }
export interface Milestone { id: string; childId: string; title: string; occurredAt: string; note?: string }

export interface NestData {
  version: 2;
  users: User[];
  household: Household;
  children: Child[];
  activities: Activity[];
  supplies: Supply[];
  shoppingItems: ShoppingItem[];
  medicines: Medicine[];
  expenses: Expense[];
  milestones: Milestone[];
  handoverViewedAt?: string;
}

export type QuickLogDraft =
  | { type: "nappy"; kind: NappyKind }
  | { type: "sleep" }
  | { type: "breastfeed"; side: "left" | "right" }
  | { type: "bottle"; amountMl: number; milk: "formula" | "expressed" }
  | { type: "medicine"; medicineId: string }
  | { type: "temperature"; valueCelsius: number }
  | { type: "pump"; durationMinutes: number }
  | { type: "tummyTime"; durationMinutes: number }
  | { type: "bath" }
  | { type: "mood"; mood: MoodActivity["metadata"]["mood"] }
  | { type: "note"; text: string };
