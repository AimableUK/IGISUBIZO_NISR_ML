import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "system" | "light" | "dark";
interface Prefs {
  theme: Theme; contrast: boolean; motion: "system" | "reduce"; textScale: number;
  set: (p: Partial<Omit<Prefs, "set">>) => void;
}
export const usePrefs = create<Prefs>()(
  persist((set) => ({ theme: "light", contrast: false, motion: "system", textScale: 1, set: (p) => set(p) }), { name: "raw-prefs" }),
);
