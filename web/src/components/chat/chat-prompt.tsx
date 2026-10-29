"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ArrowUp, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useT } from "@/i18n";
import VoiceButton from "../VoiceButton";
import { EXAMPLES } from "./QuestionBar";

type MboniPromptProps = {
  onSubmit: (question: string) => void | Promise<void>;
  initial?: string;
  busy?: boolean;
  showExamples?: boolean;
  className?: string;
};

// Runs before paint in the browser so the box never flashes at the wrong height.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// The box starts as one row and grows with the text up to this height, then scrolls.
const MAX_INPUT_HEIGHT = 168;

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [question, setQuestion] = useState(initial);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [showAllExamples, setShowAllExamples] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setQuestion(initial);
  }, [initial]);

  // Auto-grow: measure the content, then set the height. Shrinks again when text is cleared.
  useIsoLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [question]);

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
        {/* One row: mic, input, send. items-end keeps the buttons at the bottom as the input grows. */}
        <div className="flex items-end gap-2 rounded-3xl border border-line bg-surface p-2 shadow-lg transition-colors focus-within:border-primary sm:gap-3 sm:p-2.5">
          <VoiceButton
            onTranscript={(transcript) => setQuestion(transcript)}
            onMessage={setVoiceMessage}
          />

          <label htmlFor={id} className="sr-only">
            {labels.inputLabel}
          </label>

          <textarea
            ref={inputRef}
            id={id}
            rows={1}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            disabled={isBusy}
            placeholder={labels.placeholder}
            className="min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-[10px] text-base leading-6 outline-none ring-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden placeholder:text-muted focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:text-lg sm:leading-6"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            aria-label={labels.send}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isBusy ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <ArrowUp className="h-5 w-5" aria-hidden />
            )}
          </button>
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
