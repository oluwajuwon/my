import { Expense, NestData, ShoppingItem, Supply } from "./types";
import { createId } from "./id";

export type SupplyStatus = "running-low" | "soon" | "all-good";
export const estimateSupplyRunOut = (supply: Pick<Supply, "quantity" | "estimatedDailyUsage">): number | null => supply.estimatedDailyUsage && supply.estimatedDailyUsage > 0 ? Math.max(0, Math.floor(supply.quantity / supply.estimatedDailyUsage)) : null;
export const getSupplyStatus = (supply: Supply): SupplyStatus => {
  const days = estimateSupplyRunOut(supply);
  if (supply.quantity <= supply.lowStockThreshold || (days !== null && days <= 4)) return "running-low";
  if (days !== null && days <= 10) return "soon";
  return "all-good";
};
export const getLowStockSupplies = (supplies: Supply[], childId: string): Supply[] => supplies.filter((item) => item.active && (!item.childId || item.childId === childId) && getSupplyStatus(item) !== "all-good");

const id = (_prefix: string, _now: Date): string => createId();
export const addSupplyToShoppingList = (data: NestData, supplyId: string, now = new Date()): NestData => {
  const supply = data.supplies.find((item) => item.id === supplyId);
  if (!supply || data.shoppingItems.some((item) => item.supplyId === supplyId && !item.completed)) return data;
  const item: ShoppingItem = { id: id("shopping", now), householdId: supply.householdId, childId: supply.childId, supplyId, name: supply.name, reason: getSupplyStatus(supply) === "running-low" ? "Running low" : "Stocking up soon", completed: false, createdAt: now.toISOString() };
  return { ...data, shoppingItems: [item, ...data.shoppingItems] };
};

export interface PurchaseInput { shoppingItemId: string; quantity: number; pricePence: number }
export const completePurchase = (data: NestData, input: PurchaseInput, now = new Date()): NestData => {
  const item = data.shoppingItems.find((entry) => entry.id === input.shoppingItemId);
  if (!item) return data;
  const supply = data.supplies.find((entry) => entry.id === item.supplyId);
  const childId = item.childId ?? supply?.childId ?? data.children[0].id;
  const expense: Expense = { id: id("expense", now), householdId: data.household.id, childId, amountPence: Math.max(0, Math.round(input.pricePence)), category: supply?.category === "feeding" ? "feeding" : supply?.category === "medicine" ? "healthcare" : "essentials", description: item.name, occurredAt: now.toISOString() };
  return {
    ...data,
    supplies: data.supplies.map((entry) => entry.id === item.supplyId ? { ...entry, quantity: entry.quantity + Math.max(0, input.quantity), updatedAt: now.toISOString() } : entry),
    shoppingItems: data.shoppingItems.map((entry) => entry.id === item.id ? { ...entry, completed: true, completedAt: now.toISOString() } : entry),
    expenses: [expense, ...data.expenses],
  };
};
