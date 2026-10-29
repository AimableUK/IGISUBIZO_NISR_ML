"use client";
import { useEffect, useState } from "react";

/** Follows your app's own light/dark choice (the `dark` class on <html>), not the device setting. */
export function useAppTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const el = document.documentElement;
    const read = () =>
      setTheme(el.classList.contains("dark") ? "dark" : "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}
