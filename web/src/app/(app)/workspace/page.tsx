"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Circle, Loader2, RotateCcw } from "lucide-react";
import { ProgressStages, type ConversationMessage, type ConversationTurn, type ProgressStage } from "@/shared";
import PromptInput from "@/components/chat/Promptinput";
import MboniEye from "@/components/mboni/MboniEye";
import { useMboniEye, type MboniEvent } from "@/components/mboni/useMboniEye";
import { useAppTheme } from "@/components/mboni/useAppTheme";
import { getSocket } from "@/lib/socket";
import { ApiError, api } from "@/lib/api";
import { useI18n } from "@/i18n";

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
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [draft, setDraft] = useState(sp.get("q") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState(sp.get("conversation"));
  const [loadingConversation, setLoadingConversation] = useState(Boolean(sp.get("conversation")));
  const [stage, setStage] = useState<ProgressStage | null>(null);
  const started = useRef(false);
  const skipConversationLoad = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { state: eye, send: sendEye } = useMboniEye();
  const theme = useAppTheme();
  const hasStarted = turns.length > 0 || loadingConversation;

  const send = useCallback(async (value: string) => {
    const message = value.trim();
    if (message.length < 2 || busy || loadingConversation) return;

    const requestId = crypto.randomUUID();
    setBusy(true);
    setError("");
    setStage(null);
    setTurns((current) => [...current, { role: "user", content: message }]);
    const socket = getSocket();
    const onProgress = (progress: { requestId: string; stage: ProgressStage }) => {
      if (progress.requestId === requestId) setStage(progress.stage);
    };
    socket.on("analysis:progress", onProgress);
    try {
      const history: ConversationMessage[] = turns.slice(-10).map(({ role, content }) => ({
        role,
        content: content.slice(0, 2000),
      }));
      const response = await api.converse(message, history, false, requestId, conversationId ?? undefined);
      skipConversationLoad.current = response.conversationId;
      setConversationId(response.conversationId);
      router.replace(`/workspace?conversation=${encodeURIComponent(response.conversationId)}`, { scroll: false });
      setTurns((current) => [
        ...current,
        {
          role: "assistant",
          content: response.reply,
          mode: response.mode,
          sources: response.sources,
          artifactId: response.artifactId,
        },
      ]);
      setDraft("");
    } catch (reason) {
      if (reason instanceof ApiError && reason.conversationId) {
        skipConversationLoad.current = reason.conversationId;
        setConversationId(reason.conversationId);
        router.replace(`/workspace?conversation=${encodeURIComponent(reason.conversationId)}`, { scroll: false });
      }
      setError(reason instanceof ApiError ? reason.message : t("ws.errorBody"));
    } finally {
      setBusy(false);
      setStage(null);
      socket.off("analysis:progress", onProgress);
    }
  }, [busy, conversationId, loadingConversation, router, t, turns]);

  useEffect(() => {
    if (!conversationId) {
      setTurns([]);
      setLoadingConversation(false);
      return;
    }
    if (skipConversationLoad.current === conversationId) {
      skipConversationLoad.current = null;
      return;
    }
    let active = true;
    setLoadingConversation(true);
    setError("");
    void api.getConversation(conversationId).then((conversation) => {
      if (active) setTurns(conversation.messages);
    }).catch((reason) => {
      if (active) {
        setError(reason instanceof ApiError ? reason.message : t("ws.errorBody"));
        setTurns([]);
      }
    }).finally(() => {
      if (active) setLoadingConversation(false);
    });
    return () => { active = false; };
  }, [conversationId, t]);

  useEffect(() => {
    const initial = sp.get("q");
    if (initial && sp.get("run") && !started.current && !loadingConversation) {
      started.current = true;
      void send(initial);
    }
  }, [loadingConversation, send, sp]);

  useEffect(() => {
    sendEye(busy && stage ? EYE_EVENT[stage] : "idle");
  }, [busy, sendEye, stage]);

  useEffect(() => {
    if (turns.length > 1 || busy) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [busy, turns]);

  function newConversation() {
    setConversationId(null);
    router.replace("/workspace", { scroll: false });
    setTurns([]);
    setDraft("");
    setError("");
  }

  const prompt = (
    <PromptInput
      value={draft}
      onChange={setDraft}
      onSubmit={send}
      busy={busy || loadingConversation}
      placeholder={t("q.placeholder")}
      label={t("q.placeholder")}
      sendLabel={t("q.send")}
      minLength={2}
    />
  );

  return (
    <main className="mx-auto flex h-[calc(100dvh-4rem)] min-h-0 w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="mb-6 flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{t("ws.title")}</h1>
          <p className="mt-2 text-sm text-muted">{t("ws.subtitle")}</p>
        </div>
        {turns.length > 0 && (
          <button
            type="button"
            className="btn-sm shrink-0"
            onClick={newConversation}
            disabled={busy}
            aria-label={t("ws.newConversation")}
          >
            <RotateCcw className="mr-1 inline h-4 w-4" aria-hidden />
            {t("ws.newConversation")}
          </button>
        )}
      </header>

      {hasStarted ? (
        <>
      <section
        aria-label={t("ws.conversationLabel")}
        aria-live="polite"
        className="min-h-0 flex-1 space-y-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loadingConversation && (
          <p role="status" className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t("ws.loadingConversation")}
          </p>
        )}
        {turns.map((turn, index) => (
          <article
            key={`${index}-${turn.role}`}
            className={`max-w-[92%] rounded-card border p-4 ${
              turn.role === "user" ? "ml-auto border-primary bg-primary/5" : "mr-auto border-line bg-surface"
            }`}
          >
            <p className="whitespace-pre-wrap text-sm leading-6">{turn.content}</p>
            {turn.role === "assistant" && index > 0 && (
              <p className="mt-3 text-xs text-muted">
                {turn.mode === "ai" ? t("ws.aiAnswer") : t("ws.guidedAnswer")}
                {turn.sources?.some((source) => source.isSample) && ` · ${t("ws.demoDataNote")}`}
              </p>
            )}
            {turn.sources && turn.sources.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {turn.sources.map((source) => (
                  <li key={`${source.title}-${source.period}`}>
                    {t("ws.source")}: {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer" className="underline">{source.title}</a>
                    ) : source.title} ({source.period}){source.isSample ? ` — ${t("ws.demoDataNote")}` : ""}
                  </li>
                ))}
              </ul>
            )}
            {turn.artifactId && (
              <Link href={`/workspace/${turn.artifactId}`} className="btn btn-primary mt-3">
                {t("ws.openAnalysis")}
              </Link>
            )}
          </article>
        ))}
        {busy && !stage && (
          <p role="status" className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t("ws.chatThinking")}
          </p>
        )}
        {busy && stage && (
          <div role="status" aria-live="polite" className="card mt-4 p-5">
            <div className="flex flex-col items-center text-center">
              <div aria-hidden><MboniEye state={eye} width={100} theme={theme} /></div>
              <h2 className="mt-2 font-semibold">{t("ws.building")}</h2>
            </div>
            <ol className="mx-auto mt-4 max-w-sm space-y-2 text-sm">
              {ProgressStages.map((progressStage, index) => {
                const current = stage ? ProgressStages.indexOf(stage) : 0;
                return (
                  <li key={progressStage} className={`flex items-center gap-2 ${index > current ? "text-muted" : ""}`}>
                    {index < current
                      ? <Check className="h-4 w-4 text-primary" aria-hidden />
                      : index === current
                        ? <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                        : <Circle className="h-4 w-4" aria-hidden />}
                    <span>{t(`ws.stage.${progressStage}`)}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        <div ref={endRef} />
      </section>

      {error && (
        <p role="alert" className="mb-3 rounded-card border border-danger p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="shrink-0 bg-background pt-3">
        {prompt}
        {turns.length > 0 && <p className="mt-1 text-xs text-muted">{t("ws.chatDisclaimer")}</p>}
      </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col justify-center pb-10">
          {error && (
            <p role="alert" className="mb-3 rounded-card border border-danger p-3 text-sm text-danger">
              {error}
            </p>
          )}
          {prompt}
          <div className="mt-6">
            <p className="mb-2 text-sm text-muted">{t("ws.tryOne")}</p>
            <ul className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <li key={example.q}>
                  <button
                    type="button"
                    className="btn-sm h-auto whitespace-normal text-left"
                    onClick={() => void send(example.q)}
                    disabled={busy || loadingConversation}
                  >
                    {example.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Runner />
    </Suspense>
  );
}
