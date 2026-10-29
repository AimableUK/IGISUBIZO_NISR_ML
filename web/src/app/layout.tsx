import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n";
import Providers from "@/components/Providers";
import SiteChrome from "@/components/SiteChrome";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Public_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Mboni - Rwanda Analytical Workspace", template: "%s · Mboni" },
  description: "Ask a question about Rwanda's public data and get a saved, interactive analytical workspace - not a paragraph.",
  icons: { icon: "/favicon.ico" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#111D15" }, { media: "(prefers-color-scheme: light)", color: "#F6FAF7" }] };

// Applies saved theme before first paint to avoid a flash. Static string, no user input.
const THEME_INIT = `(function(){try{var p=(JSON.parse(localStorage.getItem('raw-prefs')||'{}').state)||{};var t=p.theme||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.classList.toggle('hc',!!p.contrast);e.classList.toggle('reduce-motion',p.motion==='reduce');e.style.setProperty('--text-scale',String(p.textScale||1))}catch(_){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_INIT }} /></head>
      <body>
        <Providers>
          <LocaleProvider>
            <SiteChrome>{children}</SiteChrome>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}