"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

type FeatureHeroHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  logoAlt: string;
};

export function FeatureHeroHeader({
  title,
  description,
  logoAlt,
}: FeatureHeroHeaderProps) {
  return (
    <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Image
          src="/legacy-v1-assets/v1-root-belogo.png"
          alt={logoAlt}
          width={132}
          height={74}
          className={cn(
            "h-auto w-[96px] rounded-sm border p-1 sm:w-[110px] md:w-[132px]",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        />
        <h1
          className={cn(
            "min-w-0 text-2xl font-medium leading-tight tracking-tight md:text-4xl md:font-semibold",
            beagleTheme.inkStrongText,
          )}
        >
          {title}
        </h1>
      </div>
      {description ? (
        <p
          className={cn(
            "mt-3 max-w-3xl text-sm md:text-base",
            beagleTheme.mutedText,
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
