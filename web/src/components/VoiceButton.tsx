"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useLocale } from "@/i18n";

type Rec = {
  start(): void;
  stop(): void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((e: {
        results: ArrayLike<
          ArrayLike<{ transcript: string }> & { isFinal: boolean }
        >;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
declare global {
  interface Window {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  }
}

/** Optional voice input. Audio -> speech recognition -> visible transcript in the question field -> normal request. */
export default function VoiceButton({
  onTranscript,
  onMessage,
}: {
  onTranscript: (text: string, final: boolean) => void;
  onMessage: (m: string) => void;
}) {
  const { locale, t } = useLocale();
  const v = t.voice;
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const rec = useRef<Rec | null>(null);
  useEffect(() => {
    setSupported(
      !!(window.SpeechRecognition ?? window.webkitSpeechRecognition),
    );
  }, []);

  if (!supported) return <p className="sr-only">{v.unsupported}</p>;
  const toggle = () => {
    if (on) {
      rec.current?.stop();
      return;
    }
    const R = window.SpeechRecognition ?? window.webkitSpeechRecognition!;
    const r = new R();
    // Browsers may not recognise Kinyarwanda; if so, onerror below tells the user to type.
    r.lang = locale === "rw" ? "rw-RW" : "en-RW";
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e) => {
      const res = Array.from(e.results);
      onTranscript(
        res
          .map((x) => x[0]?.transcript ?? "")
          .join(" ")
          .trim(),
        res.every((x) => x.isFinal),
      );
    };
    r.onend = () => setOn(false);
    r.onerror = (e) => {
      setOn(false);
      onMessage(e.error === "not-allowed" ? v.blocked : v.stopped);
    };
    rec.current = r;
    setOn(true);
    onMessage(v.listening);
    r.start();
  };
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? v.stop : v.start}
      title={on ? v.stop : v.start}
      onClick={toggle}
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
        on
          ? "border-danger bg-danger/10 text-danger"
          : "border-primary/40 bg-tint text-on-tint hover:bg-primary hover:text-on-primary"
      }`}
    >
      {on && (
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full border-2 border-danger/50"
        />
      )}
      {on ? (
        <Square className="relative h-4 w-4 fill-current" aria-hidden />
      ) : (
        <Mic className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
