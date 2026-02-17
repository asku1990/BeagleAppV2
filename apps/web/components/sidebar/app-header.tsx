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
      <div className="flex h-12 w-full items-center justify-between gap-2 px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <SidebarTrigger
            className={cn(beagleTheme.inkStrongText, beagleTheme.focusRing)}
          />
          {showBackHome ? (
            <Button
              asChild
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "shrink-0",
                beagleTheme.inkStrongText,
                beagleTheme.focusRing,
              )}
            >
              <Link
                href="/"
                aria-label={t("header.backHome")}
                title={t("header.backHome")}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">{t("header.backHome")}</span>
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            asChild
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(beagleTheme.inkStrongText, beagleTheme.focusRing)}
          >
            <Link
              href="/whats-new"
              aria-label={t("header.whatsNewAria")}
              title={t("header.whatsNew")}
            >
              <Info className="size-4" />
              <span className="sr-only">{t("header.whatsNew")}</span>
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
                      "h-9 w-9 text-base border ring-2 ring-[var(--beagle-focus)]",
                      beagleTheme.border,
                      beagleTheme.softAccent,
                      beagleTheme.focusRing,
                    )
                  : cn(
                      "h-9 w-9 text-base border border-transparent",
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
