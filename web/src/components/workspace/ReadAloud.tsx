"use client";
import { useEffect, useState } from "react";
import { Square, Volume2 } from "lucide-react";

/** Text-to-speech for insights. The same sentences stay visible in a live caption box. */
export default function ReadAloud({ lines }: { lines: string[] }) {
  const [supported, setSupported] = useState(false);
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => { setSupported("speechSynthesis" in window); return () => window.speechSynthesis?.cancel(); }, []);
  if (!supported || !lines.length) return null;

  const stop = () => { window.speechSynthesis.cancel(); setNow(null); };
  const start = () => {
    stop();
    lines.forEach((t, i) => {
      const u = new SpeechSynthesisUtterance(t);
      u.onstart = () => setNow(t);
      u.onend = () => { if (i === lines.length - 1) setNow(null); };
      u.onerror = () => setNow(null);
      window.speechSynthesis.speak(u);
    });
  };
  return (
    <>
      <button className="btn" aria-pressed={now !== null} onClick={now ? stop : start}>{now ? <Square className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}{now ? "Stop reading" : "Read insights aloud"}</button>
      {now && <p role="status" className="basis-full rounded-lg border border-primary bg-tint px-3 py-2 text-sm text-on-tint"><span className="font-medium">Now reading: </span>{now}</p>}
    </>
  );
}
