"use client";

import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";
import type { BeagleDogProfileDto } from "@beagle/contracts";
import { DogProfileDetailsCard } from "./dog-profile-details-card";
import { DogProfileLittersCard } from "./dog-profile-litters-card";
import { DogProfileLineageCard } from "./dog-profile-lineage-card";
import { DogProfileShowsCard } from "./dog-profile-shows-card";
import { DogProfileSiblingsCard } from "./dog-profile-siblings-card";
import { DogProfileTitlesCard } from "./dog-profile-titles-card";
import { DogProfileTrialsCard } from "./dog-profile-trials-card";

type BeagleDogProfilePageProps = {
  profile: BeagleDogProfileDto;
};

export function BeagleDogProfilePage({ profile }: BeagleDogProfilePageProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
          {t("dog.profile.page.title")}
        </h1>
        <p className={cn("mt-2 text-sm md:text-base", beagleTheme.mutedText)}>
          {profile.name} - {profile.registrationNo}
        </p>
      </header>

      <DogProfileDetailsCard profile={profile} />
      {profile.titles.length > 0 ? (
        <DogProfileTitlesCard rows={profile.titles} />
      ) : null}
      <DogProfileLineageCard profile={profile} />
      {profile.siblings.length > 0 ? (
        <DogProfileSiblingsCard profile={profile} />
      ) : null}
      {profile.litters.length > 0 ? (
        <DogProfileLittersCard profile={profile} />
      ) : null}
      {profile.shows.length > 0 ? (
        <DogProfileShowsCard rows={profile.shows} />
      ) : null}
      {profile.trials.length > 0 ? (
        <DogProfileTrialsCard rows={profile.trials} />
      ) : null}
    </div>
  );
}
