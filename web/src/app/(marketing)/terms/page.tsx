"use client";
import DocView from "@/components/marketing/PageShell";
import { useT } from "@/i18n";

export default function Page() {
  const t = useT();
  return <DocView doc={t.terms} />;
}
