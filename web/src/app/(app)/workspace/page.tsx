"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import type { ConversationMessage } from "@/shared";
import PromptInput from "@/components/chat/Promptinput";
import { ApiError, api } from "@/lib/api";
import { useI18n } from "@/i18n";

type Turn = ConversationMessage & {
  mode?: "ai" | "guided";
  sources?: { title: string; period: string; isSample: boolean; url?: string }[];
  artifactId?: string | null;
};

function Runner() {
  const sp = useSearchParams();
  const { t, examples } = useI18n();
  const [turns, setTurns] = useState<Turn[]>([
    { role: "assistant", content: t("ws.chatWelcome"), mode: "guided", sources: [] },
  ]);
  const [draft, setDraft] = useState(sp.get("q") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [useAi, setUseAi] = useState(false);
  const started = useRef(false);

  const send = useCallback(async (value: string) => {
    const message = value.trim();
    if (message.length < 2 || busy) return;

    setBusy(true);
    setError("");
    setTurns((current) => [...current, { role: "user", content: message }]);
    try {
      const history = turns.slice(-10).map(({ role, content }) => ({
        role,
        content: content.slice(0, 2000),
      }));
      const response = await api.converse(message, history, useAi);
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
      setTurns((current) => current.slice(0, -1));
      setDraft(message);
      setError(reason instanceof ApiError ? reason.message : t("ws.errorBody"));
    } finally {
      setBusy(false);
    }
  }, [busy, t, turns, useAi]);

  useEffect(() => {
    const initial = sp.get("q");
    if (initial && sp.get("run") && !started.current) {
      started.current = true;
      void send(initial);
    }
  }, [send, sp]);

  function newConversation() {
    setTurns([{ role: "assistant", content: t("ws.chatWelcome"), mode: "guided", sources: [] }]);
    setDraft("");
    setError("");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{t("ws.title")}</h1>
          <p className="mt-2 text-sm text-muted">{t("ws.subtitle")}</p>
        </div>
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
      </header>

      <section aria-label={t("ws.conversationLabel")} aria-live="polite" className="flex-1 space-y-4">
        {turns.map((turn, index) => (
          <article
            key={`${index}-${turn.role}`}
            className={`max-w-[92%] rounded-card border p-4 ${
              turn.role === "user"
                ? "ml-auto border-primary bg-primary/5"
                : "mr-auto border-line bg-surface"
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
        {busy && (
          <p role="status" className="flex items-center gap-2 text-sm text-muted">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" aria-hidden />
            {t("ws.chatThinking")}
          </p>
        )}
      </section>

      {turns.length === 1 && (
        <div className="mb-4">
          <p className="mb-2 text-sm text-muted">{t("ws.tryOne")}</p>
          <ul className="flex flex-wrap gap-2">
            {examples.slice(0, 6).map((example) => (
              <li key={example.q}>
                <button
                  type="button"
                  className="btn-sm h-auto whitespace-normal text-left"
                  onClick={() => void send(example.q)}
                  disabled={busy}
                >
                  {example.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p role="alert" className="mb-3 rounded-card border border-danger p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <PromptInput
        value={draft}
        onChange={setDraft}
        onSubmit={send}
        busy={busy}
        placeholder={t("q.placeholder")}
        label={t("q.placeholder")}
        sendLabel={t("q.send")}
        minLength={2}
      />
      <label className="mt-3 flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" checked={useAi} onChange={(event) => setUseAi(event.target.checked)} disabled={busy} />
        <span>
          <span className="font-medium">{t("ws.useAi")}</span>{" "}
          {t("ws.aiPrivacy")}
        </span>
      </label>
      <p className="mt-2 text-xs text-muted">{t("ws.chatDisclaimer")}</p>
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
