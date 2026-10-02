import React, { useMemo, useState } from "react";
import ActivityRow from "../components/ActivityRow";
import { Activity } from "../domain/types";
import { useNestStore } from "../store/NestStore";

const dayLabel = (date: Date): string => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(date); target.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (days === 0) return "Today"; if (days === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(date);
};

const Timeline: React.FC = () => {
  const { data, selectedChild, deleteActivity } = useNestStore();
  const { activities, users } = data;
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "feeds" | "sleep" | "nappies">("all");
  const groups = useMemo(() => {
    const result = new Map<string, Activity[]>();
    activities.filter((item) => item.childId === selectedChild.id)
      .filter((item) => filter === "all" || (filter === "feeds" ? item.type === "bottle" || item.type === "breastfeed" : filter === "nappies" ? item.type === "nappy" : item.type === "sleep"))
      .sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt)).forEach((item) => {
      const key = new Date(item.occurredAt).toDateString(); result.set(key, [...(result.get(key) ?? []), item]);
    }); return Array.from(result.entries());
  }, [activities, selectedChild.id, filter]);
  return <div className="nest-page nest-timeline"><header className="nest-page-heading"><div><p>SHARED HISTORY</p><h1>{selectedChild.name}’s timeline</h1></div><span>Logged by your family</span></header>
    <div className="nest-filter-pills">{([['all','All'],['feeds','Feeds'],['sleep','Sleep'],['nappies','Nappies']] as const).map(([value, label]) => <button key={value} className={filter === value ? "is-active" : ""} type="button" onClick={() => setFilter(value)}>{label}</button>)}</div>
    <div className="nest-timeline-list">{groups.map(([date, dayActivities]) => <section key={date}><div className="nest-timeline-date"><strong>{dayLabel(new Date(date))}</strong><span>{dayActivities.length} events</span></div>{dayActivities.map((activity) => <ActivityRow key={activity.id} activity={activity} users={users} actions={<div className="nest-row-actions"><button type="button" aria-label="Activity options" onClick={() => setEditing(editing === activity.id ? null : activity.id)}>•••</button>{editing === activity.id && <div><button type="button" onClick={() => { deleteActivity(activity.id); setEditing(null); }}>Delete entry</button></div>}</div>}/>)}</section>)}</div>
  </div>;
};
export default Timeline;
