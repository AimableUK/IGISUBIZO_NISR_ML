"use client";
import { Landmark } from "lucide-react";
import { useT } from "@/i18n";

/**
 * Text-based NISR credit. To show the official logo, pass `logoSrc` (for example
 * "/brand/nisr.svg") once you have permission and the asset from NISR.
 */
export default function NisrBadge({ logoSrc }: { logoSrc?: string }) {
  const t = useT();
  return (
    <p
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#CFFFDC]/40 bg-[#253D2C]/60 px-3 py-1.5 text-sm text-[#CFFFDC] backdrop-blur"
      title={t.common.nisrFull}
    >
      {logoSrc
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={logoSrc} alt="" className="h-5 w-auto" />
        : <Landmark className="h-4 w-4 shrink-0" aria-hidden />}
      <span className="truncate">{t.common.nisrBuilt}</span>
    </p>
  );
}
