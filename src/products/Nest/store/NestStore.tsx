import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createActivity, applyActivity, undoActivity } from "../domain/activity";
import { Activity, NestData, QuickLogDraft } from "../domain/types";
import { LocalNestRepository, NestRepository } from "../data/repository";
import { addSupplyToShoppingList, completePurchase, PurchaseInput } from "../domain/supplies";

interface Toast { message: string; action?: string; onAction?: () => void }
interface NestStoreValue {
  data: NestData;
  selectedChildId: string;
  selectedChild: NestData["children"][number];
  currentUser: NestData["users"][number];
  toast: Toast | null;
  selectChild(id: string): void;
  log(draft: QuickLogDraft): Activity;
  updateActivity(id: string, update: (activity: Activity) => Activity): void;
  deleteActivity(id: string): void;
  addToShoppingList(supplyId: string): void;
  addShoppingItem(name: string): void;
  toggleShoppingItem(id: string): void;
  removeShoppingItem(id: string): void;
  purchase(input: PurchaseInput): void;
  addPreference(category: NestData["children"][number]["preferences"][number]["category"], label: string): void;
  updatePreference(id: string, label: string): void;
  removePreference(id: string): void;
  markHandoverViewed(): void;
  dismissToast(): void;
}

const NestStore = createContext<NestStoreValue | null>(null);

export const NestStoreProvider: React.FC<React.PropsWithChildren<{ repository?: NestRepository }>> = ({ children, repository }) => {
  const repositoryRef = useRef<NestRepository>(repository ?? new LocalNestRepository());
  const [data, setData] = useState<NestData>(() => repositoryRef.current.load());
  const [selectedChildId, setSelectedChildId] = useState(() => data.children[0].id);
  const [toast, setToast] = useState<Toast | null>(null);
  const commit = useCallback((update: (current: NestData) => NestData) => {
    setData((current) => { const next = update(current); repositoryRef.current.save(next); return next; });
  }, []);
  const log = useCallback((draft: QuickLogDraft): Activity => {
    const activity = createActivity(draft, data, selectedChildId, data.users[0].id);
    commit((current) => applyActivity(current, activity));
    const labels: Record<QuickLogDraft["type"], string> = { nappy: "Nappy logged", sleep: "Sleep started", breastfeed: "Feed started", bottle: "Bottle logged", medicine: "Medicine logged", temperature: "Temperature logged", pump: "Pump logged", tummyTime: "Tummy time logged", bath: "Bath logged", mood: "Mood logged", note: "Note saved" };
    setToast({ message: labels[draft.type], action: "Undo", onAction: () => { commit((current) => undoActivity(current, activity)); setToast(null); } });
    return activity;
  }, [commit, data, selectedChildId]);
  const updateActivity = useCallback((id: string, update: (activity: Activity) => Activity) => commit((current) => ({ ...current, activities: current.activities.map((item) => item.id === id ? update(item) : item) })), [commit]);
  const deleteActivity = useCallback((id: string) => commit((current) => { const activity = current.activities.find((item) => item.id === id); return activity ? undoActivity(current, activity) : current; }), [commit]);
  const addToShoppingList = useCallback((supplyId: string) => { commit((current) => addSupplyToShoppingList(current, supplyId)); setToast({ message: "Added to shopping list" }); }, [commit]);
  const addShoppingItem = useCallback((name: string) => commit((current) => ({ ...current, shoppingItems: [{ id: `shopping-${Date.now().toString(36)}`, householdId: current.household.id, childId: selectedChildId, name, completed: false, createdAt: new Date().toISOString() }, ...current.shoppingItems] })), [commit, selectedChildId]);
  const toggleShoppingItem = useCallback((id: string) => commit((current) => ({ ...current, shoppingItems: current.shoppingItems.map((item) => item.id === id ? { ...item, completed: !item.completed, completedAt: item.completed ? undefined : new Date().toISOString() } : item) })), [commit]);
  const removeShoppingItem = useCallback((id: string) => commit((current) => ({ ...current, shoppingItems: current.shoppingItems.filter((item) => item.id !== id) })), [commit]);
  const purchase = useCallback((input: PurchaseInput) => { commit((current) => completePurchase(current, input)); setToast({ message: "Purchase added and stock updated" }); }, [commit]);
  const addPreference = useCallback((category: NestData["children"][number]["preferences"][number]["category"], label: string) => commit((current) => ({ ...current, children: current.children.map((child) => child.id === selectedChildId ? { ...child, preferences: [...child.preferences, { id: `preference-${Date.now().toString(36)}`, childId: child.id, category, label }] } : child) })), [commit, selectedChildId]);
  const updatePreference = useCallback((id: string, label: string) => commit((current) => ({ ...current, children: current.children.map((child) => child.id === selectedChildId ? { ...child, preferences: child.preferences.map((item) => item.id === id ? { ...item, label } : item) } : child) })), [commit, selectedChildId]);
  const removePreference = useCallback((id: string) => commit((current) => ({ ...current, children: current.children.map((child) => child.id === selectedChildId ? { ...child, preferences: child.preferences.filter((item) => item.id !== id) } : child) })), [commit, selectedChildId]);
  const markHandoverViewed = useCallback(() => commit((current) => ({ ...current, handoverViewedAt: new Date().toISOString() })), [commit]);
  const selectedChild = data.children.find((child) => child.id === selectedChildId) ?? data.children[0];
  const value = useMemo(() => ({ data, selectedChildId, selectedChild, currentUser: data.users[0], toast, selectChild: setSelectedChildId, log, updateActivity, deleteActivity, addToShoppingList, addShoppingItem, toggleShoppingItem, removeShoppingItem, purchase, addPreference, updatePreference, removePreference, markHandoverViewed, dismissToast: () => setToast(null) }), [data, selectedChildId, selectedChild, toast, log, updateActivity, deleteActivity, addToShoppingList, addShoppingItem, toggleShoppingItem, removeShoppingItem, purchase, addPreference, updatePreference, removePreference, markHandoverViewed]);
  return <NestStore.Provider value={value}>{children}</NestStore.Provider>;
};

export const useNestStore = (): NestStoreValue => {
  const value = useContext(NestStore);
  if (!value) throw new Error("useNestStore must be used inside NestStoreProvider");
  return value;
};
