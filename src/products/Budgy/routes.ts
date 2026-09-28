import { IconName } from "./components/Icon";

export const BUDGY_BASE_PATH = "/budgy";

export const budgyNavigation: Array<{
  label: string;
  path: string;
  icon: IconName;
  end?: boolean;
}> = [
  { label: "Overview", path: BUDGY_BASE_PATH, icon: "overview", end: true },
  { label: "Budget", path: BUDGY_BASE_PATH + "/budget", icon: "budget" },
  { label: "Money", path: BUDGY_BASE_PATH + "/money", icon: "money" },
  { label: "Transactions", path: BUDGY_BASE_PATH + "/transactions", icon: "transactions" },
  { label: "Goals", path: BUDGY_BASE_PATH + "/goals", icon: "goals" },
  { label: "Projections", path: BUDGY_BASE_PATH + "/projections", icon: "projections" },
  { label: "Scenarios", path: BUDGY_BASE_PATH + "/scenarios", icon: "scenarios" },
];
