"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Check, Circle, Loader2 } from "lucide-react";
import { ProgressStages, type AnalyticalResult, type ProgressStage } from "@/shared";
import QuestionBar from "@/components/chat/QuestionBar";
import MboniEye from "@/components/mboni/MboniEye";
import { useMboniEye, type MboniEvent } from "@/components/mboni/useMboniEye";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useI18n, type Key } from "@/i18n";

type State = { kind: "idle" } | { kind: "running" } | { kind: "blocked"; result: AnalyticalResult } | { kind: "error" };
const BLOCKED_TITLE: Record<string, Key> = { ambiguous: "ws.blocked.ambiguous", unsupported: "ws.blocked.unsupported", no_data: "ws.blocked.no_data" };

// Which eye animation plays for each analysis stage.
const EYE_EVENT: Record<ProgressStage, MboniEvent> = {
  interpreting: "ask",
  validating: "search",
  computing: "work",
  planning: "work",
  saving: "work",
  ready: "answer",
};

function Runner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { t, examples } = useI18n();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [stage, setStage] = useState<ProgressStage>("interpreting");
  const [q, setQ] = useState(sp.get("q") ?? "");
  const started = useRef(false);
  const { state: eye, send } = useMboniEye();

  // The eye follows the analysis; when nothing is running (or it failed / was blocked) it rests.
  useEffect(() => { send(state.kind === "running" ? EYE_EVENT[stage] : "idle"); }, [state.kind, stage, send]);

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
    } catch {
      setState({ kind: "error" });
    } finally { sock.off("analysis:progress", onProgress); }
  }, [router]);

  useEffect(() => { const initial = sp.get("q"); if (initial && sp.get("run") && !started.current) { started.current = true; void run(initial); } }, [sp, run]);

  const idx = ProgressStages.indexOf(stage);
  return (
    // Centered in the middle of the page, both ways. The bottom padding nudges it slightly above true centre.
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-4 pb-16 pt-6 sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">{t("ws.title")}</h1>
      <p className="mt-2 text-muted">{t("ws.subtitle")}</p>
      <div className="mt-8"><QuestionBar onSubmit={run} busy={state.kind === "running"} initial={q} /></div>

      {state.kind === "running" && (
        <div role="status" aria-live="polite" className="card mt-8 p-5">
          <div className="flex flex-col items-center text-center">
            {/* Decorative: the stage list below carries the meaning for screen readers. */}
            <div aria-hidden>
              <MboniEye state={eye} width={120} theme="light" />
            </div>
            <h2 className="mt-2 font-semibold">{t("ws.building")}</h2>
          </div>
          <ol className="mx-auto mt-4 max-w-sm space-y-2 text-sm">
            {ProgressStages.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${i > idx ? "text-muted" : ""}`}>
                {i < idx ? <Check className="h-4 w-4 text-primary" aria-hidden /> : i === idx ? <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                <span>{t(`ws.stage.${s}` as Key)}</span>{i < idx && <span className="sr-only"> {t("ws.done")}</span>}{i === idx && <span className="sr-only"> {t("ws.inProgress")}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
      {state.kind === "blocked" && (
        <div role="alert" className="card mt-8 border-warn p-5">
          <h2 className="flex items-center gap-2 font-semibold"><AlertCircle className="h-5 w-5 text-warn" aria-hidden />{t(BLOCKED_TITLE[state.result.status as string] ?? "ws.blocked.fallback")}</h2>
          <p className="mt-2 text-sm">{state.result.message}</p>
          <p className="mt-4 text-sm font-medium">{t("ws.tryOne")}</p>
          <ul className="mt-2 flex flex-wrap gap-2">{examples.slice(0, 6).map((e) => <li key={e.q}><button className="btn-sm h-auto min-h-[36px] whitespace-normal py-1.5 text-left" onClick={() => run(e.q)}>{e.label}</button></li>)}</ul>
        </div>
      )}
      {state.kind === "error" && (
        <div role="alert" className="card mt-8 border-danger p-5"><h2 className="flex items-center gap-2 font-semibold text-danger"><AlertCircle className="h-5 w-5" aria-hidden />{t("ws.errorTitle")}</h2><p className="mt-2 text-sm">{t("ws.errorBody")}</p><button className="btn mt-4" onClick={() => run(q)}>{t("ws.tryAgain")}</button></div>
      )}
    </div>
  );
}
export default function Page() { return <Suspense fallback={null}><Runner /></Suspense>; }