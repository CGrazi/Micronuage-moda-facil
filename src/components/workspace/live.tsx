// The app's screens — started from a Micronuage template, now yours to change.
import { useMemo, useState } from "react";
import { simulate } from "./lib";
import { brl, parseNumber } from "./lib";
import { str } from "./lib";
import { Avatar, AreaChart, Pill, Spark, hue, num } from "./ui";

/**
 * The interactive parts of the product apps. State lives in the browser: enough to try the tool for real
 * (move a card, approve a claim, simulate a loan) without a backend. Every default comes from the workspace props,
 * so what the customer edits in the builder is what the screen starts with.
 */

type Row = Record<string, unknown>;
const fmt = (n: number) => brl(Math.round(n * 100) / 100);
const field = "w-full rounded-lg border border-current/15 bg-transparent px-3 py-2 text-[13px] outline-none focus:border-[var(--rc-primary)]";
const card = "rounded-2xl border border-current/10 bg-[var(--rc-bg)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]";
const primaryBtn = "rounded-lg bg-[var(--rc-primary)] px-3 py-2 text-[12.5px] font-medium text-white hover:opacity-90";
const ghostBtn = "rounded-lg border border-current/15 px-3 py-2 text-[12.5px] font-medium hover:bg-current/5";

// ───────────────────────────── kanban (CRM, ATS, sprint) ─────────────────────────────

type Card = { id: number; title: string; meta: string; group: string; owner: string; value: string; date: string };

export function KanbanLive({ columns, items, series, seriesTitle, addLabel = "Adicionar", sum = "money" }: { columns: string[]; items: Row[]; series?: Row[]; seriesTitle?: string; addLabel?: string; sum?: "money" | "points" | "none" }) {
  const [cards, setCards] = useState<Card[]>(() => items.map((it, i) => ({ id: i, title: str(it.title), meta: str(it.meta), group: str(it.group), owner: str(it.owner), value: str(it.value), date: str(it.date) })));
  const [draft, setDraft] = useState("");
  const move = (id: number, dir: -1 | 1) =>
    setCards((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c;
        const at = columns.indexOf(c.group);
        const next = columns[Math.min(columns.length - 1, Math.max(0, at + dir))];
        return { ...c, group: next ?? c.group };
      }),
    );
  const add = () => {
    const title = draft.trim();
    if (!title) return;
    setCards((cs) => [...cs, { id: Date.now(), title, meta: "Adicionado agora", group: columns[0]!, owner: "", value: "", date: "hoje" }]);
    setDraft("");
  };
  return (
    <div className="space-y-4">
      {series && series.length > 1 && (
        <div className={card}>
          <p className="mb-2 text-[13px] font-semibold">{seriesTitle}</p>
          <AreaChart rows={series} labelA="Restante" labelB="Ideal" height={120} />
        </div>
      )}
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[46rem] gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((col, ci) => {
            const inCol = cards.filter((c) => c.group === col);
            const total = inCol.reduce((sum, c) => sum + num(c.value), 0);
            return (
              <div key={col} className="min-w-0 rounded-xl bg-current/[0.04] p-2">
                <div className="mb-2 flex items-center justify-between gap-2 px-1.5 pt-1">
                  <p className="flex min-w-0 items-center gap-1.5 text-[12px] font-semibold">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: `hsl(${(ci * 47 + 230) % 360} 70% 55%)` }} />
                    <span className="truncate">{col}</span>
                    <span className="opacity-40">{inCol.length}</span>
                  </p>
                  {total > 0 && sum !== "none" && <p className="shrink-0 text-[11px] font-medium opacity-55">{sum === "points" ? `${total} pts` : fmt(total)}</p>}
                </div>
                <div className="space-y-2">
                  {inCol.map((c) => (
                    <div key={c.id} className="rounded-lg border border-current/10 bg-[var(--rc-bg)] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                      <p className="text-[13px] font-semibold leading-snug">{c.title}</p>
                      <p className="mt-0.5 text-[11px] opacity-55">{c.meta}</p>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span className="text-[12.5px] font-semibold text-[var(--rc-primary)]">{c.value}</span>
                        <span className="flex items-center gap-1.5">
                          {c.date && <Pill tone={/hoje|atras|vence/i.test(c.date) ? "bad" : "mute"}>{c.date}</Pill>}
                          {c.owner && <Avatar name={c.owner} size={5} />}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between border-t border-current/10 pt-2 text-[11px]">
                        <button type="button" onClick={() => move(c.id, -1)} disabled={ci === 0} aria-label={`Mover ${c.title} para a etapa anterior`} className="rounded px-1.5 py-0.5 hover:bg-current/10 disabled:opacity-25">
                          ‹ voltar
                        </button>
                        <button type="button" onClick={() => move(c.id, 1)} disabled={ci === columns.length - 1} aria-label={`Mover ${c.title} para a próxima etapa`} className="rounded px-1.5 py-0.5 font-medium text-[var(--rc-primary)] hover:bg-current/10 disabled:opacity-25">
                          avançar ›
                        </button>
                      </div>
                    </div>
                  ))}
                  {ci === 0 && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        add();
                      }}
                      className="flex gap-1"
                    >
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`${addLabel}…`} className="min-w-0 flex-1 rounded-lg border border-dashed border-current/25 bg-transparent px-2.5 py-2 text-[12px] outline-none focus:border-[var(--rc-primary)]" />
                      <button type="submit" className="rounded-lg bg-[var(--rc-primary)] px-2.5 text-[14px] text-white" aria-label="Adicionar cartão">
                        +
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── proposta / orçamento ─────────────────────────────

