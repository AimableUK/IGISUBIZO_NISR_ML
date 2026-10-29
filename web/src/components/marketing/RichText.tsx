import Link from "next/link";
import type { ReactNode } from "react";

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
const LINK = "font-medium text-primary underline underline-offset-2";

/** Renders **bold**, *italic*, `code` and [label](href) inside dictionary strings. */
export default function RichText({ text }: { text: string }) {
  const out: ReactNode[] = text.split(TOKEN).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`")) return <code key={i} className="rounded bg-surface2 px-1 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>;
    if (part.startsWith("[")) {
      const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (m) {
        const [, label, href] = m;
        if (!href) return part;
        return href.startsWith("/")
          ? <Link key={i} href={href} className={LINK}>{label}</Link>
          : <a key={i} href={href} className={LINK} target="_blank" rel="noopener noreferrer">{label}</a>;
      }
    }
    return part;
  });
  return <>{out}</>;
}
