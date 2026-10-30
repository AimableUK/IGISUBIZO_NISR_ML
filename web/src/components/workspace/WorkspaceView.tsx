"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Info, LayoutGrid, Redo2, RotateCcw, Save, SquareCode, Undo2 } from "lucide-react";
import { composeView, flattenComponents, PALETTES, type FilterComponent } from "@/shared";
import { useWorkspace } from "@/store/workspace";
import { useToasts } from "@/store/toasts";
import { useI18n } from "@/i18n";
import { api, ApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { RenderContext } from "@/components/renderer/context";
import Renderer from "@/components/renderer/Renderer";
import ProvenancePanel from "./ProvenancePanel";
import ReadAloud from "./ReadAloud";
import SaveVersionDialog from "./SaveVersionDialog";

export default function WorkspaceView({ versions, onSaved }: { versions: { version: number; note: string | null; createdAt: string }[]; onSaved: (v: number) => void }) {
  const { t } = useI18n();
  const s = useWorkspace();
  const push = useToasts((t) => t.push);
  const [arrange, setArrange] = useState(false);
  const [saving, setSaving] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { payload, result, spec, cz } = s;

  const view = useMemo(() => (spec && result ? composeView(spec, cz, result) : []), [spec, cz, result]);
  const filters = useMemo(() => (spec ? flattenComponents({ ...spec, components: view }).filter((c): c is FilterComponent => c.type === "filter") : []), [spec, view]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (s.dirty) e.preventDefault(); };
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; if (/input|textarea|select/i.test(t.tagName) || t.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) s.redo(); else s.undo(); }
    };
    window.addEventListener("beforeunload", warn); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("beforeunload", warn); window.removeEventListener("keydown", key); };
  });

  if (!payload || !result || !spec) return null;
  const insights = Object.values(result.insights).map((i) => i.text);
  const palette = cz.palette ?? spec.palette;

  const save = async (note: string) => {
    try {
      const { version } = await api.saveVersion(payload.artifact.id, { spec, customizations: cz, note: note || undefined });
      s.markSaved(); setSaving(false); push(`Saved as version ${version}.`, "success"); onSaved(version);
    } catch (e) { push(e instanceof ApiError ? e.message : "Could not save this version.", "error"); }
  };

  return (
    <RenderContext.Provider value={{ result, filters, cz, arrange, setFilter: s.setFilter, setSpan: s.setSpan, move: s.move, moveTo: s.moveTo, toggleCollapse: s.toggleCollapse, switchType: s.switchType, gridRef }}>
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="mb-6">
          {payload.artifact.conversationId && (
            <Link
              href={`/workspace?conversation=${encodeURIComponent(payload.artifact.conversationId)}`}
              className="mb-4 inline-flex btn"
            >
              ← {t("an.backToConversation")}
            </Link>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-surface">Version {payload.version.version}{s.dirty ? " · unsaved changes" : ""}</span>
          </div>
          <h1 className="mt-3 max-w-[30ch] text-3xl font-semibold leading-tight sm:text-4xl">{spec.title}</h1>
          {spec.subtitle && <p className="mt-1 text-muted">{spec.subtitle}</p>}
          <p className="mt-3 max-w-[70ch] text-sm text-muted"><span className="font-medium text-ink">Question:</span> {payload.artifact.question}</p>
        </div>

        {/*{payload.drift.changed && (
          <div role="alert" className="mb-4 flex gap-3 rounded-card border border-warn bg-surface p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden />
            <div><p className="font-semibold">Sources or the analysis engine have changed since this was computed.</p>
              <p className="text-muted">You are viewing the saved result from {fmtDate(result.meta.computedAt)}; it has not been rewritten. {payload.drift.items.map((d) => `${d.id}: saved ${d.saved}, now ${d.current}`).join("; ")}.</p></div>
          </div>
        )}*/}
        {result.status === "partial" && result.message && (
          <div role="status" className="mb-4 flex gap-3 rounded-card border border-line bg-tint p-4 text-sm text-on-tint"><Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /><p><span className="font-semibold">Partial result. </span>{result.message}</p></div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-2" role="toolbar" aria-label="Workspace tools">
          <button className="btn" aria-pressed={arrange} onClick={() => setArrange((a) => !a)}><LayoutGrid className="h-4 w-4" aria-hidden />Arrange</button>
          <button className="btn" onClick={s.undo} disabled={!s.past.length}><Undo2 className="h-4 w-4" aria-hidden />Undo</button>
          <button className="btn" onClick={s.redo} disabled={!s.future.length}><Redo2 className="h-4 w-4" aria-hidden />Redo</button>
          <button className="btn" onClick={s.resetCustomizations}><RotateCcw className="h-4 w-4" aria-hidden />Reset layout</button>
          <label className="flex items-center gap-2 text-sm"><span className="sr-only sm:not-sr-only">Chart colors</span>
            <select className="field w-auto" value={palette} onChange={(e) => s.setPalette(e.target.value as (typeof PALETTES)[number])}>
              {PALETTES.map((p) => <option key={p} value={p}>{p === "default" ? "Default" : p === "categorical" ? "Colorblind-safe" : "Monochrome"}</option>)}
            </select>
          </label>
          <ReadAloud lines={insights} />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {versions.length > 1 && (
              <label className="flex items-center gap-2 text-sm"><span className="sr-only sm:not-sr-only">Version</span>
                <select className="field w-auto" value={payload.version.version} onChange={(e) => onSaved(Number(e.target.value))}>
                  {versions.map((v) => <option key={v.version} value={v.version}>v{v.version} · {fmtDate(v.createdAt)}</option>)}
                </select>
              </label>
            )}
            <Link href={`/playground/${payload.artifact.id}`} className="btn"><SquareCode className="h-4 w-4" aria-hidden />Playground</Link>
            <button className="btn btn-primary" onClick={() => setSaving(true)} disabled={!s.dirty}><Save className="h-4 w-4" aria-hidden />Save version</button>
          </div>
        </div>

        <div data-palette={palette}><Renderer components={view} /></div>
        <ProvenancePanel p={payload} />
      </div>
      <SaveVersionDialog open={saving} onClose={() => setSaving(false)} onSave={save} />
    </RenderContext.Provider>
  );
}
