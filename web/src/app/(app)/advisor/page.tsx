"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUp, Loader2, RotateCcw } from "lucide-react";
import type { ConversationMessage } from "@/shared";
import { api, ApiError } from "@/lib/api";

type Turn = ConversationMessage & {
  mode?: "ai" | "guided";
  sources?: { title: string; period: string; isSample: boolean; url?: string }[];
};

const WELCOME: Turn = {
  role: "assistant",
  content: "Hi! I can help you explore study and career options in Rwanda. Tell me what you enjoy, what you are considering, or ask “What if I chose hotel management?” I’ll separate data evidence from general considerations.",
  mode: "guided",
  sources: [],
};
const STARTERS = [
  "I enjoy maths and working with people. What paths could fit me?",
  "What if I chose hotel management? What are the pros and cons?",
  "I finished secondary school and need help choosing what to study.",
  "What is the weather forecast for Kigali?",
];

export default function AdvisorPage() {
  const [turns, setTurns] = useState<Turn[]>([WELCOME]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [useAi, setUseAi] = useState(false);

  async function send(event?: FormEvent<HTMLFormElement>, text = draft) {
    event?.preventDefault();
    const message = text.trim();
    if (message.length < 2 || busy) return;
    setBusy(true);
    setError("");
    try {
      const history = turns.slice(-10).map(({ role, content }) => ({ role, content }));
      const response = await api.converse(message, history, useAi);
      setTurns((current) => [
        ...current,
        { role: "user", content: message },
        {
          role: "assistant",
          content: response.reply,
          mode: response.mode,
          sources: response.sources,
        },
      ]);
      setDraft("");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The adviser could not answer. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/workspace" className="text-sm text-primary hover:underline">← Analysis workspace</Link>
          <h1 className="mt-3 text-3xl font-semibold">Study &amp; career adviser</h1>
          <p className="mt-2 text-sm text-muted">
            Explore choices through conversation. Evidence in this prototype may be demo data and cannot guarantee future outcomes.
          </p>
        </div>
        <button
          type="button"
          className="btn-sm shrink-0"
          onClick={() => { setTurns([WELCOME]); setError(""); }}
          disabled={busy}
          aria-label="Start a new conversation"
        >
          <RotateCcw className="mr-1 inline h-4 w-4" aria-hidden /> New
        </button>
      </header>

      <section aria-label="Conversation" aria-live="polite" className="flex-1 space-y-4">
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
                {turn.mode === "ai" ? "AI-assisted answer" : "Guided answer"}
                {turn.sources?.some((source) => source.isSample) && " · Includes generated demo data"}
              </p>
            )}
            {turn.sources && turn.sources.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {turn.sources.map((source) => (
                  <li key={`${source.title}-${source.period}`}>
                    Source: {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer" className="underline">{source.title}</a>
                    ) : source.title} ({source.period}){source.isSample ? " — demo/proxy" : ""}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
        {busy && (
          <p role="status" className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Thinking through your question…
          </p>
        )}
      </section>

      {turns.length === 1 && (
        <ul className="mb-4 flex flex-wrap gap-2">
          {STARTERS.map((starter) => (
            <li key={starter}>
              <button type="button" className="btn-sm h-auto whitespace-normal text-left" onClick={() => void send(undefined, starter)}>
                {starter}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p role="alert" className="mb-3 rounded-card border border-danger p-3 text-sm text-danger">{error}</p>}
      <form onSubmit={(event) => void send(event)} className="mt-4 rounded-card border-2 border-ink/80 bg-surface p-2 focus-within:border-primary">
        <label className="sr-only" htmlFor="advisor-message">Your message</label>
        <textarea
          id="advisor-message"
          rows={2}
          maxLength={500}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          placeholder="Ask a question or tell me what matters to you…"
          className="w-full resize-none rounded-lg bg-transparent px-3 py-2 text-base outline-none"
        />
        <div className="flex justify-end px-1 pb-1">
          <button type="submit" className="btn btn-primary" disabled={busy || draft.trim().length < 2}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowUp className="h-4 w-4" aria-hidden />}
            <span className="ml-2">Send</span>
          </button>
        </div>
      </form>
      <label className="mt-3 flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" checked={useAi} onChange={(event) => setUseAi(event.target.checked)} />
        <span>Use AI-assisted replies. If enabled, your message and recent conversation are sent to our configured AI provider. Avoid sharing sensitive personal information.</span>
      </label>
      <p className="mt-2 text-xs text-muted">Conversation history stays in this page session and is not saved as an analysis. With this option off, replies use guided rules and may be less flexible.</p>
    </main>
  );
}
