import React from "react";
import { Link } from "react-router-dom";
import { NEST_BASE_PATH } from "../config/product";
import { generateChildBrief } from "../domain/brief";
import { useNestStore } from "../store/NestStore";
import Icon from "./Icon";

const formatTime = (iso: string): string => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

const NestBrief: React.FC = () => {
  const { data, selectedChild } = useNestStore();
  const brief = generateChildBrief(data, selectedChild.id);
  return <section className="nest-brief">
    <header><div><p>NEST BRIEF</p><h2>{brief.overnight ? `${selectedChild.name} slept ${brief.overnight.duration} overnight${brief.overnight.wakeCount ? `, waking ${brief.overnight.wakeCount === 1 ? "once" : `${brief.overnight.wakeCount} times`}.` : "."}` : `${selectedChild.name}’s latest care, at a glance.`}</h2></div><Link to={`${NEST_BASE_PATH}/handover`}><Icon name="handover" size={17}/> Full handover</Link></header>
    <div className="nest-brief-events"><div><small>LAST FEED</small><strong>{brief.lastFeed?.label ?? "Nothing logged"}</strong><span>{brief.lastFeed ? formatTime(brief.lastFeed.occurredAt) : "—"}</span></div><div><small>LAST CHANGE</small><strong>{brief.lastNappy?.label ?? "Nothing logged"}</strong><span>{brief.lastNappy ? formatTime(brief.lastNappy.occurredAt) : "—"}</span></div><div><small>CURRENTLY</small><strong>{brief.currentState[0].toUpperCase() + brief.currentState.slice(1)}</strong><span>Right now</span></div></div>
    {brief.attention.length > 0 && <div className="nest-brief-attention"><p>NEEDS ATTENTION</p><div>{brief.attention.slice(0, 3).map((item) => <article key={`${item.kind}-${item.id}`}><span><Icon name={item.kind === "medicine" ? "medicine" : "cart"}/></span><div><strong>{item.label}</strong><small>{item.detail}</small></div></article>)}</div><Link to={`${NEST_BASE_PATH}/needs`}>View needs <span>→</span></Link></div>}
  </section>;
};
export default NestBrief;
