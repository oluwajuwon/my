import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import SpendingDonut from "../components/SpendingDonut";
import Icon from "../components/Icon";
import {
  calculateHouseholdSummary,
  calculateBudgetActuals,
  groupBudgetItems,
  projectSavings,
} from "../domain/budget";
import { formatCompactMoney, formatMoney } from "../domain/money";
import { ownerLabel } from "../domain/ownership";
import { MonthPicker, monthLabel } from "../components/Controls";
import { useBudgyStore } from "../store/BudgyStore";
import { useHousehold } from "../application/HouseholdContext";
import { ActivityEvent, activityRepository } from "../repositories/activityRepository";
import { accountBalances, monthlyControl, spendingPace } from "../domain/accounts";

const percentage = (value: number) => (value * 100).toFixed(1) + "%";

const Overview: React.FC = () => {
  const { data, month, setMonth, plan } = useBudgyStore();
  const household = useHousehold();
  const [activity, setActivity] = useState<ActivityEvent[] | null>(null);
  const [activityError, setActivityError] = useState(false);
  const summary = useMemo(() => calculateHouseholdSummary(plan), [plan]);
  const actuals = useMemo(()=>calculateBudgetActuals(plan,data.transactions,month),[plan,data.transactions,month]);
  const monthControl=useMemo(()=>monthlyControl(plan.budget,data.transactions,month,summary.income,plan.savings),[plan,data.transactions,month,summary.income]);
  const creditDebt=useMemo(()=>accountBalances(data.accounts,data.transactions).filter((account)=>account.type==="credit_card").reduce((sum,account)=>sum+account.balance,0),[data.accounts,data.transactions]);
  const paceDate=useMemo(()=>{const now=new Date();const key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;if(key===month)return now;const[y,m]=month.split("-").map(Number);return new Date(y,m,0);},[month]);
  const daysRemaining=spendingPace(0,1,paceDate).daysRemaining;
  const groups = useMemo(() => groupBudgetItems(plan), [plan]);
  const projection = useMemo(() => projectSavings(plan.savings, 60), [plan.savings]);
  const twelveMonthSavings = projection[12].balance;
  const fiveYearSavings = projection[60].balance;
  const recentTransactions = data.transactions.filter((transaction) => transaction.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  useEffect(() => { let active = true; activityRepository.list(household.household.id, 3).then((events) => { if (active) { setActivity(events); setActivityError(false); } }).catch(() => { if (active) setActivityError(true); }); return () => { active = false; }; }, [household.household.id, data]);
  const activitySentence = (event: ActivityEvent) => {
    const label = String(event.metadata.label ?? event.entityType.replaceAll("_", " "));
    const oldAmount = Number(event.metadata.old_amount_pence);
    const newAmount = Number(event.metadata.new_amount_pence);
    if (event.eventType.endsWith(".update") && Number.isFinite(oldAmount) && Number.isFinite(newAmount)) return `${event.actor} changed ${label} from ${formatMoney(oldAmount)} to ${formatMoney(newAmount)}`;
    if (event.eventType === "transactions.insert" && event.metadata.type === "credit_card_payment") return `${event.actor} recorded a ${formatMoney(newAmount)} credit-card payment to ${label}`;
    if (event.eventType === "transactions.insert" && event.metadata.type === "transfer") return `${event.actor} recorded a ${formatMoney(newAmount)} transfer`;
    if (event.eventType === "transactions.insert") return `${event.actor} added ${formatMoney(newAmount)} of spending for ${label}`;
    if (event.eventType.endsWith(".insert")) return `${event.actor} created ${label}`;
    if (event.eventType.endsWith(".delete")) return `${event.actor} removed ${label}`;
    return `${event.actor} updated ${label}`;
  };

  return (
    <div className="budgy-overview">
      <header className="budgy-page-header">
        <div>
          <p className="budgy-eyebrow">Household overview</p>
          <h1>Your money, moving together.</h1>
          <p className="budgy-page-intro">One clear view of income, commitments, savings and what comes next.</p>
        </div>
        <MonthPicker month={month} onChange={setMonth} />
      </header>

      <section className="budgy-plan-banner" aria-labelledby="budgy-plan-title">
        <div className="budgy-plan-topline">
          <div>
            <p className="budgy-plan-kicker">Available this month</p>
            <h2 id="budgy-plan-title">Every pound has a shared purpose.</h2>
          </div>
          <div className="budgy-plan-total">
            <span>Household income</span>
            <strong>{formatMoney(summary.income)}</strong>
          </div>
        </div>
        <div>
          <div className="budgy-allocation-track" aria-label="Income allocation">
            <i className="budgy-allocation-spending" style={{ width: percentage(summary.spendingRate) }} />
            <i className="budgy-allocation-savings" style={{ width: percentage(summary.savingsRate) }} />
            <i className="budgy-allocation-buffer" style={{ width: percentage(summary.remainingRate) }} />
          </div>
          <div className="budgy-allocation-legend">
            <span>Spending <strong>{percentage(summary.spendingRate)}</strong></span>
            <span>Savings <strong>{percentage(summary.savingsRate)}</strong></span>
            <span>Buffer <strong>{percentage(summary.remainingRate)}</strong></span>
          </div>
        </div>
      </section>

      <section className="budgy-metrics" aria-label="Monthly plan summary">
        <MetricCard
          label="Household income"
          value={formatMoney(summary.income)}
          detail={`Across ${plan.income.length} monthly income source${plan.income.length===1?"":"s"}`}
        >
          <div className="budgy-income-sources">
            {plan.income.map((income) => (
              <span key={income.id}>{income.name} <strong>{formatMoney(income.amount)}</strong></span>
            ))}
          </div>
        </MetricCard>
        <MetricCard
          label="Planned spending"
          value={formatMoney(summary.spending)}
          detail={percentage(summary.spendingRate) + " of household income"}
        />
        <MetricCard
          label="Monthly savings"
          value={formatMoney(summary.savings)}
          detail="Set aside before the month begins"
          tone="positive"
        >
          <div className="budgy-rate-chip"><Icon name="trend" size={16} />{percentage(summary.savingsRate)} savings rate</div>
        </MetricCard>
        <MetricCard
          label="Left to allocate"
          value={formatMoney(summary.remaining)}
          detail="Uncommitted household buffer"
          tone="dark"
        />
      </section>

      <section className="budgy-panel budgy-this-month"><div className="budgy-panel-heading"><div><p className="budgy-eyebrow">This month</p><h2>What is still available</h2></div><Link className="budgy-text-link" to="/budgy/money">Open Money <span aria-hidden="true">→</span></Link></div><div className="budgy-this-month-metrics"><div><span>Spent so far</span><strong>{formatMoney(monthControl.spent)}</strong></div><div><span>Left to spend</span><strong>{formatMoney(monthControl.leftToSpend)}</strong></div><div><span>Days remaining</span><strong>{daysRemaining}</strong></div><div><span>Credit-card debt</span><strong>{formatMoney(creditDebt)}</strong></div></div><div className="budgy-key-progress">{actuals.filter((actual)=>actual.planned>0).sort((a,b)=>b.planned-a.planned).slice(0,3).map((actual)=><div key={actual.group}><span><b>{actual.group}</b><small>{formatMoney(actual.spent)} / {formatMoney(actual.planned)}</small></span><div className="budgy-category-track"><span style={{width:`${Math.min(100,actual.spent/actual.planned*100)}%`}}/></div></div>)}</div></section>

      <section className="budgy-dashboard-grid">
        <article className="budgy-panel budgy-spending-panel">
          <div className="budgy-panel-heading">
            <div><p className="budgy-eyebrow">Where it goes</p><h2>Spending breakdown</h2></div>
            <Link className="budgy-text-link" to="/budgy/budget">View budget <span aria-hidden="true">→</span></Link>
          </div>
          <SpendingDonut groups={groups} total={summary.spending} />
        </article>

        <article className="budgy-panel budgy-plan-health">
          <div className="budgy-panel-heading">
            <div><p className="budgy-eyebrow">Are we on plan?</p><h2>Income allocation</h2></div>
          </div>
          <div className="budgy-rate-layout">
            <div className="budgy-rate-ring" style={{ "--budgy-rate": percentage(summary.savingsRate) } as React.CSSProperties}>
              <strong>{percentage(summary.savingsRate)}</strong><span>savings rate</span>
            </div>
            <dl className="budgy-allocation-list">
              <div><dt>Planned spending</dt><dd>{formatMoney(summary.spending)}</dd></div>
              <div><dt>Savings</dt><dd>{formatMoney(summary.savings)}</dd></div>
              <div><dt>Still flexible</dt><dd>{formatMoney(summary.remaining)}</dd></div>
            </dl>
          </div>
          <p className="budgy-plan-status"><i />Your income covers every planned commitment.</p>
        </article>
      </section>

      <section className="budgy-panel budgy-category-panel">
        <div className="budgy-panel-heading">
          <div><p className="budgy-eyebrow">The monthly plan</p><h2>Budget categories</h2></div>
          <span className="budgy-category-count">{plan.budget.length} planned items</span>
        </div>
        <div className="budgy-category-list">
          {groups.map((group) => (
            <div className="budgy-category-row" key={group.group}>
              <span className="budgy-category-symbol" aria-hidden="true">{group.group.slice(0, 1)}</span>
              <span className="budgy-category-name">{group.group}</span>
              <b className="budgy-category-value">{formatMoney(group.amount)}</b>
              <div className="budgy-category-track"><span style={{ width: percentage(group.shareOfSpending) }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="budgy-dashboard-grid budgy-dashboard-grid--bottom">
        <article className="budgy-panel budgy-projection-panel">
          <div className="budgy-panel-heading">
            <div><p className="budgy-eyebrow">Where this takes you</p><h2>Savings projection</h2></div>
            <Link className="budgy-text-link" to="/budgy/projections">Explore <span aria-hidden="true">→</span></Link>
          </div>
          <div className="budgy-projection-summary">
            <div><span>In 12 months</span><strong>{formatCompactMoney(twelveMonthSavings)}</strong></div>
            <div><span>In 5 years</span><strong>{formatCompactMoney(fiveYearSavings)}</strong></div>
          </div>
          <svg className="budgy-projection-chart" viewBox="0 0 600 150" preserveAspectRatio="none" role="img" aria-label="Savings rising from zero to £150,000 over five years">
            <defs>
              <linearGradient id="budgy-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4b8f79" stopOpacity=".34" />
                <stop offset="100%" stopColor="#4b8f79" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 136 L120 112 L240 88 L360 64 L480 40 L600 16 L600 150 L0 150 Z" fill="url(#budgy-chart-fill)" />
            <path d="M0 136 L120 112 L240 88 L360 64 L480 40 L600 16" fill="none" stroke="#27715f" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            <circle cx="600" cy="16" r="5" fill="#27715f" />
          </svg>
          <p className="budgy-chart-note">Based on saving {formatMoney(summary.savings)} each month, before interest or investment growth.</p>
        </article>

        <article className="budgy-panel budgy-activity-panel">
          <div className="budgy-panel-heading">
            <div><p className="budgy-eyebrow">Shared activity</p><h2>Recent household activity</h2></div>
            <Link className="budgy-text-link" to="/budgy/transactions">View all <span aria-hidden="true">→</span></Link>
          </div>
          {activity === null && !activityError ? <div className="budgy-activity-skeleton" aria-label="Loading household activity"><span/><span/><span/></div> : activityError ? <div className="budgy-empty-activity"><div><h3>Activity is temporarily unavailable</h3><p>Your financial plan is still safe. Refresh to try again.</p></div></div> : activity?.length ? <div className="budgy-recent-list">{activity.map((event) => <div key={event.id}><span><b>{activitySentence(event)}</b><small>{new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(event.createdAt))}</small></span></div>)}</div> : recentTransactions.length ? <div className="budgy-recent-list">{recentTransactions.map((transaction) => <div key={transaction.id}><span><b>{transaction.description}</b><small>{transaction.category} · {ownerLabel(transaction.owner,data.members)}</small></span><strong className={transaction.type === "income" ? "is-positive" : ""}>{transaction.type === "income" ? "+" : "−"}{formatMoney(transaction.amount)}</strong></div>)}</div> : <div className="budgy-empty-activity">
            <div>
              <span className="budgy-empty-icon"><Icon name="wallet" size={23} /></span>
              <h3>A clean slate for {monthLabel(month)}</h3>
              <p>Household transactions will appear here as you begin tracking the month together.</p>
            </div>
          </div>}
        </article>
      </section>
    </div>
  );
};

export default Overview;
