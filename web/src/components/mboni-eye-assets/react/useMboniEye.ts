"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MboniState } from "./MboniEye";

// What the app/AI reports. The hook turns it into an eye state.
export type MboniEvent = "wake" | "idle" | "ask" | "search" | "work" | "answer";

const MAP: Record<MboniEvent, MboniState> = {
  wake: "activate",
  idle: "static",
  ask: "thinking",
  search: "scanning",
  work: "processing",
  answer: "attentive",
};

type Options = {
  wakeMs?: number;      // length of the activate animation (match its duration)
  attentiveMs?: number; // how long to hold "attentive" before resting
  minDwellMs?: number;  // minimum time on any state (prevents flicker)
};

export function useMboniEye({ wakeMs = 2400, attentiveMs = 8000, minDwellMs = 700 }: Options = {}) {
  const [state, setState] = useState<MboniState>("static");
  const current = useRef<MboniState>("static");
  const since = useRef(0);
  const auto = useRef<ReturnType<typeof setTimeout>>();
  const queued = useRef<ReturnType<typeof setTimeout>>();

  const apply = useCallback((next: MboniState) => {
    clearTimeout(auto.current);
    current.current = next;
    since.current = Date.now();
    setState(next);
    if (next === "activate") auto.current = setTimeout(() => apply("static"), wakeMs);
    if (next === "attentive") auto.current = setTimeout(() => apply("static"), attentiveMs);
  }, [wakeMs, attentiveMs]);

  const send = useCallback((event: MboniEvent) => {
    const next = MAP[event];
    clearTimeout(queued.current);
    if (next === current.current) return;
    // The wake-up plays to the end; every other state shows at least minDwellMs.
    const dwell = current.current === "activate" ? wakeMs : minDwellMs;
    const wait = Math.max(0, dwell - (Date.now() - since.current));
    if (wait === 0) apply(next);
    else queued.current = setTimeout(() => apply(next), wait); // latest event wins
  }, [apply, wakeMs, minDwellMs]);

  useEffect(() => () => { clearTimeout(auto.current); clearTimeout(queued.current); }, []);

  return { state, send };
}
