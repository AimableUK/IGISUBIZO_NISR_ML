"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { History, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import AccessibilityMenu from "./AccessibilityMenu";
import { signOut, useSession } from "@/lib/auth-client";
import LanguageSwitcher from "./marketing/LanguageSwitcher";
import { useT } from "@/i18n";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-semibold" aria-label="Mboni home">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden><rect width="32" height="32" rx="7" fill="#253D2C" /><rect x="6" y="6" width="9" height="9" rx="2" fill="#68BA7F" /><rect x="17" y="6" width="9" height="9" rx="2" fill="#CFFFDC" /><rect x="6" y="17" width="9" height="9" rx="2" fill="#2E6F40" /><rect x="17" y="17" width="9" height="9" rx="2" fill="#68BA7F" /></svg>
      Mboni
    </Link>
  );
}

export default function SiteHeader() {
  const t = useT();
  const { data: session } = useSession();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const links = session
    ? [{ href: "/workspace", label: "New analysis", Icon: LayoutDashboard }, { href: "/history", label: "History", Icon: History }, { href: "/settings", label: "Settings", Icon: Settings }]
    : [{ href: "/about", label: "About" }, { href: "/methodology", label: "Methodology" }, { href: "/contact", label: "Contact" }];
  const cur = (h: string) => (path === h || (h !== "/" && path.startsWith(h + "/")) ? "page" : undefined);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={cur(l.href)} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-surface2 aria-[current=page]:bg-tint aria-[current=page]:text-on-tint">
              {"Icon" in l && l.Icon && <l.Icon className="h-4 w-4" aria-hidden />}{l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <AccessibilityMenu />
          <LanguageSwitcher />
          {session ? (
            <button className="btn hidden md:inline-flex" onClick={async () => { await signOut(); router.push("/"); }}><LogOut className="h-4 w-4" aria-hidden />Sign out</button>
          ) : (
            <>
              <Link href="/login" className="btn hidden sm:inline-flex">Sign in</Link>
              <Link href="/signup" className="btn btn-primary hidden sm:inline-flex">Create account</Link>
            </>
          )}
          <button className="btn-icon md:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>{open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}</button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-bg px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {links.map((l) => <li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} aria-current={cur(l.href)} className="flex min-h-[44px] items-center rounded-lg px-3 font-medium hover:bg-surface2 aria-[current=page]:bg-tint aria-[current=page]:text-on-tint">{l.label}</Link></li>)}
            {session ? <li><button className="flex min-h-[44px] w-full items-center rounded-lg px-3 font-medium hover:bg-surface2" onClick={async () => { await signOut(); setOpen(false); router.push("/"); }}>Sign out</button></li>
              : <><li><Link href="/login" onClick={() => setOpen(false)} className="flex min-h-[44px] items-center rounded-lg px-3 font-medium">Sign in</Link></li><li><Link href="/signup" onClick={() => setOpen(false)} className="flex min-h-[44px] items-center rounded-lg px-3 font-medium">Create account</Link></li></>}
          </ul>
        </nav>
      )}
    </header>
  );
}
