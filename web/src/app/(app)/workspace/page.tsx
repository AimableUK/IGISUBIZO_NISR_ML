"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Check, Circle, Loader2 } from "lucide-react";
import { ProgressStages, type AnalyticalResult, type ArtifactSummary, type ProgressStage } from "@/shared";
import QuestionBar, { EXAMPLES } from "@/components/QuestionBar";
import { api, ApiError } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { fmtDate } from "@/lib/format";

const LABEL: Record<ProgressStage, string> = {
  interpreting: "Reading your question", validating: "Checking it against supported analyses", computing: "Computing verified results",
  planning: "Designing the workspace", saving: "Saving the analysis", ready: "Opening your workspace",
};
type State = { kind: "idle" } | { kind: "running" } | { kind: "blocked"; result: AnalyticalResult } | { kind: "error"; message: string };
const TITLE = { ambiguous: "Your question needs more detail", unsupported: "That analysis is not supported yet", no_data: "No data found for that question" } as const;

function Runner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [stage, setStage] = useState<ProgressStage>("interpreting");
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [recent, setRecent] = useState<ArtifactSummary[] | null>(null);
  const started = useRef(false);

  useEffect(() => { api.list().then((l) => setRecent(l.slice(0, 3))).catch(() => setRecent([])); }, []);

  const run = useCallback(async (question: string) => {
    const requestId = crypto.randomUUID();
    setQ(question); setState({ kind: "running" }); setStage("interpreting");
    const sock = getSocket();
    const onProgress = (m: { requestId: string; stage: ProgressStage }) => { if (m.requestId === requestId) setStage(m.stage); };
    sock.on("analysis:progress", onProgress);
    try {
      const { result, artifactId } = await api.ask(question, requestId);
      if (artifactId) router.push(`/workspace/${artifactId}`);
      else setState({ kind: "blocked", result });
    } catch (e) {
      setState({ kind: "error", message: e instanceof ApiError ? e.message : "The analysis could not be completed." });
    } finally { sock.off("analysis:progress", onProgress); }
  }, [router]);

  useEffect(() => { const initial = sp.get("q"); if (initial && sp.get("run") && !started.current) { started.current = true; void run(initial); } }, [sp, run]);

  const idx = ProgressStages.indexOf(stage);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">What would you like to understand?</h1>
      <p className="mt-2 text-muted">Ask in plain language. You will get a saved workspace you can rearrange and revisit.</p>
      <div className="mt-8"><QuestionBar onSubmit={run} busy={state.kind === "running"} initial={q} /></div>

      {state.kind === "running" && (
        <div role="status" aria-live="polite" className="card mt-8 p-5">
          <h2 className="font-semibold">Building your workspace</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {ProgressStages.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${i > idx ? "text-muted" : ""}`}>
                {i < idx ? <Check className="h-4 w-4 text-primary" aria-hidden /> : i === idx ? <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                <span>{LABEL[s]}</span>{i < idx && <span className="sr-only"> (done)</span>}{i === idx && <span className="sr-only"> (in progress)</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
      {state.kind === "blocked" && (
        <div role="alert" className="card mt-8 border-warn p-5">
          <h2 className="flex items-center gap-2 font-semibold"><AlertCircle className="h-5 w-5 text-warn" aria-hidden />{TITLE[state.result.status as keyof typeof TITLE] ?? "We could not answer that"}</h2>
          <p className="mt-2 text-sm">{state.result.message}</p>
          <p className="mt-4 text-sm font-medium">Questions that work in this build</p>
          <ul className="mt-2 flex flex-wrap gap-2">{EXAMPLES.map((e) => <li key={e}><button className="btn-sm h-auto min-h-[36px] whitespace-normal py-1.5 text-left" onClick={() => run(e)}>{e}</button></li>)}</ul>
        </div>
      )}
      {state.kind === "error" && (
        <div role="alert" className="card mt-8 border-danger p-5"><h2 className="flex items-center gap-2 font-semibold text-danger"><AlertCircle className="h-5 w-5" aria-hidden />Something went wrong</h2><p className="mt-2 text-sm">{state.message}</p><button className="btn mt-4" onClick={() => run(q)}>Try again</button></div>
      )}

      {recent && recent.length > 0 && state.kind !== "running" && (
        <section aria-labelledby="recent-h" className="mt-12"><div className="mb-3 flex items-baseline justify-between"><h2 id="recent-h" className="text-lg font-semibold">Continue where you left off</h2><Link href="/history" className="text-sm font-medium text-primary underline underline-offset-2">All history</Link></div>
          <ul className="space-y-2">{recent.map((a) => <li key={a.id}><Link href={`/workspace/${a.id}`} className="card flex items-center justify-between gap-4 p-4 hover:bg-surface2"><span className="font-medium">{a.title}</span><span className="shrink-0 text-xs text-muted">{fmtDate(a.updatedAt)}</span></Link></li>)}</ul>
        </section>
      )}
    </div>
  );
}
export default function Page() { return <Suspense fallback={null}><Runner /></Suspense>; }
