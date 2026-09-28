import { Pence } from "./types";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatMoney = (pence: Pence): string =>
  currencyFormatter.format(pence / 100);

export const formatCompactMoney = (pence: Pence): string =>
  compactCurrencyFormatter.format(pence / 100);

export const sumPence = (values: Pence[]): Pence =>
  values.reduce((total, value) => total + value, 0);

export const poundsToPence = (value: string | number): Pence => {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
};

export const penceToInput = (value: Pence): string => (value / 100).toFixed(2);
