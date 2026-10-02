import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { activityDetails } from "../components/ActivityRow";
import Icon from "../components/Icon";
import NestBrief from "../components/NestBrief";
import { NEST_BASE_PATH } from "../config/product";
import { deriveRepeatActions } from "../domain/actions";
import { calculateChildSummary, durationMs, formatDuration } from "../domain/insights";
import { estimateSupplyRunOut, getLowStockSupplies } from "../domain/supplies";
import { Activity } from "../domain/types";
import { useNestStore } from "../store/NestStore";

const time = (iso: string): string => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const greeting = (): string => { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"; };

const Today: React.FC = () => {
  const { data, selectedChild, updateActivity, log } = useNestStore();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer); }, []);
  const activities = useMemo(() => data.activities.filter((item) => item.childId === selectedChild.id).sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt)), [data.activities, selectedChild.id]);
  const active = activities.find((item) => (item.type === "sleep" || item.type === "breastfeed") && !item.endedAt);
  const lastFeed = activities.find((item) => item.type === "breastfeed" || item.type === "bottle");
  const lastNappy = activities.find((item) => item.type === "nappy");
  const summary = calculateChildSummary(data.activities, selectedChild.id, now);
  const needs = getLowStockSupplies(data.supplies, selectedChild.id);
  const recent = deriveRepeatActions(data.activities, selectedChild.id, 4);
  const endActive = (item: Activity) => updateActivity(item.id, (current) => ({ ...current, endedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  return <div className="nest-page nest-today">
    <header className="nest-page-heading"><div><p>{greeting()}</p><h1>Here’s how {selectedChild.name} is doing.</h1></div><div className="nest-heading-actions"><span>{new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(now)}</span><Link to={`${NEST_BASE_PATH}/handover`}><Icon name="handover" size={16}/> Handover</Link></div></header>
    <section className={`nest-current-state ${active ? "has-active" : ""}`}>
      <div className="nest-state-orb"><Icon name={active?.type === "breastfeed" ? "feed" : "sleep"} size={30}/><i/></div>
      {active ? <div className="nest-state-copy"><p>{active.type === "sleep" ? `${selectedChild.name} is sleeping` : "Feeding now"}</p><strong>{formatDuration(durationMs(active, now))}</strong><span>{active.type === "sleep" ? `Started ${time(active.occurredAt)}` : `${activityDetails(active).detail.split(" ·")[0]} side · Started ${time(active.occurredAt)}`}</span></div> : <div className="nest-state-copy"><p>{selectedChild.name} is awake</p><strong>All settled</strong><span>No active care session</span></div>}
      {active ? <div className="nest-state-actions">{active.type === "breastfeed" && <button type="button" className="secondary" onClick={() => updateActivity(active.id, (item) => item.type === "breastfeed" ? { ...item, metadata: { ...item.metadata, side: item.metadata.side === "left" ? "right" : "left", switches: item.metadata.switches + 1 } } : item)}>Switch side</button>}<button type="button" onClick={() => endActive(active)}>{active.type === "sleep" ? "She’s awake" : "Finish feed"}</button></div> : <button type="button" onClick={() => log({ type: "sleep" })}>Start sleep</button>}
    </section>
    <NestBrief/>
    <div className="nest-today-lower">
      <section><div className="nest-section-title"><p>RECENT</p><span>One tap to repeat</span></div><div className="nest-recent-actions">{recent.length ? recent.map((item) => <button type="button" key={item.key} onClick={() => log(item.draft)}><Icon name={item.kind === "feed" ? "feed" : item.kind === "nappy" ? "nappy" : "medicine"}/><span>{item.label}</span><b>+</b></button>) : <p className="nest-inline-empty">Your repeated care actions will appear here.</p>}</div></section>
      <section className="nest-up-next"><div className="nest-section-title"><p>NEEDS</p><Link to={`${NEST_BASE_PATH}/needs`}>View needs</Link></div>{needs.slice(0, 2).map((supply) => { const days = estimateSupplyRunOut(supply); return <article key={supply.id}><span className="sand"><Icon name={supply.category === "medicine" ? "medicine" : "cart"}/></span><div><small>{supply.name}</small><strong>{supply.quantity} {supply.unit}{days !== null ? ` · ~${days} days` : ""}</strong></div><Icon name="chevron" size={18}/></article>; })}{needs.length === 0 && <p className="nest-inline-empty">You’re all stocked up.</p>}</section>
    </div>
    <section className="nest-glance"><div className="nest-section-title"><p>TODAY</p><Link to={`${NEST_BASE_PATH}/insights`}>See insights</Link></div><div className="nest-glance-grid">
      <article><span className="terracotta"><Icon name="feed"/></span><p>Feeds</p><strong>{summary.feedsToday}</strong><small>{lastFeed ? `Last at ${time(lastFeed.occurredAt)}` : "Nothing logged"}</small></article>
      <article><span className="sage"><Icon name="sleep"/></span><p>Sleep</p><strong>{formatDuration(summary.sleepTodayMs)}</strong><small>{active?.type === "sleep" ? "Sleeping now" : "Across today"}</small></article>
      <article><span className="sand"><Icon name="nappy"/></span><p>Nappies</p><strong>{summary.nappiesToday}</strong><small>{lastNappy ? `Last at ${time(lastNappy.occurredAt)}` : "Nothing logged"}</small></article>
    </div></section>
  </div>;
};
export default Today;
