import React, { useMemo, useState } from "react";
import { calculateBudgetActuals, calculateHouseholdSummary, groupBudgetItems } from "../domain/budget";
import { formatMoney } from "../domain/money";
import { ownerLabel } from "../domain/ownership";
import { BudgetItem, HOUSEHOLD_OWNER, IncomeSource } from "../domain/types";
import { useBudgyStore } from "../store/BudgyStore";
import { BudgetItemForm } from "../components/Forms";
import { ConfirmationDialog, Dialog } from "../components/Dialog";
import { FinancialMetric, MoneyInput, MonthPicker, OwnerSelector, ProgressBar } from "../components/Controls";
import { createId } from "../domain/id";
import { budgetItemActual } from "../domain/accounts";
import { Link } from "react-router-dom";


const Budget: React.FC = () => {
  const { data, month, plan, setMonth, updateMonth, updateData } = useBudgyStore();
  const [itemDialog, setItemDialog] = useState<BudgetItem | "new" | null>(null);
  const [incomeDialog, setIncomeDialog] = useState<IncomeSource | "new" | null>(null);
  const [incomeDraft, setIncomeDraft] = useState<IncomeSource | null>(null);
  const [deleteItem, setDeleteItem] = useState<BudgetItem | null>(null);
  const [deleted, setDeleted] = useState<BudgetItem | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const summary = useMemo(() => calculateHouseholdSummary(plan), [plan]);
  const groups = useMemo(() => groupBudgetItems(plan), [plan]);
  const actuals = useMemo(() => calculateBudgetActuals(plan, data.transactions, month), [plan, data.transactions, month]);
  const allocated = summary.income === 0 ? 0 : summary.allocated / summary.income;

  const saveItem = (item: BudgetItem) => {
    updateMonth((current) => ({ ...current, budget: current.budget.some((entry) => entry.id === item.id) ? current.budget.map((entry) => entry.id === item.id ? item : entry) : [...current.budget, item] }));
    setItemDialog(null);
  };
  const openIncome = (source: IncomeSource | "new") => {
    const draft = source === "new" ? { id: createId(), name: "", owner: HOUSEHOLD_OWNER, amount: 0, recurring: true } : { ...source };
    setIncomeDraft(draft); setIncomeDialog(source);
  };
  const saveIncome = (event: React.FormEvent) => {
    event.preventDefault();
    if (!incomeDraft?.name.trim()) return;
    updateMonth((current) => ({ ...current, income: current.income.some((entry) => entry.id === incomeDraft.id) ? current.income.map((entry) => entry.id === incomeDraft.id ? incomeDraft : entry) : [...current.income, incomeDraft] }));
    setIncomeDialog(null);
  };
  const copyLastMonth = () => {
    const previous = Object.keys(data.months).filter((key) => key < month).sort().reverse()[0];
    if (!previous) return;
    updateMonth((current) => ({ ...current, income: data.months[previous].income.map((item) => ({ ...item })), budget: data.months[previous].budget.map((item) => ({ ...item })), savings: data.months[previous].savings }));
  };

  return <div className="budgy-product-page budgy-budget-page">
    <header className="budgy-product-header"><div><p className="budgy-eyebrow">Monthly planning</p><h1>Budget</h1><p>Give every pound a purpose.</p></div><div className="budgy-header-actions"><button className="budgy-button budgy-button--quiet" type="button" onClick={copyLastMonth}>Copy last month</button><MonthPicker month={month} onChange={setMonth} /></div></header>

    <section className="budgy-financial-strip" aria-label="Budget summary">
      <FinancialMetric label="Household income" value={summary.income} />
      <FinancialMetric label="Planned spending" value={summary.spending} />
      <FinancialMetric label="Savings" value={summary.savings} />
      <FinancialMetric label="Left to allocate" value={summary.remaining} detail={`${(allocated * 100).toFixed(1)}% allocated`} />
    </section>

    <section className="budgy-product-panel">
      <div className="budgy-product-panel-heading"><div><p className="budgy-eyebrow">Money in</p><h2>Income sources</h2></div><button className="budgy-button budgy-button--small" type="button" onClick={() => openIncome("new")}>+ Add income</button></div>
      <div className="budgy-income-list">{plan.income.map((source) => <button type="button" key={source.id} onClick={() => openIncome(source)}><span><b>{source.name}</b><small>{ownerLabel(source.owner,data.members)} · {source.recurring ? "Recurring" : "One-off"}</small></span><strong>{formatMoney(source.amount)}</strong></button>)}</div>
    </section>

    <div className="budgy-budget-toolbar"><div><p className="budgy-eyebrow">Money out</p><h2>Monthly plan</h2></div><div><button className="budgy-button budgy-button--quiet" type="button" onClick={() => setCategoryDialog(true)}>+ Category</button><button className="budgy-button budgy-button--primary" type="button" onClick={() => setItemDialog("new")}>+ Budget item</button></div></div>

    <div className="budgy-budget-groups">{groups.map((group) => {
      const actual = actuals.find((entry) => entry.group === group.group);
      return <section className="budgy-budget-group" key={group.group}>
        <header><div><span className="budgy-category-symbol">{group.group[0]}</span><div><h3>{group.group}</h3><p>{actual?.spent ? `${formatMoney(actual.spent)} spent of ${formatMoney(group.amount)}` : `${plan.budget.filter((item) => item.group === group.group).length} planned items`}</p></div></div><strong>{formatMoney(group.amount)}</strong></header>
        {actual && actual.spent > 0 && <ProgressBar value={actual.planned ? actual.spent / actual.planned : 1} tone={actual.remaining < 0 ? "warning" : "default"} />}
        <div className="budgy-budget-rows">{plan.budget.filter((item) => item.group === group.group).map((item) => <div className="budgy-budget-row" key={item.id}>
          <button className="budgy-row-main" type="button" onClick={() => setItemDialog(item)}><span><b>{item.name}</b><small>{ownerLabel(item.owner,data.members)} · {item.recurring ? "Recurring" : "One-off"}</small>{item.trackActuals!==false&&(()=>{const actual=budgetItemActual(item,data.transactions,month);return <small>{formatMoney(actual.spent)} spent · {formatMoney(actual.remaining)} remaining</small>;})()}</span></button>
          <MoneyInput value={item.amount} onChange={(amount) => updateMonth((current) => ({ ...current, budget: current.budget.map((entry) => entry.id === item.id ? { ...entry, amount } : entry) }))} />
          {item.trackActuals!==false&&<Link className="budgy-icon-button" aria-label={`View transactions for ${item.name}`} to={`/budgy/transactions?budget=${item.id}`}>→</Link>}<button className="budgy-icon-button" type="button" aria-label={`Delete ${item.name}`} onClick={() => setDeleteItem(item)}>×</button>
        </div>)}</div>
      </section>;
    })}</div>

    <div className="budgy-sticky-summary"><span>Income <b>{formatMoney(summary.income)}</b></span><span>Budgeted <b>{formatMoney(summary.spending)}</b></span><span>Savings <b>{formatMoney(summary.savings)}</b></span><span className={summary.remaining < 0 ? "is-negative" : ""}>Left <b>{formatMoney(summary.remaining)}</b></span></div>
    {deleted && <div className="budgy-toast" role="status"><span>{deleted.name} deleted</span><button type="button" onClick={() => { updateMonth((current) => ({ ...current, budget: [...current.budget, deleted] })); setDeleted(null); }}>Undo</button></div>}

    <Dialog open={itemDialog !== null} title={itemDialog === "new" ? "Add budget item" : "Edit budget item"} onClose={() => setItemDialog(null)}>{itemDialog && <BudgetItemForm item={itemDialog === "new" ? undefined : itemDialog} categories={data.categories} onSave={saveItem} onCancel={() => setItemDialog(null)} />}</Dialog>
    <Dialog open={incomeDialog !== null} title={incomeDialog === "new" ? "Add income source" : "Edit income source"} onClose={() => setIncomeDialog(null)}>{incomeDraft && <form className="budgy-form" onSubmit={saveIncome}><label className="budgy-field"><span>Name</span><input autoFocus required value={incomeDraft.name} onChange={(event) => setIncomeDraft({ ...incomeDraft, name: event.target.value })} /></label><div className="budgy-form-grid"><MoneyInput label="Monthly amount" value={incomeDraft.amount} onChange={(amount) => setIncomeDraft({ ...incomeDraft, amount })} /><OwnerSelector value={incomeDraft.owner} onChange={(owner) => setIncomeDraft({ ...incomeDraft, owner })} /></div><label className="budgy-check"><input type="checkbox" checked={incomeDraft.recurring} onChange={(event) => setIncomeDraft({ ...incomeDraft, recurring: event.target.checked })} />Repeat in new months</label><div className="budgy-dialog-actions">{incomeDialog !== "new" && <button className="budgy-button budgy-button--danger-quiet" type="button" onClick={() => { updateMonth((current) => ({ ...current, income: current.income.filter((entry) => entry.id !== incomeDraft.id) })); setIncomeDialog(null); }}>Delete</button>}<button className="budgy-button budgy-button--primary" type="submit">Save income</button></div></form>}</Dialog>
    <Dialog open={categoryDialog} title="Add custom category" onClose={() => setCategoryDialog(false)}><form className="budgy-form" onSubmit={(event) => { event.preventDefault(); const category = newCategory.trim(); if (category && !data.categories.includes(category)) updateData((current) => ({ ...current, categories: [...current.categories, category] })); setNewCategory(""); setCategoryDialog(false); }}><label className="budgy-field"><span>Category name</span><input autoFocus required value={newCategory} onChange={(event) => setNewCategory(event.target.value)} /></label><div className="budgy-dialog-actions"><button className="budgy-button budgy-button--primary" type="submit">Add category</button></div></form></Dialog>
    <ConfirmationDialog open={!!deleteItem} title="Delete budget item?" description={`${deleteItem?.name ?? "This item"} will be removed from ${month}.`} confirmLabel="Delete item" strong onCancel={() => setDeleteItem(null)} onConfirm={() => { if (deleteItem) { updateMonth((current) => ({ ...current, budget: current.budget.filter((entry) => entry.id !== deleteItem.id) })); setDeleted(deleteItem); } setDeleteItem(null); }} />
  </div>;
};

export default Budget;
