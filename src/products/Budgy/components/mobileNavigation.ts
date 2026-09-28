import { Transaction } from "../domain/types";

export const moreRoutes = [
  "/budgy/transactions",
  "/budgy/reports",
  "/budgy/goals",
  "/budgy/projections",
  "/budgy/scenarios",
  "/budgy/settings",
] as const;

export const isMoreRoute = (pathname: string) =>
  moreRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export const quickAddOptions: Array<{ label:string; type:Transaction["type"]; primary?:boolean }> = [
  { label:"Transaction", type:"expense", primary:true },
  { label:"Income", type:"income" },
  { label:"Transfer", type:"transfer" },
  { label:"Credit card payment", type:"credit_card_payment" },
];
