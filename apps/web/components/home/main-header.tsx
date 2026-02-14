"use client";

import Image from "next/image";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function MainHeader() {
  const { t } = useI18n();

  return (
    <header
      className={cn(beagleTheme.panel, "beagle-hero px-5 py-5 md:px-6 md:py-6")}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <Image
          src="/beagle-legacy-logo.png"
          alt={t("home.hero.logoAlt")}
          width={132}
          height={74}
          className={cn(
            "h-auto w-[110px] rounded-sm border p-1 md:w-[132px]",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        />
        <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
          {t("home.hero.title")}
        </h1>
      </div>
      <p
        className={cn(
          "mt-3 max-w-2xl text-sm leading-6 md:text-base",
          beagleTheme.mutedText,
        )}
      >
        {t("home.hero.description")}
      </p>
    </header>
  );
}
