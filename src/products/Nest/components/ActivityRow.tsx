import React from "react";
import { Activity, User } from "../domain/types";
import { durationMs, formatDuration } from "../domain/insights";
import { nappyLabel } from "../domain/activity";
import Icon, { IconName } from "./Icon";

const formatTime = (iso: string): string => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

export const activityDetails = (activity: Activity): { title: string; detail: string; icon: IconName; tone: string } => {
  if (activity.type === "bottle") return { title: "Bottle", detail: `${activity.metadata.amountMl}ml ${activity.metadata.milk === "formula" ? "formula" : "expressed milk"}`, icon: "feed", tone: "terracotta" };
  if (activity.type === "breastfeed") return { title: activity.endedAt ? "Breastfeed" : "Breastfeeding", detail: `${activity.metadata.side === "left" ? "Left" : "Right"}${activity.endedAt ? ` · ${formatDuration(durationMs(activity))}` : " · active"}`, icon: "feed", tone: "terracotta" };
  if (activity.type === "sleep") return { title: activity.endedAt ? "Woke up" : "Fell asleep", detail: activity.endedAt ? `Slept ${formatDuration(durationMs(activity))}` : "Sleeping now", icon: "sleep", tone: "sage" };
  if (activity.type === "nappy") return { title: "Nappy", detail: nappyLabel(activity.metadata.kind), icon: "nappy", tone: "sand" };
  if (activity.type === "medicine") return { title: activity.metadata.name, detail: `${activity.metadata.dose} ${activity.metadata.unit}`, icon: "medicine", tone: "lavender" };
  if (activity.type === "temperature") return { title: "Temperature", detail: `${activity.metadata.valueCelsius.toFixed(1)}°C`, icon: "temperature", tone: "lavender" };
  if (activity.type === "pump") return { title: "Pumped", detail: `${activity.metadata.durationMinutes} minutes`, icon: "pump", tone: "terracotta" };
  if (activity.type === "tummyTime") return { title: "Tummy time", detail: `${activity.metadata.durationMinutes} minutes`, icon: "clock", tone: "sage" };
  if (activity.type === "bath") return { title: "Bath", detail: "Bath time", icon: "bath", tone: "sage" };
  if (activity.type === "mood") return { title: "Mood", detail: activity.metadata.mood, icon: "sparkle", tone: "sand" };
  return { title: "Note", detail: activity.metadata.text, icon: "note", tone: "sand" };
};

const ActivityRow: React.FC<{ activity: Activity; users: User[]; actions?: React.ReactNode }> = ({ activity, users, actions }) => {
  const details = activityDetails(activity);
  const author = users.find((user) => user.id === activity.createdBy)?.displayName;
  return <article className="nest-activity-row">
    <time>{formatTime(activity.occurredAt)}</time>
    <span className={`nest-activity-icon ${details.tone}`}><Icon name={details.icon} size={20}/></span>
    <div><strong>{details.title}</strong><span>{details.detail}</span><small>{author}</small></div>
    {actions}
  </article>;
};
export default ActivityRow;
