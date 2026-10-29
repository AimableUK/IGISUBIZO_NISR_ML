"use client";
import { useI18n, type Locale } from "@/i18n";
import { cx } from "./cx";

const OPTIONS: { id: Locale; short: string; key: "lang.en" | "lang.rw" }[] = [
  { id: "en", short: "EN", key: "lang.en" },
  { id: "rw", short: "RW", key: "lang.rw" },
];

export default function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div role="group" aria-label={t("lang.change")} className="flex rounded-full border border-line bg-surface p-0.5 text-xs font-semibold">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          lang={o.id}
          aria-pressed={locale === o.id}
          aria-label={t(o.key)}
          title={t(o.key)}
          onClick={() => setLocale(o.id)}
          className={cx(
            "min-w-[2.25rem] rounded-full px-2.5 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
            locale === o.id ? "bg-tint text-on-tint" : "text-muted hover:text-ink",
          )}
        >
          {o.short}
        </button>
      ))}
    </div>
  );
}
