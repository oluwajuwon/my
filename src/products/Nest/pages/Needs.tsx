import React, { useMemo, useState } from "react";
import Icon from "../components/Icon";
import { estimateSupplyRunOut, getSupplyStatus, SupplyStatus } from "../domain/supplies";
import { ShoppingItem, Supply } from "../domain/types";
import { useNestStore } from "../store/NestStore";

const statusCopy: Record<SupplyStatus, string> = { "running-low": "RUNNING LOW", soon: "SOON", "all-good": "ALL GOOD" };
const SupplyRow: React.FC<{ supply: Supply; onAdd(): void; alreadyAdded: boolean }> = ({ supply, onAdd, alreadyAdded }) => {
  const days = estimateSupplyRunOut(supply); const status = getSupplyStatus(supply);
  return <article className="nest-supply-row"><span className={`nest-supply-status ${status}`} aria-label={statusCopy[status]}/><div><strong>{supply.name}</strong><small>{supply.quantity} {supply.unit}{days !== null ? ` · ~${days} day${days === 1 ? "" : "s"}` : ""}</small></div>{status !== "all-good" && <button type="button" disabled={alreadyAdded} onClick={onAdd}>{alreadyAdded ? "On list ✓" : "Add to shopping list"}</button>}</article>;
};

const PurchaseSheet: React.FC<{ item: ShoppingItem; supply?: Supply; onClose(): void; onDone(quantity: number, pricePence: number): void }> = ({ item, supply, onClose, onDone }) => {
  const [quantity, setQuantity] = useState(supply?.category === "nappies" ? 48 : supply?.category === "feeding" ? 800 : 1);
  const [price, setPrice] = useState("");
  return <div className="nest-sheet-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><section className="nest-sheet nest-purchase-sheet" role="dialog" aria-modal="true" aria-labelledby="purchase-title"><div className="nest-sheet-handle"/><header><div><p>PURCHASED</p><h2 id="purchase-title">{item.name}</h2></div><button type="button" className="nest-close" onClick={onClose} aria-label="Close"><Icon name="close"/></button></header><div className="nest-purchase-fields"><label>Quantity <span><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><input inputMode="numeric" type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} /><button type="button" onClick={() => setQuantity(quantity + 1)}>+</button></span><small>{supply?.unit ?? "items"}</small></label><label>Price <span className="nest-price-input"><b>£</b><input inputMode="decimal" type="number" min="0" step="0.01" placeholder="12.00" value={price} onChange={(event) => setPrice(event.target.value)}/></span></label></div><button className="nest-sheet-primary" type="button" disabled={!price || Number(price) < 0} onClick={() => onDone(quantity, Math.round(Number(price) * 100))}>Done</button><small className="nest-purchase-note">This replenishes stock, records the expense, and completes the list item.</small></section></div>;
};

const Needs: React.FC = () => {
  const { data, selectedChild, addToShoppingList, addShoppingItem, toggleShoppingItem, removeShoppingItem, purchase } = useNestStore();
  const [newItem, setNewItem] = useState(""); const [purchasing, setPurchasing] = useState<ShoppingItem | null>(null);
  const supplies = data.supplies.filter((item) => item.active && (!item.childId || item.childId === selectedChild.id));
  const groups = useMemo(() => (["running-low", "soon", "all-good"] as SupplyStatus[]).map((status) => ({ status, supplies: supplies.filter((item) => getSupplyStatus(item) === status) })), [supplies]);
  const shopping = data.shoppingItems.filter((item) => !item.childId || item.childId === selectedChild.id);
  return <div className="nest-page nest-needs"><header className="nest-page-heading"><div><p>NEEDS & SUPPLIES</p><h1>Keep care essentials close.</h1></div><span>{shopping.filter((item) => !item.completed).length} items to pick up</span></header>
    <div className="nest-needs-layout"><div className="nest-supply-groups">{groups.map((group) => group.supplies.length > 0 && <section key={group.status}><div className="nest-section-title"><p>{statusCopy[group.status]}</p><span>{group.supplies.length} item{group.supplies.length === 1 ? "" : "s"}</span></div>{group.supplies.map((supply) => <SupplyRow key={supply.id} supply={supply} alreadyAdded={shopping.some((item) => item.supplyId === supply.id && !item.completed)} onAdd={() => addToShoppingList(supply.id)}/>)}</section>)}</div>
      <aside className="nest-shopping-list"><div className="nest-section-title"><p>SHOPPING LIST</p><span>Shared</span></div>{shopping.length === 0 ? <div className="nest-empty-state"><Icon name="check"/><strong>You’re all stocked up.</strong><small>Items added from supplies will appear here.</small></div> : <div>{shopping.map((item) => <article className={item.completed ? "is-complete" : ""} key={item.id}><button type="button" className="nest-shopping-check" onClick={() => item.supplyId && !item.completed ? setPurchasing(item) : toggleShoppingItem(item.id)} aria-label={item.completed ? `Restore ${item.name}` : `Check off ${item.name}`}>{item.completed ? <Icon name="check" size={15}/> : ""}</button><div><strong>{item.name}</strong><small>{item.completed ? "Purchased" : item.reason ?? "Shared item"}</small></div>{!item.completed && item.supplyId && <button type="button" className="nest-purchased-button" onClick={() => setPurchasing(item)}>Purchased</button>}<button type="button" className="nest-remove-item" aria-label={`Remove ${item.name}`} onClick={() => removeShoppingItem(item.id)}>×</button></article>)}</div>}
        <form onSubmit={(event) => { event.preventDefault(); if (newItem.trim()) { addShoppingItem(newItem.trim()); setNewItem(""); } }}><input value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Add an item" aria-label="Shopping item"/><button type="submit" disabled={!newItem.trim()}>Add</button></form></aside>
    </div>
    {purchasing && <PurchaseSheet item={purchasing} supply={data.supplies.find((item) => item.id === purchasing.supplyId)} onClose={() => setPurchasing(null)} onDone={(quantity, pricePence) => { purchase({ shoppingItemId: purchasing.id, quantity, pricePence }); setPurchasing(null); }}/>} 
  </div>;
};
export default Needs;
