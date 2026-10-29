"use client";
import Link from "next/link";
import { BarChart3, Menu, Plus } from "lucide-react";
import { useI18n } from "@/i18n";
import LanguageSwitch from "./LanguageSwitch";

const ICON_BTN = "inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-surface2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

type Props = {
  isMobile: boolean;
  /** Show the brand here when the sidebar is not showing it. */
  showBrand: boolean;
  onOpenMenu: () => void;
};

export default function Header({ isMobile, showBrand, onOpenMenu }: Props) {
  const { t } = useI18n();
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-3 sm:px-4">
      {isMobile && (
        <button type="button" className={ICON_BTN} onClick={onOpenMenu} aria-label={t("nav.openMenu")}>
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      )}
      {showBrand && (
        <Link href="/workspace" className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-lg bg-tint text-on-tint"><BarChart3 className="h-4 w-4" /></span>
          <span className="text-lg font-semibold tracking-tight">{t("brand")}</span>
        </Link>
      )}
      <div className="ml-auto flex items-center gap-1">
        <LanguageSwitch />
        {isMobile && (
          <Link href="/workspace" className={ICON_BTN} aria-label={t("nav.new")} title={t("nav.new")}>
            <Plus className="h-5 w-5" aria-hidden />
          </Link>
        )}
      </div>
    </header>
  );
}
