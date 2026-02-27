"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";
import type { BeagleDogProfileDto } from "@beagle/contracts";
import { DogProfileDetailsCard } from "./dog-profile-details-card";
import { DogProfileLineageCard } from "./dog-profile-lineage-card";
import { DogProfileShowsCard } from "./dog-profile-shows-card";
import { DogProfileTrialsCard } from "./dog-profile-trials-card";

type BeagleDogProfilePageProps = {
  profile: BeagleDogProfileDto;
};

export function BeagleDogProfilePage({ profile }: BeagleDogProfilePageProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <Button asChild variant="ghost" size="sm" className="h-9 px-3">
          <Link href="/beagle/search">
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            {t("dog.profile.page.backToSearch")}
          </Link>
        </Button>
        <h1
          className={cn(
            "mt-3",
            beagleTheme.headingLg,
            beagleTheme.inkStrongText,
          )}
        >
          {t("dog.profile.page.title")}
        </h1>
        <p className={cn("mt-2 text-sm md:text-base", beagleTheme.mutedText)}>
          {profile.name} - {profile.registrationNo}
        </p>
      </header>

      <DogProfileDetailsCard profile={profile} />
      <DogProfileLineageCard profile={profile} />
      <DogProfileShowsCard rows={profile.shows} />
      <DogProfileTrialsCard rows={profile.trials} />
    </div>
  );
}
