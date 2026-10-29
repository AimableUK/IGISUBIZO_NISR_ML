"use client";
import { useEffect } from "react";
import { useMboniEye, type MboniEvent } from "./useMboniEye";

// Short, playful moments. `ms` matches each animation's own length so it ends cleanly on the resting eye.
const MOVES: { event: MboniEvent; ms: number; weight: number }[] = [
  { event: "wake", ms: 2400, weight: 3 }, // blink / wake up
  { event: "ask", ms: 5200, weight: 3 }, // glances up and sideways
  { event: "search", ms: 4800, weight: 2 }, // looks left and right
  { event: "answer", ms: 3200, weight: 2 }, // calm, attentive stare
];
const TOTAL = MOVES.reduce((n, m) => n + m.weight, 0);
const rand = (min: number, max: number) => min + Math.random() * (max - min);

function pick() {
  let r = Math.random() * TOTAL;
  for (const m of MOVES) {
    r -= m.weight;
    if (r <= 0) return m;
  }
  return MOVES[0]!;
}

/** Returns an eye state that rests most of the time and fidgets now and then. */
export function useEyeFidget(enabled = true) {
  const { state, send } = useMboniEye({ attentiveMs: 3200 });

  useEffect(() => {
    if (!enabled) {
      send("idle");
      return;
    }
    let wait: ReturnType<typeof setTimeout> | undefined;
    let back: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      wait = setTimeout(
        () => {
          if (document.hidden) return schedule(); // nobody is looking: skip this round
          const move = pick();
          send(move.event);
          back = setTimeout(() => {
            send("idle");
            schedule();
          }, move.ms);
        },
        rand(6000, 15000),
      );
    };
    schedule();

    return () => {
      clearTimeout(wait);
      clearTimeout(back);
    };
  }, [enabled, send]);

  return state;
}
