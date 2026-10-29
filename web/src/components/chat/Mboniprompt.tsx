"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useT } from "@/i18n";
import { EXAMPLES } from "./QuestionBar";
import PromptInput from "./Promptinput";

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
  const t = useT();
  const labels = t.mboniPrompt;

  const [question, setQuestion] = useState(initial);
  const [showAllExamples, setShowAllExamples] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setQuestion(initial);
  }, [initial]);

  const isBusy = busy || submitting;

  async function handleSubmit(value: string) {
    setSubmitting(true);
    try {
      await onSubmit(value);
      setQuestion(""); // this prompt clears itself after sending
    } finally {
      setSubmitting(false);
    }
  }

  const visibleExamples = showAllExamples ? EXAMPLES : EXAMPLES.slice(0, 4);

  return (
    <section aria-label={labels.ariaLabel} className={`w-full ${className}`}>
      <h2 className="mb-5 text-center font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {labels.title}
      </h2>

      <PromptInput
        value={question}
        onChange={setQuestion}
        onSubmit={handleSubmit}
        busy={isBusy}
        placeholder={labels.placeholder}
        label={labels.inputLabel}
        sendLabel={labels.send}
      />

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
