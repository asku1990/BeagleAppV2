"use client";

import React from "react";
import type {
  AdminShowWorkbookImportIssueSeverity,
  AdminShowWorkbookImportPreviewResponse,
} from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";

export type ValidationIssueFilter = "ALL" | "ERROR" | "WARNING" | "INFO";

type ShowWorkbookValidationNotesSectionProps = {
  validation: AdminShowWorkbookImportPreviewResponse;
  issueFilter: ValidationIssueFilter;
  onIssueFilterChange: (filter: ValidationIssueFilter) => void;
};

const DUPLICATE_WARNING_CODES = new Set([
  "SHOW_WORKBOOK_SAME_DAY_EVENT_EXISTS",
]);

function getSeverityClass(
  severity: AdminShowWorkbookImportIssueSeverity,
): string {
  if (severity === "ERROR") {
    return "border-destructive/40 bg-destructive/10 text-destructive";
  }

  if (severity === "WARNING") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700";
  }

  return "border-sky-500/40 bg-sky-500/10 text-sky-700";
}

function getCountSuffixKey(
  issueFilter: ValidationIssueFilter,
):
  | "admin.shows.validation.notes.countSuffixAll"
  | "admin.shows.validation.notes.countSuffixErrors"
  | "admin.shows.validation.notes.countSuffixWarnings"
  | "admin.shows.validation.notes.countSuffixInfo" {
  if (issueFilter === "ERROR") {
    return "admin.shows.validation.notes.countSuffixErrors";
  }

  if (issueFilter === "WARNING") {
    return "admin.shows.validation.notes.countSuffixWarnings";
  }

  if (issueFilter === "INFO") {
    return "admin.shows.validation.notes.countSuffixInfo";
  }

  return "admin.shows.validation.notes.countSuffixAll";
}

// Renders validation issues with severity filters so blocking errors stay discoverable.
export function ShowWorkbookValidationNotesSection({
  validation,
  issueFilter,
  onIssueFilterChange,
}: ShowWorkbookValidationNotesSectionProps) {
  const { t, locale } = useI18n();
  const formatter = new Intl.NumberFormat(locale);
  const duplicateWarningCount = validation.issues.filter((issue) =>
    DUPLICATE_WARNING_CODES.has(issue.code),
  ).length;
  const filteredIssues = validation.issues
    .filter((issue) =>
      issueFilter === "ALL" ? true : issue.severity === issueFilter,
    )
    .map((issue, index) => ({ issue, index }))
    .sort((left, right) => {
      const leftIsDuplicate = DUPLICATE_WARNING_CODES.has(left.issue.code);
      const rightIsDuplicate = DUPLICATE_WARNING_CODES.has(right.issue.code);
      if (leftIsDuplicate && !rightIsDuplicate) {
        return -1;
      }
      if (!leftIsDuplicate && rightIsDuplicate) {
        return 1;
      }
      return left.index - right.index;
    })
    .map((entry) => entry.issue);

  return (
    <div className="space-y-3">
      {duplicateWarningCount > 0 ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
          <p className="text-sm font-semibold text-amber-900">
            {t("admin.shows.validation.notes.duplicateRisk.title")}
          </p>
          <p className="mt-1 text-xs text-amber-800">
            {formatter.format(duplicateWarningCount)}{" "}
            {t("admin.shows.validation.notes.duplicateRisk.count")} ·{" "}
            {t("admin.shows.validation.notes.duplicateRisk.description")}
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">
            {t("admin.shows.validation.notes.title")}
          </h4>
          <p className="text-xs text-muted-foreground">
            {formatter.format(filteredIssues.length)}{" "}
            {t(getCountSuffixKey(issueFilter))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["ALL", "admin.shows.validation.notes.filters.all"],
              ["ERROR", "admin.shows.validation.notes.filters.errors"],
              ["WARNING", "admin.shows.validation.notes.filters.warnings"],
              ["INFO", "admin.shows.validation.notes.filters.info"],
            ] as const
          ).map(([filterValue, translationKey]) => (
            <Button
              key={filterValue}
              type="button"
              variant={issueFilter === filterValue ? "default" : "outline"}
              size="sm"
              onClick={() => onIssueFilterChange(filterValue)}
              aria-pressed={issueFilter === filterValue}
            >
              {t(translationKey)}
            </Button>
          ))}
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          {validation.issues.length === 0
            ? t("admin.shows.validation.notes.empty")
            : t("admin.shows.validation.notes.emptyFiltered")}
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredIssues.map((issue, index) => (
            <li
              key={`${issue.rowNumber ?? "x"}-${issue.code}-${index}`}
              className="rounded-lg border bg-muted/20 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                {DUPLICATE_WARNING_CODES.has(issue.code) ? (
                  <span className="rounded-full border border-amber-600/40 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    {t("admin.shows.validation.notes.duplicateRisk.badge")}
                  </span>
                ) : null}
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getSeverityClass(issue.severity)}`}
                >
                  {issue.severity}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("admin.shows.validation.notes.row")}{" "}
                  {issue.rowNumber ?? "—"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("admin.shows.validation.notes.column")}{" "}
                  {issue.columnName ?? "—"}
                </span>
              </div>
              <p className="mt-2 text-sm">{issue.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
