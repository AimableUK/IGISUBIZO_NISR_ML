"use client";
import { useState, type ReactNode } from "react";
import { cx } from "./cx";

/**
 * Small label that appears to the right of its child on hover, or on keyboard focus.
 * The child already carries an aria-label, so the tooltip is hidden from screen readers.
 */
export default function Tooltip({
  label,
  children,
  disabled = false,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [kbd, setKbd] = useState(false);
  const show = !disabled && (hover || kbd);

  return (
    <div
      className="relative flex"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => setKbd(e.target.matches(":focus-visible"))} // keyboard focus only, not after a mouse click
      onBlur={() => setKbd(false)}
    >
      {children}
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-bg shadow-lg",
          "transition-[opacity,transform] duration-150 motion-reduce:transition-none",
          show
            ? "translate-x-0 opacity-100 delay-100"
            : "-translate-x-1 opacity-0",
        )}
      >
        <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 rounded-[1px] bg-ink" />
        {label}
      </span>
    </div>
  );
}
