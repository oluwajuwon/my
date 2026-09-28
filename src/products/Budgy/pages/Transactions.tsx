import React, { useMemo, useState } from "react";
import { formatMoney } from "../domain/money";
import { ownerLabel, ownerOptions } from "../domain/ownership";
import { Owner } from "../domain/types";
import { useBudgyStore } from "../store/BudgyStore";
import { Dialog } from "../components/Dialog";
import { EmptyState, MonthPicker } from "../components/Controls";
import { TransactionForm } from "../components/Forms";
import { useSearchParams } from "react-router-dom";

const Transactions: React.FC = () => {
  const { data, month, plan, setMonth, updateData } = useBudgyStore();
  const [searchParams]=useSearchParams();const budgetFilter=searchParams.get("budget");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [owner, setOwner] = useState<Owner | "All">("All");
  const [type, setType] = useState<"income" | "expense" | "transfer" | "credit_card_payment" | "All">("All");
  const rows = useMemo(() => data.transactions.filter((transaction) => transaction.date.startsWith(month)
    && (category === "All" || transaction.category === category)
    && (owner === "All" || transaction.owner === owner)
    && (type === "All" || transaction.type === type)
    && (!budgetFilter || transaction.budgetItemId===budgetFilter)
    && `${transaction.description} ${transaction.note ?? ""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [data.transactions, month, category, owner, type, search,budgetFilter]);
  const totalIn = rows.filter((row) => row.type === "income").reduce((sum, row) => sum + row.amount, 0);
  const totalOut = rows.filter((row) => row.type === "expense").reduce((sum, row) => sum + row.amount, 0);

  return <div className="budgy-product-page">
    <header className="budgy-product-header"><div><p className="budgy-eyebrow">Actual money movement</p><h1>Transactions</h1><p>See what happened, separate from what you planned.</p></div><div className="budgy-header-actions"><MonthPicker month={month} onChange={setMonth} /><button className="budgy-button budgy-button--primary" type="button" onClick={() => setOpen(true)}>+ Add transaction</button></div></header>
    <section className="budgy-transaction-summary"><div><span>Money in</span><strong>{formatMoney(totalIn)}</strong></div><div><span>Money out</span><strong>{formatMoney(totalOut)}</strong></div><div><span>Net movement</span><strong>{formatMoney(totalIn - totalOut)}</strong></div></section>
    <section className="budgy-product-panel">
      <div className="budgy-filter-bar"><label className="budgy-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" aria-label="Search transactions" /></label><select aria-label="Filter category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{data.categories.map((entry) => <option key={entry}>{entry}</option>)}</select><select aria-label="Filter owner" value={owner} onChange={(event) => setOwner(event.target.value)}><option>All</option>{ownerOptions(data.members).map((entry)=><option key={entry.value} value={entry.value}>{entry.label}</option>)}</select><select aria-label="Filter type" value={type} onChange={(event) => setType(event.target.value as typeof type)}><option>All</option><option value="expense">Expenses</option><option value="income">Income</option><option value="transfer">Transfers</option><option value="credit_card_payment">Card payments</option></select></div>
      {rows.length === 0 ? <EmptyState title={data.transactions.length ? "No matching transactions" : "Your household activity starts here"} description={data.transactions.length ? "Try changing the month or one of your filters." : "Add an expense or income record. Budgy will compare actual spending with your monthly plan."} action={!data.transactions.length && <button className="budgy-button budgy-button--primary" type="button" onClick={() => setOpen(true)}>Add first transaction</button>} /> : <div className="budgy-transaction-list"><div className="budgy-transaction-head"><span>Description</span><span>Category</span><span>Owner</span><span>Date</span><span>Amount</span><span /></div>{rows.map((transaction) => {const source=data.accounts.find((account)=>account.id===transaction.accountId)?.name;const allocation=plan.budget.find((item)=>item.id===transaction.budgetItemId)?.name;return <div className="budgy-transaction-row" key={transaction.id}><span><b>{transaction.description}</b><small>{[source&&`From ${source}`,allocation&&`Counts against ${allocation}`,transaction.note].filter(Boolean).join(" · ")}</small></span><span>{transaction.type==="credit_card_payment"?"Card payment":transaction.type==="transfer"?"Transfer":transaction.category}</span><span>{ownerLabel(transaction.owner,data.members)}</span><span>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${transaction.date}T12:00:00`))}</span><strong className={transaction.type === "income" ? "is-income" : ""}>{transaction.type === "income" ? "+" : transaction.type === "expense" ? "−" : ""}{formatMoney(transaction.amount)}</strong><button className="budgy-icon-button" type="button" aria-label={`Delete ${transaction.description}`} onClick={() => updateData((current) => ({ ...current, transactions: current.transactions.filter((entry) => entry.id !== transaction.id) }))}>×</button></div>;})}</div>}
    </section>
    <Dialog open={open} title="Add transaction" description="Record actual household money movement." onClose={() => setOpen(false)}><TransactionForm month={month} categories={data.categories} onCancel={() => setOpen(false)} onSave={(transaction) => { updateData((current) => ({ ...current, transactions: [...current.transactions, transaction] })); setOpen(false); }} /></Dialog>
  </div>;
};

export default Transactions;
