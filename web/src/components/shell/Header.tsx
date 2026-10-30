"use client";
import { Menu } from "lucide-react";
import { useI18n } from "@/i18n";
import LanguageSwitch from "./LanguageSwitch";
import AccessibilityMenu from "../AccessibilityMenu";

const ICON_BTN =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-surface2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

type Props = {
  isMobile: boolean;
  onOpenMenu: () => void;
};

export default function Header({ isMobile, onOpenMenu }: Props) {
  const { t } = useI18n();
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-3 sm:px-4">
      {isMobile && (
        <button
          type="button"
          className={ICON_BTN}
          onClick={onOpenMenu}
          aria-label={t("nav.openMenu")}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      )}
      <div className="ml-auto flex items-center gap-1">
        <AccessibilityMenu />
        <LanguageSwitch />
      </div>
    </header>
  );
}
