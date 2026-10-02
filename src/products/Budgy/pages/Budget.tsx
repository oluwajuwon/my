import React, { useEffect, useMemo, useState } from "react";
import { calculateBudgetActuals, calculateHouseholdSummary, groupBudgetItems } from "../domain/budget";
import { formatMoney } from "../domain/money";
import { ownerLabel } from "../domain/ownership";
import { BudgetItem, HOUSEHOLD_OWNER, IncomeSource } from "../domain/types";
import { useBudgyStore } from "../store/BudgyStore";
import { BudgetItemForm } from "../components/Forms";
import { ConfirmationDialog, Dialog } from "../components/Dialog";
import { EmptyState, FinancialMetric, MoneyInput, MonthPicker, OwnerSelector, ProgressBar } from "../components/Controls";
import { createId } from "../domain/id";
import { budgetItemActual } from "../domain/accounts";
import { Link, useSearchParams } from "react-router-dom";
import { allocationPurpose, calculateAllocationProgress, calculateReallocationPreview, validateReallocation } from "../domain/allocations";


const Budget: React.FC = () => {
  const { data, month, plan, setMonth, updateMonth, updateData,reallocate } = useBudgyStore();
  const [searchParams,setSearchParams]=useSearchParams();
  const [itemDialog, setItemDialog] = useState<BudgetItem | "new" | null>(null);
  const [incomeDialog, setIncomeDialog] = useState<IncomeSource | "new" | null>(null);
  const [incomeDraft, setIncomeDraft] = useState<IncomeSource | null>(null);
  const [deleteItem, setDeleteItem] = useState<BudgetItem | null>(null);
  const [deleted, setDeleted] = useState<BudgetItem | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [moveOpen,setMoveOpen]=useState(false);const[moveFrom,setMoveFrom]=useState("");const[moveTo,setMoveTo]=useState("");const[moveAmount,setMoveAmount]=useState(0);const[confirmOver,setConfirmOver]=useState(false);const[moveError,setMoveError]=useState("");
  const summary = useMemo(() => calculateHouseholdSummary(plan), [plan]);
  const groups = useMemo(() => groupBudgetItems(plan), [plan]);
  const actuals = useMemo(() => calculateBudgetActuals(plan, data.transactions, month), [plan, data.transactions, month]);
  const allocated = summary.income === 0 ? 0 : summary.allocated / summary.income;
  const goalSavings=data.goals.reduce((total,goal)=>total+goal.monthlyContribution,0);
  const unassignedSavings=plan.savings-goalSavings;
  const debtItems=plan.budget.filter((item)=>allocationPurpose(item)==="debt_payment");
  const preview=useMemo(()=>{try{return moveTo&&moveAmount>0?calculateReallocationPreview(plan,data.transactions,month,moveFrom||undefined,moveTo,moveAmount):null;}catch{return null;}},[data.transactions,month,moveAmount,moveFrom,moveTo,plan]);

  useEffect(()=>{
    if(searchParams.get("add")!=="budget-item")return;
    setItemDialog("new");
    const next=new URLSearchParams(searchParams);
    next.delete("add");
    setSearchParams(next,{replace:true});
  },[searchParams,setSearchParams]);

  const saveItem = (item: BudgetItem) => {
    updateMonth((current) => ({ ...current, budget: current.budget.some((entry) => entry.id === item.id) ? current.budget.map((entry) => entry.id === item.id ? item : entry) : [...current.budget, item] }));
    setItemDialog(null);
  };
  const openIncome = (source: IncomeSource | "new") => {
    const draft = source === "new" ? { id: createId(), name: "", owner: HOUSEHOLD_OWNER, amount: 0, recurring: true,category:data.incomeCategories[0],preferredAccountId:undefined } : { ...source,category:source.category??data.incomeCategories[0] };
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
    updateMonth((current) => ({ ...current, income: data.months[previous].income.map((item) => ({ ...item,id:createId() })), budget: data.months[previous].budget.map((item) => ({ ...item,id:createId() })), savings: data.months[previous].savings }));
  };

  return <div className="budgy-product-page budgy-budget-page">
    <header className="budgy-product-header"><div><p className="budgy-eyebrow">Monthly planning</p><h1>Budget</h1><p>Give every pound a purpose.</p></div><div className="budgy-header-actions"><button className="budgy-button budgy-button--quiet" type="button" onClick={copyLastMonth}>Copy last month</button><MonthPicker month={month} onChange={setMonth} /></div></header>

    <section className="budgy-financial-strip" aria-label="Budget summary">
      <FinancialMetric label="Household income" value={summary.income} />
      <FinancialMetric label="Planned spending" value={summary.spending} />
      <FinancialMetric label="Debt payments" value={summary.debtPayments} detail="Planned repayments · not new spending" />
      <FinancialMetric label="Planned savings" value={summary.savings} detail="Target only · record transfers to track actual savings" />
      <FinancialMetric label="Left to allocate" value={summary.remaining} detail={`${(allocated * 100).toFixed(1)}% allocated`} />
    </section>

    <section className="budgy-product-panel budgy-savings-plan">
      <div className="budgy-product-panel-heading"><div><p className="budgy-eyebrow">Money for later</p><h2>Savings plan</h2></div><Link className="budgy-text-link" to="/budgy/goals">Manage goals <span aria-hidden="true">→</span></Link></div>
      <div className="budgy-savings-plan-layout"><div><MoneyInput label="Monthly savings target" value={plan.savings} onChange={(savings)=>updateMonth((current)=>({...current,savings}))}/><p>This is your plan. Actual savings are recorded when money is transferred into a savings account or goal.</p></div><div className="budgy-savings-allocations"><span>Planned destination</span>{data.goals.filter((goal)=>goal.monthlyContribution>0).map((goal)=>{const account=data.accounts.find((entry)=>entry.id===goal.fundingAccountId);return <div key={goal.id}><span><b>{goal.name}</b><small>{account?.name??"Savings account not connected"}</small></span><strong>{formatMoney(goal.monthlyContribution)}</strong></div>;})}<div className={unassignedSavings<0?"is-negative":""}><span><b>{unassignedSavings<0?"Over-allocated":"Unassigned savings"}</b><small>{unassignedSavings<0?"Goal plans exceed the monthly target":"Available for another goal or general saving"}</small></span><strong>{formatMoney(Math.abs(unassignedSavings))}</strong></div></div></div>
    </section>

    <section className="budgy-product-panel">
      <div className="budgy-product-panel-heading"><div><p className="budgy-eyebrow">Money in</p><h2>Income sources</h2></div><button className="budgy-button budgy-button--small" type="button" onClick={() => openIncome("new")}>+ Add income</button></div>
      <div className="budgy-income-list">{plan.income.map((source) => <button type="button" key={source.id} onClick={() => openIncome(source)}><span><b>{source.name}</b><small>{ownerLabel(source.owner,data.members)} · {source.recurring ? "Recurring" : "One-off"}</small></span><strong>{formatMoney(source.amount)}</strong></button>)}</div>
    </section>

    <div className="budgy-budget-toolbar"><div><p className="budgy-eyebrow">Money out</p><h2>Monthly purposes</h2></div><div><button className="budgy-button budgy-button--quiet" type="button" disabled={!plan.budget.length} title={!plan.budget.length?"Add a budget item before moving money":undefined} onClick={()=>{setMoveFrom("");setMoveTo(plan.budget[0]?.id??"");setMoveAmount(0);setMoveOpen(true);}}>Move money</button><button className="budgy-button budgy-button--quiet" type="button" onClick={() => setCategoryDialog(true)}>+ Category</button><button className="budgy-button budgy-button--primary" type="button" onClick={() => setItemDialog("new")}>+ Budget item</button></div></div>

    {!plan.budget.length&&<EmptyState title="Create your first budget item" description="Plan where your household income should go each month." action={<button className="budgy-button budgy-button--primary" type="button" onClick={()=>setItemDialog("new")}>Create your first budget item</button>}/>}<div className="budgy-budget-groups">{groups.map((group) => {
      const actual = actuals.find((entry) => entry.group === group.group);
      return <section className="budgy-budget-group" key={group.group}>
        <header><div><span className="budgy-category-symbol">{group.group[0]}</span><div><h3>{group.group}</h3><p>{actual?.spent ? `${formatMoney(actual.spent)} spent of ${formatMoney(group.amount)}` : `${plan.budget.filter((item) => item.group === group.group).length} planned items`}</p></div></div><strong>{formatMoney(group.amount)}</strong></header>
        {actual && actual.spent > 0 && <ProgressBar value={actual.planned ? actual.spent / actual.planned : 1} tone={actual.remaining < 0 ? "warning" : "default"} />}
        <div className="budgy-budget-rows">{plan.budget.filter((item) => item.group === group.group).map((item) => <div className="budgy-budget-row" key={item.id}>
          <button className="budgy-row-main" type="button" onClick={() => setItemDialog(item)}><span><b>{item.name}</b><small>{ownerLabel(item.owner,data.members)} · {item.recurring ? "Recurring" : "One-off"}</small>{item.trackActuals!==false&&(()=>{const actual=budgetItemActual(item,data.transactions,month);return <small>{formatMoney(actual.spent)} spent · {formatMoney(actual.remaining)} remaining</small>;})()}</span></button>
          <MoneyInput value={item.amount} onChange={(amount) => updateMonth((current) => ({ ...current, budget: current.budget.map((entry) => entry.id === item.id ? { ...entry, amount } : entry) }))} />
          {item.trackActuals!==false&&<Link className="budgy-icon-button" aria-label={`View transactions for ${item.name}`} to={`/budgy/transactions?budget=${item.id}&budgetMonth=${month}`}>→</Link>}<button className="budgy-icon-button" type="button" aria-label={`Remove ${item.name} budget item`} onClick={() => setDeleteItem(item)}>×</button>
        </div>)}</div>
      </section>;
    })}</div>

    {!!debtItems.length&&<section className="budgy-budget-group budgy-debt-plan"><header><div><span className="budgy-category-symbol">D</span><div><h3>Debt payments</h3><p>Planned repayments reduce debt without counting as new spending.</p></div></div><strong>{formatMoney(summary.debtPayments)}</strong></header><div className="budgy-budget-rows">{debtItems.map((item)=>{const progress=calculateAllocationProgress(item,data.transactions,month);const card=data.accounts.find((account)=>account.id===item.linkedAccountId);return <div className="budgy-budget-row" key={item.id}><button className="budgy-row-main" type="button" onClick={()=>setItemDialog(item)}><span><b>{item.name}</b><small>{card?.name??"Credit card"} · {item.recurring?"Recurring":"One-off"}</small><small>{formatMoney(progress.actual)} paid · {progress.remaining<0?`${formatMoney(Math.abs(progress.remaining))} above plan`:`${formatMoney(progress.remaining)} remaining`}</small></span></button><MoneyInput value={item.amount} onChange={(amount)=>updateMonth((current)=>({...current,budget:current.budget.map((entry)=>entry.id===item.id?{...entry,amount}:entry)}))}/><Link className="budgy-icon-button" aria-label={`View payments for ${item.name}`} to={`/budgy/transactions?budget=${item.id}&budgetMonth=${month}`}>→</Link><button className="budgy-icon-button" type="button" aria-label={`Remove ${item.name}`} onClick={()=>setDeleteItem(item)}>×</button></div>;})}</div></section>}

    <div className="budgy-sticky-summary"><span>Income <b>{formatMoney(summary.income)}</b></span><span>Spending <b>{formatMoney(summary.spending)}</b></span><span>Debt payments <b>{formatMoney(summary.debtPayments)}</b></span><span className={summary.remaining < 0 ? "is-negative" : ""}>Left <b>{formatMoney(summary.remaining)}</b></span></div>
    {deleted && <div className="budgy-toast" role="status"><span>{deleted.name} deleted</span><button type="button" onClick={() => { updateMonth((current) => ({ ...current, budget: [...current.budget, deleted] })); setDeleted(null); }}>Undo</button></div>}

    <Dialog open={itemDialog !== null} title={itemDialog === "new" ? "Add money purpose" : "Edit money purpose"} onClose={() => setItemDialog(null)}>{itemDialog && <BudgetItemForm item={itemDialog === "new" ? undefined : itemDialog} categories={data.categories} accounts={data.accounts} transactions={data.transactions} onSave={saveItem} onCancel={() => setItemDialog(null)} />}</Dialog>
    <Dialog open={moveOpen} title="Move planned money" description="This edits the plan only. It does not create a transaction or change an account balance." onClose={()=>setMoveOpen(false)}>
      <form className="budgy-form" onSubmit={async(event)=>{event.preventDefault();setMoveError("");try{const next=calculateReallocationPreview(plan,data.transactions,month,moveFrom||undefined,moveTo,moveAmount);const validation=validateReallocation(next,confirmOver);if(!validation.valid){setMoveError(validation.message);return;}await reallocate(moveTo,moveAmount,moveFrom||undefined,confirmOver);setMoveOpen(false);}catch(error){setMoveError(error instanceof Error?error.message:"Budgy could not move that money.");}}}>
        <div className="budgy-form-grid"><label className="budgy-field"><span>From</span><select value={moveFrom} onChange={(event)=>{setMoveFrom(event.target.value);setConfirmOver(false);}}><option value="">Unallocated · {formatMoney(summary.remaining)}</option>{plan.budget.filter((item)=>item.id!==moveTo).map((item)=><option key={item.id} value={item.id}>{item.name} · {formatMoney(item.amount)}</option>)}</select></label><label className="budgy-field"><span>To</span><select required value={moveTo} onChange={(event)=>setMoveTo(event.target.value)}><option value="">Choose purpose</option>{plan.budget.filter((item)=>item.id!==moveFrom).map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><MoneyInput label="Amount to move" value={moveAmount} onChange={setMoveAmount} required/></div>
        {preview&&<div className="budgy-reallocation-preview"><p><span>{preview.from?.name??"Unallocated"}</span><b>{formatMoney(preview.fromBefore)} → {formatMoney(preview.fromAfter??preview.fromBefore-preview.amount)}</b></p><p><span>{preview.to.name}</span><b>{formatMoney(preview.toBefore)} → {formatMoney(preview.toAfter)}</b></p></div>}
        {preview?.wouldPutSourceOverPlan&&<label className="budgy-check budgy-warning-check"><input type="checkbox" checked={confirmOver} onChange={(event)=>setConfirmOver(event.target.checked)}/><span>{preview.from?.name} would become {formatMoney(preview.fromActual-(preview.fromAfter??0))} over plan. I understand recorded spending will not change.</span></label>}
        {moveError&&<p className="budgy-auth-message" role="alert">{moveError}</p>}<div className="budgy-dialog-actions"><button type="button" className="budgy-button budgy-button--quiet" onClick={()=>setMoveOpen(false)}>Cancel</button><button className="budgy-button budgy-button--primary" type="submit">Confirm move</button></div>
      </form>
    </Dialog>
    <Dialog open={incomeDialog !== null} title={incomeDialog === "new" ? "Add income source" : "Edit income source"} onClose={() => setIncomeDialog(null)}>{incomeDraft && <form className="budgy-form" onSubmit={saveIncome}><label className="budgy-field"><span>Source name</span><input autoFocus required value={incomeDraft.name} onChange={(event) => setIncomeDraft({ ...incomeDraft, name:event.target.value })} placeholder="Employer or client" /></label><div className="budgy-form-grid"><MoneyInput label="Planned monthly amount" value={incomeDraft.amount} onChange={(amount) => setIncomeDraft({ ...incomeDraft, amount })} /><label className="budgy-field"><span>Income type</span><select required value={incomeDraft.category??data.incomeCategories[0]??""} onChange={(event)=>setIncomeDraft({...incomeDraft,category:event.target.value})}>{data.incomeCategories.map((entry)=><option key={entry}>{entry}</option>)}</select></label><OwnerSelector value={incomeDraft.owner} onChange={(owner) => setIncomeDraft({ ...incomeDraft, owner })} /><label className="budgy-field"><span>Usually paid into</span><select value={incomeDraft.preferredAccountId??""} onChange={(event)=>setIncomeDraft({...incomeDraft,preferredAccountId:event.target.value||undefined})}><option value="">No preferred account</option>{data.accounts.filter((account)=>account.isActive&&account.type!=="credit_card").map((account)=><option key={account.id} value={account.id}>{account.name}</option>)}</select></label></div><label className="budgy-check"><input type="checkbox" checked={incomeDraft.recurring} onChange={(event) => setIncomeDraft({ ...incomeDraft, recurring: event.target.checked })} />Repeat in new months</label><div className="budgy-dialog-actions">{incomeDialog !== "new" && <button className="budgy-button budgy-button--danger-quiet" type="button" onClick={() => { updateMonth((current) => ({ ...current, income: current.income.filter((entry) => entry.id !== incomeDraft.id) })); setIncomeDialog(null); }}>Delete</button>}<button className="budgy-button budgy-button--primary" type="submit">Save income</button></div></form>}</Dialog>
    <Dialog open={categoryDialog} title="Add custom category" onClose={() => setCategoryDialog(false)}><form className="budgy-form" onSubmit={(event) => { event.preventDefault(); const category = newCategory.trim(); if (category && !data.categories.includes(category)) updateData((current) => ({ ...current, categories: [...current.categories, category] })); setNewCategory(""); setCategoryDialog(false); }}><label className="budgy-field"><span>Category name</span><input autoFocus required value={newCategory} onChange={(event) => setNewCategory(event.target.value)} /></label><div className="budgy-dialog-actions"><button className="budgy-button budgy-button--primary" type="submit">Add category</button></div></form></Dialog>
    <ConfirmationDialog open={!!deleteItem} title="Delete budget item?" description={`${deleteItem?.name ?? "This item"} will be removed from ${month}.`} confirmLabel="Delete item" strong onCancel={() => setDeleteItem(null)} onConfirm={() => { if (deleteItem) { updateMonth((current) => ({ ...current, budget: current.budget.filter((entry) => entry.id !== deleteItem.id) })); setDeleted(deleteItem); } setDeleteItem(null); }} />
  </div>;
};

export default Budget;
