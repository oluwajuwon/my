import React, { useMemo, useState } from "react";
import Icon from "../components/Icon";
import { formatDuration } from "../domain/insights";
import { generateHandoverSummary, HandoverRange } from "../domain/handover";
import { useNestStore } from "../store/NestStore";

const ranges: ReadonlyArray<readonly [HandoverRange, string]> = [["since-last", "Since I last checked"], ["4-hours", "Last 4 hours"], ["8-hours", "Last 8 hours"], ["overnight", "Overnight"], ["today", "Today"]];
const time = (iso: string): string => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

const Handover: React.FC = () => {
  const { data, selectedChild, markHandoverViewed } = useNestStore();
  const [range, setRange] = useState<HandoverRange>("since-last");
  const [caughtUp, setCaughtUp] = useState(false);
  const summary = useMemo(() => generateHandoverSummary(data, selectedChild.id, range), [data, selectedChild.id, range]);
  const userName = (id: string): string => data.users.find((user) => user.id === id)?.displayName ?? "Parent";
  return <div className="nest-page nest-handover"><header className="nest-page-heading"><div><p>PARENT HANDOVER</p><h1>What happened with {selectedChild.name}.</h1></div><button type="button" className="nest-caught-up" disabled={caughtUp} onClick={() => { markHandoverViewed(); setCaughtUp(true); }}>{caughtUp ? "You’re caught up ✓" : "Mark as caught up"}</button></header>
    <div className="nest-handover-ranges" role="group" aria-label="Handover period">{ranges.map(([value, label]) => <button type="button" key={value} className={range === value ? "is-active" : ""} onClick={() => setRange(value)}>{label}</button>)}</div>
    {summary.eventCount === 0 ? <div className="nest-empty-state nest-handover-empty"><Icon name="handover"/><strong>Nothing new has been logged in this period.</strong><small>{selectedChild.name} is currently {summary.currentState}.</small></div> : <>
      <section className="nest-handover-now"><span className="nest-child-avatar">{selectedChild.initials}</span><div><small>CURRENTLY</small><strong>{summary.currentState[0].toUpperCase() + summary.currentState.slice(1)}</strong><p>Since {time(summary.from)} · {summary.eventCount} updates</p></div></section>
      <div className="nest-handover-grid"><section><div className="nest-section-title"><p>LATEST</p><span>At a glance</span></div><article><span className="terracotta"><Icon name="feed"/></span><div><small>LAST FEED</small><strong>{summary.lastFeed?.label ?? "Nothing logged"}</strong><p>{summary.lastFeed ? `${time(summary.lastFeed.occurredAt)} · ${userName(summary.lastFeed.createdBy)}` : "—"}</p></div></article><article><span className="sand"><Icon name="nappy"/></span><div><small>LAST NAPPY</small><strong>{summary.lastNappy?.label ?? "Nothing logged"}</strong><p>{summary.lastNappy ? `${time(summary.lastNappy.occurredAt)} · ${userName(summary.lastNappy.createdBy)}` : "—"}</p></div></article></section>
        <section><div className="nest-section-title"><p>CARE SUMMARY</p><span>Selected period</span></div><div className="nest-handover-stats"><article><Icon name="sleep"/><strong>{summary.sleep.count}</strong><small>Sleep sessions · {formatDuration(summary.sleep.totalMs)}</small></article><article><Icon name="feed"/><strong>{summary.feeds.count}</strong><small>Feeds · {summary.feeds.bottleMl}ml bottles</small></article><article><Icon name="nappy"/><strong>{summary.nappies.count}</strong><small>{summary.nappies.wet} wet · {summary.nappies.both} both</small></article></div></section></div>
      <div className="nest-handover-grid nest-handover-detail">{summary.medicines.length > 0 && <section><div className="nest-section-title"><p>MEDICINE</p><span>{summary.medicines.length} logged</span></div>{summary.medicines.map((medicine) => <article key={medicine.id}><span className="lavender"><Icon name="medicine"/></span><div><strong>{medicine.metadata.name}</strong><small>{medicine.metadata.dose} {medicine.metadata.unit} · {time(medicine.occurredAt)} · {userName(medicine.createdBy)}</small></div></article>)}</section>}
        {summary.attention.length > 0 && <section><div className="nest-section-title"><p>NEEDS ATTENTION</p><span>Shared</span></div>{summary.attention.map((item) => <article key={`${item.kind}-${item.id}`}><span className="sand"><Icon name={item.kind === "medicine" ? "medicine" : "cart"}/></span><div><strong>{item.label}</strong><small>{item.detail}</small></div></article>)}</section>}</div>
    </>}
  </div>;
};
export default Handover;
