"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useI18n } from "@/lib/i18n";

const localeButtons = [
  { locale: "fi", flag: "🇫🇮", labelKey: "header.language.finnish" },
  { locale: "sv", flag: "🇸🇪", labelKey: "header.language.swedish" },
] as const;

export function AppHeader() {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--beagle-border)] bg-white/95 backdrop-blur">
      <div className="flex h-12 w-full items-center justify-between gap-3 px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <SidebarTrigger className="text-[var(--beagle-ink)]" />
        </div>
        <div className="flex items-center gap-1">
          {localeButtons.map((option) => (
            <Button
              key={option.locale}
              type="button"
              variant="ghost"
              size="icon-xs"
              className={
                locale === option.locale
                  ? "text-base border border-[var(--beagle-border)] bg-[var(--beagle-accent-soft)] ring-2 ring-[var(--beagle-border)]"
                  : "text-base border border-transparent"
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
