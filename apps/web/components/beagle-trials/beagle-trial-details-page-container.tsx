"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";
import { useBeagleTrialDetailsQuery } from "@/queries/public/beagle/trials";
import { BeagleTrialDetailsPage } from "./beagle-trial-details-page";
import { BeagleTrialDetailsState } from "./beagle-trial-details-state";

type BeagleTrialDetailsPageContainerProps = {
  trialId: string;
};

export function BeagleTrialDetailsPageContainer({
  trialId,
}: BeagleTrialDetailsPageContainerProps) {
  const { t } = useI18n();
  const normalizedTrialId = trialId.trim();
  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useBeagleTrialDetailsQuery(normalizedTrialId);

  if (!normalizedTrialId) {
    return <BeagleTrialDetailsState variant="invalid" />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
          <Skeleton className="mb-4 h-9 w-40" />
          <Skeleton className="mb-2 h-6 w-72" />
          <Skeleton className="mb-2 h-4 w-56" />
          <Skeleton className="h-4 w-40" />
        </header>
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  if (isError) {
    const errorStatus =
      typeof error === "object" &&
      error &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : undefined;

    if (errorStatus === 400) {
      return <BeagleTrialDetailsState variant="invalid" />;
    }
    if (errorStatus === 404) {
      return <BeagleTrialDetailsState variant="not-found" />;
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : t("trials.details.error.loadFailed");

    return (
      <div className={cn(beagleTheme.panel, "p-12 text-center")}>
        <p className={cn(beagleTheme.inkText, "text-lg")}>{errorMessage}</p>
      </div>
    );
  }

  if (!details) {
    return <BeagleTrialDetailsState variant="not-found" />;
  }

  return <BeagleTrialDetailsPage details={details} />;
}
