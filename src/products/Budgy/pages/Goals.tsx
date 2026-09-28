import React, { useState } from "react";
import { formatMoney } from "../domain/money";
import { Goal } from "../domain/types";
import { useBudgyStore } from "../store/BudgyStore";
import { Dialog, ConfirmationDialog } from "../components/Dialog";
import { EmptyState, ProgressBar } from "../components/Controls";
import { GoalForm } from "../components/Forms";

const completion = (goal: Goal) => {
  if (goal.monthlyContribution <= 0 || goal.currentAmount >= goal.targetAmount) return null;
  const months = Math.ceil((goal.targetAmount - goal.currentAmount) / goal.monthlyContribution);
  const date = new Date(); date.setMonth(date.getMonth() + months);
  return date;
};

const Goals: React.FC = () => {
  const { data, updateData } = useBudgyStore();
  const [editing, setEditing] = useState<Goal | "new" | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const save = (goal: Goal) => { updateData((current) => ({ ...current, goals: current.goals.some((entry) => entry.id === goal.id) ? current.goals.map((entry) => entry.id === goal.id ? goal : entry) : [...current.goals, goal] })); setEditing(null); };
  return <div className="budgy-product-page">
    <header className="budgy-product-header"><div><p className="budgy-eyebrow">Savings pots</p><h1>Goals</h1><p>Turn shared ambitions into visible, achievable targets.</p></div><button className="budgy-button budgy-button--primary" type="button" onClick={() => setEditing("new")}>+ Create goal</button></header>
    {data.goals.length === 0 ? <EmptyState title="Make the future tangible" description="Create an emergency fund, holiday, house deposit or any goal that matters to your household. Monthly savings are not allocated automatically." action={<button className="budgy-button budgy-button--primary" type="button" onClick={() => setEditing("new")}>Create your first goal</button>} /> : <div className="budgy-goal-grid">{data.goals.map((goal) => {
      const progress = goal.targetAmount ? goal.currentAmount / goal.targetAmount : 0;
      const target = new Date(`${goal.targetDate}T12:00:00`);
      const estimate = completion(goal);
      const estimateLabel = estimate ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(estimate) : null;
      const onTrack = estimate ? estimate <= target : goal.currentAmount >= goal.targetAmount;
      return <article className="budgy-goal-card" key={goal.id}><header><span>{goal.icon}</span><div><p>{onTrack ? "On track" : "Needs attention"}</p><h2>{goal.name}</h2></div><button className="budgy-icon-button" type="button" aria-label={`Edit ${goal.name}`} onClick={() => setEditing(goal)}>•••</button></header><strong>{formatMoney(goal.currentAmount)} <small>of {formatMoney(goal.targetAmount)}</small></strong><ProgressBar value={progress} /><div className="budgy-goal-meta"><span>{Math.min(progress * 100, 100).toFixed(0)}% funded</span><span>{formatMoney(Math.max(goal.targetAmount - goal.currentAmount, 0))} remaining</span></div><footer><span>£{(goal.monthlyContribution / 100).toLocaleString("en-GB")}/month</span><span>{estimateLabel ? `Est. ${estimateLabel}` : "No contribution set"}</span></footer><button className="budgy-delete-link" type="button" onClick={() => setDeleting(goal)}>Delete</button></article>;
    })}</div>}
    <Dialog open={editing !== null} title={editing === "new" ? "Create a goal" : "Edit goal"} description="Goal contributions stay separate from unallocated household savings." onClose={() => setEditing(null)}>{editing && <GoalForm goal={editing === "new" ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} />}</Dialog>
    <ConfirmationDialog open={!!deleting} title="Delete this goal?" description={`${deleting?.name ?? "This goal"} and its progress will be removed.`} confirmLabel="Delete goal" strong onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) updateData((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== deleting.id) })); setDeleting(null); }} />
  </div>;
};

export default Goals;
