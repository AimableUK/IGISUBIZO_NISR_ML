"use client";
import { useId, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Column, Row } from "@/shared";
import { fmtCell } from "@/lib/format";

export default function DataTable({ caption, columns, rows, searchable = true, sortable = true, pageSize = 15 }: {
  caption: string; columns: Column[]; rows: Row[]; searchable?: boolean; sortable?: boolean; pageSize?: number;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const sid = useId();

  const view = useMemo(() => {
    let r = rows;
    if (q.trim()) { const s = q.toLowerCase(); r = r.filter((row) => columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(s))); }
    if (sort) r = [...r].sort((a, b) => { const x = a[sort.key], y = b[sort.key]; return (typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""))) * sort.dir; });
    return r;
  }, [rows, q, sort, columns]);
  const pages = Math.max(1, Math.ceil(view.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const slice = view.slice(cur * pageSize, cur * pageSize + pageSize);

  return (
    <div className="space-y-2">
      {searchable && (
        <div className="relative max-w-xs">
          <label htmlFor={sid} className="sr-only">Search table: {caption}</label>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input id={sid} type="search" className="field pl-9" placeholder="Search rows" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
        </div>
      )}
      <div role="region" aria-label={`${caption} table, scrollable`} tabIndex={0} className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface2">
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key;
                const numeric = c.kind === "number" || c.kind === "percent";
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (sort!.dir === 1 ? "ascending" : "descending") : "none"} className={`whitespace-nowrap border-b border-line px-3 py-2 font-semibold ${numeric ? "text-right" : "text-left"}`}>
                    {sortable ? (
                      <button className="inline-flex min-h-[36px] items-center gap-1 hover:underline" onClick={() => setSort(active && sort!.dir === -1 ? null : { key: c.key, dir: active ? -1 : 1 })}>
                        {c.label}
                        {active && (sort!.dir === 1 ? <ArrowUp aria-hidden className="h-3.5 w-3.5" /> : <ArrowDown aria-hidden className="h-3.5 w-3.5" />)}
                      </button>
                    ) : c.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-muted">No rows match your search.</td></tr>}
            {slice.map((r, i) => (
              <tr key={i} className="border-b border-line last:border-0 odd:bg-bg/60">
                {columns.map((c, ci) => {
                  const numeric = c.kind === "number" || c.kind === "percent";
                  const Cell = ci === 0 ? "th" : "td";
                  return <Cell key={c.key} scope={ci === 0 ? "row" : undefined} className={`px-3 py-2 ${ci === 0 ? "text-left font-medium" : ""} ${numeric ? "text-right tabular-nums" : ""}`}>{fmtCell(r[c.key], c)}</Cell>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span aria-live="polite">Page {cur + 1} of {pages} · {view.length} rows</span>
          <div className="flex gap-1">
            <button className="btn-sm" disabled={cur === 0} onClick={() => setPage(cur - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" aria-hidden /></button>
            <button className="btn-sm" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" aria-hidden /></button>
          </div>
        </div>
      )}
    </div>
  );
}
