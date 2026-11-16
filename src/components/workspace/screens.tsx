// The app's screens — started from a Micronuage template, now yours to change.
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { href as sitePath, list, str } from "./lib";
import { labelToPageId } from "./chrome";
import { Avatar, AreaChart, Chips, KpiTiles, Pill, groupsOf, hue, money, num } from "./ui";
import { Panel } from "./panels";
import { ApprovalsLive, BudgetLive, CalendarLive, DeskLive, HealthLive, InvoiceLive, KanbanLive, LoanLive, QuoteLive } from "./live";

/**
 * Finished app screens. Each `screen` value is a different product: its own navigation shell, density and
 * widgets, so a CRM board, a cash-flow ledger, a support inbox and a point of sale do not look like the same table.
 * Data is plain workspace props (items, kpis, series, aside) so everything stays editable in the builder.
 */

export type ScreenProps = {
  p: Record<string, unknown>;
  site: Record<string, unknown>;
  compact?: boolean;
  pathPrefix?: string;
  extraPageIds?: ReadonlySet<string>;
  activePageId?: string;
};

type Row = Record<string, unknown>;

// ───────────────────────────── helpers ─────────────────────────────

function NavLink({ label, index, active, pathPrefix, extraPageIds, className, children }: { label: string; index: number; active: boolean; pathPrefix?: string; extraPageIds?: ReadonlySet<string>; className: string; children?: ReactNode }) {
  const pageId = labelToPageId(label);
  const to = index === 0 ? sitePath("/", pathPrefix) : extraPageIds?.has(pageId) ? sitePath(`/${pageId}`, pathPrefix) : "";
  const content = children ?? label;
  return to ? (
    <Link to={to} className={className} aria-current={active ? "page" : undefined}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}

function menuOf(p: Row): string[] {
  const items = list(p.menu).map((m) => str(m.label, str(m.title))).filter(Boolean);
  return items.length ? items : [str(p.title, "Início")];
}

/** Which sidebar entry is lit: the page being drawn, or the first entry on the home page. */
function activeIndex(menu: string[], activePageId?: string) {
  if (!activePageId) return 0;
  const i = menu.findIndex((m) => labelToPageId(m) === activePageId);
  return i < 0 ? 0 : i;
}

function Brand({ name, dark }: { name: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--rc-primary)] text-[12px] font-bold text-white">{name.slice(0, 1).toUpperCase()}</span>
      <span className={`truncate text-[13.5px] font-semibold tracking-[-0.01em] ${dark ? "text-white" : ""}`}>{name}</span>
    </div>
  );
}

