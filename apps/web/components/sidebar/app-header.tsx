"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const localeButtons = [
  { locale: "fi", flag: "🇫🇮", labelKey: "header.language.finnish" },
  { locale: "sv", flag: "🇸🇪", labelKey: "header.language.swedish" },
] as const;

export function AppHeader() {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const showBackHome = pathname !== "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b backdrop-blur",
        beagleTheme.border,
        beagleTheme.sidebarSurface,
      )}
    >
      <div className="flex h-12 w-full items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <SidebarTrigger
            className={cn(beagleTheme.inkStrongText, beagleTheme.focusRing)}
          />
          {showBackHome ? (
            <Button
              asChild
              type="button"
              variant="ghost"
              size="sm"
              className={cn(beagleTheme.inkStrongText, beagleTheme.focusRing)}
            >
              <Link href="/">
                <ChevronLeft className="size-4" />
                <span>{t("header.backHome")}</span>
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button
            asChild
            type="button"
            variant="ghost"
            size="sm"
            className={cn(beagleTheme.inkStrongText, beagleTheme.focusRing)}
          >
            <Link href="/whats-new" aria-label={t("header.whatsNewAria")}>
              <Info className="size-4" />
              <span>{t("header.whatsNew")}</span>
            </Link>
          </Button>
          {localeButtons.map((option) => (
            <Button
              key={option.locale}
              type="button"
              variant="ghost"
              size="icon-xs"
              className={
                locale === option.locale
                  ? cn(
                      "h-11 w-11 text-base border ring-2 ring-[var(--beagle-focus)] md:h-8 md:w-8",
                      beagleTheme.border,
                      beagleTheme.softAccent,
                      beagleTheme.focusRing,
                    )
                  : cn(
                      "h-11 w-11 text-base border border-transparent md:h-8 md:w-8",
                      beagleTheme.interactive,
                      beagleTheme.focusRing,
                    )
              }
              aria-label={t(option.labelKey)}
              aria-pressed={locale === option.locale}
              title={t(option.labelKey)}
              onClick={() => setLocale(option.locale)}
            >
              <span aria-hidden="true">{option.flag}</span>
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}
