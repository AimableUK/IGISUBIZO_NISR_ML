"use client";

import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ArrowUp, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useT } from "@/i18n";
import VoiceButton from "../VoiceButton";
import { EXAMPLES } from "../QuestionBar";

type MboniPromptProps = {
  onSubmit: (question: string) => void | Promise<void>;
  initial?: string;
  busy?: boolean;
  showExamples?: boolean;
  className?: string;
};

export default function MboniPrompt({
  onSubmit,
  initial = "",
  busy = false,
  showExamples = true,
  className = "",
}: MboniPromptProps) {
  const id = useId();
  const t = useT();
  const labels = t.mboniPrompt;

  const [question, setQuestion] = useState(initial);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [showAllExamples, setShowAllExamples] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setQuestion(initial);
  }, [initial]);

  const isBusy = busy || submitting;
  const canSubmit = question.trim().length >= 3 && !isBusy;

  async function submit(event?: FormEvent) {
    event?.preventDefault();

    const value = question.trim();
    if (value.length < 3 || isBusy) return;

    setSubmitting(true);

    try {
      await onSubmit(value);
      setQuestion("");
      setVoiceMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void submit();
    }
  }

  const visibleExamples = showAllExamples ? EXAMPLES : EXAMPLES.slice(0, 4);

  return (
    <section aria-label={labels.ariaLabel} className={`w-full ${className}`}>
      <h2 className="mb-5 text-center font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {labels.title}
      </h2>

      <form onSubmit={submit} className="w-full">
        <div className="relative rounded-[24px] border border-line bg-surface p-3 shadow-lg transition-colors focus-within:border-primary sm:p-4">
          <label htmlFor={id} className="sr-only">
            {labels.inputLabel}
          </label>

          <textarea
            id={id}
            rows={2}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            disabled={isBusy}
            placeholder={labels.placeholder}
            className="w-full resize-none rounded-lg bg-transparent px-3 py-2 text-lg outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-muted"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <VoiceButton
              onTranscript={(transcript) => setQuestion(transcript)}
              onMessage={setVoiceMessage}
            />

            <button
              type="submit"
              disabled={!canSubmit}
              aria-label={labels.send}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isBusy ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <ArrowUp className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </form>

      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-5 text-center text-sm text-muted"
      >
        {voiceMessage}
      </p>

      {showExamples && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {visibleExamples.map((example) => (
            <button
              key={example}
              type="button"
              disabled={isBusy}
              onClick={() => setQuestion(example)}
              className="min-h-9 max-w-full rounded-full border border-line bg-surface px-3.5 py-2 text-left text-sm text-muted transition-colors hover:border-primary hover:bg-surface2 hover:text-ink disabled:opacity-50"
            >
              {example}
            </button>
          ))}

          {EXAMPLES.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAllExamples((current) => !current)}
              aria-expanded={showAllExamples}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-ink hover:bg-surface2"
            >
              {showAllExamples ? (
                <>
                  {labels.fewerExamples}
                  <ChevronUp className="h-4 w-4" aria-hidden />
                </>
              ) : (
                <>
                  {labels.moreExamples}
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
