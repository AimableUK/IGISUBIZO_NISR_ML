"use client";
import { Languages } from "lucide-react";
import { LOCALES, useLocale } from "@/i18n";

/**
 * EN | RW toggle. Drop it into any header. `tone="onDark"` is for use over the green hero.
 */
export default function LanguageSwitcher({ tone = "default" }: { tone?: "default" | "onDark" }) {
  const { locale, setLocale, t } = useLocale();
  const dark = tone === "onDark";
  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={`inline-flex items-center gap-1 rounded-full border p-1 ${dark ? "border-[#CFFFDC]/40 bg-[#253D2C]/60 text-[#CFFFDC] backdrop-blur" : "border-line bg-surface text-ink"}`}
    >
      <Languages className="ml-2 h-4 w-4 shrink-0 opacity-80" aria-hidden />
      {LOCALES.map((l) => {
        const active = l.code === locale;
        return (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            aria-pressed={active}
            aria-label={l.name}
            onClick={() => setLocale(l.code)}
            className={`min-h-[36px] min-w-[44px] rounded-full px-3 text-sm font-semibold transition-colors ${
              active
                ? dark ? "bg-[#CFFFDC] text-[#253D2C]" : "bg-primary text-on-primary"
                : dark ? "hover:bg-[#CFFFDC]/15" : "hover:bg-surface2"
            }`}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
