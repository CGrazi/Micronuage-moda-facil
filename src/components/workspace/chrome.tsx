// The app's screens — started from a Micronuage template, now yours to change.
import { Link } from "react-router-dom";
import { href as sitePath, str } from "./lib";

/** Sidebar labels link to extra pages by slugified label — see attachAppModulePages. */
export function labelToPageId(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function Chip({ children, on }: { children: string; on?: boolean }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] ${on ? "bg-[var(--rc-primary)] text-white" : "bg-current/10 opacity-70"}`}>{children}</span>;
}

type MenuEntry = { label: string; group: string };

function groupMenu(menu: Record<string, unknown>[]): { name: string; entries: MenuEntry[] }[] {
  const groups: { name: string; entries: MenuEntry[] }[] = [];
  for (const item of menu) {
    const label = str(item.label, str(item.title));
    if (!label) continue;
    const name = str(item.group);
    const bucket = groups.find((g) => g.name === name);
    if (bucket) bucket.entries.push({ label, group: name });
    else groups.push({ name, entries: [{ label, group: name }] });
  }
  return groups;
}

export function Sidebar({
  brand,
  menu,
  pathPrefix,
  extraPageIds,
  activePageId,
}: {
  brand: string;
  menu: Record<string, unknown>[];
  pathPrefix?: string;
  extraPageIds?: ReadonlySet<string>;
  activePageId?: string;
}) {
  const groups = groupMenu(menu);
  let index = -1;
  return (
    <aside className="flex flex-col border-r border-current/10 bg-current/[0.03] p-3 sm:p-4">
      <div className="mb-5 flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-[var(--rc-primary)] text-[11px] font-bold text-white">{brand.slice(0, 1).toUpperCase()}</span>
        <p className="truncate text-[12.5px] font-semibold tracking-[-0.01em]">{brand}</p>
      </div>
      <nav className="space-y-3">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.name && <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-[0.12em] opacity-40">{group.name}</p>}
            <div className="space-y-0.5">
              {group.entries.map((entry) => {
                index++;
                const pageId = labelToPageId(entry.label);
                const active = activePageId ? pageId === activePageId : index === 0;
                const className = `flex items-center gap-2 rounded-md px-2 py-1.5 text-[11.5px] ${
                  active ? "bg-[color-mix(in_oklab,var(--rc-primary)_14%,transparent)] font-medium text-[var(--rc-primary)]" : "opacity-65 hover:opacity-100"
                }`;
                const dot = <span className={`size-1.5 shrink-0 rounded-full ${active ? "bg-[var(--rc-primary)]" : "bg-current/30"}`} />;
                const to = index === 0 ? sitePath("/", pathPrefix) : extraPageIds?.has(pageId) ? sitePath(`/${pageId}`, pathPrefix) : "";
                if (to) {
                  return (
                    <Link key={entry.label} to={to} className={className}>
                      {dot}
                      <span className="truncate">{entry.label}</span>
                    </Link>
                  );
                }
                return (
                  <p key={entry.label} className={className}>
                    {dot}
                    <span className="truncate">{entry.label}</span>
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2 border-t border-current/10 pt-3">
        <span className="size-5 shrink-0 rounded-full bg-current/15" />
        <span className="truncate text-[10.5px] opacity-55">Minha conta</span>
      </div>
    </aside>
  );
}

export function Topbar({ searchPlaceholder, action }: { searchPlaceholder: string; action: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-current/10 px-4 py-2.5 sm:px-5">
      <div className="min-w-0 flex-1 truncate rounded-md border border-current/10 bg-current/[0.02] px-2.5 py-1.5 text-[11px] opacity-45">{searchPlaceholder}</div>
      <span className="hidden size-7 shrink-0 place-items-center rounded-md border border-current/10 text-[11px] opacity-50 sm:grid">?</span>
      <span className="grid size-7 shrink-0 place-items-center rounded-md border border-current/10 text-[11px] opacity-50">@</span>
      {action && <span className="shrink-0 rounded-md bg-[var(--rc-primary)] px-2.5 py-1.5 text-[10.5px] font-medium text-white">{action}</span>}
    </div>
  );
}

export function Kpis({ items }: { items: Record<string, unknown>[] }) {
  if (!items.length) return null;
  const cols = items.length >= 5 ? "sm:grid-cols-3 lg:grid-cols-6" : items.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";
  return (
    <div className={`grid grid-cols-2 gap-2 ${cols}`}>
      {items.map((k, i) => {
        const delta = str(k.delta);
        const down = delta.startsWith("-");
        return (
          <div key={i} className="rounded-lg border border-current/10 bg-[var(--rc-bg)] p-3">
            <p className="truncate text-[9.5px] font-medium uppercase tracking-[0.1em] opacity-50">{str(k.label)}</p>
            <p className="mt-1.5 text-[19px] font-semibold leading-none tracking-[-0.03em]">{str(k.value)}</p>
            {delta && <p className={`mt-1.5 text-[10px] font-medium ${down ? "text-red-500" : "text-emerald-600"}`}>{delta}</p>}
          </div>
        );
      })}
    </div>
  );
}
