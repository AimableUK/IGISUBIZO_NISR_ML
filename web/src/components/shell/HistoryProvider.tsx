"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ArtifactSummary } from "@/shared";
import { api } from "@/lib/api";

type Ctx = {
  /** Newest first. `null` while the first load is in flight. */
  items: ArtifactSummary[] | null;
  error: boolean;
  refresh: () => void;
  removeLocal: (id: string) => void;
};
const HistoryContext = createContext<Ctx | null>(null);

const byNewest = (a: ArtifactSummary, b: ArtifactSummary) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

/** One shared copy of the saved analyses, used by the sidebar and the history page. */
export function HistoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ArtifactSummary[] | null>(null);
  const [error, setError] = useState(false);

  const refresh = useCallback(() => {
    setError(false);
    api.list().then((l) => setItems([...l].sort(byNewest))).catch(() => setError(true));
  }, []);
  const removeLocal = useCallback((id: string) => setItems((l) => (l ? l.filter((x) => x.id !== id) : l)), []);

  useEffect(refresh, [refresh]);

  const value = useMemo(() => ({ items, error, refresh, removeLocal }), [items, error, refresh, removeLocal]);
  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory(): Ctx {
  const c = useContext(HistoryContext);
  if (!c) throw new Error("useHistory must be used inside <HistoryProvider>");
  return c;
}
