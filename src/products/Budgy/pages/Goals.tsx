import React, { useState } from "react";
import { formatMoney } from "../domain/money";
import { Goal } from "../domain/types";
import { useBudgyStore } from "../store/BudgyStore";
import { Dialog, ConfirmationDialog } from "../components/Dialog";
import { EmptyState, ProgressBar } from "../components/Controls";
import { GoalForm, TransactionForm } from "../components/Forms";
import { goalBalance, goalContributionsForMonth } from "../domain/goals";

const completion = (goal: Goal, currentAmount: number) => {
  if (goal.monthlyContribution <= 0 || currentAmount >= goal.targetAmount) return null;
  const months = Math.ceil((goal.targetAmount - currentAmount) / goal.monthlyContribution);
  const date = new Date(); date.setMonth(date.getMonth() + months);
  return date;
};

const Goals: React.FC = () => {
  const { data, month, updateData } = useBudgyStore();
  const [editing, setEditing] = useState<Goal | "new" | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [funding, setFunding] = useState<Goal | null>(null);
  const save = (goal: Goal) => { updateData((current) => ({ ...current, goals: current.goals.some((entry) => entry.id === goal.id) ? current.goals.map((entry) => entry.id === goal.id ? goal : entry) : [...current.goals, goal] })); setEditing(null); };
  return <div className="budgy-product-page">
    <header className="budgy-product-header"><div><p className="budgy-eyebrow">Savings pots</p><h1>Goals</h1><p>Turn shared ambitions into visible, achievable targets.</p></div><button className="budgy-button budgy-button--primary" type="button" onClick={() => setEditing("new")}>+ Create goal</button></header>
    {data.goals.length === 0 ? <EmptyState title="Make the future tangible" description="Create an emergency fund, holiday, house deposit or any goal that matters to your household. Monthly savings are not allocated automatically." action={<button className="budgy-button budgy-button--primary" type="button" onClick={() => setEditing("new")}>Create your first goal</button>} /> : <div className="budgy-goal-grid">{data.goals.map((goal) => {
      const currentAmount=goalBalance(goal,data.transactions);
      const contributedThisMonth=goalContributionsForMonth(goal.id,data.transactions,month);
      const fundingAccount=data.accounts.find((account)=>account.id===goal.fundingAccountId&&account.isActive&&account.type==="savings_account");
      const progress = goal.targetAmount ? currentAmount / goal.targetAmount : 0;
      const target = new Date(`${goal.targetDate}T12:00:00`);
      const estimate = completion(goal,currentAmount);
      const estimateLabel = estimate ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(estimate) : null;
      const onTrack = estimate ? estimate <= target : currentAmount >= goal.targetAmount;
      return <article className="budgy-goal-card" key={goal.id}><header><span>{goal.icon}</span><div><p>{onTrack ? "On track" : "Needs attention"}</p><h2>{goal.name}</h2></div><button className="budgy-icon-button" type="button" aria-label={`Edit ${goal.name}`} onClick={() => setEditing(goal)}>•••</button></header><strong>{formatMoney(currentAmount)} <small>of {formatMoney(goal.targetAmount)}</small></strong><ProgressBar value={progress} /><div className="budgy-goal-meta"><span>{Math.min(progress * 100, 100).toFixed(0)}% funded</span><span>{formatMoney(Math.max(goal.targetAmount - currentAmount, 0))} remaining</span></div><div className={`budgy-goal-account ${fundingAccount?"":"is-missing"}`}><span>{fundingAccount?"Saved in":"Account needed"}</span><strong>{fundingAccount?.name??"Choose a savings account to track this goal"}</strong>{contributedThisMonth>0&&<small>{formatMoney(contributedThisMonth)} added this month</small>}</div><footer><span>{formatMoney(goal.monthlyContribution)}/month planned</span><span>{estimateLabel ? `Est. ${estimateLabel}` : "No contribution set"}</span></footer><div className="budgy-goal-actions"><button className="budgy-button budgy-button--primary" type="button" disabled={!fundingAccount} onClick={()=>setFunding(goal)}>+ Add money</button><button className="budgy-delete-link" type="button" onClick={() => setDeleting(goal)}>Delete</button></div></article>;
    })}</div>}
    <Dialog open={editing !== null} title={editing === "new" ? "Create a goal" : "Edit goal"} description="Choose the real savings account where this money is held. Recorded transfers will update progress automatically." onClose={() => setEditing(null)}>{editing && <GoalForm goal={editing === "new" ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} />}</Dialog>
    <Dialog open={!!funding} title={`Add money to ${funding?.name??"goal"}`} description={funding?`Record a real transfer into ${data.accounts.find((account)=>account.id===funding.fundingAccountId)?.name??"the linked savings account"}.`:undefined} onClose={()=>setFunding(null)}>{funding&&<TransactionForm month={month} initialType="transfer" initialGoalId={funding.id} initialDestinationAccountId={funding.fundingAccountId} onCancel={()=>setFunding(null)} onSave={(transaction)=>{updateData((current)=>({...current,transactions:[...current.transactions,transaction]}));setFunding(null);}}/>}</Dialog>
    <ConfirmationDialog open={!!deleting} title="Delete this goal?" description={`${deleting?.name ?? "This goal"} will be removed. Its account transfers will remain in your transaction history.`} confirmLabel="Delete goal" strong onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) updateData((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== deleting.id),transactions:current.transactions.map((transaction)=>transaction.savingsGoalId===deleting.id?{...transaction,savingsGoalId:undefined}:transaction) })); setDeleting(null); }} />
  </div>;
};

export default Goals;
