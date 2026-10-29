"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useI18n } from "@/i18n";
import Avatar from "./Avatar";
import Tooltip from "./Tooltip";
import { cx } from "./cx";

const ITEM = "flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-surface2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

export default function UserMenu({ expanded, onNavigate }: { expanded: boolean; onNavigate: () => void }) {
  const { data } = useSession();
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    first.current?.focus();
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  if (!data) return null;
  const { name, email, image } = data.user;

  return (
    <div ref={root} className="relative">
      <Tooltip label={name} disabled={expanded || open}>
        <button
          ref={trigger}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={expanded ? undefined : `${t("user.menu")}: ${name}`}
          onClick={() => setOpen((o) => !o)}
          className={cx(
            "flex w-full cursor-pointer items-center rounded-lg text-left hover:bg-surface2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
            expanded ? "gap-3 px-2 py-2" : "justify-center py-2",
          )}
        >
          <Avatar name={name} image={image} />
          {expanded && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{name}</span>
                <span className="block truncate text-xs text-muted">{email}</span>
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            </>
          )}
        </button>
      </Tooltip>

      {open && (
        <div
          id={panelId}
          data-no-expand
          className={cx(
            "absolute z-50 w-64 cursor-default rounded-card border border-line bg-surface p-1.5 shadow-lg",
            expanded ? "bottom-full left-0 mb-2" : "bottom-0 left-full ml-2",
          )}
        >
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={name} image={image} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>
          <div className="my-1 border-t border-line" />
          <Link ref={first} href="/settings" className={ITEM} onClick={() => { setOpen(false); onNavigate(); }}>
            <Settings className="h-4 w-4" aria-hidden />{t("user.settings")}
          </Link>
          <button
            type="button"
            className={ITEM}
            onClick={async () => { setOpen(false); await signOut(); router.push("/"); }}
          >
            <LogOut className="h-4 w-4" aria-hidden />{t("user.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