/** Sidebar shell: light or dark rail, grouped entries, account chip. */
function SideShell({ props, dark, children, action, search }: { props: ScreenProps; dark?: boolean; children: ReactNode; action?: string; search?: string }) {
  const { p, site, compact, pathPrefix, extraPageIds, activePageId } = props;
  const brand = str(site.company_name, "Produto");
  const menu = menuOf(p);
  const active = activeIndex(menu, activePageId);
  const height = compact ? "min-h-[34rem]" : "min-h-[52rem]";
  return (
    <section className={`${height} border-b border-current/10`}>
      <div className={`grid grid-cols-[3.25rem_1fr] sm:grid-cols-[13.5rem_1fr] ${height}`}>
        <aside className={`flex flex-col gap-4 p-2.5 sm:p-4 ${dark ? "bg-[#111827] text-slate-200" : "border-r border-current/10 bg-current/[0.025]"}`}>
          <div className="hidden sm:block">
            <Brand name={brand} dark={dark} />
          </div>
          <span className="grid size-8 place-items-center rounded-lg bg-[var(--rc-primary)] text-[12px] font-bold text-white sm:hidden">{brand.slice(0, 1).toUpperCase()}</span>
          <nav className="space-y-0.5">
            {menu.map((label, i) => (
              <NavLink
                key={label}
                label={label}
                index={i}
                active={i === active}
                pathPrefix={pathPrefix}
                extraPageIds={extraPageIds}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12.5px] ${
                  i === active ? (dark ? "bg-white/10 font-medium text-white" : "bg-[color-mix(in_oklab,var(--rc-primary)_13%,transparent)] font-medium text-[var(--rc-primary)]") : dark ? "text-slate-400 hover:text-white" : "opacity-70 hover:opacity-100"
                }`}
              >
                <span className={`grid size-5 shrink-0 place-items-center rounded-md text-[10px] font-semibold ${i === active ? "bg-[var(--rc-primary)] text-white" : dark ? "bg-white/10" : "bg-current/10"}`}>{label.slice(0, 1).toUpperCase()}</span>
                <span className="hidden truncate sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className={`mt-auto hidden items-center gap-2 border-t pt-3 sm:flex ${dark ? "border-white/10" : "border-current/10"}`}>
            <Avatar name="Minha Conta" size={6} />
            <span className="truncate text-[11.5px] opacity-70">Minha conta</span>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2 border-b border-current/10 px-4 py-2.5 sm:px-6">
            <div className="min-w-0 flex-1 truncate rounded-lg border border-current/10 bg-current/[0.03] px-3 py-1.5 text-[12px] opacity-50">{search ?? str(p.search_placeholder, "Buscar…")}</div>
            {action && <span className="shrink-0 rounded-lg bg-[var(--rc-primary)] px-3 py-1.5 text-[12px] font-medium text-white">{action}</span>}
          </div>
          <div className="min-w-0 flex-1 space-y-4 p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Top navigation shell, no sidebar: used by finance, portal, PDV and BI screens. */
function TopShell({ props, children, right }: { props: ScreenProps; children: ReactNode; right?: ReactNode }) {
  const { p, site, compact, pathPrefix, extraPageIds, activePageId } = props;
  const brand = str(site.company_name, "Produto");
  const menu = menuOf(p);
  const active = activeIndex(menu, activePageId);
  const height = compact ? "min-h-[34rem]" : "min-h-[52rem]";
  return (
    <section className={`${height} border-b border-current/10`}>
      <div className="flex items-center gap-4 border-b border-current/10 px-4 py-3 sm:px-8">
        <Brand name={brand} />
        <nav className="ml-2 hidden gap-1 sm:flex">
          {menu.map((label, i) => (
            <NavLink
              key={label}
              label={label}
              index={i}
              active={i === active}
              pathPrefix={pathPrefix}
              extraPageIds={extraPageIds}
              className={`rounded-full px-3 py-1.5 text-[12.5px] ${i === active ? "bg-[var(--rc-primary)] font-medium text-white" : "opacity-65 hover:opacity-100"}`}
            />
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {right}
          <Avatar name="Minha Conta" size={7} />
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-8">{children}</div>
    </section>
  );
}

function Title({ p, action }: { p: Row; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]" style={{ fontFamily: "var(--rc-heading-font)" }}>
          {str(p.title)}
        </h2>
        {str(p.subtitle) && <p className="mt-1 text-[12.5px] opacity-55">{str(p.subtitle)}</p>}
      </div>
      {action}
    </div>
  );
}

// ───────────────────────────── screens ─────────────────────────────

/** Kanban board (CRM, hiring, sprint): cards move between stages in the browser; an optional series draws a burndown above. */
export function KanbanScreen(props: ScreenProps) {
  const { p } = props;
  const items = list(p.items);
  const columns = list(p.columns).map((c) => str(c.title)).filter(Boolean);
  const cols = (columns.length ? columns : groupsOf(items)).slice(0, 6);
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} action={<Chips options={["Todos", "Meus", "Este mês"]} />} />
      <KpiTiles kpis={list(p.kpis)} />
      <KanbanLive columns={cols} items={items} series={list(p.series)} seriesTitle={str(p.aside_title)} addLabel={str(p.search_placeholder, "Adicionar")} sum={str(p.mode) === "points" ? "points" : str(p.mode) === "none" ? "none" : "money"} />
    </SideShell>
  );
}

/** ERP: dark sidebar, status tabs, orders table and a summary panel. */
export function OrdersScreen(props: ScreenProps) {
  const { p } = props;
  const items = list(p.items);
  const statuses = groupsOf(items);
  const aside = list(p.aside);
  return (
    <SideShell props={props} dark action={str(p.primary_action)}>
      <Title p={p} />
      <KpiTiles kpis={list(p.kpis)} tone="flat" />
      <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--rc-primary)] px-3 py-1 text-[11.5px] font-medium text-white">Todos · {items.length}</span>
            {statuses.map((s) => (
              <span key={s} className="rounded-full border border-current/15 px-3 py-1 text-[11.5px] opacity-70">
                {s} · {items.filter((i) => str(i.group) === s).length}
              </span>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-current/10 text-[12px] [&>div]:min-w-[34rem]">
            <div className="grid grid-cols-[1fr_1.4fr_1fr_.9fr_.9fr] gap-2 bg-current/[0.04] px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] opacity-55">
              <span>Pedido</span>
              <span>Cliente</span>
              <span className="hidden sm:block">Valor</span>
              <span className="hidden sm:block">Entrega</span>
              <span>Status</span>
            </div>
            {items.map((it, i) => (
              <div key={i} className={`grid grid-cols-[1fr_1.4fr_1fr_.9fr_.9fr] items-center gap-2 border-t border-current/10 px-4 py-3 ${i === 0 ? "bg-[color-mix(in_oklab,var(--rc-primary)_7%,transparent)]" : ""}`}>
                <span className="truncate font-semibold">{str(it.title)}</span>
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar name={str(it.meta)} size={5} />
                  <span className="truncate opacity-75">{str(it.meta)}</span>
                </span>
                <span className="hidden font-medium sm:block">{str(it.value)}</span>
                <span className="hidden opacity-60 sm:block">{str(it.date)}</span>
                <Pill>{str(it.group)}</Pill>
              </div>
            ))}
          </div>
        </div>
        {aside.length > 0 && (
          <aside className="rounded-xl border border-current/10 p-4 text-[12px]">
            <p className="text-[13px] font-semibold">{str(p.aside_title, "Resumo")}</p>
            <div className="mt-3 divide-y divide-current/10">
              {aside.map((a, i) => (
                <div key={i} className="flex items-baseline justify-between gap-3 py-2">
                  <span className="opacity-55">{str(a.title)}</span>
                  <span className="text-right font-medium">{str(a.meta)}</span>
                </div>
              ))}
            </div>
            <span className="mt-3 block rounded-lg bg-[var(--rc-primary)] py-2 text-center text-[12px] font-medium text-white">Faturar pedido</span>
          </aside>
        )}
      </div>
    </SideShell>
  );
}

/** Finance: balance, cash-flow chart, aging and the due list. */
export function LedgerScreen(props: ScreenProps) {
  const { p } = props;
  const items = list(p.items);
  const series = list(p.series);
  const aside = list(p.aside);
  const kpis = list(p.kpis);
  const big = kpis[0];
  const aging = aside.map((a) => ({ label: str(a.title), value: str(a.value), n: num(a.value) }));
  const top = Math.max(...aging.map((a) => a.n), 1);
  return (
    <TopShell props={props} right={<span className="hidden rounded-full bg-[var(--rc-primary)] px-3 py-1.5 text-[12px] font-medium text-white sm:block">{str(p.primary_action, "Novo lançamento")}</span>}>
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-current/10 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[12px] opacity-55">{str(big?.label, "Saldo previsto")}</p>
              <p className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.035em]" style={{ fontFamily: "var(--rc-heading-font)" }}>
                {str(big?.value)}
              </p>
              {str(big?.delta) && <p className="mt-1.5 text-[12px] font-medium text-emerald-500">{str(big?.delta)}</p>}
            </div>
            <Chips options={["30 dias", "90 dias", "12 meses"]} />
          </div>
          <div className="mt-5">{series.length > 1 && <AreaChart rows={series} />}</div>
        </div>
        <div className="grid gap-3">
          {kpis.slice(1, 3).map((k, i) => (
            <div key={i} className="rounded-2xl border border-current/10 p-4">
              <p className="text-[12px] opacity-55">{str(k.label)}</p>
              <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">{str(k.value)}</p>
              {str(k.delta) && <p className={`mt-1 text-[11.5px] font-medium ${str(k.delta).startsWith("-") ? "text-rose-500" : "text-emerald-500"}`}>{str(k.delta)}</p>}
            </div>
          ))}
          {aging.length > 0 && (
            <div className="rounded-2xl border border-current/10 p-4">
              <p className="text-[12px] font-semibold">{str(p.aside_title, "Vencimentos por faixa")}</p>
              <div className="mt-3 space-y-2.5">
                {aging.map((a, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[11.5px]">
                      <span className="opacity-70">{a.label}</span>
                      <span className="font-medium">{a.value}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-current/10">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(8, (a.n / top) * 100)}%`, background: /atras|vencid/i.test(a.label) ? "#e11d48" : "var(--rc-primary)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-current/10 text-[12.5px] [&>div]:min-w-[34rem]">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-[13px] font-semibold">{str(p.title, "Lançamentos")}</p>
          <Chips options={["Todos", ...groupsOf(items).slice(0, 3)]} />
        </div>
        {items.map((it, i) => {
          const out = /pagar|atras/i.test(str(it.group)) && !/receb/i.test(str(it.group));
          return (
            <div key={i} className="grid grid-cols-[1.6fr_1fr_.9fr_.9fr] items-center gap-3 border-t border-current/10 px-5 py-3">
              <span className="min-w-0">
                <span className="block truncate font-medium">{str(it.title)}</span>
                <span className="block truncate text-[11px] opacity-50">{str(it.meta)}</span>
              </span>
              <span className="opacity-60">{str(it.date)}</span>
              <Pill>{str(it.group)}</Pill>
              <span className={`text-right font-semibold ${out ? "text-rose-500" : "text-emerald-500"}`}>
                {out ? "−" : "+"} {str(it.value)}
              </span>
            </div>
          );
        })}
      </div>
    </TopShell>
  );
}

/** HR: people directory with status and the manager's approvals. */
export function PeopleScreen(props: ScreenProps) {
  const { p } = props;
  const items = list(p.items);
  const areas = groupsOf(items);
  const aside = list(p.aside);
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} action={<Chips options={["Todos", ...areas.slice(0, 4)]} />} />
      <KpiTiles kpis={list(p.kpis)} spark={false} tone="flat" />
      <div className="grid gap-4 xl:grid-cols-[1fr_16rem]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const status = str(it.owner);
            return (
              <div key={i} className="rounded-2xl border border-current/10 bg-[var(--rc-bg)] p-4 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex justify-center">
                  <Avatar name={str(it.title)} size={12} />
                </div>
                <p className="mt-2.5 text-[13.5px] font-semibold">{str(it.title)}</p>
                <p className="text-[11.5px] opacity-55">{str(it.meta)}</p>
                <div className="mt-2.5 flex items-center justify-center gap-1.5">
                  <Pill tone="mute">{str(it.group)}</Pill>
                  {status && <Pill>{status}</Pill>}
                </div>
                {str(it.date) && <p className="mt-2 text-[10.5px] opacity-40">{str(it.date)}</p>}
              </div>
            );
          })}
        </div>
        {aside.length > 0 && (
          <aside className="rounded-2xl border border-current/10 p-4">
            <p className="text-[13px] font-semibold">{str(p.aside_title, "Para aprovar")}</p>
            <div className="mt-3 space-y-3">
              {aside.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Avatar name={str(a.title)} size={7} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium">{str(a.title)}</span>
                    <span className="block truncate text-[11px] opacity-55">{str(a.meta)}</span>
                  </span>
                  <span className="rounded-md bg-[var(--rc-primary)] px-2 py-1 text-[10.5px] font-medium text-white">{str(a.value, "Aprovar")}</span>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </SideShell>
  );
}

/** Support: three-pane inbox with conversation and customer card. */
export function InboxScreen(props: ScreenProps) {
  const { p, site, compact, pathPrefix, extraPageIds, activePageId } = props;
  const items = list(p.items);
  const thread = list(p.aside);
  const kpis = list(p.kpis);
  const menu = menuOf(p);
  const active = activeIndex(menu, activePageId);
  const brand = str(site.company_name, "Produto");
  const first = items[0];
  const height = compact ? "min-h-[34rem]" : "min-h-[52rem]";
  return (
    <section className={`${height} border-b border-current/10`}>
      <div className="flex items-center gap-4 border-b border-current/10 px-4 py-2.5 sm:px-6">
        <Brand name={brand} />
        <nav className="hidden gap-1 sm:flex">
          {menu.map((m, i) => (
            <NavLink
              key={m}
              label={m}
              index={i}
              active={i === active}
              pathPrefix={pathPrefix}
              extraPageIds={extraPageIds}
              className={`rounded-full px-3 py-1.5 text-[12.5px] ${i === active ? "bg-current/10 font-medium" : "opacity-60 hover:opacity-100"}`}
            />
          ))}
        </nav>
        <span className="ml-auto rounded-full bg-[var(--rc-primary)] px-3 py-1.5 text-[12px] font-medium text-white">{str(p.primary_action, "Nova conversa")}</span>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-[17rem_1fr] lg:grid-cols-[18rem_1fr_16rem] ${compact ? "h-[30rem]" : "h-[46rem]"}`}>
        <div className="overflow-hidden border-r border-current/10">
          <div className="border-b border-current/10 px-4 py-3">
            <p className="text-[14px] font-semibold">{str(p.title, "Fila")}</p>
            <Chips options={["Abertas", "Espera", "Resolvidas"]} />
          </div>
          {items.map((it, i) => (
            <div key={i} className={`flex gap-3 border-b border-current/10 px-4 py-3 ${i === 0 ? "bg-[color-mix(in_oklab,var(--rc-primary)_10%,transparent)]" : ""}`}>
              <Avatar name={str(it.title)} size={9} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[12.5px] font-semibold">{str(it.title)}</p>
                  <span className="shrink-0 text-[10.5px] opacity-45">{str(it.date)}</span>
                </div>
                <p className="mt-0.5 truncate text-[11.5px] opacity-60">{str(it.meta)}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Pill>{str(it.group)}</Pill>
                  {str(it.owner) && <span className="text-[10.5px] opacity-45">{str(it.owner)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden min-w-0 flex-col sm:flex">
          <div className="flex items-center gap-3 border-b border-current/10 px-5 py-3">
            <Avatar name={str(first?.title)} size={9} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold">{str(first?.title)}</p>
              <p className="text-[11px] opacity-50">{str(first?.group)} · {str(first?.date)}</p>
            </div>
            <span className="rounded-lg border border-current/15 px-2.5 py-1 text-[11.5px]">Resolver</span>
          </div>
          <div className="flex-1 space-y-3 overflow-hidden p-5">
            {thread.map((m, i) => {
              const mine = /atend|equipe|voc[êe]|eu/i.test(str(m.group));
              return (
                <div key={i} className={`flex ${mine ? "justify-end" : ""}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-snug ${mine ? "rounded-br-sm bg-[var(--rc-primary)] text-white" : "rounded-bl-sm bg-current/[0.07]"}`}>
                    <p>{str(m.meta)}</p>
                    <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "opacity-40"}`}>
                      {str(m.title)} · {str(m.value)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-current/10 p-3">
            <div className="rounded-xl border border-current/15 px-4 py-3 text-[12.5px] opacity-50">Escreva uma resposta…</div>
          </div>
        </div>
        <aside className="hidden border-l border-current/10 p-4 lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] opacity-45">Cliente</p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={str(first?.title)} size={11} />
            <div>
              <p className="text-[13px] font-semibold">{str(first?.title)}</p>
              <p className="text-[11px] opacity-50">Cliente desde 2022</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {kpis.map((k, i) => (
              <div key={i} className="flex items-baseline justify-between rounded-lg bg-current/[0.05] px-3 py-2 text-[12px]">
                <span className="opacity-60">{str(k.label)}</span>
                <span className="font-semibold">{str(k.value)}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

/** Customer portal: greeting, project timeline, invoices and documents. */
export function PortalScreen(props: ScreenProps) {
  const { p } = props;
  const items = list(p.items);
  const steps = items.filter((i) => str(i.group) === "Etapa");
  const invoices = items.filter((i) => str(i.group) === "Fatura");
  const docs = items.filter((i) => str(i.group) === "Documento");
  return (
    <TopShell props={props}>
      <div className="overflow-hidden rounded-3xl p-6 text-white sm:p-8" style={{ background: "linear-gradient(120deg, var(--rc-primary), color-mix(in oklab, var(--rc-primary) 55%, #0b1220))" }}>
        <p className="text-[12.5px] text-white/70">{str(p.subtitle)}</p>
        <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.025em]" style={{ fontFamily: "var(--rc-heading-font)" }}>
          {str(p.title)}
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {list(p.kpis).slice(0, 4).map((k, i) => (
            <div key={i} className="rounded-xl bg-white/12 px-3.5 py-3 backdrop-blur">
              <p className="text-[11px] text-white/65">{str(k.label)}</p>
              <p className="mt-0.5 text-[19px] font-semibold tracking-[-0.02em]">{str(k.value)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-current/10 p-5">
          <p className="text-[14px] font-semibold">Andamento do trabalho</p>
          <div className="mt-4">
            {steps.map((s, i) => {
              const done = /conclu/i.test(str(s.value));
              const doing = /andamento/i.test(str(s.value));
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${done ? "bg-emerald-500 text-white" : doing ? "bg-[var(--rc-primary)] text-white" : "border border-current/25"}`}>{done ? "✓" : i + 1}</span>
                    {i < steps.length - 1 && <span className="my-1 w-px flex-1 bg-current/15" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-[13px] font-medium">{str(s.title)}</p>
                    <p className="text-[11.5px] opacity-55">
                      {str(s.meta)} · {str(s.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-current/10 p-5">
            <p className="text-[14px] font-semibold">Faturas</p>
            <div className="mt-3 divide-y divide-current/10">
              {invoices.map((f, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 text-[12.5px]">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{str(f.title)}</span>
                    <span className="block text-[11px] opacity-50">{str(f.date)}</span>
                  </span>
                  <span className="font-semibold">{str(f.value)}</span>
                  {/pag[ao]/i.test(str(f.meta)) && !/pagar/i.test(str(f.meta)) ? <Pill tone="good">{str(f.meta)}</Pill> : <span className="rounded-md bg-[var(--rc-primary)] px-2.5 py-1 text-[11px] font-medium text-white">{str(f.meta, "Pagar")}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-current/10 p-5">
            <p className="text-[14px] font-semibold">Documentos</p>
            <div className="mt-3 space-y-2">
              {docs.map((d, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-current/[0.04] px-3 py-2.5 text-[12.5px]">
                  <span className="grid size-7 place-items-center rounded-md bg-[var(--rc-primary)]/15 text-[10px] font-bold text-[var(--rc-primary)]">PDF</span>
                  <span className="min-w-0 flex-1 truncate">{str(d.title)}</span>
                  <span className="font-medium text-[var(--rc-primary)]">{str(d.meta)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TopShell>
  );
}

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

/** Booking: week time grid with colour per professional. */
export function WeekScreen(props: ScreenProps) {
  const { p, compact } = props;
  const items = list(p.items);
  const aside = list(p.aside);
  const start = 8;
  const hours = Array.from({ length: 10 }, (_, i) => start + i);
  const rowH = compact ? 38 : 48;
  const pros = [...new Set(items.map((i) => str(i.meta)))];
  const color = (name: string) => `hsl(${(Math.max(pros.indexOf(name), 0) * 67 + 172) % 360} 58% 42%)`;
  const dates = list(p.columns).map((c) => str(c.title));
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} action={<Chips options={["Semana", "Dia", "Mês"]} />} />
      <div className="grid gap-4 lg:grid-cols-[13rem_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-current/10 p-3.5">
            <p className="text-[12.5px] font-semibold">{str(p.aside_title, "Profissionais")}</p>
            <div className="mt-2.5 space-y-2">
              {(aside.length ? aside : pros.map((n) => ({ title: n, meta: "" }))).map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px]">
                  <span className="size-2.5 shrink-0 rounded-sm" style={{ background: color(str(a.title)) }} />
                  <span className="min-w-0 flex-1 truncate">{str(a.title)}</span>
                  <span className="text-[10.5px] opacity-45">{str(a.meta)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden rounded-xl border border-current/10 p-3.5 lg:block">
            <p className="text-[12.5px] font-semibold">Setembro</p>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10.5px]">
              {Array.from({ length: 28 }, (_, i) => (
                <span key={i} className={`rounded-md py-1 ${i === 21 ? "bg-[var(--rc-primary)] font-semibold text-white" : "opacity-55"}`}>
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-current/10">
         <div className="min-w-[38rem]">
          <div className="grid grid-cols-[3rem_repeat(5,minmax(0,1fr))] border-b border-current/10 bg-current/[0.03] text-center text-[11.5px] font-medium">
            <span />
            {DAYS.map((d, i) => (
              <span key={d} className="border-l border-current/10 py-2">
                {d} <span className="opacity-45">{dates[i] ?? ""}</span>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-[3rem_repeat(5,minmax(0,1fr))]">
            <div>
              {hours.map((h) => (
                <div key={h} style={{ height: rowH }} className="pr-2 text-right text-[10.5px] opacity-45">
                  {h}h
                </div>
              ))}
            </div>
            {DAYS.map((d) => (
              <div key={d} className="relative border-l border-current/10">
                {hours.map((h) => (
                  <div key={h} style={{ height: rowH }} className="border-t border-current/[0.07]" />
                ))}
                {items
                  .filter((it) => str(it.group) === d)
                  .map((it, i) => {
                    const [hh, mm] = str(it.date, "09:00").split(":").map((x) => Number(x) || 0);
                    const dur = num(it.value) || 45;
                    return (
                      <div
                        key={i}
                        className="absolute inset-x-1 overflow-hidden rounded-md px-1.5 py-1 text-white"
                        style={{ top: ((hh! - start) + (mm ?? 0) / 60) * rowH + 1, height: Math.max(22, (dur / 60) * rowH - 2), background: color(str(it.meta)) }}
                      >
                        <p className="truncate text-[11px] font-semibold leading-tight">{str(it.title)}</p>
                        <p className="truncate text-[10px] leading-tight text-white/75">{str(it.date)} · {dur} min</p>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
         </div>
        </div>
      </div>
    </SideShell>
  );
}

/** Point of sale: product grid on the left, cart and total on the right. */
export function PosScreen(props: ScreenProps) {
  const { p } = props;
  const items = list(p.items);
  const cart = list(p.aside);
  const cats = groupsOf(items);
  const total = cart.reduce((s, c) => s + num(c.value), 0);
  return (
    <TopShell props={props} right={<span className="hidden text-[12px] opacity-60 sm:block">{str(p.subtitle)}</span>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 rounded-xl border border-current/15 px-4 py-2.5 text-[13px] opacity-55">{str(p.search_placeholder, "Buscar produto ou ler código de barras")}</div>
          </div>
          <Chips options={["Todos", ...cats.slice(0, 5)]} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((it, i) => {
              const stock = num(it.owner);
              return (
                <div key={i} className="rounded-xl border border-current/10 bg-[var(--rc-bg)] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="grid h-16 place-items-center rounded-lg text-[22px] font-bold text-white" style={{ background: `linear-gradient(135deg, hsl(${hue(str(it.title))} 55% 50%), hsl(${(hue(str(it.title)) + 40) % 360} 55% 38%))` }}>
                    {str(it.title).slice(0, 1).toUpperCase()}
                  </div>
                  <p className="mt-2 truncate text-[12.5px] font-semibold">{str(it.title)}</p>
                  <p className="truncate text-[10.5px] opacity-45">{str(it.meta)}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[var(--rc-primary)]">{str(it.value)}</span>
                    <Pill tone={stock <= 5 ? "bad" : "mute"}>{str(it.owner)}</Pill>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <aside className="flex flex-col rounded-2xl border border-current/10 p-4">
          <p className="text-[14px] font-semibold">{str(p.aside_title, "Venda atual")}</p>
          <div className="mt-3 flex-1 divide-y divide-current/10">
            {cart.map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-2.5 text-[12.5px]">
                <span className="grid size-6 place-items-center rounded-md bg-current/10 text-[11px] font-semibold">{str(c.group, "1")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{str(c.title)}</span>
                  <span className="block truncate text-[10.5px] opacity-45">{str(c.meta)}</span>
                </span>
                <span className="font-semibold">{str(c.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-current/10 pt-3 text-[12.5px]">
            <div className="flex justify-between opacity-60">
              <span>Subtotal</span>
              <span>{money(total)}</span>
            </div>
            <div className="flex items-baseline justify-between text-[16px] font-semibold">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11.5px]">
            {["Pix", "Débito", "Crédito"].map((m, i) => (
              <span key={m} className={`rounded-lg py-2 ${i === 0 ? "bg-[var(--rc-primary)]/15 font-medium text-[var(--rc-primary)]" : "border border-current/15 opacity-70"}`}>
                {m}
              </span>
            ))}
          </div>
          <span className="mt-3 rounded-xl bg-[var(--rc-primary)] py-3 text-center text-[14px] font-semibold text-white">Cobrar {money(total)}</span>
        </aside>
      </div>
    </TopShell>
  );
}

/** Contracts: document list, paper preview and signature status. */
export function ContractsScreen(props: ScreenProps) {
  const { p } = props;
  const items = list(p.items);
  const signers = list(p.aside);
  const first = items[0];
  const statuses = groupsOf(items);
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} />
      <div className="grid gap-4 lg:grid-cols-[17rem_1fr_15rem]">
        <div className="space-y-2">
          <Chips options={["Todos", ...statuses.slice(0, 2)]} />
          {items.map((it, i) => (
            <div key={i} className={`rounded-xl border p-3 ${i === 0 ? "border-[var(--rc-primary)] bg-[color-mix(in_oklab,var(--rc-primary)_6%,transparent)]" : "border-current/10"}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12.5px] font-semibold leading-snug">{str(it.title)}</p>
                <Pill>{str(it.group)}</Pill>
              </div>
              <p className="mt-1 text-[11px] opacity-55">
                {str(it.meta)} · {str(it.date)}
              </p>
            </div>
          ))}
        </div>
        <div className="hidden rounded-xl bg-current/[0.06] p-5 lg:block">
          <div className="mx-auto max-w-md rounded-md bg-white p-7 text-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
            <p className="text-center text-[13px] font-bold uppercase tracking-[0.08em]">{str(first?.title)}</p>
            <div className="mt-5 space-y-2">
              {[92, 100, 88, 96, 70, 100, 84, 94, 60].map((w, i) => (
                <div key={i} className="h-1.5 rounded bg-neutral-200" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {signers.slice(0, 2).map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`border-b border-neutral-400 pb-1 text-[15px] italic ${/assinou/i.test(str(s.value)) ? "text-[var(--rc-primary)]" : "text-transparent"}`} style={{ fontFamily: "'Segoe Script', cursive" }}>
                    {str(s.title).split(" ")[0]}
                  </div>
                  <p className="mt-1 text-[10px] text-neutral-500">{str(s.title)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="rounded-xl border border-current/10 p-4">
          <p className="text-[13px] font-semibold">{str(p.aside_title, "Assinaturas")}</p>
          <div className="mt-3 space-y-3">
            {signers.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Avatar name={str(s.title)} size={7} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium">{str(s.title)}</span>
                  <span className="block text-[11px] opacity-55">{str(s.meta)}</span>
                </span>
                <Pill>{str(s.value)}</Pill>
              </div>
            ))}
          </div>
          <span className="mt-4 block rounded-lg bg-[var(--rc-primary)] py-2 text-center text-[12px] font-medium text-white">Enviar lembrete</span>
        </aside>
      </div>
    </SideShell>
  );
}

/** BI: dark dashboard with a headline chart, KPI tiles and breakdown panels. */
export function BiScreen(props: ScreenProps) {
  const { p } = props;
  const series = list(p.series);
  const items = list(p.items);
  const panels = list(p.panels).slice(0, 3);
  return (
    <TopShell props={props} right={<Chips options={["7 dias", "30 dias", "Trimestre"]} active={1} />}>
      <Title p={p} />
      <KpiTiles kpis={list(p.kpis)} tone="flat" />
      <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <div className="rounded-2xl border border-current/10 bg-current/[0.03] p-5">
          <p className="mb-3 text-[13px] font-semibold">{str(p.aside_title, "Receita e meta")}</p>
          {series.length > 1 && <AreaChart rows={series} labelA="Realizado" labelB="Meta" height={200} />}
        </div>
        {panels[0] && (
          <div className="rounded-2xl border border-current/10 bg-current/[0.03] p-1">
            <Panel spec={{ title: str(panels[0].title), kind: str(panels[0].kind, "donut"), rows: items.filter((i) => str(i.group) === str(panels[0]!.source)) }} />
          </div>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {panels.slice(1).map((pn, i) => (
          <div key={i} className="rounded-2xl border border-current/10 bg-current/[0.03] p-1">
            <Panel spec={{ title: str(pn.title), kind: str(pn.kind, "bars"), rows: items.filter((it) => str(it.group) === str(pn.source)) }} />
          </div>
        ))}
      </div>
    </TopShell>
  );
}

/** Generic module page: clean table with only the columns that have data. */
export function TableScreen(props: ScreenProps) {
  const { p } = props;
  const items = list(p.items);
  const cols = list(p.columns).map((c) => str(c.title));
  // Headers are written for the columns that carry data, in field order, so an unused field never shifts them.
  const present = (["title", "meta", "owner", "value", "date", "group"] as const).filter((f) => items.some((it) => str(it[f])));
  const fallback: Record<string, string> = { title: "Registro", meta: "Detalhe", owner: "Responsável", value: "Valor", date: "Data", group: "Situação" };
  const fields = present.map((f, i) => ({ f, head: cols[i] || fallback[f]! }));
  const statuses = groupsOf(items);
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} action={<Chips options={["Todos", ...statuses.slice(0, 3)]} />} />
      <KpiTiles kpis={list(p.kpis)} />
      <div className="overflow-x-auto rounded-xl border border-current/10 text-[12.5px] [&>div]:min-w-[34rem]">
        <div className="grid gap-3 bg-current/[0.04] px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] opacity-55" style={{ gridTemplateColumns: `1.5fr repeat(${Math.max(fields.length - 1, 1)}, minmax(0, 1fr))` }}>
          {fields.map(({ head }) => (
            <span key={head} className="truncate">
              {head}
            </span>
          ))}
        </div>
        {items.map((it, i) => (
          <div key={i} className="grid items-center gap-3 border-t border-current/10 px-4 py-3" style={{ gridTemplateColumns: `1.5fr repeat(${Math.max(fields.length - 1, 1)}, minmax(0, 1fr))` }}>
            {fields.map(({ f }) =>
              f === "group" ? (
                <span key={f}>
                  <Pill>{str(it[f])}</Pill>
                </span>
              ) : f === "owner" && /respons|gestor|vendedor|profission|dono/i.test(fields.find((x) => x.f === "owner")?.head ?? "") ? (
                <span key={f} className="flex min-w-0 items-center gap-2">
                  <Avatar name={str(it[f])} size={5} />
                  <span className="truncate opacity-75">{str(it[f])}</span>
                </span>
              ) : (
                <span key={f} className={`truncate ${f === "title" ? "font-semibold" : f === "value" ? "font-medium" : "opacity-65"}`}>
                  {str(it[f])}
                </span>
              ),
            )}
          </div>
        ))}
      </div>
    </SideShell>
  );
}

/** Proposal builder: items on the left, the finished document on the right. */
export function QuoteScreen(props: ScreenProps) {
  const { p } = props;
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} />
      <QuoteLive lines={list(p.items)} settings={list(p.aside)} client={str(p.aside_title, "Cliente")} />
    </SideShell>
  );
}

/** Financing simulator: the numbers recalculate on every keystroke. */
export function LoanScreen(props: ScreenProps) {
  const { p } = props;
  return (
    <SideShell props={props}>
      <Title p={p} />
      <LoanLive inputs={list(p.items)} mode={str(p.mode)} />
    </SideShell>
  );
}

/** Personal budget: tick the bills you paid and the leftover recalculates. */
export function BudgetScreen(props: ScreenProps) {
  const { p } = props;
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} />
      <BudgetLive incomes={list(p.aside)} bills={list(p.items)} />
    </SideShell>
  );
}

/** Desk booking: floor plan you can click. */
export function DeskScreen(props: ScreenProps) {
  const { p } = props;
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} />
      <KpiTiles kpis={list(p.kpis)} spark={false} tone="flat" />
      <DeskLive desks={list(p.items)} people={list(p.aside)} />
    </SideShell>
  );
}

/** Expense approvals: manager then finance, each with their own buttons. */
export function ApprovalsScreen(props: ScreenProps) {
  const { p } = props;
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} />
      <ApprovalsLive claims={list(p.items)} limits={list(p.aside)} role={str(p.mode, "Colaborador")} />
    </SideShell>
  );
}

/** Customer health: scatter of every account, drivers behind each score. */
export function HealthScreen(props: ScreenProps) {
  const { p } = props;
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} />
      <KpiTiles kpis={list(p.kpis)} tone="flat" />
      <HealthLive accounts={list(p.items)} />
    </SideShell>
  );
}

