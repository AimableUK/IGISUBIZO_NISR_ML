"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, History as HistoryIcon, PanelLeftClose, PanelLeftOpen, Plus, Search, X } from "lucide-react";
import type { ArtifactSummary } from "@/shared";
import { useI18n, type Key } from "@/i18n";
import { useHistory } from "./HistoryProvider";
import UserMenu from "./UserMenu";
import { cx } from "./cx";

type GroupId = "today" | "yesterday" | "week" | "older";
const ORDER: GroupId[] = ["today", "yesterday", "week", "older"];

function groupOf(updatedAt: string, startOfToday: number): GroupId {
  const days = Math.floor((startOfToday - new Date(updatedAt).setHours(0, 0, 0, 0)) / 86_400_000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : days < 7 ? "week" : "older";
}

const ROW = "flex h-10 items-center rounded-lg text-sm hover:bg-surface2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
const ICON_BTN = "inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

type Props = {
  expanded: boolean;
  /** On mobile the toggle closes the drawer, so it shows an X. */
  isDrawer: boolean;
  onToggle: () => void;
  onNavigate: () => void;
};

export default function Sidebar({ expanded, isDrawer, onToggle, onNavigate }: Props) {
  const { t } = useI18n();
  const pathname = usePathname();
  const { items, error, refresh } = useHistory();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  // A freshly created analysis is not in the list yet: reload once when we land on it.
  const openId = pathname.match(/^\/workspace\/([^/]+)/)?.[1];
  useEffect(() => { if (openId && items && !items.some((a) => a.id === openId)) refresh(); }, [openId, items, refresh]);
  useEffect(() => { if (searching && expanded) input.current?.focus(); }, [searching, expanded]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (items ?? []).filter((a) => !needle || `${a.title} ${a.question}`.toLowerCase().includes(needle));
  }, [items, q]);

  const groups = useMemo(() => {
    const start = new Date().setHours(0, 0, 0, 0);
    const map: Record<GroupId, ArtifactSummary[]> = { today: [], yesterday: [], week: [], older: [] };
    for (const a of filtered) map[groupOf(a.updatedAt, start)].push(a);
    return ORDER.map((id) => ({ id, list: map[id] })).filter((g) => g.list.length);
  }, [filtered]);

  const closeSearch = () => { setSearching(false); setQ(""); };
  const ToggleIcon = isDrawer ? X : expanded ? PanelLeftClose : PanelLeftOpen;
  const toggleLabel = isDrawer ? t("nav.closeMenu") : expanded ? t("nav.collapse") : t("nav.expand");

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand + toggle */}
      <div className={cx("flex h-14 shrink-0 items-center", expanded ? "justify-between pl-4 pr-2" : "justify-center")}>
        {expanded && (
          <Link href="/workspace" onClick={onNavigate} className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-lg bg-tint text-on-tint"><BarChart3 className="h-4 w-4" /></span>
            <span className="text-lg font-semibold tracking-tight">{t("brand")}</span>
          </Link>
        )}
        <button type="button" className={ICON_BTN} onClick={onToggle} aria-label={toggleLabel} title={toggleLabel}>
          <ToggleIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* Primary actions */}
      <div className={cx("space-y-1 px-2", !expanded && "flex flex-col items-center")}>
        <Link
          href="/workspace"
          onClick={onNavigate}
          aria-label={expanded ? undefined : t("nav.new")}
          title={expanded ? undefined : t("nav.new")}
          className={cx(ROW, expanded ? "w-full gap-3 px-3 font-medium" : "w-10 justify-center", pathname === "/workspace" && "bg-surface2")}
        >
          <Plus className="h-5 w-5 shrink-0" aria-hidden />{expanded && t("nav.new")}
        </Link>

        {expanded && searching ? (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              ref={input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); closeSearch(); } }}
              onBlur={() => { if (!q) setSearching(false); }}
              placeholder={t("nav.searchPlaceholder")}
              aria-label={t("nav.search")}
              className="field h-10 pl-9 text-sm"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setSearching(true); if (!expanded) onToggle(); }}
            aria-label={expanded ? undefined : t("nav.search")}
            title={expanded ? undefined : t("nav.search")}
            className={cx(ROW, expanded ? "w-full gap-3 px-3" : "w-10 justify-center")}
          >
            <Search className="h-5 w-5 shrink-0" aria-hidden />{expanded && t("nav.search")}
          </button>
        )}
      </div>

      {/* History */}
      <nav aria-label={t("nav.history")} className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {expanded && (
          <>
            {items === null && !error && (
              <div aria-hidden className="space-y-2 px-1 pt-2">
                {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-surface2 motion-reduce:animate-none" />)}
              </div>
            )}
            {error && (
              <div role="alert" className="px-3 py-2 text-sm">
                <p className="text-muted">{t("nav.loadError")}</p>
                <button type="button" onClick={refresh} className="mt-1 font-medium text-primary underline underline-offset-2">{t("nav.retry")}</button>
              </div>
            )}
            {items && items.length === 0 && <p className="px-3 py-2 text-sm text-muted">{t("nav.empty")}</p>}
            {items && items.length > 0 && filtered.length === 0 && <p className="px-3 py-2 text-sm text-muted">{t("nav.noMatch")}</p>}
            {groups.map((g) => (
              <section key={g.id} className="mb-3">
                <h2 className="px-3 pb-1 pt-2 text-xs font-medium text-muted">{t(`group.${g.id}` as Key)}</h2>
                <ul className="space-y-0.5">
                  {g.list.map((a) => {
                    const active = openId === a.id;
                    return (
                      <li key={a.id}>
                        <Link
                          href={`/workspace/${a.id}`}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          title={a.title}
                          className={cx(ROW, "px-3", active ? "bg-tint font-medium text-on-tint" : "text-ink")}
                        >
                          <span className="truncate">{a.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className={cx("shrink-0 space-y-1 border-t border-line p-2", !expanded && "flex flex-col items-center")}>
        <Link
          href="/history"
          onClick={onNavigate}
          aria-label={expanded ? undefined : t("nav.all")}
          title={expanded ? undefined : t("nav.all")}
          className={cx(ROW, expanded ? "w-full gap-3 px-3 text-muted" : "w-10 justify-center text-muted", pathname === "/history" && "bg-surface2")}
        >
          <HistoryIcon className="h-5 w-5 shrink-0" aria-hidden />{expanded && t("nav.all")}
        </Link>
        <div className={expanded ? "w-full" : "w-10"}><UserMenu expanded={expanded} onNavigate={onNavigate} /></div>
      </div>
    </div>
  );
}
