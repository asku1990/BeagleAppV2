"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  computeBeagleSearchResults,
  getNewestDogs,
  resolvePrimarySearchMode,
  useBeagleSearchUiState,
} from "@/lib/beagle-search";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BeagleNewestDogsPanel } from "./beagle-newest-dogs-panel";
import { BeagleSearchEmptyState } from "./beagle-search-empty-state";
import { BeagleSearchForm } from "./beagle-search-form";
import { BeagleSearchLoadingState } from "./beagle-search-loading-state";
import { BeagleSearchPagination } from "./beagle-search-pagination";
import { BeagleSearchResultsCards } from "./beagle-search-results-cards";
import { BeagleSearchResultsTable } from "./beagle-search-results-table";

export function BeagleSearchPage() {
  const { t, locale } = useI18n();
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

  const newestDogs = useMemo(() => getNewestDogs(10), []);

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
        <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
          {t("search.page.title")}
        </h1>
        <p
          className={cn(
            "mt-2 max-w-3xl text-sm md:text-base",
            beagleTheme.mutedText,
          )}
        >
          {t("search.page.description")}
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
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
        <BeagleNewestDogsPanel items={newestDogs} locale={locale} />
      </section>

      <Card className={cn(beagleTheme.panel, "gap-0 py-0")}>
        <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
          <CardTitle
            className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
          >
            {t("search.results.title")}
          </CardTitle>
          {searchResults.mode !== "none" && searchResults.mode !== "invalid" ? (
            <p className={cn("text-sm", beagleTheme.mutedText)}>
              {t("search.results.count")} {searchResults.total}
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
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
        </CardContent>
      </Card>
    </>
  );
}
