"use client";
import { useEffect, useId, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import VoiceButton from "./VoiceButton";

export const EXAMPLES = [
  "Compare youth employment across districts over the last five years",
  "Rank districts by secondary school enrolment",
  "Show the trend in youth employment in Huye and Musanze",
];

export default function QuestionBar({ onSubmit, busy, initial = "", showExamples = true }: { onSubmit: (q: string) => void; busy?: boolean; initial?: string; showExamples?: boolean }) {
  const id = useId();
  const [q, setQ] = useState(initial);
  const [voiceMsg, setVoiceMsg] = useState("");
  useEffect(() => setQ(initial), [initial]);
  const submit = () => { const t = q.trim(); if (t.length >= 3 && !busy) onSubmit(t); };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="rounded-card border-2 border-ink/80 bg-surface p-2 focus-within:border-primary">
        <label htmlFor={id} className="sr-only">Your question about Rwanda’s public data</label>
        <textarea id={id} rows={2} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} maxLength={500}
          placeholder="Ask a question, e.g. Compare youth employment across districts over the last five years" className="w-full resize-none rounded-lg bg-transparent px-3 py-2 text-lg outline-none placeholder:text-muted focus-visible:outline-none" />
        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <VoiceButton onTranscript={(t) => setQ(t)} onMessage={setVoiceMsg} />
          <button type="submit" disabled={busy || q.trim().length < 3} className="btn btn-primary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowUp className="h-4 w-4" aria-hidden />}Build workspace
          </button>
        </div>
      </form>
      <p role="status" aria-live="polite" className="mt-2 min-h-[1.25rem] text-sm text-muted">{voiceMsg}</p>
      {showExamples && (
        <div className="mt-2"><p className="mb-2 text-sm text-muted">Try one of these</p>
          <ul className="flex flex-wrap gap-2">{EXAMPLES.map((e) => <li key={e}><button type="button" className="btn-sm h-auto min-h-[36px] max-w-full whitespace-normal py-1.5 text-left" onClick={() => setQ(e)}>{e}</button></li>)}</ul>
        </div>
      )}
    </div>
  );
}
