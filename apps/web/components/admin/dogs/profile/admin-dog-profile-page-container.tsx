"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import { useAdminDogProfileQuery } from "@/queries/admin/dogs";
import { AdminDogProfilePage } from "./admin-dog-profile-page";

function AdminDogProfileErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className={cn(beagleTheme.panel, "space-y-3 p-8 text-center")}>
      <h1 className={cn("text-lg font-semibold", beagleTheme.inkStrongText)}>
        {title}
      </h1>
      <p className={beagleTheme.mutedText}>{message}</p>
      <Link href="/admin/dogs" className={beagleTheme.textLink}>
        Takaisin koiralistaan
      </Link>
    </div>
  );
}

export function AdminDogProfilePageContainer({ dogId }: { dogId: string }) {
  const { data, isLoading, isError, error } = useAdminDogProfileQuery({
    dogId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            beagleTheme.panel,
            "space-y-3 px-5 py-5 md:px-6 md:py-6",
          )}
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-[280px] w-full" />
        <Skeleton className="h-[160px] w-full" />
        <Skeleton className="h-[220px] w-full" />
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
      error instanceof Error
        ? error.message
        : "Failed to load admin dog profile.";

    if (errorStatus === 404) {
      return (
        <AdminDogProfileErrorState
          title="Koiraa ei löytynyt"
          message={errorMessage}
        />
      );
    }

    if (errorStatus === 401) {
      return (
        <AdminDogProfileErrorState
          title="Kirjaudu sisään"
          message="Tämä näkymä vaatii kirjautumisen."
        />
      );
    }

    if (errorStatus === 403) {
      return (
        <AdminDogProfileErrorState
          title="Ei käyttöoikeutta"
          message="Tämä näkymä vaatii ylläpitäjän oikeudet."
        />
      );
    }

    return <AdminDogProfileErrorState title="Virhe" message={errorMessage} />;
  }

  if (!data) {
    return (
      <AdminDogProfileErrorState
        title="Koiraa ei löytynyt"
        message="Profiilitietoja ei voitu ladata."
      />
    );
  }

  return <AdminDogProfilePage dog={data.dog} />;
}
