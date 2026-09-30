import React, { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { formatMoney, formatMoneyInput, parseMoneyInput, penceToInput, sanitizeMoneyEditingInput } from "../domain/money";
import { Owner, Pence } from "../domain/types";
import { ownerOptions } from "../domain/ownership";
import { useBudgyStore } from "../store/BudgyStore";

export const shiftMonth = (month: string, amount: number) => {
  const [year, index] = month.split("-").map(Number);
  const next = new Date(year, index - 1 + amount, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (month: string) => {
  const [year, index] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(year, index - 1, 1));
};

export const MonthPicker: React.FC<{ month: string; onChange: (month: string) => void }> = ({ month, onChange }) => (
  <div className="budgy-month-control" aria-label="Budget month">
    <button className="budgy-month-button" type="button" onClick={() => onChange(shiftMonth(month, -1))} aria-label="Previous month"><Icon name="arrow-left" size={17} /></button>
    <label className="budgy-month-picker"><Icon name="calendar" size={17} /><span>{monthLabel(month)}</span><input type="month" value={month} onChange={(event) => onChange(event.target.value)} aria-label="Select month" /></label>
    <button className="budgy-month-button" type="button" onClick={() => onChange(shiftMonth(month, 1))} aria-label="Next month"><Icon name="arrow-right" size={17} /></button>
  </div>
);

export const MoneyInput: React.FC<{
  value: Pence; onChange: (value: Pence) => void; label?: string; id?: string; required?: boolean;
}> = ({ value, onChange, label, id, required }) => {
  const[editing,setEditing]=useState(formatMoneyInput(value));const[focused,setFocused]=useState(false);const inputRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(!focused)setEditing(formatMoneyInput(value));},[value,focused]);
  const commit=()=>{const next=parseMoneyInput(editing);onChange(next);setFocused(false);setEditing(formatMoneyInput(next));};
  return <label className="budgy-field" htmlFor={id}>{label&&<span>{label}</span>}<div className="budgy-money-input"><span>£</span><input ref={inputRef} id={id} inputMode="decimal" type="text" value={focused?editing:formatMoneyInput(value)} required={required} onFocus={(event)=>{const input=event.currentTarget;setFocused(true);setEditing(value===0?"":penceToInput(value));requestAnimationFrame(()=>input.select());}} onChange={(event)=>setEditing(sanitizeMoneyEditingInput(event.target.value))} onBlur={commit} onKeyDown={(event)=>{if(event.key==="Enter")event.currentTarget.blur();}} /></div></label>;
};

export const OwnerSelector: React.FC<{ value: Owner; onChange: (value: Owner) => void; label?: string }> = ({ value, onChange, label = "Owner" }) => {
  const { data } = useBudgyStore();
  const options = ownerOptions(data.members);
  return <label className="budgy-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((owner) => <option key={owner.value} value={owner.value}>{owner.label}</option>)}</select></label>;
};

export const CategorySelector: React.FC<{ value: string; categories: string[]; onChange: (value: string) => void;label?:string }> = ({ value, categories, onChange,label="Category" }) => (
  <label className="budgy-field"><span>{label}</span><select required value={value} onChange={(event) => onChange(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
);

export const ProgressBar: React.FC<{ value: number; tone?: "default" | "warning" }> = ({ value, tone = "default" }) => (
  <div className={`budgy-progress ${tone === "warning" ? "is-warning" : ""}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}><span style={{ width: `${Math.max(0, Math.min(value, 1)) * 100}%` }} /></div>
);

export const FinancialMetric: React.FC<{ label: string; value: Pence; detail?: string }> = ({ label, value, detail }) => (
  <div className="budgy-financial-metric"><span>{label}</span><strong>{formatMoney(value)}</strong>{detail && <small>{detail}</small>}</div>
);

export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="budgy-product-empty"><span className="budgy-empty-orbit" aria-hidden="true" /><h2>{title}</h2><p>{description}</p>{action}</div>
);
