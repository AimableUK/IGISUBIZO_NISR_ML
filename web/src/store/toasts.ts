import { create } from "zustand";

export type Toast = { id: number; text: string; tone: "info" | "success" | "error" };
let n = 0;
export const useToasts = create<{ items: Toast[]; push: (text: string, tone?: Toast["tone"]) => void; dismiss: (id: number) => void }>((set) => ({
  items: [],
  push: (text, tone = "info") => {
    const id = ++n;
    set((s) => ({ items: [...s.items, { id, text, tone }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 7000);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));
