import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useHousehold } from "../application/HouseholdContext";
import { clearTransactionDraft, transactionDraftKey } from "../application/transactionDraft";
import { useAuth } from "../auth/AuthProvider";
import { EmptyState, MonthPicker, monthLabel } from "../components/Controls";
import { Dialog } from "../components/Dialog";
import { TransactionForm } from "../components/Forms";
import { transactionBudgetMonth } from "../domain/months";
import { formatMoney } from "../domain/money";
import { ownerLabel, ownerOptions } from "../domain/ownership";
import { transactionMatchesView } from "../domain/transactionFilters";
import { Owner, Transaction } from "../domain/types";
import { useBudgyStore } from "../store/BudgyStore";

const Transactions: React.FC = () => {
  const { data, month, setMonth, updateData } = useBudgyStore();
  const { session } = useAuth();
  const household = useHousehold();
  const draftKey = transactionDraftKey(session!.user.id, household.household.id);
  const [searchParams] = useSearchParams();
  const budgetFilter = searchParams.get("budget") ?? undefined;
  const budgetMonthFilter = searchParams.get("budgetMonth") ?? undefined;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "All");
  const [owner, setOwner] = useState<Owner | "All">("All");
  const [type, setType] = useState<Transaction["type"] | "All">("All");
  useEffect(()=>{if(searchParams.get("add")==="transaction")setOpen(true);},[searchParams]);
  const discard = () => { clearTransactionDraft(draftKey); setOpen(false); };

  const rows = useMemo(() => data.transactions.filter((transaction) =>
    transactionMatchesView(transaction, { ledgerMonth: month, budgetMonth: budgetMonthFilter, budgetItemId: budgetFilter })
    && (category === "All" || (transaction.category ?? (transaction.type === "income" ? "Uncategorised income" : "Uncategorised expense")) === category)
    && (owner === "All" || transaction.owner === owner)
    && (type === "All" || transaction.type === type)
    && `${transaction.description} ${transaction.note ?? ""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [data.transactions, month, budgetMonthFilter, budgetFilter, category, owner, type, search]);
  const totalIn = rows.filter((row) => row.type === "income").reduce((sum, row) => sum + row.amount, 0);
  const totalOut = rows.reduce((sum, row) => sum + (row.type === "expense" ? row.amount : row.type === "refund" ? -row.amount : 0), 0);
  const saveEdit = (transaction: Transaction) => {
    updateData((current) => ({ ...current, transactions: current.transactions.map((entry) => entry.id === transaction.id ? transaction : entry) }));
    setEditing(null);
  };

  return <div className="budgy-product-page">
    <header className="budgy-product-header"><div><p className="budgy-eyebrow">{budgetMonthFilter ? "Budget activity" : "Actual money movement"}</p><h1>Transactions</h1><p>{budgetMonthFilter ? `Entries counted toward ${monthLabel(budgetMonthFilter)}, regardless of their payment date.` : "See what happened, separate from what you planned."}</p></div><div className="budgy-header-actions">{!budgetMonthFilter&&<MonthPicker month={month} onChange={setMonth} />}<button className="budgy-button budgy-button--primary" type="button" onClick={() => setOpen(true)}>+ Add transaction</button></div></header>
    <section className="budgy-transaction-summary"><div><span>{budgetMonthFilter?"Assigned income":"Money in"}</span><strong>{formatMoney(totalIn)}</strong></div><div><span>{budgetMonthFilter?"Assigned spending":"Money out"}</span><strong>{formatMoney(totalOut)}</strong></div><div><span>{budgetMonthFilter?"Net assigned":"Net movement"}</span><strong>{formatMoney(totalIn - totalOut)}</strong></div></section>
    <section className="budgy-product-panel">
      <div className="budgy-filter-bar"><label className="budgy-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" aria-label="Search transactions" /></label><select aria-label="Filter category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{Array.from(new Set([...data.categories, ...data.incomeCategories, "Uncategorised income"])).map((entry) => <option key={entry}>{entry}</option>)}</select><select aria-label="Filter owner" value={owner} onChange={(event) => setOwner(event.target.value)}><option>All</option>{ownerOptions(data.members).map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}</select><select aria-label="Filter type" value={type} onChange={(event) => setType(event.target.value as typeof type)}><option>All</option><option value="expense">Expenses</option><option value="refund">Refunds</option><option value="income">Income</option><option value="transfer">Transfers</option><option value="credit_card_payment">Card payments</option></select></div>
      {rows.length === 0 ? <EmptyState title={data.transactions.length ? "No matching transactions" : "Your household activity starts here"} description={data.transactions.length ? "Try changing the month or one of your filters." : "Transactions turn your monthly plan into actual spending."} action={!data.transactions.length && <button className="budgy-button budgy-button--primary" type="button" onClick={() => setOpen(true)}>Add transaction</button>} /> : <div className="budgy-transaction-list"><div className="budgy-transaction-head"><span>Description</span><span>Category</span><span>Owner</span><span>Date</span><span>Amount</span><span /></div>{rows.map((transaction) => {
        const source = data.accounts.find((account) => account.id === transaction.accountId)?.name;
        const destination = data.accounts.find((account) => account.id === transaction.destinationAccountId)?.name;
        const assignedMonth = transactionBudgetMonth(transaction);
        const assignedPlan = assignedMonth ? data.months[assignedMonth] : undefined;
        const allocation = assignedPlan?.budget.find((item) => item.id === transaction.budgetItemId)?.name;
        const incomeSource = assignedPlan?.income.find((item) => item.id === transaction.incomeSourceId)?.name;
        const savingsGoal = data.goals.find((goal) => goal.id === transaction.savingsGoalId)?.name;
        const positive = transaction.type === "income" || transaction.type === "refund";
        const details = [source && `${positive ? "Into" : "From"} ${source}`, destination && `To ${destination}`, savingsGoal && `Goal ${savingsGoal}`, incomeSource && `Source ${incomeSource}`, allocation && `Counts against ${allocation}`, assignedMonth && `Counts toward ${monthLabel(assignedMonth)}`, transaction.note].filter(Boolean).join(" · ");
        return <div className="budgy-transaction-row" key={transaction.id}><span><b>{transaction.description}</b><small>{details}</small></span><span>{transaction.type === "credit_card_payment" ? "Card payment" : savingsGoal ? "Goal contribution" : transaction.type === "transfer" ? "Transfer" : transaction.type === "refund" ? "Refund" : transaction.category ?? "Uncategorised income"}</span><span>{ownerLabel(transaction.owner, data.members)}</span><span>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${transaction.date}T12:00:00`))}</span><strong className={positive ? "is-income" : ""}>{positive ? "+" : transaction.type === "expense" ? "−" : ""}{formatMoney(transaction.amount)}</strong><span className="budgy-transaction-actions"><button className="budgy-icon-button" type="button" aria-label={`Edit ${transaction.description}`} onClick={() => setEditing(transaction)}>✎</button><button className="budgy-icon-button" type="button" aria-label={`Delete ${transaction.description}`} onClick={() => updateData((current) => ({ ...current, transactions: current.transactions.filter((entry) => entry.id !== transaction.id) }))}>×</button></span></div>;
      })}</div>}
    </section>
    <Dialog open={open} title="Add transaction" description="Record actual household money movement." onClose={discard}><TransactionForm month={month} onCancel={discard} onSave={(transaction) => { updateData((current) => ({ ...current, transactions: [...current.transactions, transaction] })); clearTransactionDraft(draftKey); setOpen(false); }} /></Dialog>
    <Dialog open={Boolean(editing)} title="Edit transaction" description="Change the payment date or the budget month independently." onClose={() => setEditing(null)}>{editing && <TransactionForm month={month} initialTransaction={editing} onCancel={() => setEditing(null)} onSave={saveEdit} />}</Dialog>
  </div>;
};

export default Transactions;