/** Invoice editor with the document next to it. */
export function InvoiceScreen(props: ScreenProps) {
  const { p, site } = props;
  const note = list(p.aside)[0];
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} />
      <InvoiceLive lines={list(p.items)} client={str(p.aside_title, "Cliente")} business={str(site.company_name, "Empresa")} taxNote={str(note?.meta)} />
    </SideShell>
  );
}

/** Content calendar: month grid, day detail and status counters. */
export function CalendarScreen(props: ScreenProps) {
  const { p } = props;
  return (
    <SideShell props={props} action={str(p.primary_action)}>
      <Title p={p} />
      <KpiTiles kpis={list(p.kpis)} tone="flat" />
      <CalendarLive posts={list(p.items)} monthLabel={str(p.aside_title, "Mês")} startsOn={Number(str(p.mode, "0")) || 0} />
    </SideShell>
  );
}

export const SCREENS: Record<string, (props: ScreenProps) => ReactNode> = {
  kanban: KanbanScreen,
  orders: OrdersScreen,
  ledger: LedgerScreen,
  people: PeopleScreen,
  inbox: InboxScreen,
  portal: PortalScreen,
  week: WeekScreen,
  pos: PosScreen,
  contracts: ContractsScreen,
  bi: BiScreen,
  table: TableScreen,
  quote: QuoteScreen,
  loan: LoanScreen,
  budget: BudgetScreen,
  desk: DeskScreen,
  approvals: ApprovalsScreen,
  health: HealthScreen,
  invoice: InvoiceScreen,
  calendar: CalendarScreen,
};
