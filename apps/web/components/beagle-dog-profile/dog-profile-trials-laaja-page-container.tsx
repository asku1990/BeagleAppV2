"use client";

import { beagleTheme } from "@/components/ui/beagle-theme";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBeagleDogTrialsQuery } from "@/queries/public/beagle/dogs/profile/use-beagle-dog-trials-query";
import { DogProfileNotFoundState } from "./dog-profile-not-found-state";
import { DogProfileTrialsLaajaPage } from "./dog-profile-trials-laaja-page";

type DogProfileTrialsLaajaPageContainerProps = {
  dogId: string;
};

export function DogProfileTrialsLaajaPageContainer({
  dogId,
}: DogProfileTrialsLaajaPageContainerProps) {
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useBeagleDogTrialsQuery(dogId);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
          <Skeleton className="mb-4 h-9 w-44" />
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-48" />
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

    if (errorStatus === 404) {
      return <DogProfileNotFoundState />;
    }

    return (
      <div className={cn(beagleTheme.panel, "p-12 text-center")}>
        <p className={cn(beagleTheme.inkText, "text-lg")}>
          {error instanceof Error
            ? error.message
            : "Failed to load dog trials."}
        </p>
      </div>
    );
  }

  if (!profile) {
    return <DogProfileNotFoundState />;
  }

  return <DogProfileTrialsLaajaPage profile={profile} />;
}
