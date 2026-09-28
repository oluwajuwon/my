import React, { useMemo, useState } from "react";
import { calculateProjection } from "../domain/budget";
import { formatCompactMoney, formatMoney } from "../domain/money";
import { useBudgyStore } from "../store/BudgyStore";

const horizons = [{ label: "6 months", value: 6 }, { label: "1 year", value: 12 }, { label: "2 years", value: 24 }, { label: "5 years", value: 60 }, { label: "10 years", value: 120 }];

const Projections: React.FC = () => {
  const { data, plan } = useBudgyStore();
  const [months, setMonths] = useState(60);
  const [growthEnabled, setGrowthEnabled] = useState(false);
  const [growthRate, setGrowthRate] = useState(4);
  const goalContributions = data.goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);
  const monthlySavings = plan.savings + goalContributions;
  const projection = useMemo(() => calculateProjection({ ...plan, savings: monthlySavings }, months, growthEnabled ? growthRate : 0), [plan, monthlySavings, months, growthEnabled, growthRate]);
  const last = projection.points[projection.points.length - 1];
  const points = projection.points.map((point, index) => `${(index / months) * 600},${145 - (point.balance / Math.max(last.balance, 1)) * 125}`).join(" ");

  return <div className="budgy-product-page">
    <header className="budgy-product-header"><div><p className="budgy-eyebrow">Financial forecast</p><h1>Projections</h1><p>See where consistent household decisions can take you.</p></div></header>
    <div className="budgy-horizon-tabs" role="group" aria-label="Projection horizon">{horizons.map((option) => <button type="button" key={option.value} className={months === option.value ? "is-active" : ""} onClick={() => setMonths(option.value)}>{option.label}</button>)}</div>
    <section className="budgy-projection-hero">
      <div><p className="budgy-eyebrow">Projected cumulative savings</p><strong>{formatMoney(last.balance)}</strong><span>after {horizons.find((option) => option.value === months)?.label}</span></div>
      <svg viewBox="0 0 600 160" preserveAspectRatio="none" role="img" aria-label={`Savings projection reaching ${formatMoney(last.balance)}`}><defs><linearGradient id="budgy-projection-fill-v2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9dc84" stopOpacity=".45" /><stop offset="100%" stopColor="#c9dc84" stopOpacity="0" /></linearGradient></defs><polygon points={`0,150 ${points} 600,150`} fill="url(#budgy-projection-fill-v2)" /><polyline points={points} fill="none" stroke="#c9dc84" strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg>
    </section>
    <section className="budgy-projection-metrics"><div><span>Projected income</span><strong>{formatCompactMoney(projection.income)}</strong></div><div><span>Projected spending</span><strong>{formatCompactMoney(projection.spending)}</strong></div><div><span>Planned contributions</span><strong>{formatCompactMoney(last.contributions)}</strong></div><div><span>Projected surplus</span><strong>{formatCompactMoney(projection.surplus)}</strong></div><div><span>Savings rate</span><strong>{(projection.savingsRate * 100).toFixed(1)}%</strong></div>{growthEnabled && <div><span>Estimated growth</span><strong>{formatCompactMoney(last.growth)}</strong></div>}</section>
    <div className="budgy-projection-grid"><section className="budgy-product-panel"><div className="budgy-product-panel-heading"><div><p className="budgy-eyebrow">Monthly engine</p><h2>What drives this forecast</h2></div></div><dl className="budgy-definition-list"><div><dt>Household savings</dt><dd>{formatMoney(plan.savings)}</dd></div><div><dt>Goal contributions</dt><dd>{formatMoney(goalContributions)}</dd></div><div><dt>Unallocated buffer</dt><dd>{formatMoney(calculateProjection(plan, 1).surplus)}</dd></div></dl></section><section className="budgy-product-panel"><div className="budgy-product-panel-heading"><div><p className="budgy-eyebrow">Advanced assumption</p><h2>Estimated growth</h2></div><label className="budgy-switch"><input type="checkbox" checked={growthEnabled} onChange={(event) => setGrowthEnabled(event.target.checked)} /><span /></label></div>{growthEnabled && <label className="budgy-field"><span>Annual growth rate %</span><input type="number" min="0" max="30" step="0.1" value={growthRate} onChange={(event) => setGrowthRate(Number(event.target.value))} /></label>}<p className="budgy-disclaimer">Based on your current plan. Investment growth is {growthEnabled ? `estimated at ${growthRate}% and is not guaranteed` : "not included"}.</p></section></div>
  </div>;
};

export default Projections;
