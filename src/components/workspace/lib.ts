// The app's screens — started from a Micronuage template, now yours to change.
/** Small helpers the screens share: reading the data, links, money and numbers. */

export const str = (v: unknown, fallback = "") => (typeof v === "string" && v.length > 0 ? v : fallback);
export const list = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? (v as Record<string, unknown>[]) : []);

/** A page of this app: its path (the screens only link to pages that exist). */
export function href(path: string, pathPrefix = ""): string {
  return pathPrefix + path;
}

export type Lang = "pt" | "en" | "es";

export function parseNumber(input: unknown, fallback = 0): number {
  if (typeof input === "number") return Number.isFinite(input) ? input : fallback;
  if (typeof input !== "string") return fallback;
  let s = input.replace(/[^\d.,-]/g, "");
  if (!s) return fallback;
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  // "20.000" and "1.234.567" are Brazilian thousands, "0.95" and "4.8" are decimals: a dot followed by exactly three digits groups thousands.
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

export function brl(value: number, lang: Lang = "pt"): string {
  const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "BRL", maximumFractionDigits: value >= 1000 ? 0 : 2 }).format(value);
}

export type Sim = { payment: number; first: number; last: number; totalInterest: number; total: number; balances: number[]; months: number };

/**
 * Financing schedule. Price: fixed instalment. SAC: fixed amortisation, falling instalment.
 * `annualPct` is the nominal yearly rate (divided by 12, as banks quote it); `extra` is a monthly extra amortisation.
 */
export function simulate(principal: number, annualPct: number, months: number, system: "price" | "sac", extra = 0): Sim {
  const i = annualPct / 100 / 12;
  const balances = [principal];
  let balance = principal;
  let interestTotal = 0;
  let paid = 0;
  let first = 0;
  let last = 0;
  const price = i === 0 ? principal / months : (principal * i) / (1 - Math.pow(1 + i, -months));
  const sac = principal / months;
  let k = 0;
  while (balance > 0.005 && k < months) {
    const interest = balance * i;
    const base = system === "price" ? price : sac + interest;
    const amort = Math.min(balance, base - interest + extra);
    const pay = interest + amort;
    if (k === 0) first = pay;
    last = pay;
    balance -= amort;
    interestTotal += interest;
    paid += pay;
    balances.push(Math.max(0, balance));
    k++;
  }
  return { payment: system === "price" ? price : first, first, last, totalInterest: interestTotal, total: paid, balances, months: k };
}
