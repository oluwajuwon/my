import React, { useMemo, useState } from "react";
import { calculateHouseholdSummary, calculateScenarioSummary } from "../domain/budget";
import { formatMoney } from "../domain/money";
import { Scenario } from "../domain/types";
import { useBudgyStore } from "../store/BudgyStore";
import { ConfirmationDialog } from "../components/Dialog";
import { EmptyState, MoneyInput } from "../components/Controls";
import { createId } from "../domain/id";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const makeId = createId;

const Scenarios: React.FC = () => {
  const { data, month, plan, updateData, updateMonth } = useBudgyStore();
  const [selectedId, setSelectedId] = useState(data.scenarios[0]?.id ?? "");
  const [confirmApply, setConfirmApply] = useState(false);
  const scenario = data.scenarios.find((entry) => entry.id === selectedId);
  const current = useMemo(() => calculateHouseholdSummary(plan), [plan]);
  const compared = scenario ? calculateScenarioSummary(scenario) : null;
  const updateScenario = (updater: (value: Scenario) => Scenario) => updateData((currentData) => ({ ...currentData, scenarios: currentData.scenarios.map((entry) => entry.id === selectedId ? updater(entry) : entry) }));
  const create = () => {
    const next: Scenario = { id: createId(), name: "New scenario", baseMonth: month, plan: clone(plan), oneOffExpenses: 0, createdAt: new Date().toISOString() };
    updateData((currentData) => ({ ...currentData, scenarios: [...currentData.scenarios, next] })); setSelectedId(next.id);
  };
  const difference = (value: number, base: number) => <small className={value - base >= 0 ? "is-positive" : "is-negative"}>{value - base >= 0 ? "+" : ""}{formatMoney(value - base)}</small>;

  return <div className="budgy-product-page">
    <header className="budgy-product-header"><div><p className="budgy-eyebrow">Safe-to-try planning</p><h1>Scenario Lab</h1><p>Explore a different future without changing the real budget.</p></div><button className="budgy-button budgy-button--primary" type="button" onClick={create}>+ Create scenario</button></header>
    {!scenario ? <EmptyState title="Ask “what if?” without risk" description="Model a move, parental leave, salary change or ambitious savings target. Your current budget remains untouched." action={<button className="budgy-button budgy-button--primary" type="button" onClick={create}>Create a scenario</button>} /> : <>
      <div className="budgy-scenario-toolbar"><select aria-label="Choose scenario" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{data.scenarios.map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}</select><div><button className="budgy-button budgy-button--quiet" type="button" onClick={() => { const duplicate = { ...clone(scenario), id: makeId(), name: `${scenario.name} copy` }; updateData((value) => ({ ...value, scenarios: [...value.scenarios, duplicate] })); setSelectedId(duplicate.id); }}>Duplicate</button><button className="budgy-button budgy-button--quiet" type="button" onClick={() => updateScenario((value) => ({ ...value, plan: clone(plan), oneOffExpenses: 0, baseMonth: month }))}>Reset</button><button className="budgy-button budgy-button--danger-quiet" type="button" onClick={() => { updateData((value) => ({ ...value, scenarios: value.scenarios.filter((entry) => entry.id !== scenario.id) })); setSelectedId(data.scenarios.find((entry) => entry.id !== scenario.id)?.id ?? ""); }}>Delete</button><button className="budgy-button budgy-button--primary" type="button" onClick={() => setConfirmApply(true)}>Apply to budget</button></div></div>
      <section className="budgy-scenario-name"><label><span>Scenario name</span><input value={scenario.name} onChange={(event) => updateScenario((value) => ({ ...value, name: event.target.value }))} /></label></section>
      <section className="budgy-comparison"><div className="budgy-comparison-head"><span>Measure</span><b>Current plan</b><b>{scenario.name}</b></div>{[
        ["Monthly income", current.income, compared!.income], ["Monthly spending", current.spending, compared!.spending], ["Monthly savings", current.savings, compared!.savings], ["Remaining buffer", current.remaining, compared!.remaining],
      ].map(([label, base, value]) => <div key={label as string}><span>{label}</span><strong>{formatMoney(base as number)}</strong><strong>{formatMoney(value as number)} {difference(value as number, base as number)}</strong></div>)}<div><span>Savings rate</span><strong>{(current.savingsRate * 100).toFixed(1)}%</strong><strong>{(compared!.savingsRate * 100).toFixed(1)}%</strong></div><div><span>12-month savings</span><strong>{formatMoney(current.savings * 12)}</strong><strong>{formatMoney(compared!.savings * 12 - scenario.oneOffExpenses)} {difference(compared!.savings * 12 - scenario.oneOffExpenses, current.savings * 12)}</strong></div><div><span>5-year savings</span><strong>{formatMoney(current.savings * 60)}</strong><strong>{formatMoney(compared!.savings * 60 - scenario.oneOffExpenses)} {difference(compared!.savings * 60 - scenario.oneOffExpenses, current.savings * 60)}</strong></div></section>
      <div className="budgy-scenario-editor"><section className="budgy-product-panel"><div className="budgy-product-panel-heading"><div><p className="budgy-eyebrow">Scenario inputs</p><h2>Income and savings</h2></div></div>{scenario.plan.income.map((income) => <div className="budgy-scenario-input" key={income.id}><span>{income.name}</span><MoneyInput value={income.amount} onChange={(amount) => updateScenario((value) => ({ ...value, plan: { ...value.plan, income: value.plan.income.map((entry) => entry.id === income.id ? { ...entry, amount } : entry) } }))} /></div>)}<div className="budgy-scenario-input"><span>Monthly savings</span><MoneyInput value={scenario.plan.savings} onChange={(savings) => updateScenario((value) => ({ ...value, plan: { ...value.plan, savings } }))} /></div><div className="budgy-scenario-input"><span>One-off expense</span><MoneyInput value={scenario.oneOffExpenses} onChange={(oneOffExpenses) => updateScenario((value) => ({ ...value, oneOffExpenses }))} /></div></section><section className="budgy-product-panel"><div className="budgy-product-panel-heading"><div><p className="budgy-eyebrow">Temporary overrides</p><h2>Budget items</h2></div><button className="budgy-button budgy-button--small" type="button" onClick={() => updateScenario((value) => ({ ...value, plan: { ...value.plan, budget: [...value.plan.budget, { id: makeId(), name: "New recurring expense", group: "Scenario", owner: "Household", amount: 0, recurring: true }] } }))}>+ Expense</button></div><div className="budgy-scenario-budget">{scenario.plan.budget.map((item) => <div className="budgy-scenario-input" key={item.id}><span><input aria-label="Expense name" value={item.name} onChange={(event) => updateScenario((value) => ({ ...value, plan: { ...value.plan, budget: value.plan.budget.map((entry) => entry.id === item.id ? { ...entry, name: event.target.value } : entry) } }))} /><small>{item.group}</small></span><MoneyInput value={item.amount} onChange={(amount) => updateScenario((value) => ({ ...value, plan: { ...value.plan, budget: value.plan.budget.map((entry) => entry.id === item.id ? { ...entry, amount } : entry) } }))} /></div>)}</div></section></div>
    </>}
    <ConfirmationDialog open={confirmApply} title="Apply scenario to the real budget?" description="This will replace the current month's income, budget items and savings with the selected scenario." confirmLabel="Apply scenario" onCancel={() => setConfirmApply(false)} onConfirm={() => { if (scenario) updateMonth(() => ({ ...clone(scenario.plan), month })); setConfirmApply(false); }} />
  </div>;
};

export default Scenarios;
