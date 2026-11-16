// The app's screens — started from a Micronuage template, now yours to change.
import { str } from "./lib";
import { Chip } from "./chrome";
import { Panel, type PanelSpec } from "./panels";

/** Row fields map onto table columns in this order, so `columns` must be titled to match. */
export const CELL_ORDER = ["title", "meta", "owner", "value", "date", "group"] as const;

const DEFAULT_HEADS = ["Registro", "Detalhe", "Responsável", "Valor", "Data", "Status"];

export function DataTable({ items, columns, caption }: { items: Record<string, unknown>[]; columns: Record<string, unknown>[]; caption?: string }) {
  const heads = (columns.length ? columns.map((c) => str(c.title)) : DEFAULT_HEADS).filter(Boolean).slice(0, 6);
  const wanted = heads.length ? heads : DEFAULT_HEADS.slice(0, 3);
  // A column nobody fills would render as a wall of dashes, so it is left out.
  const kept = wanted.map((head, i) => ({ head, field: CELL_ORDER[i]! })).filter(({ field }, i) => i === 0 || items.some((it) => str(it[field])));
  const used = kept.map((k) => k.head);
  const cells = kept.map((k) => k.field);
  const grid = { gridTemplateColumns: `minmax(0,1.6fr) repeat(${Math.max(used.length - 1, 1)}, minmax(0,1fr))` };
  return (
    <div className="overflow-hidden rounded-lg border border-current/10 bg-[var(--rc-bg)] text-[11px]">
      {caption && <p className="border-b border-current/10 px-3 py-2 text-[11px] font-semibold">{caption}</p>}
      <div className="grid gap-2 bg-current/[0.03] px-3 py-2 text-[9.5px] font-semibold uppercase tracking-[0.08em] opacity-50" style={grid}>
        {used.map((head, i) => (
          <span key={i} className="truncate">
            {head}
          </span>
        ))}
      </div>
      {items.map((item, i) => (
        <div key={i} className="grid items-center gap-2 border-t border-current/10 px-3 py-2" style={grid}>
          {cells.map((field, ci) => {
            const value = str(item[field]);
            if (field === "group" && value) {
              return (
                <span key={ci} className="min-w-0">
                  <Chip on={ci % 3 === 0}>{value}</Chip>
                </span>
              );
            }
            if (field === "owner" && value) {
              return (
                <span key={ci} className="flex min-w-0 items-center gap-1.5">
                  <span className="grid size-4 shrink-0 place-items-center rounded-full bg-current/10 text-[8px] font-semibold">{value.slice(0, 1).toUpperCase()}</span>
                  <span className="truncate opacity-70">{value}</span>
                </span>
              );
            }
            return (
              <span key={ci} className={`truncate ${ci === 0 ? "font-medium" : "opacity-65"}`}>
                {value || "—"}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function Pipeline({ columns, items }: { columns: Record<string, unknown>[]; items: Record<string, unknown>[] }) {
  const cols = (columns.length ? columns : [{ title: "Fila" }]).slice(0, 6);
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
      {cols.map((col, ci) => {
        const title = str(col.title);
        const cards = items.filter((it) => str(it.group) === title);
        const total = cards.reduce((sum, card) => sum + (Number(str(card.value).replace(/[^\d]/g, "")) || 0), 0);
        return (
          <div key={ci} className="rounded-lg bg-current/[0.04] p-2">
            <div className="mb-2 px-1">
              <p className="truncate text-[9.5px] font-semibold uppercase tracking-[0.08em] opacity-55">
                {title} · {cards.length}
              </p>
              {total > 0 && <p className="mt-0.5 text-[9.5px] opacity-40">R$ {total.toLocaleString("pt-BR")}</p>}
            </div>
            {cards.map((card, i) => (
              <div key={i} className="mb-1.5 rounded-md border border-current/10 bg-[var(--rc-bg)] p-2">
                <p className="truncate text-[11px] font-medium">{str(card.title)}</p>
                {str(card.meta) && <p className="mt-0.5 truncate text-[9.5px] opacity-55">{str(card.meta)}</p>}
                <div className="mt-1.5 flex items-center justify-between gap-1.5">
                  {str(card.value) && <span className="text-[10px] font-semibold text-[var(--rc-primary)]">{str(card.value)}</span>}
                  {str(card.owner) && <span className="grid size-4 shrink-0 place-items-center rounded-full bg-current/10 text-[8px] font-semibold">{str(card.owner).slice(0, 1).toUpperCase()}</span>}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function Dashboard({ panels, items, columns }: { panels: Record<string, unknown>[]; items: Record<string, unknown>[]; columns: Record<string, unknown>[] }) {
  const consumed = new Set<string>();
  const specs: PanelSpec[] = panels.slice(0, 4).map((panel) => {
    const source = str(panel.source);
    const rows = source ? items.filter((it) => str(it.group) === source) : [];
    if (source && rows.length) consumed.add(source);
    return { title: str(panel.title), kind: str(panel.kind, "list"), rows: rows.length ? rows : items.slice(0, 5) };
  });
  const rest = items.filter((it) => !consumed.has(str(it.group))).slice(0, 8);
  return (
    <div className="space-y-3">
      {specs.length > 0 && (
        <div className="grid gap-2.5 lg:grid-cols-2">
          {specs.map((spec, i) => (
            <Panel key={i} spec={spec} />
          ))}
        </div>
      )}
      {rest.length > 0 && <DataTable items={rest} columns={columns} caption="Atividades recentes" />}
    </div>
  );
}

export function Calendar({ items }: { items: Record<string, unknown>[] }) {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {days.map((day) => (
        <div key={day}>
          <p className="mb-1 text-center text-[10px] opacity-55">{day}</p>
          <div className="h-56 space-y-1 rounded-md border border-current/10 bg-current/[0.03] p-1">
            {items
              .filter((it) => str(it.group) === day)
              .map((it, i) => (
                <div key={i} className="rounded-[4px] bg-[var(--rc-primary)]/85 px-1.5 py-1 text-[9px] leading-tight text-white">
                  <p className="truncate font-medium">{str(it.title)}</p>
                  {str(it.date) && <p className="truncate opacity-80">{str(it.date)}</p>}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Documents({ items }: { items: Record<string, unknown>[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {[items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)].map((col, ci) => (
        <div key={ci} className="rounded-lg border border-current/10 bg-[var(--rc-bg)] p-3">
          <p className="mb-2 text-[11px] font-semibold">{ci === 0 ? "Documentos" : "Pendências"}</p>
          {col.map((it, i) => (
            <div key={i} className="flex items-center justify-between gap-2 border-t border-current/10 py-1.5 text-[10.5px] first:border-0 first:pt-0">
              <span className="min-w-0 flex-1 truncate">{str(it.title)}</span>
              <span className="shrink-0 opacity-50">{str(it.date)}</span>
              <span className="shrink-0 font-medium text-[var(--rc-primary)]">{str(it.meta, "Ver")}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Queue({ items }: { items: Record<string, unknown>[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2 rounded-md border border-current/10 bg-[var(--rc-bg)] px-3 py-2 text-[11px]">
          <span className="min-w-0 flex-1 truncate font-medium">{str(it.title)}</span>
          <span className="hidden shrink-0 opacity-55 sm:inline">{str(it.meta)}</span>
          {str(it.owner) && <span className="shrink-0 opacity-55">{str(it.owner)}</span>}
          <Chip on={/aberto|novo|urgente/i.test(str(it.group))}>{str(it.group, "Fila")}</Chip>
        </div>
      ))}
    </div>
  );
}
