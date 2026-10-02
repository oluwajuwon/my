import React from "react";

export type IconName = "home" | "timeline" | "plus" | "insights" | "family" | "feed" | "sleep" | "nappy" | "more" | "moon" | "chevron" | "clock" | "sparkle" | "close" | "medicine" | "temperature" | "pump" | "bath" | "note" | "cart" | "handover" | "check";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></>,
  timeline: <><path d="M7 4h14M7 12h14M7 20h14"/><circle cx="3" cy="4" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="20" r="1"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  insights: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  family: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c0-4 2.4-7 6-7s6 3 6 7M15 14c3 0 5 2.4 5 5"/></>,
  feed: <><path d="M8 3h8M9 3v4l-2 3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9l-2-3V3"/><path d="M8 13h8"/></>,
  sleep: <><path d="M20 15.5A8 8 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z"/></>,
  nappy: <><path d="M5 7c1.8 1.2 4.1 1.8 7 1.8S17.2 8.2 19 7l-1 11c-3.7 2.7-8.3 2.7-12 0L5 7Z"/><path d="M6 14c2.7 0 4.7 1.3 6 4 1.3-2.7 3.3-4 6-4"/></>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  moon: <path d="M20 15.5A8 8 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  sparkle: <><path d="m12 2 1.4 5.1L18 9l-4.6 1.9L12 16l-1.4-5.1L6 9l4.6-1.9L12 2Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  medicine: <><path d="M10 4h4v4l3 3v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8l3-3V4Z"/><path d="M9 14h6M12 11v6"/></>,
  temperature: <><path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z"/><path d="M12 9v8"/></>,
  pump: <><path d="M7 4h7v5H7zM10.5 9v11M6 20h9"/><path d="M14 6h3c2 0 3 1 3 3s-1 3-3 3h-2"/></>,
  bath: <><path d="M3 12h18l-1 5a4 4 0 0 1-4 3H8a4 4 0 0 1-4-3l-1-5ZM7 12V7a3 3 0 0 1 6 0"/><path d="M13 7h3"/></>,
  note: <><path d="M5 3h11l3 3v15H5z"/><path d="M15 3v4h4M8 12h8M8 16h6"/></>,
  cart: <><path d="M3 4h2l2 11h10l3-7H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></>,
  handover: <><path d="M4 8h12M12 4l4 4-4 4M20 16H8M12 12l-4 4 4 4"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
};

const Icon: React.FC<{ name: IconName; size?: number; className?: string }> = ({ name, size = 22, className }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
export default Icon;
