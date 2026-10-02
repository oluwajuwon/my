import React from"react";
import{Link}from"react-router-dom";
import{HomeViewModel}from"../domain/home";
import{formatMoney}from"../domain/money";

const variance=(amount:number,complete:boolean)=>amount<0?`${formatMoney(Math.abs(amount))} over plan`:amount===0?"On plan":complete?`${formatMoney(amount)} under plan`:`${formatMoney(amount)} left to spend`;
const MonthHero:React.FC<{model:HomeViewModel;hasAccounts:boolean}>=({model,hasAccounts})=>{
  const setup=model.lifecycle==="setup";const planLed=model.lifecycle==="future"||model.lifecycle==="ready";const complete=model.lifecycle==="complete";
  return <section className={`budgy-month-hero is-${model.lifecycle}`} aria-labelledby="budgy-month-hero-title">
    <header><div><p className="budgy-eyebrow">{model.copy.statusLabel}</p><h2 id="budgy-month-hero-title">{model.copy.headline}</h2><p>{model.copy.supporting}</p></div><Link className="budgy-button budgy-button--hero" to={model.primaryAction.to}>{model.primaryAction.label}</Link></header>
    {setup?<div className="budgy-setup-checklist" aria-label="Month setup steps"><div className={model.plan.income>0?"is-complete":""}><span>{model.plan.income>0?"✓":"○"}</span><b>Household income</b><small>{model.plan.income>0?"Added":"Required for your plan"}</small></div><div className={model.plan.spending>0?"is-complete":""}><span>{model.plan.spending>0?"✓":"○"}</span><b>Monthly commitments</b><small>{model.plan.spending>0?"Added":"Required for spending progress"}</small></div><div className={model.plan.savings>0?"is-complete":""}><span>{model.plan.savings>0?"✓":"○"}</span><b>Savings target</b><small>Optional</small></div><div className={hasAccounts?"is-complete":""}><span>{hasAccounts?"✓":"○"}</span><b>Add an account</b><small>Recommended next step</small></div></div>:<>
      <div className="budgy-month-hero-metrics">
        <div><span>{planLed?"Spending plan":complete?"Actual spending":"Spent so far"}</span><strong>{formatMoney(planLed?model.spendingPlan:model.actualSpending)}</strong></div>
        <div><span>{planLed?model.hasActualSpending?"Already recorded":"Savings target":complete?"Planned spending":"Left to spend"}{!planLed&&<i className="budgy-info-dot" tabIndex={0} aria-label="Left to spend means your spending plan minus expenses recorded against this month’s budget." title="Your spending plan minus expenses recorded against this month’s budget.">i</i>}</span><strong>{formatMoney(planLed?(model.hasActualSpending?model.actualSpending:model.plan.savings):complete?model.spendingPlan:model.leftToSpend)}</strong></div>
        <div className={model.leftToSpend<0?"is-over":""}><span>{planLed?model.hasActualSpending?"Remaining":"Left to allocate":complete?"Result":"Spending plan used"}</span><strong>{planLed?(model.hasActualSpending?formatMoney(model.leftToSpend):formatMoney(model.plan.remaining)):complete?variance(model.leftToSpend,true):`${Math.max(0,model.spendingUsedRate*100).toFixed(1)}%`}</strong></div>
      </div>
      {(model.hasActualSpending||complete)&&<div className="budgy-month-progress"><div role="progressbar" aria-label={`${formatMoney(model.actualSpending)} spent of ${formatMoney(model.spendingPlan)} planned`} aria-valuemin={0} aria-valuemax={model.spendingPlan} aria-valuenow={model.actualSpending}><span style={{width:`${Math.min(100,Math.max(0,model.spendingUsedRate*100))}%`}}/></div><p><b>{formatMoney(model.actualSpending)}</b> of {formatMoney(model.spendingPlan)} spending plan recorded</p></div>}
      <div className="budgy-month-hero-context"><span>Income <b>{formatMoney(model.plan.income)}</b></span>{model.plannedDebtPayments>0&&<span>Debt payments <b>{formatMoney(model.actualDebtPayments)} of {formatMoney(model.plannedDebtPayments)}</b></span>}<span>Savings target <b>{formatMoney(model.plan.savings)}</b></span>{model.actualSavings!==0&&<span>{complete?"Saved":"Saved so far"} <b>{formatMoney(model.actualSavings)}</b></span>}<Link to="/budgy/money">Credit cards <b>{formatMoney(model.creditCardDebt)} owed</b></Link>{model.daysRemaining!==null&&<span><b>{model.daysRemaining}</b> days left in {model.monthName.split(" ")[0]}</span>}</div>
      {model.pacing&&<div className="budgy-pacing"><b>{model.pacing.label}</b><span>{Math.round(model.pacing.elapsedRate*100)}% of month elapsed · {Math.round(model.pacing.spentRate*100)}% of spending plan used</span></div>}
      {model.budgetTransactionCount>0&&<p className="budgy-recording-context">Based on {model.budgetTransactionCount} transaction{model.budgetTransactionCount===1?"":"s"} recorded against {model.monthName} in Budgy.</p>}
    </>}
  </section>;
};
export default MonthHero;
