"use client";
import Link from "next/link";
import Image from "next/image";
import { useT } from "@/i18n";

// "site" = marketing header, "app" = sidebar and app header (a bit smaller).
// Below the sm breakpoint (640px) both shrink so they fit small phones.
const SIZES = {
  site: {
    box: "h-10 w-10 sm:h-[50px] sm:w-[50px]",
    text: "text-lg sm:text-xl",
    gap: "gap-2 sm:gap-2.5",
  },
  app: { box: "h-8 w-8 sm:h-9 sm:w-9", text: "text-lg", gap: "gap-2" },
} as const;

type Props = {
  href?: string;
  size?: keyof typeof SIZES;
  onClick?: () => void;
};

export default function Logo({ href = "/", size = "site", onClick }: Props) {
  const h = useT().header;
  const s = SIZES[size];
  const inApp = size === "app";
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={inApp ? undefined : h.homeLabel}
      className={`flex items-center rounded-lg font-display font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${s.gap} ${s.text}`}
    >
      {/* In the app the visible "Mboni" text already names the link, so the image is decorative. */}
      <Image
        src="/logo.png"
        alt={inApp ? "" : h.logoAlt}
        width={100}
        height={100}
        className={`${s.box} shrink-0 object-contain`}
      />
      Mboni
    </Link>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={100}
      height={100}
      className={`h-8 w-8 shrink-0 object-contain ${className}`}
    />
  );
}
