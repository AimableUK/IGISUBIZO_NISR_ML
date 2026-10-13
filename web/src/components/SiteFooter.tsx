import Link from "next/link";
import { Logo } from "./SiteHeader";

const cols = [
  { h: "Product", l: [["/workspace", "New analysis"], ["/history", "History"], ["/methodology", "Methodology"], ["/ai-transparency", "AI transparency"]] },
  { h: "Company", l: [["/about", "About"], ["/contact", "Contact"], ["/accessibility", "Accessibility"]] },
  { h: "Legal", l: [["/privacy", "Privacy policy"], ["/terms", "Terms of service"]] },
] as const;

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface2">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div><Logo /><p className="mt-3 max-w-xs text-sm text-muted">Ask about Rwanda’s public data and keep the analysis as a workspace you can reopen, edit and cite.</p></div>
        {cols.map((c) => (
          <nav key={c.h} aria-label={c.h}><h2 className="mb-3 text-sm font-semibold">{c.h}</h2>
            <ul className="space-y-1">{c.l.map(([href, label]) => <li key={href}><Link href={href} className="inline-flex min-h-[36px] items-center text-sm text-muted hover:text-ink hover:underline">{label}</Link></li>)}</ul>
          </nav>
        ))}
      </div>
      <p className="border-t border-line px-4 py-4 text-center text-xs text-muted">Built for the 2026 NISR Big Data Hackathon.</p>
    </footer>
  );
}
