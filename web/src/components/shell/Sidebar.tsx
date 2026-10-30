"use client";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { History as HistoryIcon, PanelLeftClose, PanelLeftOpen, Plus, Search, X } from "lucide-react";
import type { ArtifactSummary } from "@/shared";
import Logo, { LogoMark } from "@/components/Logo";
import { useI18n, type Key } from "@/i18n";
import { useHistory } from "./HistoryProvider";
import Tooltip from "./Tooltip";
import UserMenu from "./UserMenu";
import { cx } from "./cx";

type GroupId = "today" | "yesterday" | "week" | "older";
const ORDER: GroupId[] = ["today", "yesterday", "week", "older"];

function groupOf(updatedAt: string, startOfToday: number): GroupId {
  const days = Math.floor((startOfToday - new Date(updatedAt).setHours(0, 0, 0, 0)) / 86_400_000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : days < 7 ? "week" : "older";
}

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
const ROW = `flex h-10 cursor-pointer items-center rounded-lg text-sm hover:bg-surface2 ${FOCUS}`;
const ICON_BTN = `inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink ${FOCUS}`;

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
  const ToggleIcon = isDrawer ? X : PanelLeftClose;
  const toggleLabel = isDrawer ? t("nav.closeMenu") : t("nav.collapse");

  // Collapsed rail: a click on any empty spot opens the sidebar. Buttons, links and open menus keep their own behaviour.
  // (Keyboard users open it with the toggle button, which becomes visible on focus.)
  const onRailClick = (e: MouseEvent<HTMLDivElement>) => {
    if (expanded) return;
    if ((e.target as HTMLElement).closest("a, button, input, select, textarea, [data-no-expand]")) return;
    onToggle();
  };

  return (
    <div
      onClick={onRailClick}
      className={cx("group/rail flex h-full min-h-0 flex-col", !expanded && "cursor-e-resize")}
    >
      {/* Top: logo + collapse (expanded)  |  logo that turns into the expand button on hover (rail) */}
      {expanded ? (
        <div className="flex h-14 shrink-0 items-center justify-between pl-4 pr-2">
          <Logo href="/workspace" size="app" onClick={onNavigate} animated />
          <button
            type="button"
            className={cx(ICON_BTN, isDrawer ? "cursor-pointer" : "cursor-w-resize")}
            onClick={onToggle}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            <ToggleIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="flex h-14 shrink-0 items-center justify-center">
          <Tooltip label={t("nav.expand")}>
            <div className="relative h-10 w-10">
              <button
                type="button"
                onClick={onToggle}
                aria-label={t("nav.expand")}
                className={cx(ICON_BTN, "peer absolute inset-0 cursor-e-resize opacity-0 transition-opacity focus-visible:opacity-100 group-hover/rail:opacity-100 motion-reduce:transition-none")}
              >
                <PanelLeftOpen className="h-5 w-5" aria-hidden />
              </button>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity peer-focus-visible:opacity-0 group-hover/rail:opacity-0 motion-reduce:transition-none"
              >
                <LogoMark animated />
              </span>
            </div>
          </Tooltip>
        </div>
      )}

      {/* Primary actions */}
      <div className={cx("space-y-1 px-2", !expanded && "flex flex-col items-center")}>
        <Tooltip label={t("nav.new")} disabled={expanded}>
          <Link
            href="/workspace?new=1"
            onClick={onNavigate}
            aria-label={expanded ? undefined : t("nav.new")}
            className={cx(ROW, expanded ? "w-full gap-3 px-3 font-medium" : "w-10 justify-center", pathname === "/workspace" && "bg-surface2")}
          >
            <Plus className="h-5 w-5 shrink-0" aria-hidden />{expanded && t("nav.new")}
          </Link>
        </Tooltip>

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
          <Tooltip label={t("nav.search")} disabled={expanded}>
            <button
              type="button"
              onClick={() => { setSearching(true); if (!expanded) onToggle(); }}
              aria-label={expanded ? undefined : t("nav.search")}
              className={cx(ROW, expanded ? "w-full gap-3 px-3" : "w-10 justify-center")}
            >
              <Search className="h-5 w-5 shrink-0" aria-hidden />{expanded && t("nav.search")}
            </button>
          </Tooltip>
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
                <button type="button" onClick={refresh} className="mt-1 cursor-pointer font-medium text-primary underline underline-offset-2">{t("nav.retry")}</button>
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
        <Tooltip label={t("nav.all")} disabled={expanded}>
          <Link
            href="/history"
            onClick={onNavigate}
            aria-label={expanded ? undefined : t("nav.all")}
            className={cx(ROW, expanded ? "w-full gap-3 px-3 text-muted" : "w-10 justify-center text-muted", pathname === "/history" && "bg-surface2")}
          >
            <HistoryIcon className="h-5 w-5 shrink-0" aria-hidden />{expanded && t("nav.all")}
          </Link>
        </Tooltip>
        <div className={expanded ? "w-full" : "w-10"}><UserMenu expanded={expanded} onNavigate={onNavigate} /></div>
      </div>
    </div>
  );
}