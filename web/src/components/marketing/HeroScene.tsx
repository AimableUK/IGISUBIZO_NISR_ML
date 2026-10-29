/**
 * Full-bleed Rwanda landscape: a green dawn over the Virunga volcanoes, with layers of
 * terraced hills in front. Pure SVG in the existing palette, so it needs no image files
 * and stays sharp at any size. `xMidYMax slice` keeps the hills in view on tall phones.
 */
const DARK = "#253D2C";
const MID = "#2E6F40";
const SAGE = "#68BA7F";
const TINT = "#CFFFDC";

const HILLS = {
  far: "M0 585 C140 535 260 515 400 545 C540 575 640 520 790 510 C940 500 1060 560 1210 545 C1320 534 1390 555 1440 548",
  mid: "M0 650 C150 600 290 590 430 620 C570 650 710 585 860 592 C1010 600 1140 660 1290 632 C1370 617 1410 622 1440 630",
  near: "M0 725 C200 672 360 680 520 708 C700 740 820 672 1000 682 C1180 692 1300 735 1440 708",
  front: "M0 782 C240 748 420 756 620 774 C820 792 1000 748 1200 760 C1320 768 1400 764 1440 768",
};
const close = (d: string) => `${d} L1440 800 L0 800Z`;

export default function HeroScene({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" role="img" aria-label={label} className="h-full w-full">
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={DARK} />
          <stop offset="0.5" stopColor={MID} />
          <stop offset="1" stopColor={SAGE} />
        </linearGradient>
        <radialGradient id="hs-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={TINT} stopOpacity="0.95" />
          <stop offset="0.3" stopColor={TINT} stopOpacity="0.4" />
          <stop offset="1" stopColor={TINT} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hs-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TINT} stopOpacity="0" />
          <stop offset="0.5" stopColor={TINT} stopOpacity="0.22" />
          <stop offset="1" stopColor={TINT} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hs-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SAGE} />
          <stop offset="0.35" stopColor={MID} />
        </linearGradient>
        <linearGradient id="hs-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MID} />
          <stop offset="1" stopColor={DARK} />
        </linearGradient>
        <linearGradient id="hs-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MID} stopOpacity="0.95" />
          <stop offset="0.6" stopColor={DARK} />
        </linearGradient>
        <clipPath id="hs-clip-mid"><path d={close(HILLS.mid)} /></clipPath>
        <clipPath id="hs-clip-near"><path d={close(HILLS.near)} /></clipPath>
      </defs>

      {/* sky and sunrise */}
      <rect width="1440" height="800" fill="url(#hs-sky)" />
      <circle cx="1010" cy="430" r="340" fill="url(#hs-glow)" />
      <circle cx="1010" cy="430" r="58" fill={TINT} opacity="0.92" />

      {/* Virunga volcanoes */}
      <path d="M900 640 C980 480 1050 365 1100 295 C1112 282 1128 282 1140 295 C1195 360 1270 475 1370 640Z" fill={DARK} opacity="0.42" />
      <path d="M250 640 C360 480 450 345 520 302 C545 288 585 288 610 302 C690 348 780 480 900 640Z" fill={DARK} opacity="0.55" />
      <path d="M630 640 C700 490 760 385 800 348 L826 356 C842 348 858 349 872 356 C930 405 1010 505 1100 640Z" fill={DARK} opacity="0.68" />

      {/* birds */}
      <g fill="none" stroke={TINT} strokeWidth="2" strokeLinecap="round" opacity="0.6">
        <path d="M520 250 q7 -7 14 0 q7 -7 14 0" />
        <path d="M575 275 q5 -5 10 0 q5 -5 10 0" />
        <path d="M1220 210 q6 -6 12 0 q6 -6 12 0" />
      </g>

      {/* far hills */}
      <path d={close(HILLS.far)} fill="url(#hs-far)" />
      <rect y="470" width="1440" height="130" fill="url(#hs-mist)" />

      {/* terraced hills */}
      <path d={close(HILLS.mid)} fill="url(#hs-mid)" />
      <g clipPath="url(#hs-clip-mid)" fill="none" stroke={TINT} strokeOpacity="0.11" strokeWidth="1.5">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={HILLS.mid} transform={`translate(0 ${14 + i * 16})`} />)}
      </g>
      <rect y="590" width="1440" height="110" fill="url(#hs-mist)" opacity="0.7" />

      <path d={close(HILLS.near)} fill="url(#hs-near)" />
      <g clipPath="url(#hs-clip-near)" fill="none" stroke={SAGE} strokeOpacity="0.16" strokeWidth="1.5">
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={HILLS.near} transform={`translate(0 ${12 + i * 14})`} />)}
      </g>

      <path d={close(HILLS.front)} fill={DARK} />
    </svg>
  );
}
