"use client";
import { useEffect, useLayoutEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** mobile < 768px <= tablet < 1024px <= desktop. `null` until the first client measurement. */
export function useBreakpoint(): Breakpoint | null {
  const [bp, setBp] = useState<Breakpoint | null>(null);
  useIso(() => {
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const read = () => setBp(lg.matches ? "desktop" : md.matches ? "tablet" : "mobile");
    read();
    md.addEventListener("change", read);
    lg.addEventListener("change", read);
    return () => { md.removeEventListener("change", read); lg.removeEventListener("change", read); };
  }, []);
  return bp;
}
