"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useBeagleShowsUiState } from "@/hooks/public/beagle/shows";
import { useI18n } from "@/hooks/i18n";
import type { MessageKey } from "@/lib/i18n";
import {
  formatIsoDateForDisplay,
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

function getFilterLabel(
  filters: {
    mode: "year" | "range";
    year: number | null;
    dateFrom: string | null;
    dateTo: string | null;
  },
  locale: "fi" | "sv",
  t: (key: MessageKey) => string,
): string {
  if (filters.mode === "range") {
    if (filters.dateFrom && filters.dateTo) {
      return `${t("shows.results.filter.range")} ${formatIsoDateForDisplay(filters.dateFrom, locale)} - ${formatIsoDateForDisplay(filters.dateTo, locale)}`;
    }
    return t("shows.results.filter.range");
  }

  if (filters.year == null) {
    return t("shows.results.filter.latestYear");
  }

  return `${t("shows.results.filter.year")} ${filters.year}`;
}

export function BeagleShowsPage() {
  const { t, locale } = useI18n();
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
      : t("shows.empty.error");

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
            alt={t("shows.page.logoAlt")}
            width={132}
            height={74}
            className={cn(
              "h-auto w-[110px] rounded-sm border p-1 md:w-[132px]",
              beagleTheme.border,
              beagleTheme.surface,
            )}
          />
          <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
            {t("shows.page.title")}
          </h1>
        </div>
        <p
          className={cn(
            "mt-3 max-w-3xl text-sm md:text-base",
            beagleTheme.mutedText,
          )}
        >
          {t("shows.page.description")}
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
        title={t("shows.results.title")}
        count={
          !hasError ? (
            <span>
              {t("shows.results.count")} {response.total} {" • "}{" "}
              {getFilterLabel(response.filters, locale, t)}
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
