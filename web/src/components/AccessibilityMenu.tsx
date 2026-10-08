"use client";
import { useEffect, useRef, useState } from "react";
import { Accessibility, Monitor, Moon, Sun } from "lucide-react";
import { usePrefs, type Theme } from "@/store/prefs";

const THEMES: { v: Theme; label: string; Icon: typeof Sun }[] = [{ v: "light", label: "Day", Icon: Sun }, { v: "dark", label: "Night", Icon: Moon }, { v: "system", label: "System", Icon: Monitor }];

export default function AccessibilityMenu() {
  const p = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", off); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", off); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button className="btn-icon" aria-expanded={open} aria-controls="a11y-panel" aria-label="Display and accessibility settings" onClick={() => setOpen((o) => !o)}><Accessibility className="h-5 w-5" aria-hidden /></button>
      {open && (
        <div id="a11y-panel" role="group" aria-label="Display and accessibility settings" className="absolute right-0 z-40 mt-2 w-72 space-y-4 rounded-card border border-line bg-surface p-4 shadow-xl">
          <fieldset><legend className="mb-2 text-sm font-semibold">Theme</legend>
            <div className="grid grid-cols-3 gap-1">
              {THEMES.map(({ v, label, Icon }) => (
                <button key={v} className="btn-sm h-11 flex-col gap-0" aria-pressed={p.theme === v} onClick={() => p.set({ theme: v })}><Icon className="h-4 w-4" aria-hidden />{label}</button>
              ))}
            </div>
          </fieldset>
          <fieldset><legend className="mb-2 text-sm font-semibold">Text size</legend>
            <div className="grid grid-cols-3 gap-1">
              {[1, 1.15, 1.3].map((s) => <button key={s} className="btn-sm h-11" aria-pressed={p.textScale === s} onClick={() => p.set({ textScale: s })}>{Math.round(s * 100)}%</button>)}
            </div>
          </fieldset>
          <label className="flex min-h-[44px] items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[rgb(var(--primary))]" checked={p.contrast} onChange={(e) => p.set({ contrast: e.target.checked })} />High contrast</label>
          <label className="flex min-h-[44px] items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[rgb(var(--primary))]" checked={p.motion === "reduce"} onChange={(e) => p.set({ motion: e.target.checked ? "reduce" : "system" })} />Reduce motion</label>
        </div>
      )}
    </div>
  );
}
