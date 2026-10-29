import type { CSSProperties, ReactElement } from "react";

/**
 * Decorative bamboo. Pure SVG, no images, no hooks, so it works in server and client components.
 * Colours come from the existing palette (#253D2C #2E6F40 #68BA7F #CFFFDC).
 * Sway uses CSS keyframes, so your global reduced-motion rules already switch it off.
 */

const DARK = "#253D2C";
const MID = "#2E6F40";
const SAGE = "#68BA7F";
const TINT = "#CFFFDC";

// Deterministic pseudo-random numbers so server and client render identical markup.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Stalk = {
  x: number;
  h: number;
  w: number;
  seg: number;
  far: boolean;
  seed: number;
  lean: number;
  sway: number;
  dur: number;
  delay: number;
};

// Back row first, front row last. Base of every stalk sits on y = 800.
const STALKS: Stalk[] = [
  {
    x: 318,
    h: 430,
    w: 6,
    seg: 62,
    far: true,
    seed: 11,
    lean: 1.5,
    sway: 1.1,
    dur: 8.5,
    delay: -1,
  },
  {
    x: 268,
    h: 520,
    w: 7,
    seg: 68,
    far: true,
    seed: 12,
    lean: -1,
    sway: 1.0,
    dur: 9.5,
    delay: -4,
  },
  {
    x: 214,
    h: 620,
    w: 9,
    seg: 74,
    far: true,
    seed: 13,
    lean: 2,
    sway: 0.9,
    dur: 8,
    delay: -2.5,
  },
  {
    x: 158,
    h: 700,
    w: 11,
    seg: 80,
    far: false,
    seed: 14,
    lean: -1.5,
    sway: 0.8,
    dur: 10,
    delay: -6,
  },
  {
    x: 100,
    h: 770,
    w: 14,
    seg: 88,
    far: false,
    seed: 15,
    lean: 1,
    sway: 0.7,
    dur: 11,
    delay: -3,
  },
  {
    x: 40,
    h: 830,
    w: 18,
    seg: 96,
    far: false,
    seed: 16,
    lean: -2,
    sway: 0.6,
    dur: 12,
    delay: -8,
  },
];

const CSS = `
@keyframes bamboo-sway { 0%,100% { transform: rotate(calc(var(--r) * -1)); } 50% { transform: rotate(var(--r)); } }
.bamboo-sway { transform-box: fill-box; transform-origin: 50% 100%; animation: bamboo-sway var(--t) ease-in-out var(--d) infinite; }
`;

function Leaf({
  side,
  x,
  y,
  angle,
  size,
  fill,
  opacity,
}: {
  side: 1 | -1;
  x: number;
  y: number;
  angle: number;
  size: number;
  fill: string;
  opacity: number;
}) {
  return (
    <path
      d="M0 0 C14 -12 44 -16 70 -4 C44 6 14 8 0 0Z"
      transform={`translate(${x} ${y}) rotate(${-side * angle}) scale(${side * size} ${size * 0.9})`}
      fill={fill}
      opacity={opacity}
    />
  );
}

function BambooStalk({ s }: { s: Stalk }) {
  const rand = rng(s.seed);
  const n = Math.floor(s.h / s.seg);
  const body = s.far ? MID : SAGE;
  const leafScale = s.w / 9 + 0.35;
  const nodes = Array.from({ length: n }, (_, k) => -(k + 1) * s.seg);
  const style = {
    "--r": `${s.sway}deg`,
    "--t": `${s.dur}s`,
    "--d": `${s.delay}s`,
  } as CSSProperties;

  return (
    <g transform={`translate(${s.x} 800) rotate(${s.lean})`}>
      <g className="bamboo-sway" style={style}>
        <rect
          x={-s.w / 2}
          y={-s.h}
          width={s.w}
          height={s.h + 6}
          rx={s.w / 2}
          fill={body}
          opacity={s.far ? 0.85 : 1}
        />
        {!s.far && (
          <rect
            x={-s.w / 2 + s.w * 0.2}
            y={-s.h + 6}
            width={Math.max(1.5, s.w * 0.14)}
            height={s.h}
            fill={TINT}
            opacity={0.3}
          />
        )}
        {nodes.map((y, k) => (
          <rect
            key={`n${k}`}
            x={-s.w / 2 - 1.5}
            y={y - 2.5}
            width={s.w + 3}
            height={5}
            rx={2}
            fill={DARK}
            opacity={0.6}
          />
        ))}
        {nodes.map((y, k) => {
          if (k < 1) return null;
          const out: ReactElement[] = [];
          ([1, -1] as const).forEach((side) => {
            if (rand() < 0.78) {
              const hi = rand() > 0.88;
              out.push(
                <Leaf
                  key={`l${k}${side}`}
                  side={side}
                  x={side * (s.w / 2)}
                  y={y}
                  angle={8 + rand() * 32}
                  size={leafScale * (0.75 + rand() * 0.55)}
                  fill={s.far ? MID : hi ? TINT : SAGE}
                  opacity={s.far ? 0.9 : hi ? 0.4 : 0.95}
                />,
              );
            }
          });
          return out;
        })}
        {/* crown of leaves at the top */}
        {[-62, -38, -14, 14, 38, 62].map((a, i) => (
          <Leaf
            key={`c${i}`}
            side={a < 0 ? -1 : 1}
            x={0}
            y={-s.h}
            angle={90 - Math.abs(a) * 0.9}
            size={leafScale * 0.9}
            fill={s.far ? MID : SAGE}
            opacity={0.95}
          />
        ))}
      </g>
    </g>
  );
}

export function BambooGrove({
  className = "",
  mirror = false,
}: {
  className?: string;
  mirror?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 360 800"
      aria-hidden
      focusable="false"
      className={`overflow-visible ${className}`}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      <style>{CSS}</style>
      {STALKS.map((s) => (
        <BambooStalk key={s.seed} s={s} />
      ))}
    </svg>
  );
}
