"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import {
  isDateRangeValid,
  parseYearInput,
  type AdminTrialSearchMode,
  type AdminTrialSearchSort,
} from "./internal/trial-ui";

type AdminTrialEventsFiltersProps = {
  mode: AdminTrialSearchMode;
  query: string;
  yearInput: string;
  dateFrom: string;
  dateTo: string;
  sort: AdminTrialSearchSort;
  filterError: string | null;
  onQueryChange: (value: string) => void;
  onModeChange: (value: AdminTrialSearchMode) => void;
  onYearInputChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSortChange: (value: AdminTrialSearchSort) => void;
  onApply: () => void;
  onReset: () => void;
};

export function AdminTrialEventsFilters({
  mode,
  query,
  yearInput,
  dateFrom,
  dateTo,
  sort,
  filterError,
  onQueryChange,
  onModeChange,
  onYearInputChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
  onApply,
  onReset,
}: AdminTrialEventsFiltersProps) {
  const { t } = useI18n();
  const canSubmit =
    mode === "year"
      ? yearInput.trim().length === 0 || parseYearInput(yearInput) !== null
      : isDateRangeValid(dateFrom, dateTo);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("admin.trials.manage.filters.placeholder")}
          aria-label={t("admin.trials.manage.filters.aria")}
        />
        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as AdminTrialSearchSort)
          }
          aria-label={t("admin.trials.manage.filters.sort.label")}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="date-desc">
            {t("admin.trials.manage.filters.sort.dateDesc")}
          </option>
          <option value="date-asc">
            {t("admin.trials.manage.filters.sort.dateAsc")}
          </option>
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={mode}
          onChange={(event) =>
            onModeChange(event.target.value as AdminTrialSearchMode)
          }
          aria-label={t("admin.trials.manage.filters.mode.label")}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="year">
            {t("admin.trials.manage.filters.mode.year")}
          </option>
          <option value="range">
            {t("admin.trials.manage.filters.mode.range")}
          </option>
        </select>

        {mode === "year" ? (
          <Input
            value={yearInput}
            onChange={(event) => onYearInputChange(event.target.value)}
            placeholder={t("admin.trials.manage.filters.year.placeholder")}
            aria-label={t("admin.trials.manage.filters.year.label")}
          />
        ) : (
          <>
            <Input
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              type="date"
              aria-label={t("admin.trials.manage.filters.dateFrom")}
            />
            <Input
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              type="date"
              aria-label={t("admin.trials.manage.filters.dateTo")}
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onApply} disabled={!canSubmit}>
          {t("admin.trials.manage.filters.apply")}
        </Button>
        <Button variant="outline" onClick={onReset}>
          {t("admin.trials.manage.filters.reset")}
        </Button>
      </div>

      {filterError ? (
        <p className="text-sm text-destructive">{filterError}</p>
      ) : null}
    </div>
  );
}
