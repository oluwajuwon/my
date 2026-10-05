import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createActivity, applyActivity, undoActivity } from "../domain/activity";
import { Activity, NestData, QuickLogDraft } from "../domain/types";
import { LocalNestRepository, NestRepository } from "../data/repository";
import { addSupplyToShoppingList, completePurchase, PurchaseInput } from "../domain/supplies";
import { createId } from "../domain/id";

interface Toast { message: string; action?: string; onAction?: () => void }
interface NestStoreValue {
  data: NestData;
  selectedChildId: string;
  selectedChild: NestData["children"][number];
  currentUser: NestData["users"][number];
  toast: Toast | null;
  saving: boolean;
  syncError: string | null;
  retry(): void;
  selectChild(id: string): void;
  addChild(name: string, birthday: string): void;
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
  inviteMember(email: string): Promise<string | null>;
  dismissPrompt(id: string): void;
  setNightCare(enabled: boolean): void;
  dismissToast(): void;
}

const NestStore = createContext<NestStoreValue | null>(null);

type NestPersistence = Pick<NestRepository, "save" | "clear"> & { invite?(householdId: string, email: string, role?: "parent" | "caregiver"): Promise<string> };
export const NestStoreProvider: React.FC<React.PropsWithChildren<{ repository?: NestPersistence; initialData?: NestData }>> = ({ children, repository, initialData }) => {
  const localRef = useRef(new LocalNestRepository());
  const repositoryRef = useRef<NestPersistence>(repository ?? localRef.current);
  const [data, setData] = useState<NestData>(() => initialData ?? localRef.current.load());
  const [selectedChildId, setSelectedChildId] = useState(() => data.userPreferences.selectedChildId && data.children.some((child) => child.id === data.userPreferences.selectedChildId) ? data.userPreferences.selectedChildId : data.children[0].id);
  const [toast, setToast] = useState<Toast | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const persist = useCallback((next: NestData) => { try { const result = repositoryRef.current.save(next); if (result instanceof Promise) { setSaving(true); void result.then(() => { setSaving(false); setSyncError(null); }).catch((error: unknown) => { setSaving(false); setSyncError(error instanceof Error ? error.message : "Your change could not be saved."); }); } else setSyncError(null); } catch (error) { setSyncError(error instanceof Error ? error.message : "Your change could not be saved."); } }, []);
  const commit = useCallback((update: (current: NestData) => NestData) => {
    setData((current) => { const next = update(current); persist(next); return next; });
  }, [persist]);
  const selectChild = useCallback((id: string) => { setSelectedChildId(id); commit((current) => ({ ...current, userPreferences: { ...current.userPreferences, selectedChildId: id } })); }, [commit]);
  const addChild = useCallback((name: string, birthday: string) => { const id = createId(); commit((current) => ({ ...current, children: [...current.children, { id, householdId: current.household.id, name: name.trim(), birthday, initials: name.trim().slice(0,1).toUpperCase(), preferences: [] }], userPreferences: { ...current.userPreferences, selectedChildId: id } })); setSelectedChildId(id); setToast({ message: `${name.trim()} added to your family` }); }, [commit]);
  const log = useCallback((draft: QuickLogDraft): Activity => {
    const activity = createActivity(draft, data, selectedChildId, data.userPreferences.userId);
    commit((current) => applyActivity(current, activity));
    const labels: Record<QuickLogDraft["type"], string> = { nappy: "Nappy logged", sleep: "Sleep started", breastfeed: "Feed started", bottle: "Bottle logged", medicine: "Medicine logged", temperature: "Temperature logged", pump: "Pump logged", tummyTime: "Tummy time logged", bath: "Bath logged", mood: "Mood logged", note: "Note saved" };
    setToast({ message: labels[draft.type], action: "Undo", onAction: () => { commit((current) => undoActivity(current, activity)); setToast(null); } });
    return activity;
  }, [commit, data, selectedChildId]);
  const updateActivity = useCallback((id: string, update: (activity: Activity) => Activity) => commit((current) => ({ ...current, activities: current.activities.map((item) => item.id === id ? update(item) : item) })), [commit]);
  const deleteActivity = useCallback((id: string) => commit((current) => { const activity = current.activities.find((item) => item.id === id); return activity ? undoActivity(current, activity) : current; }), [commit]);
  const addToShoppingList = useCallback((supplyId: string) => { commit((current) => addSupplyToShoppingList(current, supplyId)); setToast({ message: "Added to shopping list" }); }, [commit]);
  const addShoppingItem = useCallback((name: string) => commit((current) => ({ ...current, shoppingItems: [{ id: createId(), householdId: current.household.id, childId: selectedChildId, name, completed: false, createdAt: new Date().toISOString() }, ...current.shoppingItems] })), [commit, selectedChildId]);
  const toggleShoppingItem = useCallback((id: string) => commit((current) => ({ ...current, shoppingItems: current.shoppingItems.map((item) => item.id === id ? { ...item, completed: !item.completed, completedAt: item.completed ? undefined : new Date().toISOString() } : item) })), [commit]);
  const removeShoppingItem = useCallback((id: string) => commit((current) => ({ ...current, shoppingItems: current.shoppingItems.filter((item) => item.id !== id) })), [commit]);
  const purchase = useCallback((input: PurchaseInput) => { commit((current) => completePurchase(current, input)); setToast({ message: "Purchase added and stock updated" }); }, [commit]);
  const addPreference = useCallback((category: NestData["children"][number]["preferences"][number]["category"], label: string) => commit((current) => ({ ...current, children: current.children.map((child) => child.id === selectedChildId ? { ...child, preferences: [...child.preferences, { id: createId(), childId: child.id, category, label }] } : child) })), [commit, selectedChildId]);
  const updatePreference = useCallback((id: string, label: string) => commit((current) => ({ ...current, children: current.children.map((child) => child.id === selectedChildId ? { ...child, preferences: child.preferences.map((item) => item.id === id ? { ...item, label } : item) } : child) })), [commit, selectedChildId]);
  const removePreference = useCallback((id: string) => commit((current) => ({ ...current, children: current.children.map((child) => child.id === selectedChildId ? { ...child, preferences: child.preferences.filter((item) => item.id !== id) } : child) })), [commit, selectedChildId]);
  const markHandoverViewed = useCallback(() => commit((current) => ({ ...current, handoverViewedAt: new Date().toISOString() })), [commit]);
  const inviteMember = useCallback(async (email: string): Promise<string | null> => repositoryRef.current.invite ? repositoryRef.current.invite(data.household.id, email, "parent") : null, [data.household.id]);
  const dismissPrompt = useCallback((id: string) => commit((current) => ({ ...current, userPreferences: { ...current.userPreferences, dismissedPrompts: Array.from(new Set([...current.userPreferences.dismissedPrompts, id])) } })), [commit]);
  const setNightCare = useCallback((enabled: boolean) => commit((current) => ({ ...current, userPreferences: { ...current.userPreferences, nightCareEnabled: enabled } })), [commit]);
  const selectedChild = data.children.find((child) => child.id === selectedChildId) ?? data.children[0];
  const currentUser = data.users.find((user) => user.id === data.userPreferences.userId) ?? data.users[0];
  const value = useMemo(() => ({ data, selectedChildId, selectedChild, currentUser, toast, saving, syncError, retry: () => persist(data), selectChild, addChild, log, updateActivity, deleteActivity, addToShoppingList, addShoppingItem, toggleShoppingItem, removeShoppingItem, purchase, addPreference, updatePreference, removePreference, markHandoverViewed, inviteMember, dismissPrompt, setNightCare, dismissToast: () => setToast(null) }), [data, selectedChildId, selectedChild, currentUser, toast, saving, syncError, persist, selectChild, addChild, log, updateActivity, deleteActivity, addToShoppingList, addShoppingItem, toggleShoppingItem, removeShoppingItem, purchase, addPreference, updatePreference, removePreference, markHandoverViewed, inviteMember, dismissPrompt, setNightCare]);
  return <NestStore.Provider value={value}>{children}</NestStore.Provider>;
};

export const useNestStore = (): NestStoreValue => {
  const value = useContext(NestStore);
  if (!value) throw new Error("useNestStore must be used inside NestStoreProvider");
  return value;
};
