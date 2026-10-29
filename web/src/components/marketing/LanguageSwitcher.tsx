"use client";
import { Languages } from "lucide-react";
import { LOCALES, useLocale } from "@/i18n";

/**
 * Compact EN | RW toggle. Drop it into any header. `tone="onDark"` is for use over the green hero.
 * The pill is 32px tall; each button's tap area is stretched to 44px with an invisible overlay.
 */
export default function LanguageSwitcher({
  tone = "default",
}: {
  tone?: "default" | "onDark";
}) {
  const { locale, setLocale, t } = useLocale();
  const dark = tone === "onDark";
  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={`inline-flex h-8 items-center rounded-full border p-0.5 ${
        dark
          ? "border-[#CFFFDC]/40 bg-[#253D2C]/60 text-[#CFFFDC] backdrop-blur"
          : "border-line bg-surface text-ink"
      }`}
    >
      <Languages
        className="mx-1.5 h-3.5 w-3.5 shrink-0 opacity-70"
        aria-hidden
      />
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
            className={`relative h-7 min-w-[32px] rounded-full px-2 text-xs font-semibold transition-colors before:absolute before:-inset-y-2 before:inset-x-0 before:content-[''] ${
              active
                ? dark
                  ? "bg-[#CFFFDC] text-[#253D2C]"
                  : "bg-primary text-on-primary"
                : dark
                  ? "hover:bg-[#CFFFDC]/15"
                  : "hover:bg-surface2"
            }`}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
