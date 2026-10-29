"use client";
import { useEffect, useState } from "react";
import { useT } from "@/i18n";
import PromptInput from "./Promptinput";

export const EXAMPLES = [
  "Compare youth employment across districts over the last five years",
  "Which districts have the highest poverty rates?",
  "Show child vaccination coverage by district",
  "How has school dropout changed since 2020?",
  "How has Software Engineering enrollment changed from 2021 to 2025?",
  "Which sectors hire applied mathematics graduates?",
  "Compare maize yield across districts",
  "Which sectors have the highest employment share?",
  "Show job vacancies by occupation",
  "Compare TVET pass rates by trade",
  "Which exam subjects have the highest pass rates?",
  "Compare household electricity access across districts",
];

export default function QuestionBar({
  onSubmit,
  busy,
  initial = "",
  showExamples = true,
}: {
  onSubmit: (q: string) => void;
  busy?: boolean;
  initial?: string;
  showExamples?: boolean;
}) {
  const labels = useT().mboniPrompt;
  const [q, setQ] = useState(initial);
  useEffect(() => setQ(initial), [initial]);

  return (
    <div>
      {/* Same input as the home prompt. Unlike MboniPrompt, the text stays after sending. */}
      <PromptInput
        value={q}
        onChange={setQ}
        onSubmit={onSubmit}
        busy={busy}
        placeholder={labels.placeholder}
        label={labels.inputLabel}
        sendLabel={labels.send}
      />

      {showExamples && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <li key={e}>
              <button
                type="button"
                className="btn-sm h-auto min-h-[36px] max-w-full whitespace-normal py-1.5 text-left"
                onClick={() => setQ(e)}
              >
                {e}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
