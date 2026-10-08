"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BarChart3, ChevronDown, ChevronUp, GripVertical, Maximize2, Minus, Plus, X } from "lucide-react";
import { alternativesFor, type Component, type SwitchType } from "@/shared";
import { useRender } from "./context";

const LABEL: Record<SwitchType, string> = { bar: "Bars", line: "Line", area: "Area", map: "Map", table: "Table" };
export const spanMd = (s: number) => (s >= 6 ? 6 : 3);

export default function Frame({ c, nested, children }: { c: Component; nested?: boolean; children: (expanded: boolean) => React.ReactNode }) {
  const r = useRender();
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const collapsed = !!r.cz.overrides[c.id]?.collapsed;
  const alts = alternativesFor(c, r.result);
  const bodyId = `body-${c.id}`;
  const expandable = !["filter", "metric"].includes(c.type);

  useEffect(() => { const d = dlg.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);

  const startResize = (e: React.PointerEvent) => {
    const grid = r.gridRef.current; if (!grid) return;
    e.preventDefault();
    const rect = grid.getBoundingClientRect(); const left = (e.currentTarget.closest("[data-cell]") as HTMLElement).getBoundingClientRect().left;
    const move = (ev: PointerEvent) => r.setSpan(c.id, Math.round(((ev.clientX - left) / rect.width) * 12));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  return (
    <>
      <article
        data-cell
        draggable={r.arrange && !nested}
        onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
        onDragOver={(e) => r.arrange && e.preventDefault()}
        onDrop={(e) => { const id = e.dataTransfer.getData("text/plain"); if (id && id !== c.id) r.moveTo(id, c.id); }}
        aria-labelledby={`t-${c.id}`}
        className={`cell card relative flex flex-col ${r.arrange ? "ring-2 ring-primary/40" : ""}`}
        style={{ ["--span" as string]: c.layout.span, ["--span-md" as string]: spanMd(c.layout.span) }}
      >
        <header className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h3 id={`t-${c.id}`} className="text-base font-semibold leading-snug">{c.title}</h3>
            {c.description && <p className="mt-0.5 max-w-[60ch] text-sm text-muted">{c.description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {alts.length > 1 && (
              <div role="group" aria-label={`Show ${c.title} as`} className="flex gap-1">
                {alts.map((t) => (
                  <button key={t} className="btn-sm" aria-pressed={c.type === t} onClick={() => r.switchType(c.id, t)}>{LABEL[t]}</button>
                ))}
              </div>
            )}
            {expandable && <button className="btn-icon h-9 w-9" aria-label={`Focus ${c.title}`} onClick={() => setOpen(true)}><Maximize2 className="h-4 w-4" aria-hidden /></button>}
            <button className="btn-icon h-9 w-9" aria-expanded={!collapsed} aria-controls={bodyId} aria-label={`${collapsed ? "Expand" : "Collapse"} ${c.title}`} onClick={() => r.toggleCollapse(c.id)}>
              {collapsed ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronUp className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </header>

        {r.arrange && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-tint/60 px-4 py-2 text-xs text-on-tint" role="group" aria-label={`Arrange ${c.title}`}>
            {!nested && <GripVertical className="h-4 w-4" aria-hidden />}
            {!nested && (<>
              <button className="btn-sm" onClick={() => r.move(c.id, -1)} aria-label={`Move ${c.title} earlier`}><ArrowLeft className="h-3.5 w-3.5" aria-hidden />Earlier</button>
              <button className="btn-sm" onClick={() => r.move(c.id, 1)} aria-label={`Move ${c.title} later`}>Later<ArrowRight className="h-3.5 w-3.5" aria-hidden /></button>
            </>)}
            <button className="btn-sm" onClick={() => r.setSpan(c.id, c.layout.span - 1)} aria-label={`Make ${c.title} narrower`} disabled={c.layout.span <= 3}><Minus className="h-3.5 w-3.5" aria-hidden /></button>
            <span aria-live="polite">{c.layout.span}/12 wide</span>
            <button className="btn-sm" onClick={() => r.setSpan(c.id, c.layout.span + 1)} aria-label={`Make ${c.title} wider`} disabled={c.layout.span >= 12}><Plus className="h-3.5 w-3.5" aria-hidden /></button>
          </div>
        )}

        <div id={bodyId} hidden={collapsed} className="flex-1 px-4 py-4">{!collapsed && children(false)}</div>
        {r.arrange && !nested && (
          <div role="presentation" onPointerDown={startResize} className="absolute inset-y-0 -right-1 hidden w-3 cursor-ew-resize rounded-full bg-primary/40 hover:bg-primary lg:block" title="Drag to resize" />
        )}
      </article>

      {expandable && (
        <dialog ref={dlg} onClose={() => setOpen(false)} aria-labelledby={`dt-${c.id}`} className="m-auto w-[min(1100px,96vw)] rounded-card border border-line bg-surface p-0 text-ink backdrop:bg-black/50">
          {open && (
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2 id={`dt-${c.id}`} className="flex items-center gap-2 text-lg font-semibold"><BarChart3 className="h-5 w-5 text-primary" aria-hidden />{c.title}</h2>
                <button className="btn" onClick={() => setOpen(false)}><X className="h-4 w-4" aria-hidden />Close</button>
              </div>
              {children(true)}
            </div>
          )}
        </dialog>
      )}
    </>
  );
}
