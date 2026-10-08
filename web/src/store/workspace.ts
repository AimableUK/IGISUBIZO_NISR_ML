import { create } from "zustand";
import {
  composeView, emptyCustomizations,
  type AnalyticalResult, type ArtifactPayload, type Customizations, type FilterValueT, type PresentationSpec, type SwitchType,
} from "@/shared";

type Snap = { spec: PresentationSpec; cz: Customizations };
const LIMIT = 50;

interface WorkspaceState {
  payload: ArtifactPayload | null;
  result: AnalyticalResult | null;
  spec: PresentationSpec | null;
  cz: Customizations;
  past: Snap[]; future: Snap[];
  dirty: boolean;
  load: (p: ArtifactPayload) => void;
  clear: () => void;
  setSpan: (id: string, span: number) => void;
  move: (id: string, dir: -1 | 1) => void;
  moveTo: (id: string, targetId: string) => void;
  toggleCollapse: (id: string) => void;
  switchType: (id: string, t: SwitchType | null) => void;
  setPalette: (p: Customizations["palette"]) => void;
  setFilter: (id: string, v: FilterValueT) => void;
  replaceSpec: (spec: PresentationSpec) => void;
  resetCustomizations: () => void;
  undo: () => void; redo: () => void;
  markSaved: () => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => {
  /** Record an undoable change. Filters are deliberately outside the undo stack. */
  const commit = (patch: Partial<Snap>) => {
    const { spec, cz, past } = get();
    if (!spec) return;
    set({ past: [...past.slice(-LIMIT + 1), { spec, cz }], future: [], spec: patch.spec ?? spec, cz: patch.cz ?? cz, dirty: true });
  };
  const ids = () => { const { spec, cz, result } = get(); return spec && result ? composeView(spec, cz, result).map((c) => c.id) : []; };

  return {
    payload: null, result: null, spec: null, cz: emptyCustomizations(), past: [], future: [], dirty: false,
    load: (p) => set({ payload: p, result: p.result, spec: p.spec, cz: p.customizations, past: [], future: [], dirty: false }),
    clear: () => set({ payload: null, result: null, spec: null, cz: emptyCustomizations(), past: [], future: [], dirty: false }),
    setSpan: (id, span) => { const { cz } = get(); commit({ cz: { ...cz, overrides: { ...cz.overrides, [id]: { ...cz.overrides[id], span: Math.min(12, Math.max(3, span)) } } } }); },
    move: (id, dir) => {
      const order = ids(); const i = order.indexOf(id); const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return;
      [order[i], order[j]] = [order[j]!, order[i]!];
      commit({ cz: { ...get().cz, order } });
    },
    moveTo: (id, targetId) => {
      const order = ids().filter((x) => x !== id); const t = order.indexOf(targetId);
      if (t < 0) return;
      order.splice(t, 0, id);
      commit({ cz: { ...get().cz, order } });
    },
    toggleCollapse: (id) => { const { cz } = get(); commit({ cz: { ...cz, overrides: { ...cz.overrides, [id]: { ...cz.overrides[id], collapsed: !cz.overrides[id]?.collapsed } } } }); },
    switchType: (id, t) => { const { cz } = get(); commit({ cz: { ...cz, overrides: { ...cz.overrides, [id]: { ...cz.overrides[id], type: t ?? undefined } } } }); },
    setPalette: (palette) => commit({ cz: { ...get().cz, palette } }),
    setFilter: (id, v) => set((s) => ({ cz: { ...s.cz, filters: { ...s.cz.filters, [id]: v } }, dirty: true })),
    replaceSpec: (spec) => commit({ spec }),
    resetCustomizations: () => commit({ cz: emptyCustomizations() }),
    undo: () => { const { past, future, spec, cz } = get(); const prev = past[past.length - 1]; if (!prev || !spec) return; set({ past: past.slice(0, -1), future: [{ spec, cz }, ...future], spec: prev.spec, cz: prev.cz, dirty: true }); },
    redo: () => { const { past, future, spec, cz } = get(); const next = future[0]; if (!next || !spec) return; set({ past: [...past, { spec, cz }], future: future.slice(1), spec: next.spec, cz: next.cz, dirty: true }); },
    markSaved: () => set({ dirty: false }),
  };
});
