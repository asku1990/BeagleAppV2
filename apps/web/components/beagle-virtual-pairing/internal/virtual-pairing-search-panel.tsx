"use client";

import type {
  VirtualPairingDogOption,
  VirtualPairingSearchField,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";

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

function formatSex(
  value: VirtualPairingDogOption["sex"],
  t: TranslateFn,
): string {
  if (value === "U") return t("beagle.virtualPairing.search.sex.male");
  if (value === "N") return t("beagle.virtualPairing.search.sex.female");
  return t("beagle.virtualPairing.search.sex.unknown");
}

function SearchResultActions({
  candidate,
  onSelectSire,
  onSelectDam,
  t,
}: {
  candidate: VirtualPairingDogOption;
  onSelectSire: (candidate: VirtualPairingDogOption) => void;
  onSelectDam: (candidate: VirtualPairingDogOption) => void;
  t: TranslateFn;
}) {
  const canSelectSire = candidate.sex === "U";
  const canSelectDam = candidate.sex === "N";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!canSelectSire}
        onClick={() => onSelectSire(candidate)}
      >
        {t("beagle.virtualPairing.search.selectSire")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!canSelectDam}
        onClick={() => onSelectDam(candidate)}
      >
        {t("beagle.virtualPairing.search.selectDam")}
      </Button>
    </div>
  );
}

function SearchResultsTable({
  rows,
  onSelectSire,
  onSelectDam,
  t,
}: {
  rows: VirtualPairingSearchResponse["items"];
  onSelectSire: (candidate: VirtualPairingDogOption) => void;
  onSelectDam: (candidate: VirtualPairingDogOption) => void;
  t: TranslateFn;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.ek")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.reg")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.sex")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.name")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.trials")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.shows")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.select")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn("border-b last:border-b-0", beagleTheme.border)}
            >
              <td className="py-2 pr-3 tabular-nums">{row.ekNo ?? "-"}</td>
              <td className="py-2 pr-3">{row.registrationNo}</td>
              <td className="py-2 pr-3">{formatSex(row.sex, t)}</td>
              <td className="py-2 pr-3 font-medium">{row.name}</td>
              <td className="py-2 pr-3 tabular-nums">{row.trialCount}</td>
              <td className="py-2 pr-3 tabular-nums">{row.showCount}</td>
              <td className="py-2 pr-3">
                <SearchResultActions
                  candidate={row}
                  onSelectSire={onSelectSire}
                  onSelectDam={onSelectDam}
                  t={t}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SearchResultsCards({
  rows,
  onSelectSire,
  onSelectDam,
  t,
}: {
  rows: VirtualPairingSearchResponse["items"];
  onSelectSire: (candidate: VirtualPairingDogOption) => void;
  onSelectDam: (candidate: VirtualPairingDogOption) => void;
  t: TranslateFn;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <Card key={row.id} className={cn(beagleTheme.subpanel, "gap-0 py-0")}>
          <CardContent className="px-4 py-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold">{row.name}</div>
                  <div className={cn("text-sm", beagleTheme.mutedText)}>
                    {row.registrationNo}
                  </div>
                </div>
                <div className="text-sm tabular-nums text-right">
                  <div>EK {row.ekNo ?? "-"}</div>
                  <div>{formatSex(row.sex, t)}</div>
                </div>
              </div>
              <div className={cn("text-sm", beagleTheme.mutedText)}>
                {t("beagle.virtualPairing.search.col.trials")}: {row.trialCount}{" "}
                {t("beagle.virtualPairing.search.col.shows")}: {row.showCount}
              </div>
              <SearchResultActions
                candidate={row}
                onSelectSire={onSelectSire}
                onSelectDam={onSelectDam}
                t={t}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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
        <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
              <label className="space-y-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    beagleTheme.inkStrongText,
                  )}
                >
                  {t("beagle.virtualPairing.search.fieldLabel")}
                </span>
                <select
                  value={field}
                  onChange={(event) =>
                    onFieldChange(
                      event.target.value as VirtualPairingSearchField,
                    )
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="ek">
                    {t("beagle.virtualPairing.search.field.ek")}
                  </option>
                  <option value="reg">
                    {t("beagle.virtualPairing.search.field.reg")}
                  </option>
                  <option value="name">
                    {t("beagle.virtualPairing.search.field.name")}
                  </option>
                </select>
              </label>
              <label className="space-y-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    beagleTheme.inkStrongText,
                  )}
                >
                  {t("beagle.virtualPairing.search.inputAria")}
                </span>
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder={t(
                    "beagle.virtualPairing.search.inputPlaceholder",
                  )}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </label>
              <Button type="submit" disabled={!canSubmit || isPending}>
                {isPending
                  ? t("beagle.virtualPairing.search.loading")
                  : t("beagle.virtualPairing.search.button")}
              </Button>
            </div>
            <p className={cn("text-sm", beagleTheme.mutedText)}>
              {t("beagle.virtualPairing.search.helper")}
            </p>
          </form>
        </CardContent>
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
                <SearchResultsTable
                  rows={results.items}
                  onSelectSire={onSelectSire}
                  onSelectDam={onSelectDam}
                  t={t}
                />
              </div>
              <div className="md:hidden">
                <SearchResultsCards
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
