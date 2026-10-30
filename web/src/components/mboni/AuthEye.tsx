"use client";
import { useEffect } from "react";
import MboniEye from "./MboniEye";
import { useEyeFidget } from "./useEyeFidget";
import { useAppTheme } from "./useAppTheme";
import { useReduceMotion } from "./LiveEye";

// rest      = idle, fidgets on its own
// attentive = watching you type in name / email
// closed    = shy, while a hidden password is being typed
// busy      = scanning, while the form is submitting
export type AuthEyeMode = "rest" | "attentive" | "closed" | "busy";

/** Decorative: hidden from screen readers. */
export default function AuthEye({
  mode,
  className = "w-[72px] sm:w-[88px]",
}: {
  mode: AuthEyeMode;
  className?: string;
}) {
  const theme = useAppTheme();
  const reduce = useReduceMotion();
  const { state, send } = useEyeFidget(mode === "rest" && !reduce, {
    gap: [4000, 9000],
  });

  useEffect(() => {
    send("wake");
  }, [send]); // wakes up once when the form appears
  useEffect(() => {
    send(mode === "busy" ? "search" : mode === "attentive" ? "answer" : "idle");
  }, [mode, send]);

  return (
    <div aria-hidden className={className}>
      <MboniEye
        state={state}
        width="100%"
        className="w-full"
        theme={theme}
        motion={reduce ? "off" : "auto"}
        closed={mode === "closed"}
      />
    </div>
  );
}
