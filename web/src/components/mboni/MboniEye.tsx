"use client";

import type { CSSProperties } from "react";
import { MBONI_SVGS } from "./svgs.generated";

export type MboniState = keyof typeof MBONI_SVGS;
// "static" | "thinking" | "scanning" | "activate" | "processing" | "attentive"

type MboniColors = { lid?: string; iris?: string; pupil?: string; arc?: string; hl?: string };

export type MboniEyeProps = {
  state?: MboniState;
  width?: number | string;
  height?: number | string;          // omit to keep aspect ratio
  theme?: "auto" | "light" | "dark"; // auto follows prefers-color-scheme
  duration?: string;                 // loop / one-shot length, e.g. "4s"
  delay?: string;                    // start delay
  count?: number | "infinite";       // iteration count (activate defaults to 1)
  motion?: "auto" | "off";           // "off" freezes to the static logo
  colors?: MboniColors;
  className?: string;
};

export default function MboniEye({
  state = "static",
  width = 240,
  height,
  theme = "auto",
  duration,
  delay,
  count,
  motion = "auto",
  colors = {},
  className,
}: MboniEyeProps) {
  const svg = MBONI_SVGS[state]
    .replace(' width="240" height="88"', ` width="${width}"${height !== undefined ? ` height="${height}"` : ""}`)
    .replace('data-theme="auto"', `data-theme="${theme}" data-motion="${motion}"`);

  const vars: Record<string, string | number | undefined> = {
    "--mboni-dur": duration,
    "--mboni-delay": delay,
    "--mboni-count": count,
    "--mboni-lid": colors.lid,
    "--mboni-iris": colors.iris,
    "--mboni-pupil": colors.pupil,
    "--mboni-arc": colors.arc,
    "--mboni-hl": colors.hl,
  };
  const style = Object.fromEntries(Object.entries(vars).filter(([, v]) => v !== undefined)) as CSSProperties;

  // key={state} remounts the SVG on every state change so each animation restarts from frame 0.
  return (
    <span
      key={state}
      className={className}
      style={{ display: "inline-block", lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
