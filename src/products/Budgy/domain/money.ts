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
  if(typeof value==="number")return Number.isFinite(value)?Math.round(value*100):0;
  return parseMoneyInput(value);
};

export const penceToInput = (value: Pence): string => (value / 100).toFixed(2);

export const sanitizeMoneyEditingInput = (input: string): string => {
  const numeric = input.replace(/[£,\s]/g, "").replace(/[^\d.]/g, "");
  const [whole = "", ...fractionParts] = numeric.split(".");
  return fractionParts.length ? `${whole}.${fractionParts.join("")}` : whole;
};

export const parseMoneyInput=(input:string):Pence=>{
  const cleaned=input.trim().replace(/[£,\s]/g,"");
  if(!cleaned)return 0;
  const negative=cleaned.startsWith("-");
  const unsigned=cleaned.replace(/-/g,"");
  const[first="0",...rest]=unsigned.split(".");
  const whole=(first.replace(/\D/g,"")||"0").replace(/^0+(?=\d)/,"");
  const fractional=rest.join("").replace(/\D/g,"");
  let pence=Number(whole)*100+Number((fractional+"00").slice(0,2));
  if(fractional.length>2&&Number(fractional[2])>=5)pence+=1;
  const signed=negative?-pence:pence;
  return Number.isSafeInteger(signed)?signed:0;
};

export const formatMoneyInput=(pence:Pence):string=>new Intl.NumberFormat("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2}).format(pence/100);
