"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dict, type Example } from "./en";
import { rw } from "./rw";

export type Locale = "en" | "rw";
export const LOCALES: { code: Locale; short: string; name: string }[] = [
  { code: "en", short: "EN", name: "English" },
  { code: "rw", short: "RW", name: "Kinyarwanda" },
];

const dictionaries: Record<Locale, Dict> = { en, rw };
const STORAGE_KEY = "mboni.lang";

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
  useEffect(() => { document.title = `${title} · Mboni`; }, [title]);
}

/* ------------------------------------------------------------------ */
/* Adapter used by the app shell and the (app) pages                   */
/* ------------------------------------------------------------------ */

export type Key = string;
type Vars = Record<string, string | number>;

const lookup = (obj: unknown, path: string): unknown =>
  path.split(".").reduce<any>((o, k) => o?.[k], obj); // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * t("ws.title"), t("hist.version", { n: 2, total: 5 }).
 * Keys are looked up in dict.app first, then dict.common (so t("brand") returns common.brand).
 */
export function useI18n() {
  const { locale, t: dict, setLocale } = useLocale();
  return useMemo(() => {
    let fmt: Intl.DateTimeFormat;
    try { fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }); }
    catch { fmt = new Intl.DateTimeFormat("en", { dateStyle: "medium" }); }
    return {
      locale,
      setLocale,
      t: (key: Key, vars?: Vars): string => {
        const raw = String(lookup(dict.app, key) ?? lookup(dict.common, key) ?? key);
        return raw.replace(/\{(\w+)\}/g, (_, k: string) => (vars && k in vars ? String(vars[k]) : `{${k}}`));
      },
      examples: dict.app.examples as Example[],
      formatDate: (v: string | number | Date) => {
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? "" : fmt.format(d);
      },
    };
  }, [locale, setLocale, dict]);
}