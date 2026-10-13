"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BadgeCheck, Layers, PersonStanding } from "lucide-react";
import QuestionBar from "@/components/QuestionBar";
import TileMap from "@/components/renderer/TileMap";
import { useSession } from "@/lib/auth-client";

const STEPS = [
  ["Ask", "Type or speak a question about Rwanda’s public data."],
  ["Verify", "The analysis engine computes the numbers and records its method and sources."],
  ["Describe", "A planner proposes a workspace as a structured specification, never as code."],
  ["Render", "The product validates the specification and draws it with its own components."],
  ["Keep", "The analysis is saved with its layout, so you can reopen and refine it later."],
];

export default function Landing() {
  const router = useRouter();
  const { data: session } = useSession();
  const go = (q: string) => {
    const target = `/workspace?q=${encodeURIComponent(q)}&run=1`;
    router.push(session ? target : `/login?next=${encodeURIComponent(target)}`);
  };
  return (
    <>
      <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
        <div>
          <h1 className="max-w-[16ch] text-5xl font-semibold leading-[1.02] sm:text-6xl">Ask about Rwanda. Get a workspace, not a paragraph.</h1>
          <p className="mt-5 max-w-[52ch] text-lg text-muted">Charts, tables, maps and the numbers behind them, arranged for your question and saved so you can reopen, edit and cite them.</p>
          <div className="mt-8 max-w-2xl"><QuestionBar onSubmit={go} /></div>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="card p-5 sm:p-6">
          <h2 className="mb-1 text-lg font-semibold">30 districts, one map</h2>
          <p className="mb-4 text-sm text-muted">Every geographic question in Isesengura is drawn on this district grid, grouped here by province.</p>
          <TileMap mode="province" label="Rwanda districts grouped by province" />
        </motion.div>
      </section>

      <section aria-labelledby="how-h" className="border-y border-line bg-surface2/60 py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <h2 id="how-h" className="text-3xl font-semibold">How a question becomes a workspace</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="card p-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary" aria-hidden>{i + 1}</span>
                <h3 className="mt-3 font-semibold"><span className="sr-only">Step {i + 1}: </span>{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="why-h" className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <h2 id="why-h" className="sr-only">Why Isesengura</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            [BadgeCheck, "Every number has a trail", "Values come only from the analytical result. Sources, method and caveats sit beside every workspace."],
            [Layers, "Yours to rearrange", "Resize, reorder, switch chart types and save versions. The underlying result never changes when you do."],
            [PersonStanding, "Built for everyone", "Keyboard navigation, screen-reader summaries, data tables for every chart, high contrast and voice that is always optional."],
          ].map(([I, t, d]) => { const Icon = I as typeof BadgeCheck; return (
            <div key={t as string}><Icon className="h-7 w-7 text-primary" aria-hidden /><h3 className="mt-3 text-xl font-semibold">{t as string}</h3><p className="mt-2 max-w-[44ch] text-muted">{d as string}</p></div>
          ); })}
        </div>
        <p className="mt-10 text-sm text-muted"><Link href="/methodology" className="font-medium text-primary underline underline-offset-2">Read the methodology</Link>.</p>
      </section>
    </>
  );
}
