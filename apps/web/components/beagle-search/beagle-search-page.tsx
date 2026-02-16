"use client";

import Image from "next/image";
import { useMemo } from "react";
import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  normalizeBirthYearInput,
  resolvePrimarySearchMode,
  useBeagleSearchUiState,
} from "@/lib/beagle-search";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useBeagleNewestQuery } from "@/queries/beagle-search/use-beagle-newest-query";
import { useBeagleSearchQuery } from "@/queries/beagle-search/use-beagle-search-query";
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

  const emptyVariant = hasSearchError
    ? "error"
    : searchResults.mode === "none"
      ? "start"
      : "no-results";

  const hasResultItems = searchResults.items.length > 0;

  return (
    <>
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <div className="flex items-center gap-3 md:gap-4">
          <Image
            src="/legacy-v1-assets/v1-root-belogo.png"
            alt={t("search.page.logoAlt")}
            width={132}
            height={74}
            className={cn(
              "h-auto w-[110px] rounded-sm border p-1 md:w-[132px]",
              beagleTheme.border,
              beagleTheme.surface,
            )}
          />
          <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
            {t("search.page.title")}
          </h1>
        </div>
        <p
          className={cn(
            "mt-3 max-w-3xl text-sm md:text-base",
            beagleTheme.mutedText,
          )}
        >
          {t("search.page.description")}
        </p>
      </header>

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
          !hasSearchError && searchResults.mode !== "none"
            ? `${t("search.results.count")} ${searchResults.total}`
            : undefined
        }
      >
        {isSearchLoading ? (
          <BeagleSearchLoadingState />
        ) : hasSearchError ? (
          <BeagleSearchEmptyState variant="error" />
        ) : hasResultItems ? (
          <>
            {/* Desktop uses table, mobile uses cards; both render same row contract. */}
            <div className="hidden md:block">
              <BeagleSearchResultsDesktopTable rows={searchResults.items} />
            </div>
            <div className="md:hidden">
              <BeagleSearchResultsMobileCards rows={searchResults.items} />
            </div>
            <BeagleSearchPagination
              page={searchResults.page}
              total={searchResults.total}
              totalPages={Math.max(1, searchResults.totalPages)}
              onPrevious={() => setPage(searchResults.page - 1)}
              onNext={() => setPage(searchResults.page + 1)}
            />
          </>
        ) : (
          <BeagleSearchEmptyState variant={emptyVariant} />
        )}
      </ListingSectionShell>

      <ListingSectionShell
        title={t("search.newest.title")}
        subtitle={t("search.newest.subtitle")}
      >
        {newestQuery.isLoading && !newestQuery.data ? (
          <BeagleSearchLoadingState />
        ) : hasNewestError ? (
          <BeagleSearchEmptyState variant="error" />
        ) : (
          <>
            <div className="hidden md:block">
              <BeagleSearchResultsDesktopTable rows={newestQuery.data ?? []} />
            </div>
            <div className="md:hidden">
              <BeagleSearchResultsMobileCards rows={newestQuery.data ?? []} />
            </div>
          </>
        )}
      </ListingSectionShell>
    </>
  );
}
