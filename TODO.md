# Mboni eye – animated state assets

One eye, six states. Every file uses the **same canonical eye** (same paths, same proportions, `viewBox="0 0 240 88"`, transparent background). Only the eyelids, iris, pupil and highlights move. Nothing else is ever drawn.

```
mboni-eye-assets/
  manifest.json            machine-readable list of states (read this first, if you are an AI)
  svg/                     the six standalone SVGs
  react/                   MboniEye.tsx, useMboniEye.ts, svgs.generated.ts (Next.js / React)
  html/demo.html           all states, light + dark (serve over HTTP)
```

## The six states

| # | State | File | Kind | Default | Use it when |
|---|---|---|---|---|---|
| 01 | `static` | `svg/mboni-eye.svg` | still | n/a | Resting / idle. The default. Also the logo. |
| 02 | `thinking` | `svg/mboni-eye-thinking.svg` | loop | 5.2s | A question just arrived and Mboni is working out what to do. Gaze glances up and sideways, pupil pulses, natural blinks. |
| 03 | `scanning` | `svg/mboni-eye-scanning.svg` | loop | 4.8s | Looking through data: searching datasets, reading tables or sources. Iris and pupil sweep side to side. |
| 04 | `activate` | `svg/mboni-eye-activate.svg` | one-shot | 2.4s | Mboni wakes up: closed, opens, pupil centers, settles into the static eye. |
| 05 | `processing` | `svg/mboni-eye-processing.svg` | loop | 3.2s | Computing, aggregating, building the answer. Lids narrow, pupil steady with tiny micro-movements. |
| 06 | `attentive` | `svg/mboni-eye-attentive.svg` | loop | 6s | Presenting the answer. Lids open slightly wider, calm centered gaze, slow blink. |

`activate` ends exactly on the static eye. `processing` and `attentive` ease in from the static eye (0.6s and 0.7s), then hold.

## How Mboni should use them while working

Report what you are doing with one of six events. The UI maps the event to a state.

| Event | Eye state | Send it when |
|---|---|---|
| `wake` | `activate` | The assistant opens or the session starts. Plays once, then rests. |
| `idle` | `static` | Nothing is happening. |
| `ask` | `thinking` | A user message arrives, before any lookup or computation. |
| `search` | `scanning` | You start searching, retrieving, or reading data and sources. |
| `work` | `processing` | You start calculating, aggregating, analysing, or composing the answer. |
| `answer` | `attentive` | You start presenting the answer. Holds about 8s, then rests. |

Typical turn: `wake` → `idle` → `ask` → `search` → `work` → `answer` → `idle`.

Rules for the AI and the developer:
1. Send the event when the phase **starts**, not after it ends. Repeat phases are fine (`search` → `work` → `search`).
2. One eye on screen at a time. Never show two states together and never crossfade two eyes.
3. Each state stays on screen at least about 0.7s (the hook enforces this; the latest event wins). `activate` always plays to the end, then the next event applies.
4. There is no error or success state. On errors or unknown situations, send `idle`. Do not invent new states, symbols, badges, loading dots or text around the eye.
5. Never edit the geometry. Color, size and animation speed are the only things you change (variables below).
6. Reduced motion is automatic: users who prefer reduced motion see the static eye in every state.

### Paste into Mboni's system prompt (if the AI drives the eye itself)

```
You control Mboni's eye with the tool/field `eye` (one of: wake, idle, ask, search, work, answer).
Set it when a phase starts: `ask` when you begin reasoning about a new user message, `search` when you begin
looking up data or sources, `work` when you begin calculating or composing, `answer` when you begin writing
the final answer, `idle` when you are done or something went wrong. Use `wake` only once per session.
Never mention the eye to the user.
```

Wire it from your backend as a stream event, for example `{"type":"eye","state":"search"}`, and call `send("search")` on the client.

## Next.js

1. Copy `react/` to `components/mboni/`. (`svgs.generated.ts` holds the six SVGs as strings, so nothing else is needed.)
2. Use it:

```tsx
"use client";
import MboniEye from "@/components/mboni/MboniEye";
import { useMboniEye } from "@/components/mboni/useMboniEye";

export default function Assistant() {
  const { state, send } = useMboniEye();

  // Example wiring: call send() as your chat stream reports each phase.
  // send("wake") on mount · send("ask") on submit · send("search") · send("work") · send("answer")

  return <MboniEye state={state} width={96} theme="auto" />;
}
```

Props of `MboniEye`: `state`, `width`, `height`, `theme` (`auto | light | dark`), `duration`, `delay`, `count`, `motion` (`auto | off`), `colors={{ lid, iris, pupil, arc, hl }}`, `className`.
Tracking your own theme toggle (for example `next-themes`): `theme={resolvedTheme === "dark" ? "dark" : "light"}`.

### Plain `<img>` (simplest, no React)

```html
<img src="/mboni/mboni-eye-scanning.svg" width="96" alt="Mboni">
```

Swap the `src` per state. Theme follows the OS and reduced motion works, but colors and duration cannot be changed this way. Set `width`/`height` to size it. To restart an animation, change the `src` or re-insert the element.

### Inline SVG (customizable)

Paste the SVG source, or fetch and inject it (see `html/demo.html`). Then set variables on the SVG or any parent:

```html
<div style="width:120px; --mboni-dur:3s; --mboni-iris:#059669">  <!-- inline SVG here --> </div>
```

## Customization

| What | How |
|---|---|
| Width / height | `width` / `height` attributes or props. The viewBox keeps the 240:88 ratio. Set only `width` for automatic height. |
| Colors | `--mboni-lid`, `--mboni-iris`, `--mboni-pupil`, `--mboni-arc`, `--mboni-hl` |
| Speed | `--mboni-dur` (each state has its own default, see the table) |
| Start delay | `--mboni-delay` |
| Repeats | `--mboni-count` (`infinite` for loops, `1` for activate; `0` stops a loop on the static eye) |
| Ramp-in | `--mboni-enter` (processing 0.6s, attentive 0.7s) |
| Theme | `data-theme="auto"` (OS), `"light"`, or `"dark"` |
| Force static | `data-motion="off"` |

Light theme uses dark forest greens (for white and pale backgrounds). Dark theme uses emerald and mint (for dark surfaces). A monochrome variant is not in this set yet.

## Notes

- Variables only work with inline SVG (or the React component), not with `<img>`.
- Each SVG uses its own prefixed class names and IDs, so several different states can be on one page.
- If you edit an SVG, regenerate `react/svgs.generated.ts` so the component stays in sync.
- `mboni-eye-thinking.svg` is the approved Thinking / blinking asset, renamed.


