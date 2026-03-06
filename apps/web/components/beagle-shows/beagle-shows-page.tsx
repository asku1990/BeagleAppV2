"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useBeagleShowsUiState } from "@/hooks/public/beagle/shows";
import {
  normalizeIsoDateOnlyInput,
  toBeagleShowSearchRequest,
} from "@/lib/public/beagle/shows";
import { cn } from "@/lib/utils";
import { useBeagleShowsQuery } from "@/queries/public/beagle/shows/use-beagle-shows-query";
import { BeagleShowsEmptyState } from "./beagle-shows-empty-state";
import { BeagleShowsForm } from "./beagle-shows-form";
import { BeagleShowsLoadingState } from "./beagle-shows-loading-state";
import { BeagleShowsPagination } from "./beagle-shows-pagination";
import { BeagleShowsResultsDesktopTable } from "./beagle-shows-results-desktop-table";
import { BeagleShowsResultsMobileCards } from "./beagle-shows-results-mobile-cards";

function getFilterLabel(filters: {
  mode: "year" | "range";
  year: number | null;
  dateFrom: string | null;
  dateTo: string | null;
}): string {
  if (filters.mode === "range") {
    if (filters.dateFrom && filters.dateTo) {
      return `Aikaväli ${filters.dateFrom} - ${filters.dateTo}`;
    }
    return "Aikaväli";
  }

  if (filters.year == null) {
    return "Vuosi: uusin saatavilla";
  }

  return `Vuosi ${filters.year}`;
}

export function BeagleShowsPage() {
  const {
    formState,
    urlState,
    isPending,
    setMode,
    setYear,
    setDateFrom,
    setDateTo,
    submitSearch,
    resetSearch,
    setPage,
    setPageSize,
    setSort,
  } = useBeagleShowsUiState();

  const request = useMemo(
    () => toBeagleShowSearchRequest(urlState),
    [urlState],
  );
  const showsQuery = useBeagleShowsQuery(request);

  const response =
    showsQuery.data ??
    ({
      filters: {
        mode: "year",
        year: null,
        dateFrom: null,
        dateTo: null,
      },
      availableYears: [],
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    } as const);

  const hasItems = response.items.length > 0;
  const isLoading = isPending || (showsQuery.isFetching && !showsQuery.data);
  const hasError = showsQuery.isError && !showsQuery.data;
  const errorMessage =
    showsQuery.error instanceof Error
      ? showsQuery.error.message
      : "Näyttelyiden haku epäonnistui.";

  const canSubmit =
    formState.mode === "year"
      ? true
      : normalizeIsoDateOnlyInput(formState.dateFrom).length > 0 &&
        normalizeIsoDateOnlyInput(formState.dateTo).length > 0;

  return (
    <>
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <div className="flex items-center gap-3 md:gap-4">
          <Image
            src="/legacy-v1-assets/v1-root-belogo.png"
            alt="Suomen Beaglejärjestön logo"
            width={132}
            height={74}
            className={cn(
              "h-auto w-[110px] rounded-sm border p-1 md:w-[132px]",
              beagleTheme.border,
              beagleTheme.surface,
            )}
          />
          <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
            Näyttelyhaku
          </h1>
        </div>
        <p
          className={cn(
            "mt-3 max-w-3xl text-sm md:text-base",
            beagleTheme.mutedText,
          )}
        >
          Hae beagle-näyttelyitä vuosittain tai valitulla aikavälillä. Avaa
          näyttely nähdäksesi koirien tulokset.
        </p>
      </header>

      <BeagleShowsForm
        values={formState}
        sort={urlState.sort}
        isPending={isPending}
        canSubmit={canSubmit}
        availableYears={response.availableYears}
        onModeChange={setMode}
        onYearChange={setYear}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onSortChange={setSort}
        onSubmit={submitSearch}
        onReset={resetSearch}
      />

      <ListingSectionShell
        title="Näyttelyt"
        count={
          !hasError ? (
            <span className="flex flex-wrap items-center gap-2">
              <span>Näyttelyitä {response.total}</span>
              <span>• {getFilterLabel(response.filters)}</span>
            </span>
          ) : undefined
        }
      >
        {isLoading ? (
          <BeagleShowsLoadingState />
        ) : hasError ? (
          <BeagleShowsEmptyState variant="error" message={errorMessage} />
        ) : hasItems ? (
          <>
            <ListingResponsiveResults
              desktop={<BeagleShowsResultsDesktopTable rows={response.items} />}
              mobile={<BeagleShowsResultsMobileCards rows={response.items} />}
            />
            <BeagleShowsPagination
              page={response.page}
              pageSize={urlState.pageSize}
              total={response.total}
              totalPages={Math.max(1, response.totalPages)}
              onPageSelect={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        ) : (
          <BeagleShowsEmptyState variant="no-results" />
        )}
      </ListingSectionShell>
    </>
  );
}
