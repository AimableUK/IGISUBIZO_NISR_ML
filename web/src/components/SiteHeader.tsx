"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import Image from "next/image";

import AccessibilityMenu from "./AccessibilityMenu";
import LanguageSwitcher from "./marketing/LanguageSwitcher";
import { useSession } from "@/lib/auth-client";
import { useT } from "@/i18n";

export function Logo() {
  const h = useT().header;
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-display text-xl font-semibold"
      aria-label={h.homeLabel}
    >
      <Image src="/logo.png" alt={h.logoAlt} width={60} height={60} />
      Mboni
    </Link>
  );
}

// Same look for every row in the mobile menu: plain row, background on hover and press.
const MOBILE_ROW =
  "flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-left font-medium hover:bg-surface2 active:bg-tint active:text-on-tint";

export default function SiteHeader() {
  const h = useT().header;
  const { data: session, isPending } = useSession();

  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    if (open) {
      setHidden(false);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollY.current;

      // Always show the header at the top of the page.
      if (currentScrollY <= 8) {
        setHidden(false);
      } else if (difference < -1) {
        // Reveal the header as soon as the user scrolls upward.
        setHidden(false);
      } else if (difference > 3 && currentScrollY > 80) {
        // Hide the header when scrolling down.
        setHidden(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <div className="flex items-center gap-1">
          <AccessibilityMenu />

          {/* From md up everything sits in the bar. Below md it all lives in the menu. */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Wait for the session so the wrong buttons never flash. */}
          {!isPending &&
            (session ? (
              <Link
                href="/workspace"
                className="btn btn-primary hidden md:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                {h.goToWorkspace}
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn hidden md:inline-flex">
                  {h.signIn}
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary hidden md:inline-flex"
                >
                  {h.createAccount}
                </Link>
              </>
            ))}

          <button
            className="btn-icon md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? h.closeMenu : h.openMenu}
            onClick={() => setOpen((previous) => !previous)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={h.navMobile}
          className="border-t border-line bg-bg px-4 py-3 md:hidden"
        >
          <ul className="space-y-1">
            <li className="px-3 py-2">
              <LanguageSwitcher />
            </li>

            {!isPending &&
              (session ? (
                <li>
                  <Link
                    href="/workspace"
                    onClick={closeMenu}
                    className={MOBILE_ROW}
                  >
                    <LayoutDashboard className="h-4 w-4" aria-hidden />
                    {h.goToWorkspace}
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className={MOBILE_ROW}
                    >
                      {h.signIn}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      onClick={closeMenu}
                      className={MOBILE_ROW}
                    >
                      {h.createAccount}
                    </Link>
                  </li>
                </>
              ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
