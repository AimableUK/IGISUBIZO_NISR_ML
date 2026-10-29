"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { useDocumentTitle, useT } from "@/i18n";
import type { Block, DocPage } from "@/i18n/en";
import { BambooGrove } from "./Bamboo";
import RichText from "./RichText";

type TocItem = { id: string; h: string };

/** Green header with hills and bamboo, then the page content. Used by every inner marketing page. */
export function PageShell({
  title, intro, updated, toc, children,
}: { title: string; intro?: string; updated?: string; toc?: TocItem[]; children: ReactNode }) {
  const t = useT();
  return (
    <>
      <header className="relative isolate overflow-hidden bg-[#253D2C] text-white">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#253D2C] via-[#253D2C] to-[#2E6F40]" aria-hidden />
        <BambooGrove mirror className="pointer-events-none absolute bottom-0 right-0 -z-10 hidden h-[135%] w-auto opacity-60 sm:block" />
        <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="font-display text-lg font-semibold text-[#CFFFDC] underline-offset-4 hover:underline">{t.common.brand}</Link>
          </div>
          <h1 className="mt-10 max-w-[22ch] text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          {intro && <p className="mt-4 max-w-[60ch] text-lg text-[#CFFFDC]/90">{intro}</p>}
          {updated && <p className="mt-3 text-sm text-[#CFFFDC]/75">{t.common.lastUpdated}: {updated}</p>}
        </div>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden className="absolute bottom-0 h-10 w-full fill-bg sm:h-14">
          <path d="M0 80V50C200 20 380 62 560 42C760 18 900 64 1100 38C1260 20 1360 42 1440 30V80Z" />
        </svg>
      </header>

      <div className={`mx-auto max-w-[1100px] px-4 pb-16 pt-6 sm:px-6 ${toc ? "lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12" : ""}`}>
        {toc && (
          <>
            <details className="card mb-6 p-3 lg:hidden">
              <summary className="cursor-pointer font-medium">{t.common.onThisPage}</summary>
              <TocList toc={toc} />
            </details>
            <nav aria-label={t.common.onThisPage} className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
              <p className="mb-2 text-sm font-semibold">{t.common.onThisPage}</p>
              <TocList toc={toc} />
            </nav>
          </>
        )}
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}

function TocList({ toc }: { toc: TocItem[] }) {
  return (
    <ul className="mt-2 space-y-1 border-l border-line text-sm">
      {toc.map((x) => (
        <li key={x.id}><a href={`#${x.id}`} className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-muted hover:border-primary hover:text-ink">{x.h}</a></li>
      ))}
    </ul>
  );
}

export function DocBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-page [&>section:first-child>h2]:mt-0">
      {blocks.map((b, i) => (
        <section key={b.id ?? i} id={b.id}>
          {b.h && <h2>{b.h}</h2>}
          {b.p?.map((x, j) => <p key={j}><RichText text={x} /></p>)}
          {b.ol && <ol className="mb-4 ml-5 max-w-[68ch] list-decimal space-y-1">{b.ol.map((x, j) => <li key={j}><RichText text={x} /></li>)}</ol>}
          {b.ul && <ul>{b.ul.map((x, j) => <li key={j}><RichText text={x} /></li>)}</ul>}
          {b.qa?.map(([q, a], j) => (
            <details key={j} className="card mb-3 max-w-[68ch] p-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mb-0 mt-2 text-muted"><RichText text={a} /></p>
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}

/** A complete page rendered from a dictionary entry: title, header, notice, sections. */
export default function DocView({ doc, withToc = false, after }: { doc: DocPage; withToc?: boolean; after?: ReactNode }) {
  useDocumentTitle(doc.metaTitle);
  const toc = withToc ? doc.sections.filter((s) => s.id && s.h).map((s) => ({ id: s.id as string, h: s.h as string })) : undefined;
  return (
    <PageShell title={doc.title} intro={doc.intro} updated={doc.updated} toc={toc}>
      {doc.notice && (
        <p role="note" className="mb-8 flex max-w-[68ch] items-start gap-2 rounded-lg border border-warn p-3 text-sm text-warn">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{doc.notice}
        </p>
      )}
      <DocBody blocks={doc.sections} />
      {after}
    </PageShell>
  );
}
