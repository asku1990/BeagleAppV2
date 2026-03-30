"use client";

import React from "react";
import type { AdminShowWorkbookImportPreviewResponse } from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import {
  ShowWorkbookValidationNotesSection,
  type ValidationIssueFilter,
} from "./show-workbook-validation-notes-section";
import { ShowWorkbookValidationSchemaSection } from "./show-workbook-validation-schema-section";
import { ShowWorkbookValidationSummary } from "./show-workbook-validation-summary";

type ShowWorkbookValidationPanelProps = {
  validation: AdminShowWorkbookImportPreviewResponse | null;
  error: string | null;
  isLoading: boolean;
  mode?: "full" | "summary";
  showAcceptanceActions?: boolean;
  notesAccepted?: boolean;
  onAcceptNotes?: () => void;
  onShowDetails?: () => void;
};

function getStatusKey(
  validation: AdminShowWorkbookImportPreviewResponse | null,
) {
  if (!validation) {
    return "admin.shows.validation.status.idle";
  }

  if (validation.errorCount > 0) {
    return "admin.shows.validation.status.blocked";
  }

  if (
    validation.warningCount > 0 ||
    validation.schema.ignoredColumns.length > 0
  ) {
    return "admin.shows.validation.status.review";
  }

  return "admin.shows.validation.status.ready";
}

function getStatusClass(
  validation: AdminShowWorkbookImportPreviewResponse | null,
): string {
  if (!validation) {
    return "border-border bg-muted/40 text-muted-foreground";
  }

  if (validation.errorCount > 0) {
    return "border-destructive/40 bg-destructive/10 text-destructive";
  }

  if (
    validation.warningCount > 0 ||
    validation.schema.ignoredColumns.length > 0
  ) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700";
  }

  return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";
}

export function ShowWorkbookValidationPanel({
  validation,
  error,
  isLoading,
  mode = "full",
  showAcceptanceActions = false,
  notesAccepted = false,
  onAcceptNotes,
  onShowDetails,
}: ShowWorkbookValidationPanelProps) {
  const { t, locale } = useI18n();
  const formatter = new Intl.NumberFormat(locale);
  const [issueFilter, setIssueFilter] =
    React.useState<ValidationIssueFilter>("ALL");
  const isSummaryMode = mode === "summary";
  const hasReviewNotes =
    validation !== null &&
    (validation.warningCount > 0 ||
      validation.schema.ignoredColumns.length > 0);
  // Keep the acceptance prompt aligned with the summary: INFO issues already include ignored columns.
  const acceptedReviewNoteCount =
    (validation?.warningCount ?? 0) + (validation?.infoCount ?? 0);
  const blockingReasonCount =
    (validation?.schema.missingStructuralFields.length ?? 0) +
    (validation?.schema.blockedColumns.length ?? 0);

  React.useEffect(() => {
    setIssueFilter("ALL");
  }, [
    validation?.fileName,
    validation?.sheetName,
    validation?.issues.length,
    validation?.errorCount,
    validation?.warningCount,
    validation?.infoCount,
  ]);

  return (
    <div className="space-y-3 rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            {t("admin.shows.validation.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("admin.shows.validation.description")}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(validation)}`}
        >
          {t(getStatusKey(validation))}
        </span>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          {t("admin.shows.validation.loading")}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {validation ? (
        <>
          <ShowWorkbookValidationSummary
            validation={validation}
            isSummaryMode={isSummaryMode}
            hasReviewNotes={hasReviewNotes}
            notesAccepted={notesAccepted}
            onShowDetails={onShowDetails}
          />

          {validation.errorCount > 0 && blockingReasonCount > 0 ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-destructive">
                  {t("admin.shows.validation.blocking.title")}
                </h4>
                <p className="text-sm text-destructive/90">
                  {t("admin.shows.validation.blocking.description")}
                </p>
              </div>

              <ul className="mt-3 space-y-2 text-sm text-destructive/90">
                {validation.schema.missingStructuralFields.map((field) => (
                  <li key={`missing-${field.fieldKey}`}>
                    <div className="font-medium">{field.expectedHeader}</div>
                    <div>
                      {t("admin.shows.validation.blocking.missingField")}
                    </div>
                  </li>
                ))}
                {validation.schema.blockedColumns.map((column) => (
                  <li
                    key={`blocked-${column.columnIndex}-${column.headerName}`}
                  >
                    <div className="font-medium">{column.headerName}</div>
                    <div>{column.reasonText}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {isSummaryMode ? null : (
            <div className="space-y-3">
              <ShowWorkbookValidationSchemaSection validation={validation} />

              {showAcceptanceActions ? (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-amber-900">
                      {t("admin.shows.validation.review.title")}
                    </h4>
                    <p className="text-sm text-amber-800">
                      {t("admin.shows.validation.review.description")}
                    </p>
                    <p className="text-xs text-amber-700">
                      {formatter.format(acceptedReviewNoteCount)}{" "}
                      {t("admin.shows.validation.notes.countSuffixAll")} ·{" "}
                      {formatter.format(validation.warningCount)}{" "}
                      {t("admin.shows.validation.summary.warnings")} ·{" "}
                      {formatter.format(validation.infoCount)}{" "}
                      {t("admin.shows.validation.summary.info")} ·{" "}
                      {formatter.format(
                        validation.schema.ignoredColumns.length,
                      )}{" "}
                      {t("admin.shows.validation.schema.coverageIgnored")}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={onAcceptNotes}
                      disabled={!onAcceptNotes}
                    >
                      {t("admin.shows.validation.review.accept")}
                    </Button>
                  </div>
                </div>
              ) : null}

              <ShowWorkbookValidationNotesSection
                validation={validation}
                issueFilter={issueFilter}
                onIssueFilterChange={setIssueFilter}
              />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
