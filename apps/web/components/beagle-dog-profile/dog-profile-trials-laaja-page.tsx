"use client";

import { useI18n } from "@/hooks/i18n";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  copyDogProfileTrialRowsToClipboard,
  getTrialPdfPageHref,
} from "@/lib/public/beagle/trials";
import type { BeagleDogTrialsDto } from "@beagle/contracts";
import { DogProfileTrialsLaajaTable } from "./dog-profile-trials-laaja-table";

export function DogProfileTrialsLaajaPage({
  profile,
}: {
  profile: BeagleDogTrialsDto;
}) {
  const { t } = useI18n();
  const supportedTrialEntryIds = profile.trials
    .filter((trial) => trial.hasDogTrialPdf)
    .map((trial) => trial.trialEntryId);
  const handleCopyRows = async () => {
    await copyDogProfileTrialRowsToClipboard({
      rows: profile.trials,
      labels: {
        no: t("dog.profile.trials.col.no"),
        place: t("dog.profile.trials.col.place"),
        date: t("dog.profile.trials.col.date"),
        weather: t("dog.profile.trials.col.weather"),
        award: t("dog.profile.trials.col.class"),
        rank: t("dog.profile.trials.col.rank"),
        points: t("dog.profile.trials.col.points"),
        searchWork: t("trials.details.copy.col.searchWork"),
        barking: t("trials.details.copy.col.barking"),
        generalImpression: t("trials.details.copy.col.ajotaito"),
        searchLoosenessPenalty: t(
          "trials.details.copy.col.searchLoosenessPenalty",
        ),
        chaseLoosenessPenalty: t(
          "trials.details.copy.col.chaseLoosenessPenalty",
        ),
        judge: t("trials.details.col.judge"),
        obstacleWork: t("trials.details.copy.col.obstacleWork"),
        totalPoints: t("trials.details.copy.col.mi"),
      },
      columns: {
        includeWeather: true,
        includeAward: true,
        includeRank: true,
        includePoints: true,
        includeJudge: true,
        includeSearchWork: true,
        includeBarking: true,
        includeGeneralImpression: true,
        includeSearchLoosenessPenalty: true,
        includeChaseLoosenessPenalty: true,
        includeObstacleWork: true,
        includeTotalPoints: true,
      },
      messages: {
        success: t("dog.profile.trials.copy.success"),
        error: t("dog.profile.trials.copy.error"),
        unsupported: t("dog.profile.trials.copy.unsupported"),
      },
      clipboard: globalThis.navigator?.clipboard,
      toast,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <div>
          <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
            {t("dog.profile.trials.laaja.title")}
          </h1>
          <p className={cn("mt-2 text-sm md:text-base", beagleTheme.mutedText)}>
            {profile.name} - {profile.registrationNo}
          </p>
        </div>
      </header>

      <ListingSectionShell
        title={t("dog.profile.trials.laaja.section.title")}
        count={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {t("dog.profile.count.entries")}: {profile.trials.length}
            </span>
            {profile.trials.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyRows();
                  }}
                  className={cn("text-xs", beagleTheme.actionLink)}
                >
                  {t("dog.profile.trials.copy.button")}
                </button>
                {supportedTrialEntryIds.length > 0 ? (
                  <Button asChild variant="outline" size="xs">
                    <Link
                      href={getTrialPdfPageHref(supportedTrialEntryIds)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("dog.profile.trials.openPdfStack")}
                    </Link>
                  </Button>
                ) : null}
              </>
            ) : null}
          </span>
        }
      >
        {profile.trials.length === 0 ? (
          <div
            className={cn(
              "rounded-lg border px-4 py-8 text-center text-sm",
              beagleTheme.border,
              beagleTheme.mutedText,
            )}
          >
            {t("dog.profile.empty.trials")}
          </div>
        ) : (
          <DogProfileTrialsLaajaTable rows={profile.trials} />
        )}
      </ListingSectionShell>
    </div>
  );
}
