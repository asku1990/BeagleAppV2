"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import { useBeagleShowDetailsQuery } from "@/queries/public/beagle/shows";
import { BeagleShowDetailsPage } from "./beagle-show-details-page";
import { BeagleShowDetailsState } from "./beagle-show-details-state";

type BeagleShowDetailsPageContainerProps = {
  showId: string;
};

export function BeagleShowDetailsPageContainer({
  showId,
}: BeagleShowDetailsPageContainerProps) {
  const normalizedShowId = showId.trim();
  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useBeagleShowDetailsQuery(normalizedShowId);

  if (!normalizedShowId) {
    return <BeagleShowDetailsState variant="invalid" />;
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
      return <BeagleShowDetailsState variant="invalid" />;
    }
    if (errorStatus === 404) {
      return <BeagleShowDetailsState variant="not-found" />;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Näyttelyn lataus epäonnistui.";

    return (
      <div className={cn(beagleTheme.panel, "p-12 text-center")}>
        <p className={cn(beagleTheme.inkText, "text-lg")}>{errorMessage}</p>
      </div>
    );
  }

  if (!details) {
    return <BeagleShowDetailsState variant="not-found" />;
  }

  return <BeagleShowDetailsPage details={details} />;
}
