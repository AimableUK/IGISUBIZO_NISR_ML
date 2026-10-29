"use client";
import Link from "next/link";
import DocView from "@/components/marketing/PageShell";
import { useStart } from "@/components/marketing/useStart";
import { useT } from "@/i18n";

export default function Docs() {
  const t = useT();
  const { href } = useStart();
  return (
    <DocView
      doc={t.docs}
      withToc
      after={
        <aside className="mt-12 max-w-[68ch] rounded-card border border-line bg-tint p-6 text-on-tint">
          <h2 className="text-xl font-semibold">{t.docs.ctaTitle}</h2>
          <p className="mt-1">{t.docs.ctaBody}</p>
          <Link href={href()} className="btn btn-primary mt-4">{t.common.startChatting}</Link>
        </aside>
      }
    />
  );
}
