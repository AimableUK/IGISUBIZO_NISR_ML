"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BarChart3, Hash, Loader2, Map, Search, Table2, Trash2, TrendingUp, Type } from "lucide-react";
import type { ArtifactSummary } from "@/shared";
import { api, ApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { useToasts } from "@/store/toasts";

const ICON: Record<string, typeof BarChart3> = { bar: BarChart3, line: TrendingUp, area: TrendingUp, map: Map, table: Table2, metric: Hash, text: Type };
const NAME: Record<string, string> = { bar: "Bar chart", line: "Line chart", area: "Area chart", map: "Map", table: "Table", metric: "Key figures", text: "Insights" };

export default function History() {
  const [items, setItems] = useState<ArtifactSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [del, setDel] = useState<ArtifactSummary | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const push = useToasts((t) => t.push);
  const load = () => { setError(null); api.list().then(setItems).catch((e) => setError(e instanceof ApiError ? e.message : "Could not load history.")); };
  useEffect(load, []);
  useEffect(() => { const d = dlg.current; if (!d) return; if (del && !d.open) d.showModal(); if (!del && d.open) d.close(); }, [del]);
  const shown = useMemo(() => (items ?? []).filter((a) => `${a.title} ${a.question}`.toLowerCase().includes(q.toLowerCase())), [items, q]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Saved analyses</h1>
      <p className="mt-1 text-muted">Each item is a workspace with its result, sources, layout and versions.</p>
      <div className="relative mt-6 max-w-md"><label htmlFor="hq" className="sr-only">Search saved analyses</label><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden /><input id="hq" type="search" className="field pl-9" placeholder="Search by title or question" value={q} onChange={(e) => setQ(e.target.value)} /></div>

      {error && <div role="alert" className="card mt-6 border-danger p-4 text-sm"><p>{error}</p><button className="btn mt-3" onClick={load}>Try again</button></div>}
      {!items && !error && <div role="status" className="mt-10 flex items-center gap-2 text-muted"><Loader2 className="h-5 w-5 animate-spin" aria-hidden />Loading your analyses…</div>}
      {items && items.length === 0 && (
        <div className="card mt-8 p-10 text-center"><h2 className="text-xl font-semibold">No saved analyses yet</h2><p className="mt-2 text-muted">Ask a question and your first workspace will appear here.</p><Link href="/workspace" className="btn btn-primary mt-5">Start an analysis</Link></div>
      )}
      {items && items.length > 0 && shown.length === 0 && <p className="mt-8 text-muted">Nothing matches “{q}”.</p>}
      <ul className="mt-6 space-y-3">
        {shown.map((a) => (
          <li key={a.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><h2 className="text-lg font-semibold"><Link href={`/workspace/${a.id}`} className="hover:underline">{a.title}</Link></h2><p className="mt-1 max-w-[70ch] text-sm text-muted">“{a.question}”</p></div>
              <div className="flex gap-2"><Link href={`/workspace/${a.id}`} className="btn btn-primary">Open</Link><button className="btn-icon border border-line" aria-label={`Delete ${a.title}`} onClick={() => setDel(a)}><Trash2 className="h-4 w-4" aria-hidden /></button></div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
              <ul className="flex flex-wrap gap-1.5" aria-label="Contains">{a.componentTypes.filter((t) => ICON[t]).map((t) => { const I = ICON[t]!; return <li key={t} className="inline-flex items-center gap-1 rounded-md border border-line bg-surface2 px-2 py-1 text-ink"><I className="h-3.5 w-3.5" aria-hidden />{NAME[t]}</li>; })}</ul>
              <span>Updated {fmtDate(a.updatedAt)}</span><span>Version {a.currentVersion} of {a.versionCount}</span>
            </div>
          </li>
        ))}
      </ul>

      <dialog ref={dlg} onClose={() => setDel(null)} aria-labelledby="del-h" className="m-auto w-[min(440px,94vw)] rounded-card border border-line bg-surface p-5 text-ink">
        {del && (<><h2 id="del-h" className="text-lg font-semibold">Delete this analysis?</h2><p className="mt-2 text-sm text-muted">“{del.title}” and all {del.versionCount} of its versions will be removed. This cannot be undone.</p>
          <div className="mt-5 flex justify-end gap-2"><button className="btn" onClick={() => setDel(null)}>Keep it</button>
            <button className="btn border-danger text-danger" onClick={async () => { try { await api.remove(del.id); setItems((l) => (l ?? []).filter((x) => x.id !== del.id)); push("Analysis deleted.", "success"); } catch { push("Could not delete the analysis.", "error"); } setDel(null); }}>Delete analysis</button></div></>)}
      </dialog>
    </div>
  );
}
