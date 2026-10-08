"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type Rec = { start(): void; stop(): void; lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };
declare global { interface Window { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec } }

/** Optional voice input. Audio -> speech recognition -> visible transcript in the question field -> normal request. */
export default function VoiceButton({ onTranscript, onMessage }: { onTranscript: (text: string, final: boolean) => void; onMessage: (m: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const rec = useRef<Rec | null>(null);
  useEffect(() => { setSupported(!!(window.SpeechRecognition ?? window.webkitSpeechRecognition)); }, []);

  if (!supported) return <p className="sr-only">Voice input is not supported in this browser. Type your question instead.</p>;
  const toggle = () => {
    if (on) { rec.current?.stop(); return; }
    const R = window.SpeechRecognition ?? window.webkitSpeechRecognition!;
    const r = new R(); r.lang = "en-RW"; r.interimResults = true; r.continuous = false;
    r.onresult = (e) => { const res = Array.from(e.results); onTranscript(res.map((x) => x[0]?.transcript ?? "").join(" ").trim(), res.every((x) => x.isFinal)); };
    r.onend = () => setOn(false);
    r.onerror = (e) => { setOn(false); onMessage(e.error === "not-allowed" ? "Microphone access was blocked. You can still type your question." : "Voice input stopped. You can type your question instead."); };
    rec.current = r; setOn(true); onMessage("Listening… your words appear in the question box."); r.start();
  };
  return (
    <button type="button" className="btn-icon border-line" aria-pressed={on} aria-label={on ? "Stop voice input" : "Ask by voice"} onClick={toggle}>
      {on ? <Square className="h-5 w-5 text-danger" aria-hidden /> : <Mic className="h-5 w-5" aria-hidden />}
    </button>
  );
}
