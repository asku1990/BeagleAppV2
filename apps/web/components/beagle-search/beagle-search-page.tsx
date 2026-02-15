"use client";

import Image from "next/image";
import { useMemo } from "react";
import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  computeBeagleSearchResults,
  getNewestDogRows,
  resolvePrimarySearchMode,
  useBeagleSearchUiState,
} from "@/lib/beagle-search";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BeagleSearchEmptyState } from "./beagle-search-empty-state";
import { BeagleSearchForm } from "./beagle-search-form";
import { BeagleSearchLoadingState } from "./beagle-search-loading-state";
import { BeagleSearchPagination } from "./beagle-search-pagination";
import { BeagleSearchResultsCards } from "./beagle-search-results-cards";
import { BeagleSearchResultsTable } from "./beagle-search-results-table";

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
    toggleAdvanced,
  } = useBeagleSearchUiState();

  const localMode = resolvePrimarySearchMode(formState);
  const canSubmit =
    localMode === "ek" || localMode === "reg" || localMode === "name";

  const searchResults = useMemo(
    () => computeBeagleSearchResults(urlState),
    [urlState],
  );

  const newestDogRows = useMemo(() => getNewestDogRows(5), []);

  const emptyVariant =
    searchResults.mode === "none"
      ? "start"
      : searchResults.mode === "invalid"
        ? "invalid"
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
        mode={localMode}
        sort={urlState.sort}
        advancedOpen={urlState.adv}
        isPending={isPending}
        canSubmit={canSubmit}
        onFieldChange={setFormField}
        onSubmit={submitSearch}
        onReset={resetSearch}
        onToggleAdvanced={toggleAdvanced}
        onSortChange={setSort}
      />

      <ListingSectionShell
        title={t("search.results.title")}
        count={
          searchResults.mode !== "none" && searchResults.mode !== "invalid"
            ? `${t("search.results.count")} ${searchResults.total}`
            : undefined
        }
      >
        {isPending ? (
          <BeagleSearchLoadingState />
        ) : hasResultItems ? (
          <>
            <div className="hidden md:block">
              <BeagleSearchResultsTable rows={searchResults.items} />
            </div>
            <div className="md:hidden">
              <BeagleSearchResultsCards rows={searchResults.items} />
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
        <div className="hidden md:block">
          <BeagleSearchResultsTable rows={newestDogRows} />
        </div>
        <div className="md:hidden">
          <BeagleSearchResultsCards rows={newestDogRows} />
        </div>
      </ListingSectionShell>
    </>
  );
}
