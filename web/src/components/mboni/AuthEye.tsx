"use client";
import { useEffect } from "react";
import MboniEye from "./MboniEye";
import { useMboniEye } from "./useMboniEye";
import { useAppTheme } from "./useAppTheme";
import { useReduceMotion } from "./LiveEye";

export type AuthEyeMode = "rest" | "closed" | "busy";

/**
 * Wakes up once, then rests. "closed" shuts the lids (password being typed),
 * "busy" scans (form is being submitted). Decorative: hidden from screen readers.
 */
export default function AuthEye({
  mode,
  className = "w-[72px] sm:w-[88px]",
}: {
  mode: AuthEyeMode;
  className?: string;
}) {
  const theme = useAppTheme();
  const reduce = useReduceMotion();
  const { state, send } = useMboniEye();

  useEffect(() => {
    send("wake");
  }, [send]); // once, when the form appears
  useEffect(() => {
    send(mode === "busy" ? "search" : "idle");
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
