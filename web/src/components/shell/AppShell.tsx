"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { useDocumentTitle, useT } from "@/i18n";
import type { Block, DocPage } from "@/i18n/en";
import { BambooGrove } from "./Bamboo";
import RichText from "./RichText";

type TocItem = { id: string; h: string };

/**
 * Scroll-spy: returns the id of the section the reader is currently in.
 * A section counts as "current" while it crosses a band between just under the
 * sticky header and roughly the upper-middle of the screen. At the very bottom of
 * the page the last section wins, so short final sections can still be highlighted.
 */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const key = ids.join("|");

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    const firstEl = els[0];
    const lastEl = els[els.length - 1];
    if (!firstEl || !lastEl) return;
    const visible = new Set<string>();

    const pick = () => {
      const first = els.find((e) => visible.has(e.id));
      if (first) return setActive(first.id);
      // Nothing inside the band (between sections): use the last one scrolled past.
      let current = firstEl.id;
      for (const e of els)
        if (e.getBoundingClientRect().top <= 120) current = e.id;
      setActive(current);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        pick();
      },
      { rootMargin: "-96px 0px -55% 0px" },
    );
    els.forEach((e) => io.observe(e));

    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) setActive(lastEl.id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    pick();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [active, setActive] as const;
}

/** Green header with hills and bamboo, then the page content. Used by every inner marketing page. */
export function PageShell({
  title,
  intro,
  updated,
  toc,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  toc?: TocItem[];
  children: ReactNode;
}) {
  const t = useT();
  const [active, setActive] = useActiveSection(toc?.map((x) => x.id) ?? []);
  const navRef = useRef<HTMLElement>(null);

  // Keep the highlighted item visible when the contents list is taller than the screen.
  useEffect(() => {
    const nav = navRef.current;
    const item = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !item) return;
    const top = item.offsetTop;
    const bottom = top + item.offsetHeight;
    if (top < nav.scrollTop) nav.scrollTop = top - 8;
    else if (bottom > nav.scrollTop + nav.clientHeight)
      nav.scrollTop = bottom - nav.clientHeight + 8;
  }, [active]);

  return (
    <>
      <header className="relative isolate overflow-hidden bg-[#253D2C] text-white">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-[#253D2C] via-[#253D2C] to-[#2E6F40]"
          aria-hidden
        />
        <BambooGrove
          mirror
          className="pointer-events-none absolute bottom-0 right-0 -z-10 hidden h-[135%] w-auto opacity-60 sm:block"
        />
        <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="font-display text-lg font-semibold text-[#CFFFDC] underline-offset-4 hover:underline"
            >
              {t.common.brand}
            </Link>
          </div>
          <h1 className="mt-10 max-w-[22ch] text-4xl font-semibold leading-tight sm:text-5xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-4 max-w-[60ch] text-lg text-[#CFFFDC]/90">
              {intro}
            </p>
          )}
          {updated && (
            <p className="mt-3 text-sm text-[#CFFFDC]/75">
              {t.common.lastUpdated}: {updated}
            </p>
          )}
        </div>
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute bottom-0 h-10 w-full fill-bg sm:h-14"
        >
          <path d="M0 80V50C200 20 380 62 560 42C760 18 900 64 1100 38C1260 20 1360 42 1440 30V80Z" />
        </svg>
      </header>

      <div
        className={`mx-auto max-w-[1100px] px-4 pb-16 pt-6 sm:px-6 ${toc ? "lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12" : ""}`}
      >
        {toc && (
          <>
            <details className="card mb-6 p-3 lg:hidden">
              <summary className="cursor-pointer font-medium">
                {t.common.onThisPage}
              </summary>
              <TocList toc={toc} active={active} onPick={setActive} />
            </details>
            <nav
              ref={navRef}
              aria-label={t.common.onThisPage}
              className="relative hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto"
            >
              <p className="mb-2 text-sm font-semibold">
                {t.common.onThisPage}
              </p>
              <TocList toc={toc} active={active} onPick={setActive} />
            </nav>
          </>
        )}
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}

function TocList({
  toc,
  active,
  onPick,
}: {
  toc: TocItem[];
  active: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <ul className="relative mt-2 space-y-0.5 border-l border-line text-sm">
      {toc.map((x) => {
        const on = x.id === active;
        return (
          <li key={x.id}>
            <a
              href={`#${x.id}`}
              onClick={() => onPick(x.id)}
              aria-current={on ? "location" : undefined}
              className={`-ml-px block rounded-r-md border-l-[3px] py-1.5 pl-3 pr-2 transition-colors ${
                on
                  ? "border-primary bg-tint font-semibold text-ink"
                  : "border-transparent text-muted hover:border-primary hover:text-ink"
              }`}
            >
              {x.h}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function DocBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-page [&>section:first-child>h2]:mt-0">
      {blocks.map((b, i) => (
        <section key={b.id ?? i} id={b.id} className="scroll-mt-24">
          {b.h && <h2>{b.h}</h2>}
          {b.p?.map((x, j) => (
            <p key={j}>
              <RichText text={x} />
            </p>
          ))}
          {b.ol && (
            <ol className="mb-4 ml-5 max-w-[68ch] list-decimal space-y-1">
              {b.ol.map((x, j) => (
                <li key={j}>
                  <RichText text={x} />
                </li>
              ))}
            </ol>
          )}
          {b.ul && (
            <ul>
              {b.ul.map((x, j) => (
                <li key={j}>
                  <RichText text={x} />
                </li>
              ))}
            </ul>
          )}
          {b.qa?.map(([q, a], j) => (
            <details key={j} className="card mb-3 max-w-[68ch] p-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mb-0 mt-2 text-muted">
                <RichText text={a} />
              </p>
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}

/** A complete page rendered from a dictionary entry: title, header, notice, sections. */
export default function DocView({
  doc,
  withToc = false,
  after,
}: {
  doc: DocPage;
  withToc?: boolean;
  after?: ReactNode;
}) {
  useDocumentTitle(doc.metaTitle);
  const toc = withToc
    ? doc.sections
        .filter((s) => s.id && s.h)
        .map((s) => ({ id: s.id as string, h: s.h as string }))
    : undefined;
  return (
    <PageShell
      title={doc.title}
      intro={doc.intro}
      updated={doc.updated}
      toc={toc}
    >
      {doc.notice && (
        <p
          role="note"
          className="mb-8 flex max-w-[68ch] items-start gap-2 rounded-lg border border-warn p-3 text-sm text-warn"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {doc.notice}
        </p>
      )}
      <DocBody blocks={doc.sections} />
      {after}
    </PageShell>
  );
}
