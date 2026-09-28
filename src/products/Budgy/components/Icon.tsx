import React from "react";

export type IconName =
  | "overview"
  | "budget"
  | "money"
  | "transactions"
  | "goals"
  | "projections"
  | "scenarios"
  | "calendar"
  | "arrow-left"
  | "arrow-right"
  | "trend"
  | "wallet";

interface IconProps {
  name: IconName;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, size = 20 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    budget: <><path d="M4 7.5h16M7 4v3.5M17 4v3.5" /><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 12h3M7 16h6" /></>,
    money: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 9h10M7 15h3"/><circle cx="16.5" cy="15" r="1.5"/></>,
    transactions: <><path d="M4 8h14M15 5l3 3-3 3M20 16H6M9 13l-3 3 3 3" /></>,
    goals: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 2v3M22 12h-3" /></>,
    projections: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /><path d="m3 15 7-6 4 4 8-9" /></>,
    scenarios: <><path d="M5 5h5a4 4 0 0 1 4 4v10M5 19h5a4 4 0 0 0 4-4V9a4 4 0 0 1 4-4h1" /><path d="m17 3 2 2-2 2M3 3l2 2-2 2M3 17l2 2-2 2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
    "arrow-left": <path d="m15 18-6-6 6-6" />,
    "arrow-right": <path d="m9 18 6-6-6-6" />,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    wallet: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19a2 2 0 0 1 2 2v13H6a3 3 0 0 1-3-3V7" /><path d="M3 8h16M15 12h6v4h-6a2 2 0 0 1 0-4Z" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
};

export default Icon;
