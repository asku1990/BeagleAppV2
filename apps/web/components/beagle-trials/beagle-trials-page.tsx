"use client";

import { useMemo } from "react";
import { toast } from "@/components/ui/sonner";
import { FeatureHeroHeader } from "@/components/layout";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useBeagleTrialsUiState } from "@/hooks/public/beagle/trials";
import { useI18n } from "@/hooks/i18n";
import type { MessageKey } from "@/lib/i18n";
import {
  copyTrialSearchRowsToClipboard,
  formatIsoDateForDisplay,
  normalizeIsoDateOnlyInput,
  parseTrialYearInput,
  toBeagleTrialSearchRequest,
} from "@/lib/public/beagle/trials";
import { cn } from "@/lib/utils";
import { useBeagleTrialsQuery } from "@/queries/public/beagle/trials/use-beagle-trials-query";
import { BeagleTrialsEmptyState } from "./beagle-trials-empty-state";
import { BeagleTrialsForm } from "./beagle-trials-form";
import { BeagleTrialsLoadingState } from "./beagle-trials-loading-state";
import { BeagleTrialsPagination } from "./beagle-trials-pagination";
import { BeagleTrialsResultsDesktopTable } from "./beagle-trials-results-desktop-table";
import { BeagleTrialsResultsMobileCards } from "./beagle-trials-results-mobile-cards";

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
      return `${t("trials.results.filter.range")} ${formatIsoDateForDisplay(filters.dateFrom, locale)} - ${formatIsoDateForDisplay(filters.dateTo, locale)}`;
    }
    return t("trials.results.filter.range");
  }

  if (filters.year == null) {
    return t("trials.results.filter.latestYear");
  }

  return `${t("trials.results.filter.year")} ${filters.year}`;
}

export function BeagleTrialsPage() {
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
  } = useBeagleTrialsUiState();

  const request = useMemo(
    () => toBeagleTrialSearchRequest(urlState),
    [urlState],
  );
  const trialsQuery = useBeagleTrialsQuery(request);

  const response =
    trialsQuery.data ??
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
  const isLoading = isPending || (trialsQuery.isFetching && !trialsQuery.data);
  const hasError = trialsQuery.isError && !trialsQuery.data;
  const errorMessage =
    trialsQuery.error instanceof Error
      ? trialsQuery.error.message
      : t("trials.empty.error");

  const canSubmit =
    formState.mode === "year"
      ? formState.year.trim().length === 0 ||
        parseTrialYearInput(formState.year) != null
      : normalizeIsoDateOnlyInput(formState.dateFrom).length > 0 &&
        normalizeIsoDateOnlyInput(formState.dateTo).length > 0;

  const handleCopyResults = async () => {
    await copyTrialSearchRowsToClipboard({
      rows: response.items,
      labels: {
        date: t("trials.results.col.date"),
        place: t("trials.results.col.place"),
        judge: t("trials.results.col.judge"),
        dogCount: t("trials.results.col.dogCount"),
      },
      messages: {
        success: t("trials.results.copy.success"),
        error: t("trials.results.copy.error"),
        unsupported: t("trials.results.copy.unsupported"),
      },
      clipboard: globalThis.navigator?.clipboard,
      toast,
    });
  };

  return (
    <>
      <FeatureHeroHeader
        logoAlt={t("trials.page.logoAlt")}
        title={t("trials.page.title")}
        description={t("trials.page.description")}
      />

      <BeagleTrialsForm
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
        title={t("trials.results.title")}
        count={
          !hasError ? (
            <span className="flex flex-wrap items-center gap-2">
              <span>
                {t("trials.results.count")} {response.total} {" • "}{" "}
                {getFilterLabel(response.filters, locale, t)}
              </span>
              {hasItems ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyResults();
                  }}
                  className={cn("text-xs", beagleTheme.actionLink)}
                >
                  {t("trials.results.copy.button")}
                </button>
              ) : null}
            </span>
          ) : undefined
        }
      >
        {isLoading ? (
          <BeagleTrialsLoadingState />
        ) : hasError ? (
          <BeagleTrialsEmptyState variant="error" message={errorMessage} />
        ) : hasItems ? (
          <>
            <ListingResponsiveResults
              desktop={
                <BeagleTrialsResultsDesktopTable rows={response.items} />
              }
              mobile={<BeagleTrialsResultsMobileCards rows={response.items} />}
            />
            <BeagleTrialsPagination
              page={response.page}
              pageSize={urlState.pageSize}
              total={response.total}
              totalPages={Math.max(1, response.totalPages)}
              onPageSelect={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        ) : (
          <BeagleTrialsEmptyState variant="no-results" />
        )}
      </ListingSectionShell>
    </>
  );
}
