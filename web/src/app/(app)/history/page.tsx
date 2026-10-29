"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BarChart3, Hash, Loader2, Map, Search, Table2, Trash2, TrendingUp, Type } from "lucide-react";
import type { ArtifactSummary } from "@/shared";
import { api } from "@/lib/api";
import { useI18n, type Key } from "@/i18n";
import { useHistory } from "@/components/shell/HistoryProvider";
import { useToasts } from "@/store/toasts";

const ICON: Record<string, typeof BarChart3> = { bar: BarChart3, line: TrendingUp, area: TrendingUp, map: Map, table: Table2, metric: Hash, text: Type };

export default function History() {
  const { t, formatDate } = useI18n();
  const { items, error, refresh, removeLocal } = useHistory();
  const [q, setQ] = useState("");
  const [del, setDel] = useState<ArtifactSummary | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const push = useToasts((s) => s.push);
  useEffect(refresh, [refresh]);
  useEffect(() => { const d = dlg.current; if (!d) return; if (del && !d.open) d.showModal(); if (!del && d.open) d.close(); }, [del]);
  const shown = useMemo(() => (items ?? []).filter((a) => `${a.title} ${a.question}`.toLowerCase().includes(q.toLowerCase())), [items, q]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">{t("hist.title")}</h1>
      <p className="mt-1 text-muted">{t("hist.subtitle")}</p>
      <div className="relative mt-6 max-w-md"><label htmlFor="hq" className="sr-only">{t("hist.searchLabel")}</label><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden /><input id="hq" type="search" className="field pl-9" placeholder={t("hist.searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} /></div>

      {error && !items && <div role="alert" className="card mt-6 border-danger p-4 text-sm"><p>{t("hist.loadError")}</p><button className="btn mt-3" onClick={refresh}>{t("ws.tryAgain")}</button></div>}
      {!items && !error && <div role="status" className="mt-10 flex items-center gap-2 text-muted"><Loader2 className="h-5 w-5 animate-spin" aria-hidden />{t("hist.loading")}</div>}
      {items && items.length === 0 && (
        <div className="card mt-8 p-10 text-center"><h2 className="text-xl font-semibold">{t("hist.emptyTitle")}</h2><p className="mt-2 text-muted">{t("hist.emptyBody")}</p><Link href="/workspace" className="btn btn-primary mt-5">{t("hist.emptyCta")}</Link></div>
      )}
      {items && items.length > 0 && shown.length === 0 && <p className="mt-8 text-muted">{t("hist.noMatch", { q })}</p>}
      <ul className="mt-6 space-y-3">
        {shown.map((a) => (
          <li key={a.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><h2 className="text-lg font-semibold"><Link href={`/workspace/${a.id}`} className="hover:underline">{a.title}</Link></h2><p className="mt-1 max-w-[70ch] text-sm text-muted">“{a.question}”</p></div>
              <div className="flex gap-2"><Link href={`/workspace/${a.id}`} className="btn btn-primary">{t("hist.open")}</Link><button className="btn-icon border border-line" aria-label={t("hist.delete", { title: a.title })} onClick={() => setDel(a)}><Trash2 className="h-4 w-4" aria-hidden /></button></div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
              <ul className="flex flex-wrap gap-1.5" aria-label={t("hist.contains")}>{a.componentTypes.filter((c) => ICON[c]).map((c) => { const I = ICON[c]!; return <li key={c} className="inline-flex items-center gap-1 rounded-md border border-line bg-surface2 px-2 py-1 text-ink"><I className="h-3.5 w-3.5" aria-hidden />{t(`ctype.${c}` as Key)}</li>; })}</ul>
              <span>{t("hist.updated", { date: formatDate(a.updatedAt) })}</span><span>{t("hist.version", { n: a.currentVersion, total: a.versionCount })}</span>
            </div>
          </li>
        ))}
      </ul>

      <dialog ref={dlg} onClose={() => setDel(null)} aria-labelledby="del-h" className="m-auto w-[min(440px,94vw)] rounded-card border border-line bg-surface p-5 text-ink">
        {del && (<><h2 id="del-h" className="text-lg font-semibold">{t("hist.delTitle")}</h2><p className="mt-2 text-sm text-muted">{t("hist.delBody", { title: del.title, n: del.versionCount })}</p>
          <div className="mt-5 flex justify-end gap-2"><button className="btn" onClick={() => setDel(null)}>{t("hist.keep")}</button>
            <button className="btn border-danger text-danger" onClick={async () => { try { await api.remove(del.id); removeLocal(del.id); push(t("hist.deleted"), "success"); } catch { push(t("hist.deleteFail"), "error"); } setDel(null); }}>{t("hist.delConfirm")}</button></div></>)}
      </dialog>
    </div>
  );
}
