"use client";
import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useBreakpoint } from "./useBreakpoint";
import { cx } from "./cx";

const PREF = "mboni:sidebar";
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
const readPref = () => { try { return localStorage.getItem(PREF); } catch { return null; } };
const writePref = (v: string) => { try { localStorage.setItem(PREF, v); } catch { /* ignore */ } };

/**
 * Responsive behaviour
 *  - desktop (>= 1024px): sidebar is part of the layout; open by default, remembers your choice on this device.
 *  - tablet (768-1023px): collapses to an icon rail on its own; expanding opens it over the page.
 *  - mobile (< 768px): hidden; the menu button opens it as a drawer that closes after you pick something.
 * Crossing a breakpoint (resize, rotate, new device) resets to that size's default.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const bp = useBreakpoint();
  const [collapsed, setCollapsed] = useState(true); // desktop + tablet
  const [open, setOpen] = useState(false); // mobile drawer

  useIso(() => {
    if (!bp) return;
    setOpen(false);
    setCollapsed(bp === "desktop" ? readPref() === "collapsed" : true);
  }, [bp]);

  // Leaving the page you were on closes any overlay.
  useEffect(() => {
    setOpen(false);
    setCollapsed((c) => (bp === "tablet" ? true : c));
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isMobile = bp === "mobile";
  const isOverlay = bp !== "desktop";
  const expanded = isMobile ? open : !collapsed;
  const showBackdrop = bp !== null && isOverlay && expanded;

  const toggle = useCallback(() => {
    if (isMobile) return setOpen((o) => !o);
    const next = !collapsed;
    setCollapsed(next);
    if (bp === "desktop") writePref(next ? "collapsed" : "expanded");
  }, [isMobile, collapsed, bp]);

  const dismiss = useCallback(() => {
    if (isMobile) setOpen(false);
    else if (bp === "tablet") setCollapsed(true);
  }, [isMobile, bp]);

  useEffect(() => {
    if (!showBackdrop) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [showBackdrop, dismiss]);

  const railWidth = "w-14";
  const fullWidth = "w-72";

  return (
    <div className="flex h-dvh overflow-hidden text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lg">
        {t("shell.skip")}
      </a>

      {/* Space the sidebar takes in the layout. Overlays (tablet / mobile) float above it instead. */}
      <div className={cx("relative shrink-0 transition-[width] duration-200 motion-reduce:transition-none", bp === "desktop" ? (expanded ? fullWidth : railWidth) : bp === "tablet" ? railWidth : "w-0")}>
        <aside
          aria-label={t("nav.main")}
          className={cx(
            "fixed inset-y-0 left-0 z-40 border-r border-line bg-surface",
            "transition-[width,transform,visibility] duration-200 motion-reduce:transition-none",
            isMobile ? "w-[min(20rem,85vw)]" : expanded ? fullWidth : railWidth,
            (bp === null || (isMobile && !open)) && "invisible -translate-x-full",
            showBackdrop && "shadow-2xl",
          )}
        >
          <Sidebar expanded={expanded} isDrawer={isMobile} onToggle={toggle} onNavigate={dismiss} />
        </aside>
      </div>

      {showBackdrop && <div aria-hidden onClick={dismiss} className="fixed inset-0 z-30 bg-black/40" />}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header isMobile={isMobile} showBrand={bp !== "desktop" || !expanded} onOpenMenu={toggle} />
        <main id="main" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto focus:outline-none">{children}</main>
      </div>
    </div>
  );
}
