// The app's screens — started from a Micronuage template, now yours to change.
import { parseNumber, brl } from "./lib";
import { str } from "./lib";

type Row = Record<string, unknown>;

export const TONES = {
  good: "bg-emerald-500/15 text-emerald-600",
  warn: "bg-amber-500/15 text-amber-600",
  bad: "bg-rose-500/15 text-rose-600",
  info: "bg-sky-500/15 text-sky-600",
  mute: "bg-current/10 opacity-70",
} as const;

export function toneOf(text: string): keyof typeof TONES {
  if (/receb|pago|paga|conclu|assinad|resolv|fechad|ganho|ativo|ok\b|entreg|conciliad|dispon|aprovad|ativa/i.test(text)) return "good";
  if (/atras|vencid|urgent|cancel|perdid|falta|abaixo|cr[ií]tic|recus/i.test(text)) return "bad";
  if (/aguard|pendent|em aberto|espera|rascunho|separ|prazo|a pagar|proposta|analise|análise|f[ée]rias|enviad/i.test(text)) return "warn";
  if (/novo|lead|qualific|fatur|em andamento|fila|aberto/i.test(text)) return "info";
  return "mute";
}

export function Pill({ children, tone }: { children: string; tone?: keyof typeof TONES }) {
  if (!children) return null;
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${TONES[tone ?? toneOf(children)]}`}>{children}</span>;
}

export function hue(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export function Avatar({ name, size = 7 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  const px = size * 4;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: px, height: px, fontSize: Math.max(9, px * 0.38), background: `hsl(${hue(name)} 55% 45%)` }}
    >
      {initials || "?"}
    </span>
  );
}

export const num = (v: unknown) => parseNumber(str(v));
export const money = (n: number) => brl(n);

/** Deterministic, gently trending points so a KPI tile can carry a sparkline without inventing data fields. */
export function trend(seed: string, up: boolean, points = 9): number[] {
  let h = hue(seed) + 17;
  const out: number[] = [];
  let level = 50;
  for (let i = 0; i < points; i++) {
    h = (h * 1103515245 + 12345) % 2147483647;
    level += (up ? 4 : -4) + ((h % 15) - 7);
    out.push(Math.max(8, Math.min(92, level)));
  }
  return out;
}

export function Spark({ points, color = "var(--rc-primary)", className = "h-8 w-full" }: { points: number[]; color?: string; className?: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = 100 / (points.length - 1);
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(30 - ((v - min) / span) * 26 - 2).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d={`${d} L100,30 L0,30 Z`} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function KpiTiles({ kpis, spark = true, tone = "card" }: { kpis: Row[]; spark?: boolean; tone?: "card" | "flat" }) {
  if (!kpis.length) return null;
  return (
    <div className={`grid grid-cols-2 gap-3 ${kpis.length >= 4 ? "lg:grid-cols-4" : kpis.length === 3 ? "lg:grid-cols-3" : ""}`}>
      {kpis.slice(0, 4).map((k, i) => {
        const delta = str(k.delta);
        const down = delta.startsWith("-");
        return (
          <div key={i} className={`rounded-xl p-3.5 ${tone === "card" ? "border border-current/10 bg-[var(--rc-bg)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]" : "bg-current/[0.04]"}`}>
            <p className="truncate text-[11px] font-medium opacity-55">{str(k.label)}</p>
            <div className="mt-1.5 flex items-end justify-between gap-2">
              <p className="text-[24px] font-semibold leading-none tracking-[-0.03em]" style={{ fontFamily: "var(--rc-heading-font)" }}>
                {str(k.value)}
              </p>
              {spark && <Spark points={trend(str(k.label), !down)} color={down ? "#e11d48" : "var(--rc-primary)"} className="h-7 w-16 shrink-0" />}
            </div>
            {delta && <p className={`mt-1.5 text-[11px] font-medium ${down ? "text-rose-500" : "text-emerald-500"}`}>{delta}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function AreaChart({ rows, height = 170, labelA = "Entradas", labelB = "Saídas" }: { rows: Row[]; height?: number; labelA?: string; labelB?: string }) {
  const a = rows.map((r) => num(r.a));
  const b = rows.map((r) => num(r.b));
  const hasB = rows.some((r) => str(r.b));
  const top = Math.max(...a, ...(hasB ? b : [0]), 1) * 1.12;
  const step = rows.length > 1 ? 600 / (rows.length - 1) : 600;
  const y = (v: number) => 150 - (v / top) * 140;
  const path = (vals: number[]) => {
    const pts = vals.map((v, i) => [i * step, y(v)] as const);
    return pts.map(([x, py], i) => (i === 0 ? `M${x},${py}` : `C${(pts[i - 1]![0] + x) / 2},${pts[i - 1]![1]} ${(pts[i - 1]![0] + x) / 2},${py} ${x},${py}`)).join(" ");
  };
  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1.5 opacity-75">
          <span className="h-0.5 w-4 rounded bg-[var(--rc-primary)]" /> {labelA}
        </span>
        {hasB && (
          <span className="flex items-center gap-1.5 opacity-75">
            <span className="h-0.5 w-4 rounded border-t border-dashed border-current" /> {labelB}
          </span>
        )}
      </div>
      <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="w-full" style={{ height }} aria-hidden="true">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2="600" y1={150 - f * 140} y2={150 - f * 140} stroke="currentColor" strokeOpacity="0.08" vectorEffect="non-scaling-stroke" />
        ))}
        <defs>
          <linearGradient id="rc-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--rc-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--rc-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path(a)} L600,150 L0,150 Z`} fill="url(#rc-area)" />
        <path d={path(a)} fill="none" stroke="var(--rc-primary)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
        {hasB && <path d={path(b)} fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.8" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="mt-1 flex justify-between text-[10.5px] opacity-45">
        {rows.map((r, i) => (
          <span key={i}>{str(r.label)}</span>
        ))}
      </div>
    </div>
  );
}

export function Chips({ options, active = 0 }: { options: string[]; active?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o, i) => (
        <span key={o} className={`rounded-full px-3 py-1 text-[11.5px] font-medium ${i === active ? "bg-[var(--rc-primary)] text-white" : "border border-current/15 opacity-70"}`}>
          {o}
        </span>
      ))}
    </div>
  );
}

export const groupsOf = (items: Row[]) => [...new Set(items.map((i) => str(i.group)).filter(Boolean))];

