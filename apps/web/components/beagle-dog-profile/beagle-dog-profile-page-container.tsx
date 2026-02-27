"use client";

import { useBeagleDogProfileQuery } from "@/queries/public/beagle/dogs";
import { BeagleDogProfilePage } from "./beagle-dog-profile-page";
import { DogProfileNotFoundState } from "./dog-profile-not-found-state";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type BeagleDogProfilePageContainerProps = {
  dogId: string;
};

export function BeagleDogProfilePageContainer({
  dogId,
}: BeagleDogProfilePageContainerProps) {
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useBeagleDogProfileQuery(dogId);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
          <Skeleton className="mb-4 h-9 w-32" />
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </header>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
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
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load dog profile.";
    if (errorStatus === 404) {
      return <DogProfileNotFoundState />;
    }

    return (
      <div className={cn(beagleTheme.panel, "p-12 text-center")}>
        <p className={cn(beagleTheme.inkText, "text-lg")}>{errorMessage}</p>
      </div>
    );
  }

  if (!profile) {
    return <DogProfileNotFoundState />;
  }

  return <BeagleDogProfilePage profile={profile} />;
}
