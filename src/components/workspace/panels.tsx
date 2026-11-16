// The app's screens — started from a Micronuage template, now yours to change.
import { str } from "./lib";

/** Charts are illustrative: magnitude comes from the row's `value` when it holds digits, otherwise
 *  from its position, so a panel always reads as real data instead of an empty frame. */
function magnitude(row: Record<string, unknown>, index: number, total: number): number {
  const digits = `${str(row.value)}${str(row.meta)}`.replace(/[^\d]/g, "");
  if (digits) return Number(digits.slice(0, 6));
  return Math.max(1, total - index);
}

function scale(rows: Record<string, unknown>[]): number[] {
  const raw = rows.map((row, i) => magnitude(row, i, rows.length));
  const top = Math.max(...raw, 1);
  return raw.map((n) => Math.max(8, Math.round((n / top) * 100)));
}

/** Categorical series: both theme colours lead, then mixes — so accent_color visibly drives charts. */
const SERIES = [
  "var(--rc-primary)",
  "var(--rc-accent)",
  "color-mix(in oklab, var(--rc-accent) 55%, var(--rc-primary))",
  "color-mix(in oklab, var(--rc-primary) 58%, var(--rc-bg))",
  "color-mix(in oklab, var(--rc-accent) 48%, var(--rc-bg))",
  "color-mix(in oklab, var(--rc-primary) 30%, var(--rc-bg))",
];

function tint(i: number): string {
  return SERIES[i % SERIES.length];
}

function Bars({ rows }: { rows: Record<string, unknown>[] }) {
  const heights = scale(rows);
  return (
    <div className="flex h-28 items-end gap-1.5">
      {rows.map((row, i) => (
        <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <div className="w-full rounded-t-[3px] bg-[var(--rc-primary)]" style={{ height: `${heights[i]}%` }} />
          <p className="w-full truncate text-center text-[8.5px] opacity-50">{str(row.title)}</p>
        </div>
      ))}
    </div>
  );
}

function Donut({ rows }: { rows: Record<string, unknown>[] }) {
  const values = scale(rows);
  const total = values.reduce((a, b) => a + b, 0) || 1;
  let cursor = 0;
  const stops = values.map((v, i) => {
    const from = (cursor / total) * 360;
    cursor += v;
    return `${tint(i)} ${from}deg ${(cursor / total) * 360}deg`;
  });
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(", ")})` }}>
        <div className="absolute inset-[26%] rounded-full bg-[var(--rc-bg)]" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <span className="size-2 shrink-0 rounded-[2px]" style={{ background: tint(i) }} />
            <span className="min-w-0 flex-1 truncate opacity-70">{str(row.title)}</span>
            <span className="shrink-0 font-medium">{str(row.value, `${Math.round((values[i] / total) * 100)}%`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Funnel({ rows }: { rows: Record<string, unknown>[] }) {
  const widths = scale(rows);
  return (
    <div className="space-y-1.5">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px]">
          <span className="w-20 shrink-0 truncate opacity-65">{str(row.title)}</span>
          <span className="h-4 rounded-[3px]" style={{ width: `${widths[i]}%`, background: tint(i) }} />
          <span className="shrink-0 font-medium opacity-80">{str(row.value, str(row.meta))}</span>
        </div>
      ))}
    </div>
  );
}

function Progress({ rows }: { rows: Record<string, unknown>[] }) {
  const widths = scale(rows);
  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => (
        <div key={i}>
          <div className="flex items-baseline justify-between gap-2 text-[10.5px]">
            <span className="min-w-0 truncate opacity-75">{str(row.title)}</span>
            <span className="shrink-0 font-medium">{str(row.value, str(row.meta))}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-current/10">
            <div className="h-full rounded-full" style={{ width: `${widths[i]}%`, background: tint(i) }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Rows({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <div className="divide-y divide-current/10">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5 text-[10.5px] first:pt-0 last:pb-0">
          <span className="size-1.5 shrink-0 rounded-full bg-[var(--rc-primary)]" />
          <span className="min-w-0 flex-1 truncate">{str(row.title)}</span>
          <span className="shrink-0 opacity-50">{str(row.meta, str(row.date))}</span>
        </div>
      ))}
    </div>
  );
}

export type PanelSpec = { title: string; kind: string; rows: Record<string, unknown>[] };

export function Panel({ spec }: { spec: PanelSpec }) {
  const rows = spec.rows.slice(0, spec.kind === "bars" ? 12 : 6);
  return (
    <div className="rounded-lg border border-current/10 bg-[var(--rc-bg)] p-3">
      <p className="mb-2.5 text-[11px] font-semibold tracking-[-0.01em]">{spec.title}</p>
      {spec.kind === "bars" ? (
        <Bars rows={rows} />
      ) : spec.kind === "donut" ? (
        <Donut rows={rows} />
      ) : spec.kind === "funnel" ? (
        <Funnel rows={rows} />
      ) : spec.kind === "progress" ? (
        <Progress rows={rows} />
      ) : (
        <Rows rows={rows} />
      )}
    </div>
  );
}
