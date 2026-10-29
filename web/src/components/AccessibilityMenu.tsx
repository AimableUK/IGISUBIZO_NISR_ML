"use client";
import { useEffect, useRef, useState } from "react";
import { Accessibility, Monitor, Moon, Sun } from "lucide-react";
import { usePrefs, type Theme } from "@/store/prefs";
import { useT } from "@/i18n";

const SCALES = [1, 1.15, 1.3];

export default function AccessibilityMenu() {
  const t = useT();
  const p = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const themes: { v: Theme; label: string; Icon: typeof Sun }[] = [
    { v: "light", label: t.a11y.day, Icon: Sun },
    { v: "dark", label: t.a11y.night, Icon: Moon },
    { v: "system", label: t.a11y.system, Icon: Monitor },
  ];

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={trigger}
        className="btn-icon"
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label={t.a11y.label}
        title={t.a11y.label}
        onClick={() => setOpen((o) => !o)}
      >
        <Accessibility className="h-5 w-5" aria-hidden />
      </button>
      {open && (
        <div
          id="a11y-panel"
          role="group"
          aria-label={t.a11y.label}
          // Phones: pinned under the header with 12px side margins, so it can never run off-screen.
          // Larger screens: a small dropdown under the button.
          className="fixed inset-x-3 top-[4.25rem] z-40 max-h-[calc(100dvh-5.5rem)] space-y-3 overflow-y-auto rounded-card border border-line bg-surface p-3 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64 sm:max-h-[calc(100dvh-6rem)]"
        >
          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              {t.a11y.theme}
            </legend>
            <div className="grid grid-cols-3 gap-1">
              {themes.map(({ v, label, Icon }) => (
                <button
                  key={v}
                  className="btn-sm h-11 min-w-0 flex-col gap-0 px-1 text-xs"
                  aria-pressed={p.theme === v}
                  onClick={() => p.set({ theme: v })}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="max-w-full truncate">{label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              {t.a11y.textSize}
            </legend>
            <div className="grid grid-cols-3 gap-1">
              {SCALES.map((s) => (
                <button
                  key={s}
                  className="btn-sm h-10 text-xs"
                  aria-pressed={p.textScale === s}
                  onClick={() => p.set({ textScale: s })}
                >
                  {Math.round(s * 100)}%
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-0.5 border-t border-line pt-2">
            <label className="flex min-h-[40px] items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[rgb(var(--primary))]"
                checked={p.contrast}
                onChange={(e) => p.set({ contrast: e.target.checked })}
              />
              {t.a11y.contrast}
            </label>
            <label className="flex min-h-[40px] items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[rgb(var(--primary))]"
                checked={p.motion === "reduce"}
                onChange={(e) =>
                  p.set({ motion: e.target.checked ? "reduce" : "system" })
                }
              />
              {t.a11y.motion}
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
