"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { FeatureHeroHeader } from "@/components/layout";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  formatBeagleRowsForClipboard,
  normalizeBirthYearInput,
  resolvePrimarySearchMode,
} from "@/lib/public/beagle/search";
import { useBeagleSearchUiState } from "@/hooks/public/beagle/search";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";
import { useBeagleNewestQuery } from "@/queries/public/beagle/search/use-beagle-newest-query";
import { useBeagleSearchQuery } from "@/queries/public/beagle/search/use-beagle-search-query";
import { BeagleSearchEmptyState } from "./beagle-search-empty-state";
import { BeagleSearchForm } from "./beagle-search-form";
import { BeagleSearchResultsDesktopTable } from "./beagle-search-results-desktop-table";
import { BeagleSearchLoadingState } from "./beagle-search-loading-state";
import { BeagleSearchResultsMobileCards } from "./beagle-search-results-mobile-cards";
import { BeagleSearchPagination } from "./beagle-search-pagination";

export function BeagleSearchPage() {
  const { t } = useI18n();
  const {
    formState,
    urlState,
    isPending,
    setFormField,
    submitSearch,
    resetSearch,
    setPage,
    setPageSize,
    setSort,
    setSex,
    setBirthYearFrom,
    setBirthYearTo,
    setEkOnly,
    setMultipleRegsOnly,
    toggleAdvanced,
  } = useBeagleSearchUiState();

  const localMode = resolvePrimarySearchMode(formState);
  const hasAdvancedFilters =
    formState.multipleRegsOnly ||
    formState.ekOnly ||
    formState.sex !== "any" ||
    normalizeBirthYearInput(formState.birthYearFrom).length > 0 ||
    normalizeBirthYearInput(formState.birthYearTo).length > 0;
  const effectiveFormMode =
    localMode === "none" && hasAdvancedFilters ? "combined" : localMode;
  const canSubmit = localMode !== "none" || hasAdvancedFilters;
  const hasCommittedSearch =
    urlState.ek.trim().length > 0 ||
    urlState.reg.trim().length > 0 ||
    urlState.name.trim().length > 0 ||
    normalizeBirthYearInput(urlState.birthYearFrom).length > 0 ||
    normalizeBirthYearInput(urlState.birthYearTo).length > 0 ||
    urlState.ekOnly ||
    urlState.sex !== "any" ||
    urlState.multipleRegsOnly;

  const searchQuery = useBeagleSearchQuery(urlState);
  const newestQuery = useBeagleNewestQuery(5);

  const searchResults = useMemo(
    () =>
      searchQuery.data ?? {
        mode: "none" as const,
        total: 0,
        totalPages: 0,
        page: 1,
        items: [],
      },
    [searchQuery.data],
  );

  const isSearchLoading =
    isPending || (searchQuery.isFetching && !searchQuery.data);
  const hasSearchError = searchQuery.isError && !searchQuery.data;
  const hasNewestError = newestQuery.isError && !newestQuery.data;
  const hasNotifiedSearchError = useRef(false);
  const hasNotifiedNewestError = useRef(false);

  useEffect(() => {
    if (hasSearchError && !hasNotifiedSearchError.current) {
      toast.error(t("search.empty.fetchFailed"));
      hasNotifiedSearchError.current = true;
      return;
    }

    if (!hasSearchError) {
      hasNotifiedSearchError.current = false;
    }
  }, [hasSearchError, t]);

  useEffect(() => {
    if (hasNewestError && !hasNotifiedNewestError.current) {
      toast.error(t("search.newest.fetchFailed"));
      hasNotifiedNewestError.current = true;
      return;
    }

    if (!hasNewestError) {
      hasNotifiedNewestError.current = false;
    }
  }, [hasNewestError, t]);

  const emptyVariant = hasSearchError
    ? "error"
    : searchResults.mode === "none"
      ? "start"
      : "no-results";
  const showNewestAdditions = !hasCommittedSearch;

  const hasResultItems = searchResults.items.length > 0;
  const handleCopyResults = useCallback(async () => {
    if (searchResults.items.length === 0) {
      return;
    }

    const clipboard = globalThis.navigator?.clipboard;
    if (!clipboard?.writeText) {
      toast.warning(t("search.results.copy.unsupported"));
      return;
    }

    const output = formatBeagleRowsForClipboard(searchResults.items, {
      ek: t("search.results.col.ek"),
      registration: t("search.results.col.reg"),
      registrationAll: t("search.results.col.regAll"),
      name: t("search.results.col.name"),
      sex: t("search.results.col.sex"),
      birthDate: t("search.newest.birthDate"),
      sire: t("search.results.parents.sire"),
      dam: t("search.results.parents.dam"),
      trials: t("search.results.col.trials"),
      shows: t("search.results.col.shows"),
      sexMale: t("search.results.sex.male"),
      sexFemale: t("search.results.sex.female"),
    });

    try {
      await clipboard.writeText(output);
      toast.success(t("search.results.copy.success"));
    } catch {
      toast.error(t("search.results.copy.error"));
    }
  }, [searchResults.items, t]);

  return (
    <>
      <FeatureHeroHeader
        logoAlt={t("search.page.logoAlt")}
        title={t("search.page.title")}
        description={t("search.page.description")}
      />

      <BeagleSearchForm
        values={formState}
        mode={effectiveFormMode}
        sort={urlState.sort}
        advancedOpen={urlState.adv}
        isPending={isPending}
        canSubmit={canSubmit}
        onFieldChange={setFormField}
        onSubmit={submitSearch}
        onReset={resetSearch}
        onToggleAdvanced={toggleAdvanced}
        onSortChange={setSort}
        onSexChange={setSex}
        onBirthYearFromChange={setBirthYearFrom}
        onBirthYearToChange={setBirthYearTo}
        onEkOnlyChange={setEkOnly}
        onMultipleRegsOnlyChange={setMultipleRegsOnly}
      />

      <ListingSectionShell
        title={t("search.results.title")}
        count={
          !hasSearchError && searchResults.mode !== "none" ? (
            <span className="flex flex-wrap items-center gap-2">
              <span>
                {t("search.results.count")} {searchResults.total}
              </span>
              {hasResultItems ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyResults();
                  }}
                  className={cn("text-xs", beagleTheme.actionLink)}
                >
                  {t("search.results.copy.button")}
                </button>
              ) : null}
            </span>
          ) : undefined
        }
      >
        {isSearchLoading ? (
          <BeagleSearchLoadingState />
        ) : hasSearchError ? (
          <BeagleSearchEmptyState variant="error" />
        ) : hasResultItems ? (
          <>
            <ListingResponsiveResults
              desktop={
                <BeagleSearchResultsDesktopTable rows={searchResults.items} />
              }
              mobile={
                <BeagleSearchResultsMobileCards rows={searchResults.items} />
              }
            />
            <BeagleSearchPagination
              page={searchResults.page}
              pageSize={urlState.pageSize}
              total={searchResults.total}
              totalPages={Math.max(1, searchResults.totalPages)}
              onPageSelect={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        ) : (
          <BeagleSearchEmptyState variant={emptyVariant} />
        )}
      </ListingSectionShell>

      {showNewestAdditions ? (
        <ListingSectionShell
          title={t("search.newest.title")}
          subtitle={t("search.newest.subtitle")}
        >
          {newestQuery.isLoading && !newestQuery.data ? (
            <BeagleSearchLoadingState />
          ) : hasNewestError ? (
            <BeagleSearchEmptyState variant="error" />
          ) : (
            <ListingResponsiveResults
              desktop={
                <BeagleSearchResultsDesktopTable
                  rows={newestQuery.data ?? []}
                />
              }
              mobile={
                <BeagleSearchResultsMobileCards rows={newestQuery.data ?? []} />
              }
            />
          )}
        </ListingSectionShell>
      ) : null}
    </>
  );
}
