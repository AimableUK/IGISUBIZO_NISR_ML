"use client";

import { useEffect, useState } from "react";
import MboniEye from "./MboniEye";
import { useAppTheme } from "./useAppTheme";
import { useEyeFidget } from "./useEyeFidget";

/** Follows your own "Reduce motion" setting (the class on <html>), on top of the device setting. */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setReduce(el.classList.contains("reduce-motion"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return reduce;
}

export default function LiveEye({ width = 44 }: { width?: number }) {
  const theme = useAppTheme();
  const reduce = useReduceMotion();
  const state = useEyeFidget(!reduce);
  return (
    <MboniEye
      state={state}
      width={width}
      theme={theme}
      motion={reduce ? "off" : "auto"}
    />
  );
}