type Line = { id: number; desc: string; qty: number; price: number };

export function QuoteLive({ lines: seed, settings, client }: { lines: Row[]; settings: Row[]; client: string }) {
  const setting = (name: string, fallback: number) => {
    const found = settings.find((s) => str(s.title).toLowerCase().startsWith(name));
    return found ? parseNumber(str(found.value), fallback) : fallback;
  };
  const [lines, setLines] = useState<Line[]>(() => seed.map((r, i) => ({ id: i, desc: str(r.title), qty: parseNumber(str(r.owner), 1), price: parseNumber(str(r.value), 0) })));
  const [discount, setDiscount] = useState(setting("desconto", 0));
  const [tax, setTax] = useState(setting("impostos", 0));
  const [validity, setValidity] = useState(setting("validade", 10));
  const [name, setName] = useState(client);
  const [status, setStatus] = useState("Rascunho");
  const [copied, setCopied] = useState(false);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const discountValue = (subtotal * discount) / 100;
  const taxValue = ((subtotal - discountValue) * tax) / 100;
  const total = subtotal - discountValue + taxValue;
  const update = (id: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const summary = `Proposta para ${name}\n${lines.map((l) => `${l.qty} × ${l.desc}: ${fmt(l.qty * l.price)}`).join("\n")}\nTotal: ${fmt(total)} (válida por ${validity} dias)`;
  const steps = ["Rascunho", "Enviada", "Visualizada", "Aceita"];
  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className={`${card} space-y-4`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {steps.map((s, i) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={`rounded-full px-3 py-1 text-[11.5px] font-medium ${status === s ? "bg-[var(--rc-primary)] text-white" : i < steps.indexOf(status) ? "bg-emerald-500/15 text-emerald-600" : "border border-current/15 opacity-65"}`}>
              {i + 1}. {s}
            </button>
          ))}
        </div>
        <label className="block text-[11.5px] font-medium opacity-70">
          Cliente
          <input value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-1`} />
        </label>
        <div>
          <p className="mb-2 text-[11.5px] font-medium opacity-70">Itens da proposta</p>
          <div className="space-y-2">
            {lines.map((l) => (
              <div key={l.id} className="grid grid-cols-[1fr_4rem_6.5rem_1.5rem] items-center gap-2">
                <input value={l.desc} onChange={(e) => update(l.id, { desc: e.target.value })} aria-label="Descrição" className={field} />
                <input type="number" min={0} value={l.qty} onChange={(e) => update(l.id, { qty: Math.max(0, Number(e.target.value)) })} aria-label="Quantidade" className={field} />
                <input type="number" min={0} step="0.01" value={l.price} onChange={(e) => update(l.id, { price: Math.max(0, Number(e.target.value)) })} aria-label="Valor unitário" className={field} />
                <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} aria-label="Remover item" className="text-[16px] opacity-45 hover:opacity-100">
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setLines((ls) => [...ls, { id: Date.now(), desc: "Novo item", qty: 1, price: 0 }])} className={`${ghostBtn} mt-2`}>
            + Adicionar item
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="text-[11.5px] font-medium opacity-70">
            Desconto (%)
            <input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))} className={`${field} mt-1`} />
          </label>
          <label className="text-[11.5px] font-medium opacity-70">
            Impostos (%)
            <input type="number" min={0} max={100} value={tax} onChange={(e) => setTax(Math.min(100, Math.max(0, Number(e.target.value))))} className={`${field} mt-1`} />
          </label>
          <label className="text-[11.5px] font-medium opacity-70">
            Validade (dias)
            <input type="number" min={1} value={validity} onChange={(e) => setValidity(Math.max(1, Number(e.target.value)))} className={`${field} mt-1`} />
          </label>
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl bg-white p-6 text-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Proposta comercial</p>
              <p className="mt-1 text-[17px] font-semibold">{name || "Cliente"}</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10.5px] font-medium text-neutral-600">{status}</span>
          </div>
          <div className="mt-5 divide-y divide-neutral-200 text-[12.5px]">
            {lines.map((l) => (
              <div key={l.id} className="flex items-baseline justify-between gap-3 py-2">
                <span className="min-w-0 flex-1">
                  {l.desc}
                  <span className="ml-1.5 text-neutral-400">
                    {l.qty} × {fmt(l.price)}
                  </span>
                </span>
                <span className="font-medium">{fmt(l.qty * l.price)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-neutral-200 pt-3 text-[12.5px]">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-neutral-500">
                <span>Desconto ({discount}%)</span>
                <span>− {fmt(discountValue)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-neutral-500">
                <span>Impostos ({tax}%)</span>
                <span>{fmt(taxValue)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between text-[18px] font-semibold text-neutral-900">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-neutral-400">Proposta válida por {validity} dias. Valores em reais.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(summary);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className={`${primaryBtn} flex-1`}
          >
            {copied ? "Resumo copiado" : "Copiar resumo"}
          </button>
          <button type="button" onClick={() => window.print()} className={`${ghostBtn} flex-1`}>
            Imprimir ou salvar em PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── financiamento (Price × SAC) ─────────────────────────────

export function LoanLive({ inputs, mode }: { inputs: Row[]; mode: string }) {
  const pick = (name: string, fallback: number) => {
    const f = inputs.find((r) => str(r.title).toLowerCase().startsWith(name));
    return f ? parseNumber(str(f.value), fallback) : fallback;
  };
  const [price, setPrice] = useState(pick("valor", 450000));
  const [downPct, setDownPct] = useState(pick("entrada", 20));
  const [rate, setRate] = useState(pick("taxa", 10.5));
  const [years, setYears] = useState(pick("prazo", 30));
  const [income, setIncome] = useState(pick("renda", 15000));
  const [system, setSystem] = useState<"price" | "sac">("price");
  const [extra, setExtra] = useState(mode === "extra" ? 500 : 0);
  const principal = Math.max(0, price - (price * downPct) / 100);
  const months = Math.max(1, Math.round(years * 12));
  const main = useMemo(() => simulate(principal, rate, months, system, extra), [principal, rate, months, system, extra]);
  const price_ = useMemo(() => simulate(principal, rate, months, "price"), [principal, rate, months]);
  const sac_ = useMemo(() => simulate(principal, rate, months, "sac"), [principal, rate, months]);
  const base = simulate(principal, rate, months, system, 0);
  const minIncome = main.first / 0.3;
  const rows = useMemo(() => {
    const out: { n: number; interest: number; amort: number; pay: number; balance: number }[] = [];
    const i = rate / 100 / 12;
    let bal = principal;
    for (let k = 0; k < Math.min(main.months, 12); k++) {
      const interest = bal * i;
      const baseP = system === "price" ? (i === 0 ? principal / months : (principal * i) / (1 - Math.pow(1 + i, -months))) : principal / months + interest;
      const amort = Math.min(bal, baseP - interest + extra);
      bal -= amort;
      out.push({ n: k + 1, interest, amort, pay: interest + amort, balance: bal });
    }
    return out;
  }, [principal, rate, months, system, extra, main.months]);
  const chartRows = main.balances.filter((_, i) => i % Math.max(1, Math.floor(main.balances.length / 8)) === 0).map((b, i) => ({ label: `${Math.round((i * Math.max(1, Math.floor(main.balances.length / 8))) / 12)}a`, a: String(Math.round(b / 1000)) }));
  const num_ = (label: string, value: number, set: (n: number) => void, step = 1, suffix = "") => (
    <label className="block text-[11.5px] font-medium opacity-70">
      {label}
      <div className="relative mt-1">
        <input type="number" min={0} step={step} value={value} onChange={(e) => set(Math.max(0, Number(e.target.value)))} className={field} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] opacity-45">{suffix}</span>}
      </div>
    </label>
  );
  return (
    <div className="grid gap-4 lg:grid-cols-[19rem_1fr]">
      <div className={`${card} space-y-3`}>
        {num_("Valor do imóvel (R$)", price, setPrice, 5000)}
        {num_("Entrada (%)", downPct, (n) => setDownPct(Math.min(90, n)), 1, "%")}
        {num_("Taxa de juros nominal (% a.a.)", rate, setRate, 0.1, "% a.a.")}
        {num_("Prazo (anos)", years, (n) => setYears(Math.min(35, Math.max(1, n))), 1, "anos")}
        {num_("Renda mensal (R$)", income, setIncome, 500)}
        {mode !== "compare" && (
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-current/[0.06] p-1 text-[12px]">
            {(["price", "sac"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setSystem(s)} className={`rounded-md py-1.5 font-medium ${system === s ? "bg-[var(--rc-primary)] text-white" : "opacity-65"}`}>
                {s === "price" ? "Price (parcela fixa)" : "SAC (parcela cai)"}
              </button>
            ))}
          </div>
        )}
        {mode === "extra" && num_("Amortização extra por mês (R$)", extra, setExtra, 100)}
        <p className="text-[10.5px] leading-snug opacity-50">Simulação com taxa nominal dividida por 12. Não inclui seguros, tarifas nem taxa de avaliação; o valor final é o da proposta do banco.</p>
      </div>
      <div className="space-y-4">
        {mode === "compare" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "Price", sim: price_, note: "Parcela igual do início ao fim" },
              { name: "SAC", sim: sac_, note: "Começa mais alta e diminui todo mês" },
            ].map((x) => (
              <div key={x.name} className={card}>
                <p className="text-[12px] font-semibold opacity-60">{x.name}</p>
                <p className="mt-1 text-[26px] font-semibold tracking-[-0.03em]">{fmt(x.sim.first)}</p>
                <p className="text-[11.5px] opacity-55">{x.note}</p>
                <div className="mt-3 space-y-1 text-[12.5px]">
                  <div className="flex justify-between"><span className="opacity-60">Última parcela</span><span className="font-medium">{fmt(x.sim.last)}</span></div>
                  <div className="flex justify-between"><span className="opacity-60">Total de juros</span><span className="font-medium">{fmt(x.sim.totalInterest)}</span></div>
                  <div className="flex justify-between"><span className="opacity-60">Total pago</span><span className="font-medium">{fmt(x.sim.total)}</span></div>
                </div>
              </div>
            ))}
            <p className="col-span-full rounded-xl bg-emerald-500/10 p-3 text-[12.5px] text-emerald-600">
              O SAC paga {fmt(Math.max(0, price_.totalInterest - sac_.totalInterest))} a menos de juros, mas exige uma renda de {fmt(sac_.first / 0.3)} no começo. O Price cabe em uma renda de {fmt(price_.first / 0.3)}.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={card}>
              <p className="text-[11.5px] opacity-55">{system === "price" ? "Parcela" : "Primeira parcela"}</p>
              <p className="mt-1 text-[26px] font-semibold tracking-[-0.03em]">{fmt(main.first)}</p>
              {system === "sac" && <p className="text-[11px] opacity-50">Última: {fmt(main.last)}</p>}
            </div>
            <div className={card}>
              <p className="text-[11.5px] opacity-55">Total de juros</p>
              <p className="mt-1 text-[26px] font-semibold tracking-[-0.03em]">{fmt(main.totalInterest)}</p>
              <p className="text-[11px] opacity-50">Total pago {fmt(main.total)}</p>
            </div>
            <div className={card}>
              <p className="text-[11.5px] opacity-55">Renda mínima (parcela até 30%)</p>
              <p className={`mt-1 text-[26px] font-semibold tracking-[-0.03em] ${income >= minIncome ? "text-emerald-500" : "text-rose-500"}`}>{fmt(minIncome)}</p>
              <p className="text-[11px] opacity-50">{income >= minIncome ? "Sua renda comporta a parcela" : "A parcela passa de 30% da sua renda"}</p>
            </div>
          </div>
        )}
        {extra > 0 && mode !== "compare" && (
          <p className="rounded-xl bg-[var(--rc-primary)]/10 p-3 text-[12.5px]">
            Com {fmt(extra)} a mais por mês, você quita em {Math.floor(main.months / 12)} anos e {main.months % 12} meses (em vez de {Math.round(months / 12)} anos) e economiza {fmt(Math.max(0, base.totalInterest - main.totalInterest))} de juros.
          </p>
        )}
        <div className={card}>
          <p className="mb-2 text-[13px] font-semibold">Saldo devedor ao longo do tempo (R$ mil)</p>
          {chartRows.length > 1 && <AreaChart rows={chartRows} labelA="Saldo devedor" height={140} />}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-current/10 text-[12px]">
          <div className="grid min-w-[30rem] grid-cols-5 gap-2 bg-current/[0.04] px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] opacity-55">
            <span>Mês</span><span>Parcela</span><span>Juros</span><span>Amortização</span><span>Saldo</span>
          </div>
          {rows.map((r) => (
            <div key={r.n} className="grid min-w-[30rem] grid-cols-5 gap-2 border-t border-current/10 px-4 py-2">
              <span>{r.n}</span><span className="font-medium">{fmt(r.pay)}</span><span className="opacity-65">{fmt(r.interest)}</span><span className="opacity-65">{fmt(r.amort)}</span><span>{fmt(r.balance)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── controle financeiro pessoal ─────────────────────────────

type Bill = { id: number; title: string; category: string; amount: number; day: string; paid: boolean };

export function BudgetLive({ incomes, bills: seed }: { incomes: Row[]; bills: Row[] }) {
  const [bills, setBills] = useState<Bill[]>(() => seed.map((b, i) => ({ id: i, title: str(b.title), category: str(b.meta), amount: parseNumber(str(b.value), 0), day: str(b.date), paid: /pago/i.test(str(b.group)) })));
  const [draft, setDraft] = useState({ title: "", amount: "", category: "Casa" });
  const income = incomes.reduce((s, r) => s + parseNumber(str(r.value), 0), 0);
  const paid = bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const toPay = bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);
  const free = income - paid - toPay;
  const categories = [...new Set(bills.map((b) => b.category))];
  const byCat = categories.map((c) => ({ c, v: bills.filter((b) => b.category === c).reduce((s, b) => s + b.amount, 0) }));
  const totalSpend = byCat.reduce((s, x) => s + x.v, 0) || 1;
  let cursor = 0;
  const stops = byCat.map((x) => {
    const from = (cursor / totalSpend) * 360;
    cursor += x.v;
    return `hsl(${hue(x.c)} 60% 50%) ${from}deg ${(cursor / totalSpend) * 360}deg`;
  });
  const add = () => {
    const amount = parseNumber(draft.amount, 0);
    if (!draft.title.trim() || amount <= 0) return;
    setBills((bs) => [...bs, { id: Date.now(), title: draft.title.trim(), category: draft.category, amount, day: "dia 25", paid: false }]);
    setDraft({ ...draft, title: "", amount: "" });
  };
  return (
    <div className="space-y-4">
      <div className={`${card} flex flex-wrap items-end justify-between gap-4`}>
        <div>
          <p className="text-[12px] opacity-55">Disponível agora, descontando o que você já pagou</p>
          <p className={`mt-1 text-[38px] font-semibold leading-none tracking-[-0.04em] ${income - paid < 0 ? "text-rose-500" : ""}`} style={{ fontFamily: "var(--rc-heading-font)" }}>
            {fmt(income - paid)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[12px] sm:grid-cols-4">
          <div><p className="opacity-55">Entrou</p><p className="text-[15px] font-semibold">{fmt(income)}</p></div>
          <div><p className="opacity-55">Já pago</p><p className="text-[15px] font-semibold text-emerald-500">{fmt(paid)}</p></div>
          <div><p className="opacity-55">A pagar</p><p className="text-[15px] font-semibold text-amber-500">{fmt(toPay)}</p></div>
          <div><p className="opacity-55">Sobra do ciclo</p><p className={`text-[15px] font-semibold ${free < 0 ? "text-rose-500" : ""}`}>{fmt(free)}</p></div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className={card}>
          <p className="text-[13px] font-semibold">Contas do ciclo</p>
          <div className="mt-2 divide-y divide-current/10">
            {bills.map((b) => (
              <label key={b.id} className="flex cursor-pointer items-center gap-3 py-2.5 text-[12.5px]">
                <input type="checkbox" checked={b.paid} onChange={() => setBills((bs) => bs.map((x) => (x.id === b.id ? { ...x, paid: !x.paid } : x)))} className="size-4 accent-[var(--rc-primary)]" />
                <span className={`min-w-0 flex-1 ${b.paid ? "line-through opacity-45" : ""}`}>
                  <span className="block truncate font-medium">{b.title}</span>
                  <span className="block text-[11px] opacity-50">{b.category} · {b.day}</span>
                </span>
                <span className="font-semibold">{fmt(b.amount)}</span>
              </label>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mt-3 grid grid-cols-[1fr_6rem_6.5rem_auto] gap-2">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Nova conta" className={field} />
            <input value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} placeholder="Valor" inputMode="decimal" className={field} />
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={field}>
              {[...categories, "Outros"].filter((c, i, a) => a.indexOf(c) === i).map((c) => <option key={c} className="text-neutral-900">{c}</option>)}
            </select>
            <button type="submit" className={primaryBtn}>Adicionar</button>
          </form>
        </div>
        <div className={card}>
          <p className="text-[13px] font-semibold">Para onde vai o dinheiro</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="relative size-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(", ")})` }}>
              <div className="absolute inset-[26%] rounded-full bg-[var(--rc-bg)]" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              {byCat.map((x) => (
                <div key={x.c} className="flex items-center gap-2 text-[11.5px]">
                  <span className="size-2 shrink-0 rounded-sm" style={{ background: `hsl(${hue(x.c)} 60% 50%)` }} />
                  <span className="min-w-0 flex-1 truncate opacity-75">{x.c}</span>
                  <span className="font-medium">{Math.round((x.v / totalSpend) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 rounded-lg bg-current/[0.05] p-3 text-[11.5px] leading-snug opacity-75">Regra 50-30-20: até 50% em necessidades, 30% em desejos e 20% em reserva. Você guardou {Math.max(0, Math.round((free / (income || 1)) * 100))}% neste ciclo.</p>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── mesas e salas ─────────────────────────────

type Desk = { id: string; zone: string; state: "free" | "busy" | "mine"; who: string };

export function DeskLive({ desks: seed, people }: { desks: Row[]; people: Row[] }) {
  const [desks, setDesks] = useState<Desk[]>(() => seed.map((d) => ({ id: str(d.title), zone: str(d.meta), state: /ocupad/i.test(str(d.group)) ? "busy" : "free", who: str(d.owner) })));
  const [day, setDay] = useState("Seg");
  const zones = [...new Set(desks.map((d) => d.zone))];
  const mine = desks.find((d) => d.state === "mine");
  const toggle = (id: string) =>
    setDesks((ds) => {
      const target = ds.find((d) => d.id === id);
      if (!target || target.state === "busy") return ds;
      if (target.state === "mine") return ds.map((d) => (d.id === id ? { ...d, state: "free", who: "" } : d));
      // Reserving a desk releases the one you held before: one desk per person per day.
      return ds.map((d) => (d.id === id ? { ...d, state: "mine", who: "Você" } : d.state === "mine" ? { ...d, state: "free", who: "" } : d));
    });
  const free = desks.filter((d) => d.state === "free").length;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
      <div className={`${card} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {["Seg", "Ter", "Qua", "Qui", "Sex"].map((d) => (
              <button key={d} type="button" onClick={() => setDay(d)} className={`rounded-full px-3 py-1 text-[11.5px] font-medium ${day === d ? "bg-[var(--rc-primary)] text-white" : "border border-current/15 opacity-65"}`}>{d}</button>
            ))}
          </div>
          <p className="text-[12px] opacity-60">{free} mesas livres · {mine ? `Você está na ${mine.id}` : "Toque em uma mesa livre para reservar"}</p>
        </div>
        {zones.map((z) => (
          <div key={z}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] opacity-45">{z}</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {desks.filter((d) => d.zone === z).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggle(d.id)}
                  disabled={d.state === "busy"}
                  aria-label={`Mesa ${d.id}: ${d.state === "free" ? "livre" : d.state === "mine" ? "reservada por você" : `ocupada por ${d.who}`}`}
                  className={`rounded-lg border p-2 text-center text-[11px] ${d.state === "free" ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20" : d.state === "mine" ? "border-[var(--rc-primary)] bg-[var(--rc-primary)] text-white" : "cursor-not-allowed border-current/10 bg-current/[0.06] opacity-60"}`}
                >
                  <span className="block text-[12.5px] font-semibold">{d.id}</span>
                  <span className="block truncate text-[10px]">{d.state === "free" ? "livre" : d.who}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <aside className={card}>
        <p className="text-[13px] font-semibold">Quem vem {day === "Seg" ? "na segunda" : `na ${day.toLowerCase()}`}</p>
        <div className="mt-3 space-y-2.5">
          {people.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[12.5px]">
              <Avatar name={str(p.title)} size={7} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{str(p.title)}</span>
                <span className="block truncate text-[11px] opacity-55">{str(p.meta)}</span>
              </span>
              <Pill tone={/casa|remoto/i.test(str(p.value)) ? "mute" : "good"}>{str(p.value)}</Pill>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ───────────────────────────── reembolso com aprovação ─────────────────────────────

type Claim = { id: number; title: string; who: string; category: string; amount: number; date: string; status: string; note: string };
const FLOW = ["Aguardando gestor", "Aguardando financeiro", "Aprovada"];

export function ApprovalsLive({ claims: seed, limits, role: initialRole }: { claims: Row[]; limits: Row[]; role: string }) {
  const [claims, setClaims] = useState<Claim[]>(() => seed.map((c, i) => ({ id: i, title: str(c.title), who: str(c.owner), category: str(c.meta), amount: parseNumber(str(c.value), 0), date: str(c.date), status: str(c.group), note: "" })));
  const [role, setRole] = useState(initialRole);
  const [draft, setDraft] = useState({ title: "", amount: "", category: "Transporte" });
  const limit = (cat: string) => {
    const l = limits.find((x) => str(x.title).toLowerCase() === cat.toLowerCase());
    return l ? parseNumber(str(l.value), Infinity) : Infinity;
  };
  const act = (id: number, ok: boolean) =>
    setClaims((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c;
        if (!ok) return { ...c, status: "Recusada" };
        const at = FLOW.indexOf(c.status);
        return { ...c, status: FLOW[Math.min(FLOW.length - 1, at + 1)]! };
      }),
    );
  const mineTurn = (c: Claim) => (role === "Gestor" ? c.status === FLOW[0] : role === "Financeiro" ? c.status === FLOW[1] : false);
  const submit = () => {
    const amount = parseNumber(draft.amount, 0);
    if (!draft.title.trim() || amount <= 0) return;
    setClaims((cs) => [{ id: Date.now(), title: draft.title.trim(), who: "Você", category: draft.category, amount, date: "hoje", status: FLOW[0]!, note: "" }, ...cs]);
    setDraft({ ...draft, title: "", amount: "" });
  };
  const totals = {
    open: claims.filter((c) => c.status.startsWith("Aguardando")).reduce((s, c) => s + c.amount, 0),
    approved: claims.filter((c) => c.status === "Aprovada").reduce((s, c) => s + c.amount, 0),
    refused: claims.filter((c) => c.status === "Recusada").length,
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[["Em análise", fmt(totals.open)], ["Aprovado no mês", fmt(totals.approved)], ["Recusadas", String(totals.refused)]].map(([l, v]) => (
          <div key={l} className={card}><p className="text-[11px] opacity-55">{l}</p><p className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">{v}</p></div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[12px]">
        <span className="opacity-55">Ver como</span>
        {["Colaborador", "Gestor", "Financeiro"].map((r) => (
          <button key={r} type="button" onClick={() => setRole(r)} className={`rounded-lg px-3 py-1.5 text-[12px] font-medium ${role === r ? "bg-[var(--rc-primary)] text-white" : "border border-current/15 opacity-70"}`}>{r}</button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-x-auto rounded-2xl border border-current/10 text-[12.5px]">
          {claims.map((c) => {
            const over = c.amount > limit(c.category);
            return (
              <div key={c.id} className="grid min-w-[34rem] grid-cols-[1.6fr_.9fr_1.1fr_auto] items-center gap-3 border-b border-current/10 px-4 py-3 last:border-0">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{c.title}</span>
                  <span className="block truncate text-[11px] opacity-55">{c.who} · {c.category} · {c.date}</span>
                  {over && <span className="text-[10.5px] text-amber-500">Acima do limite da política ({fmt(limit(c.category))})</span>}
                </span>
                <span className="font-semibold">{fmt(c.amount)}</span>
                <Pill>{c.status}</Pill>
                <span className="flex gap-1.5">
                  {mineTurn(c) ? (
                    <>
                      <button type="button" onClick={() => act(c.id, true)} className="rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-white">Aprovar</button>
                      <button type="button" onClick={() => act(c.id, false)} className="rounded-md border border-rose-500/40 px-2.5 py-1 text-[11px] font-medium text-rose-500">Recusar</button>
                    </>
                  ) : (
                    <span className="w-[8.5rem]" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div className={`${card} space-y-3`}>
          <p className="text-[13px] font-semibold">Nova solicitação</p>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ex.: táxi para reunião com cliente" className={field} />
          <div className="grid grid-cols-2 gap-2">
            <input value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} placeholder="Valor (R$)" inputMode="decimal" className={field} />
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={field}>
              {limits.map((l) => <option key={str(l.title)} className="text-neutral-900">{str(l.title)}</option>)}
            </select>
          </div>
          <button type="button" onClick={submit} className={`${primaryBtn} w-full`}>Enviar para aprovação</button>
          <p className="text-[11px] leading-snug opacity-55">Passa pelo gestor e depois pelo financeiro. Guarde a nota fiscal ou o recibo: sem comprovante, o reembolso não é pago.</p>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── saúde da carteira ─────────────────────────────

type Account = { name: string; segment: string; arr: number; score: number };

const DRIVERS = ["Uso do produto", "Amplitude de recursos", "Engajamento do contato principal", "Chamados de suporte", "Pagamentos em dia", "Satisfação (NPS)"];

export function HealthLive({ accounts: seed }: { accounts: Row[] }) {
  const accounts: Account[] = useMemo(() => seed.map((a) => ({ name: str(a.title), segment: str(a.group), arr: parseNumber(str(a.value), 0), score: parseNumber(str(a.owner), 50) })), [seed]);
  const segments = [...new Set(accounts.map((a) => a.segment))];
  const [segment, setSegment] = useState("Todos");
  const [selected, setSelected] = useState<string>(accounts[0]?.name ?? "");
  const shown = accounts.filter((a) => segment === "Todos" || a.segment === segment);
  const cur = accounts.find((a) => a.name === selected) ?? accounts[0];
  const maxArr = Math.max(...accounts.map((a) => a.arr), 1);
  const color = (s: number) => (s >= 70 ? "#10b981" : s >= 50 ? "#f59e0b" : "#e11d48");
  const drivers = cur ? DRIVERS.map((d, i) => ({ d, v: Math.max(5, Math.min(100, Math.round(cur.score + ((hue(cur.name + d) % 41) - 20) + (i % 2 ? -4 : 4)))) })) : [];
  const trendPts = cur ? Array.from({ length: 13 }, (_, i) => Math.max(5, Math.min(98, cur.score + (12 - i) * (cur.score < 50 ? 1.8 : -0.8) + ((hue(cur.name + i) % 9) - 4)))) : [];
  const risk = accounts.filter((a) => a.score < 50).sort((a, b) => a.score - b.score);
  const atRisk = risk.reduce((s, a) => s + a.arr, 0);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-4">
        <div className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-semibold">Cada ponto é uma conta: quanto mais à direita, mais saudável</p>
            <div className="flex flex-wrap gap-1.5">
              {["Todos", ...segments].map((s) => (
                <button key={s} type="button" onClick={() => setSegment(s)} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${segment === s ? "bg-[var(--rc-primary)] text-white" : "border border-current/15 opacity-65"}`}>{s}</button>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 600 220" className="mt-3 w-full" role="img" aria-label="Contas por nota de saúde">
            {[0, 25, 50, 75, 100].map((t) => (
              <g key={t}>
                <line x1={t * 5.6 + 20} x2={t * 5.6 + 20} y1="10" y2="190" stroke="currentColor" strokeOpacity="0.08" />
                <text x={t * 5.6 + 20} y="210" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.5">{t}</text>
              </g>
            ))}
            {shown.map((a, i) => {
              const r = 6 + (a.arr / maxArr) * 16;
              const y = 100 + (((hue(a.name) % 100) - 50) / 50) * 70 + (i % 2 ? 6 : -6);
              return (
                <g key={a.name} onClick={() => setSelected(a.name)} className="cursor-pointer">
                  <circle cx={a.score * 5.6 + 20} cy={y} r={r} fill={color(a.score)} opacity={selected === a.name ? 1 : 0.7} stroke={selected === a.name ? "currentColor" : "none"} strokeWidth="2" />
                </g>
              );
            })}
          </svg>
          <div className="flex justify-between text-[10.5px] opacity-50"><span>Em risco</span><span>Estável</span><span>Saudável</span></div>
        </div>
        <div className={card}>
          <p className="text-[13px] font-semibold">Lista de atenção: {risk.length} contas, {fmt(atRisk)} em risco</p>
          <div className="mt-2 divide-y divide-current/10">
            {risk.map((a) => (
              <button key={a.name} type="button" onClick={() => setSelected(a.name)} className="flex w-full items-center gap-3 py-2.5 text-left text-[12.5px]">
                <span className="min-w-0 flex-1"><span className="block truncate font-medium">{a.name}</span><span className="block text-[11px] opacity-50">{a.segment} · {fmt(a.arr)} por ano</span></span>
                <Spark points={Array.from({ length: 9 }, (_, i) => 60 - i * (a.score < 40 ? 4 : 2) + (hue(a.name + i) % 7))} color="#e11d48" className="h-6 w-16" />
                <span className="w-9 text-right text-[15px] font-semibold text-rose-500">{a.score}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {cur && (
        <aside className={`${card} h-fit space-y-4`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[15px] font-semibold">{cur.name}</p>
              <p className="text-[11.5px] opacity-55">{cur.segment} · {fmt(cur.arr)} por ano</p>
            </div>
            <span className="rounded-xl px-2.5 py-1 text-[20px] font-semibold text-white" style={{ background: color(cur.score) }}>{cur.score}</span>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] opacity-45">Por que essa nota</p>
            <div className="space-y-2">
              {drivers.map((x) => (
                <div key={x.d}>
                  <div className="flex justify-between text-[11.5px]"><span className="opacity-70">{x.d}</span><span className="font-medium">{x.v}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-current/10"><div className="h-full rounded-full" style={{ width: `${x.v}%`, background: color(x.v) }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] opacity-45">Últimas 13 semanas</p>
            <Spark points={trendPts} color={color(cur.score)} className="h-14 w-full" />
          </div>
        </aside>
      )}
    </div>
  );
}

// ───────────────────────────── cobrança de MEI ─────────────────────────────

type InvLine = { id: number; desc: string; qty: number; price: number };

export function InvoiceLive({ lines: seed, client, business, taxNote }: { lines: Row[]; client: string; business: string; taxNote: string }) {
  const [lines, setLines] = useState<InvLine[]>(() => seed.map((r, i) => ({ id: i, desc: str(r.title), qty: parseNumber(str(r.owner), 1), price: parseNumber(str(r.value), 0) })));
  const [name, setName] = useState(client);
  const [due, setDue] = useState("10/10");
  const [method, setMethod] = useState("Pix");
  const [sent, setSent] = useState(false);
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const upd = (id: number, patch: Partial<InvLine>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className={`${card} space-y-4`}>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-[11.5px] font-medium opacity-70">Cliente<input value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-1`} /></label>
          <label className="text-[11.5px] font-medium opacity-70">Vencimento<input value={due} onChange={(e) => setDue(e.target.value)} className={`${field} mt-1`} /></label>
        </div>
        <div className="space-y-2">
          {lines.map((l) => (
            <div key={l.id} className="grid grid-cols-[1fr_3.5rem_6.5rem_1.5rem] items-center gap-2">
              <input value={l.desc} onChange={(e) => upd(l.id, { desc: e.target.value })} aria-label="Serviço" className={field} />
              <input type="number" min={1} value={l.qty} onChange={(e) => upd(l.id, { qty: Math.max(1, Number(e.target.value)) })} aria-label="Quantidade" className={field} />
              <input type="number" min={0} step="0.01" value={l.price} onChange={(e) => upd(l.id, { price: Math.max(0, Number(e.target.value)) })} aria-label="Valor" className={field} />
              <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} aria-label="Remover" className="text-[16px] opacity-45 hover:opacity-100">×</button>
            </div>
          ))}
          <button type="button" onClick={() => setLines((ls) => [...ls, { id: Date.now(), desc: "Serviço", qty: 1, price: 0 }])} className={ghostBtn}>+ Adicionar serviço</button>
        </div>
        <div>
          <p className="mb-1 text-[11.5px] font-medium opacity-70">Forma de pagamento</p>
          <div className="flex gap-1.5">{["Pix", "Boleto", "Cartão"].map((m) => <button key={m} type="button" onClick={() => setMethod(m)} className={`rounded-full px-3 py-1 text-[11.5px] font-medium ${method === m ? "bg-[var(--rc-primary)] text-white" : "border border-current/15 opacity-65"}`}>{m}</button>)}</div>
        </div>
        <button type="button" onClick={() => setSent(true)} className={`${primaryBtn} w-full`}>{sent ? `Cobrança enviada para ${name}` : "Enviar cobrança"}</button>
      </div>
      <div className="rounded-2xl bg-white p-6 text-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Cobrança</p>
        <p className="mt-1 text-[17px] font-semibold">{business}</p>
        <p className="mt-4 text-[12px] text-neutral-500">Para</p>
        <p className="text-[14px] font-medium">{name}</p>
        <div className="mt-4 divide-y divide-neutral-200 text-[12.5px]">
          {lines.map((l) => (
            <div key={l.id} className="flex items-baseline justify-between gap-3 py-2"><span>{l.desc}<span className="ml-1.5 text-neutral-400">{l.qty} × {fmt(l.price)}</span></span><span className="font-medium">{fmt(l.qty * l.price)}</span></div>
          ))}
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-neutral-200 pt-3 text-[18px] font-semibold"><span>Total</span><span>{fmt(total)}</span></div>
        <p className="mt-3 text-[11.5px] text-neutral-500">Vence em {due} · Pagamento por {method}</p>
        <p className="mt-2 text-[10.5px] leading-snug text-neutral-400">{taxNote}</p>
      </div>
    </div>
  );
}

// ───────────────────────────── calendário de conteúdo ─────────────────────────────

type Post = { id: number; title: string; channel: string; status: string; day: number; owner: string };
const STATUS = ["Ideia", "Roteiro", "Agendado", "Publicado"];

export function CalendarLive({ posts: seed, monthLabel, startsOn }: { posts: Row[]; monthLabel: string; startsOn: number }) {
  const [posts, setPosts] = useState<Post[]>(() => seed.map((p, i) => ({ id: i, title: str(p.title), channel: str(p.meta), status: str(p.group), day: parseNumber(str(p.date), 1), owner: str(p.owner) })));
  const [day, setDay] = useState(posts[0]?.day ?? 1);
  const channels = [...new Set(posts.map((p) => p.channel))];
  const cells = Array.from({ length: startsOn + 30 }, (_, i) => (i < startsOn ? 0 : i - startsOn + 1));
  const advance = (id: number) => setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, status: STATUS[Math.min(STATUS.length - 1, STATUS.indexOf(p.status) + 1)]! } : p)));
  const selected = posts.filter((p) => p.day === day);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className={card}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-semibold">{monthLabel}</p>
          <div className="flex flex-wrap gap-2 text-[11px]">{channels.map((c) => <span key={c} className="flex items-center gap-1.5 opacity-75"><span className="size-2 rounded-sm" style={{ background: `hsl(${hue(c)} 62% 48%)` }} />{c}</span>)}</div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-medium opacity-45">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => <span key={d}>{d}</span>)}</div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => (
            <button key={i} type="button" disabled={!d} onClick={() => d && setDay(d)} className={`min-h-[3.6rem] rounded-lg border p-1 text-left text-[11px] ${!d ? "border-transparent" : day === d ? "border-[var(--rc-primary)] bg-[var(--rc-primary)]/8" : "border-current/10 hover:bg-current/5"}`}>
              {d > 0 && <span className="opacity-55">{d}</span>}
              <span className="mt-0.5 flex flex-wrap gap-0.5">{posts.filter((p) => p.day === d).map((p) => <span key={p.id} className="size-2 rounded-sm" style={{ background: `hsl(${hue(p.channel)} 62% 48%)` }} title={p.title} />)}</span>
            </button>
          ))}
        </div>
      </div>
      <aside className={`${card} h-fit`}>
        <p className="text-[13px] font-semibold">Dia {day}</p>
        <div className="mt-3 space-y-3">
          {selected.length === 0 && <p className="text-[12px] opacity-55">Nada planejado para este dia.</p>}
          {selected.map((p) => (
            <div key={p.id} className="rounded-xl border border-current/10 p-3">
              <p className="text-[12.5px] font-semibold leading-snug">{p.title}</p>
              <p className="mt-0.5 text-[11px] opacity-55">{p.channel} · {p.owner}</p>
              <div className="mt-2 flex items-center justify-between">
                <Pill>{p.status}</Pill>
                {p.status !== "Publicado" && <button type="button" onClick={() => advance(p.id)} className="text-[11.5px] font-medium text-[var(--rc-primary)]">Avançar para {STATUS[STATUS.indexOf(p.status) + 1]?.toLowerCase()} ›</button>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-1.5 text-center">
          {STATUS.map((s) => <div key={s} className="rounded-lg bg-current/[0.05] py-2"><p className="text-[15px] font-semibold">{posts.filter((p) => p.status === s).length}</p><p className="text-[9.5px] opacity-55">{s}</p></div>)}
        </div>
      </aside>
    </div>
  );
}
