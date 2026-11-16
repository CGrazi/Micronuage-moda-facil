// The app's screens — started from a Micronuage template, now yours to change.
import { list, str } from "./lib";
import { Kpis, Sidebar, Topbar } from "./chrome";
import { SCREENS } from "./screens";
import { Calendar, DataTable, Dashboard, Documents, Pipeline, Queue } from "./views";

/**
 * The product itself — CRM board, dashboard, queue, calendar — not a marketing hero.
 * One section draws the entire app screen: sidebar, top bar, KPI strip and the view for `kind`.
 * Sub-components live in workspace-chrome / workspace-views / workspace-panels.
 */
export function Workspace({
  p,
  site,
  compact,
  pathPrefix,
  extraPageIds,
  activePageId,
}: {
  p: Record<string, unknown>;
  site: Record<string, unknown>;
  compact?: boolean;
  pathPrefix?: string;
  extraPageIds?: ReadonlySet<string>;
  activePageId?: string;
}) {
  const Screen = SCREENS[str(p.screen)];
  if (Screen) return <Screen p={p} site={site} compact={compact} pathPrefix={pathPrefix} extraPageIds={extraPageIds} activePageId={activePageId} />;
  const kind = str(p.kind, "records");
  const brand = str(site.company_name, "Produto");
  const menu = list(p.menu);
  const kpis = list(p.kpis);
  const columns = list(p.columns);
  const panels = list(p.panels);
  const items = list(p.items);
  const height = compact ? "min-h-[36rem]" : "min-h-[54rem]";

  return (
    <section className={`${height} border-b border-current/10`}>
      <div className={`grid grid-cols-[10rem_1fr] sm:grid-cols-[12rem_1fr] ${height}`}>
        <Sidebar brand={brand} menu={menu.length ? menu : [{ label: str(p.title, "Início") }]} pathPrefix={pathPrefix} extraPageIds={extraPageIds} activePageId={activePageId} />
        <div className="flex min-w-0 flex-col">
          <Topbar searchPlaceholder={str(p.search_placeholder, "Buscar…")} action={str(p.primary_action)} />
          <div className="min-w-0 flex-1 space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold tracking-[-0.02em]">{str(p.title, brand)}</p>
                {str(p.subtitle) && <p className="mt-0.5 text-[11px] opacity-55">{str(p.subtitle)}</p>}
              </div>
              <p className="text-[10px] opacity-40">{items.length} registros</p>
            </div>
            {kind !== "calendar" && <Kpis items={kpis} />}
            {kind === "pipeline" ? (
              <Pipeline columns={columns} items={items} />
            ) : kind === "dashboard" ? (
              <Dashboard panels={panels} items={items} columns={columns} />
            ) : kind === "calendar" ? (
              <Calendar items={items} />
            ) : kind === "documents" ? (
              <Documents items={items} />
            ) : kind === "queue" ? (
              <Queue items={items} />
            ) : (
              <DataTable items={items} columns={columns} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
