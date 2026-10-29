import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n";
import Providers from "@/components/Providers";
import SiteHeader from "@/components/SiteHeader";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Public_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Isesengura - Rwanda Analytical Workspace", template: "%s · Isesengura" },
  description: "Ask a question about Rwanda's public data and get a saved, interactive analytical workspace - not a paragraph.",
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#111D15" }, { media: "(prefers-color-scheme: light)", color: "#F6FAF7" }] };

// Applies saved theme before first paint to avoid a flash. Static string, no user input.
const THEME_INIT = `(function(){try{var p=(JSON.parse(localStorage.getItem('raw-prefs')||'{}').state)||{};var t=p.theme||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.classList.toggle('hc',!!p.contrast);e.classList.toggle('reduce-motion',p.motion==='reduce');e.style.setProperty('--text-scale',String(p.textScale||1))}catch(_){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_INIT }} /></head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">Skip to main content</a>
        <Providers>
          <LocaleProvider>
            <SiteHeader />
            <main id="main" tabIndex={-1} className="outline-none">{children}</main>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
