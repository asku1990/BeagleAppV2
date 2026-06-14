"use client";

import type {
  VirtualPairingDogOption,
  VirtualPairingSearchField,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import type { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";
import { VirtualPairingSearchForm } from "./virtual-pairing-search-form";
import { VirtualPairingSearchResultsCards } from "./virtual-pairing-search-results-cards";
import { VirtualPairingSearchResultsTable } from "./virtual-pairing-search-results-table";

type TranslateFn = (key: MessageKey) => string;

type Props = {
  t: TranslateFn;
  field: VirtualPairingSearchField;
  query: string;
  isPending: boolean;
  canSubmit: boolean;
  results: VirtualPairingSearchResponse | null;
  hasCommittedSearch: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  onFieldChange: (field: VirtualPairingSearchField) => void;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSelectSire: (candidate: VirtualPairingDogOption) => void;
  onSelectDam: (candidate: VirtualPairingDogOption) => void;
};

export function VirtualPairingSearchPanel({
  t,
  field,
  query,
  isPending,
  canSubmit,
  results,
  hasCommittedSearch,
  isLoading,
  isError,
  errorMessage,
  onFieldChange,
  onQueryChange,
  onSubmit,
  onSelectSire,
  onSelectDam,
}: Props) {
  const hasResults = Boolean(results && results.items.length > 0);
  const isStartState = !results && !isError && !hasCommittedSearch;

  return (
    <div className="space-y-5">
      <Card className={cn(beagleTheme.subpanel, "gap-0 py-0")}>
        <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
          <CardTitle
            className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
          >
            {t("beagle.virtualPairing.search.title")}
          </CardTitle>
          <p className={cn("text-sm", beagleTheme.mutedText)}>
            {t("beagle.virtualPairing.search.description")}
          </p>
        </CardHeader>
        <VirtualPairingSearchForm
          t={t}
          field={field}
          query={query}
          isPending={isPending}
          canSubmit={canSubmit}
          onFieldChange={onFieldChange}
          onQueryChange={onQueryChange}
          onSubmit={onSubmit}
        />
      </Card>

      {isLoading ? (
        <Card className={cn(beagleTheme.subpanel, "gap-0 py-0")}>
          <CardContent className="px-5 py-5 md:px-6 md:py-6">
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className={cn(beagleTheme.subpanel, "gap-0 py-0")}>
          <CardContent className="px-5 py-5 md:px-6 md:py-6">
            <p className="text-sm">
              {errorMessage ?? t("beagle.virtualPairing.search.error")}
            </p>
          </CardContent>
        </Card>
      ) : isStartState ? (
        <Card className={cn(beagleTheme.subpanel, "gap-0 py-0")}>
          <CardContent className="px-5 py-5 md:px-6 md:py-6">
            <p className={cn("text-sm", beagleTheme.mutedText)}>
              {t("beagle.virtualPairing.search.empty")}
            </p>
          </CardContent>
        </Card>
      ) : hasResults && results ? (
        <Card className={cn(beagleTheme.subpanel, "gap-0 py-0")}>
          <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
            <CardTitle
              className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
            >
              {t("beagle.virtualPairing.search.countPrefix")} {results.total}
            </CardTitle>
            {results.isLimited ? (
              <p className={cn("text-sm", beagleTheme.mutedText)}>
                {t("beagle.virtualPairing.search.limitedWarningPrefix")}{" "}
                {results.candidateLimit ?? results.total}{" "}
                {t("beagle.virtualPairing.search.limitedWarningSuffix")}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
            <div className="space-y-4">
              <div className="hidden md:block">
                <VirtualPairingSearchResultsTable
                  rows={results.items}
                  onSelectSire={onSelectSire}
                  onSelectDam={onSelectDam}
                  t={t}
                />
              </div>
              <div className="md:hidden">
                <VirtualPairingSearchResultsCards
                  rows={results.items}
                  onSelectSire={onSelectSire}
                  onSelectDam={onSelectDam}
                  t={t}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={cn(beagleTheme.subpanel, "gap-0 py-0")}>
          <CardContent className="px-5 py-5 md:px-6 md:py-6">
            <p className={cn("text-sm", beagleTheme.mutedText)}>
              {t("beagle.virtualPairing.search.empty")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
