import type { Config } from "tailwindcss";
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: c("bg"), surface: c("surface"), surface2: c("surface2"), ink: c("ink"), muted: c("muted"), line: c("line"),
        primary: c("primary"), "on-primary": c("on-primary"), tint: c("tint"), "on-tint": c("on-tint"), sage: c("sage"),
        danger: c("danger"), warn: c("warn"), focus: c("focus"),
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "10px" },
    },
  },
} satisfies Config;
