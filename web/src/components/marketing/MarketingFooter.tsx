"use client";
import Link from "next/link";
import { useT } from "@/i18n";

export default function MarketingFooter() {
  const t = useT();
  const f = t.footer;
  return (
    <footer className="border-t border-line bg-surface2/60">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <p className="font-display text-xl font-semibold">{t.common.brand}</p>
          <p className="mt-2 max-w-[38ch] text-sm text-muted">{f.tagline}</p>
        </div>
        {f.groups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <p className="text-sm font-semibold">{g.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted underline-offset-2 hover:text-ink hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-5 text-xs text-muted sm:px-6">
          <p>{f.rights}</p>
        </div>
      </div>
    </footer>
  );
}
