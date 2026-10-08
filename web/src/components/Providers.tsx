"use client";
import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { X } from "lucide-react";
import { usePrefs } from "@/store/prefs";
import { useToasts } from "@/store/toasts";

function PrefsApplier() {
  const { theme, contrast, motion, textScale } = usePrefs();
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const e = document.documentElement;
      e.classList.toggle("dark", theme === "dark" || (theme === "system" && mq.matches));
      e.classList.toggle("hc", contrast);
      e.classList.toggle("reduce-motion", motion === "reduce");
      e.style.setProperty("--text-scale", String(textScale));
    };
    apply(); mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, contrast, motion, textScale]);
  return null;
}

/** Visual notifications (never audio-only). */
function StatusRegion() {
  const { items, dismiss } = useToasts();
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {items.map((t) => (
        <div key={t.id} className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${t.tone === "error" ? "border-danger bg-surface text-danger" : "border-primary bg-surface text-ink"}`}>
          <p className="flex-1">{t.text}</p>
          <button className="-m-2 p-2" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}><X className="h-4 w-4" aria-hidden /></button>
        </div>
      ))}
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const motion = usePrefs((s) => s.motion);
  return (
    <MotionConfig reducedMotion={motion === "reduce" ? "always" : "user"}>
      <PrefsApplier />
      {children}
      <StatusRegion />
    </MotionConfig>
  );
}
