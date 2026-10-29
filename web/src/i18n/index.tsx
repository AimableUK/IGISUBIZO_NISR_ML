"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { en, type Dict } from "./en";
import { rw } from "./rw";

export type Locale = "en" | "rw";
export const LOCALES: { code: Locale; short: string; name: string }[] = [
  { code: "en", short: "EN", name: "English" },
  { code: "rw", short: "RW", name: "Kinyarwanda" },
];

const dictionaries: Record<Locale, Dict> = { en, rw };
const STORAGE_KEY = "isesengura.lang";

type Ctx = { locale: Locale; t: Dict; setLocale: (l: Locale) => void };
const LocaleContext = createContext<Ctx>({ locale: "en", t: en, setLocale: () => {} });

/**
 * Starts in English on the server and on first paint (so markup matches),
 * then switches to the saved choice, or to Kinyarwanda if the browser asks for it.
 * To make the whole app bilingual, move this provider into the root layout.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, set] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "rw") set(saved);
      else if (navigator.language?.toLowerCase().startsWith("rw")) set("rw");
    } catch { /* storage unavailable: stay in English */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale; // "rw" is the ISO 639-1 code for Kinyarwanda
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    set(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  return <LocaleContext.Provider value={{ locale, t: dictionaries[locale], setLocale }}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
export const useT = () => useContext(LocaleContext).t;

/** Sets the browser tab title. Marketing pages are client components, so they cannot export `metadata`. */
export function useDocumentTitle(title: string) {
  useEffect(() => { document.title = `${title} · Isesengura`; }, [title]);
}
