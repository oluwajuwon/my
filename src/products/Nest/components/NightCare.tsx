import React, { useEffect, useState } from "react";
import { durationMs, formatDuration } from "../domain/insights";
import { useNestStore } from "../store/NestStore";
import Icon from "./Icon";
import { QuickLogStart } from "./QuickLog";

const NightCare: React.FC<{ openLog(start: QuickLogStart): void }> = ({ openLog }) => {
  const { data, selectedChild, log, updateActivity } = useNestStore();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(id); }, []);
  const activities = data.activities.filter((item) => item.childId === selectedChild.id);
  const active = activities.find((item) => (item.type === "sleep" || item.type === "breastfeed") && !item.endedAt);
  const lastFeed = activities.find((item) => item.type === "bottle" || item.type === "breastfeed");
  const sinceFeed = lastFeed ? formatDuration(now.getTime() - new Date(lastFeed.occurredAt).getTime()) : "Not logged";
  return <div className="nest-night-care"><header><span className="nest-child-avatar">{selectedChild.initials}</span><div><small>NIGHT CARE</small><h1>{selectedChild.name}</h1></div><span className="nest-night-time">{new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(now)}</span></header>
    <section className="nest-night-state"><Icon name={active?.type === "breastfeed" ? "feed" : "moon"} size={29}/><div><small>{active ? active.type === "sleep" ? "SLEEPING" : "FEEDING" : "LAST FEED"}</small><strong>{active ? formatDuration(durationMs(active, now)) : sinceFeed}</strong><p>{active ? `Started at ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(active.occurredAt))}` : lastFeed ? "ago" : "No feed recorded"}</p></div></section>
    <div className="nest-night-actions">{active ? <button type="button" onClick={() => updateActivity(active.id, (item) => ({ ...item, endedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }))}><Icon name={active.type === "sleep" ? "sleep" : "feed"}/><span>{active.type === "sleep" ? "She’s awake" : "Finish feed"}</span></button> : <button type="button" onClick={() => log({ type: "sleep" })}><Icon name="sleep"/><span>Start sleep</span></button>}<button type="button" onClick={() => openLog("feed")}><Icon name="feed"/><span>Start feed</span></button><button type="button" onClick={() => openLog("nappy")}><Icon name="nappy"/><span>Nappy</span></button>{data.medicines.some((item) => item.childId === selectedChild.id && item.active) && <button type="button" onClick={() => openLog("medicine")}><Icon name="medicine"/><span>Medicine</span></button>}</div>
    <p className="nest-night-foot">Only essential care actions are shown overnight.</p>
  </div>;
};
export default NightCare;
