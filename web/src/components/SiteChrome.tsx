"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { useI18n } from "@/i18n";

// Routes that render inside the app shell (own sidebar, header and <main>).
const APP_PREFIXES = ["/workspace", "/history", "/settings", "/playground"];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const inApp = APP_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (inApp) return <>{children}</>;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        {t("shell.skip")}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </>
  );
}
