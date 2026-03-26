"use client";

import React from "react";
import type { AdminShowWorkbookImportPreviewResponse } from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";

type ShowWorkbookValidationSummaryProps = {
  validation: AdminShowWorkbookImportPreviewResponse;
  isSummaryMode: boolean;
  hasReviewNotes: boolean;
  notesAccepted: boolean;
  onShowDetails?: () => void;
};

function getReadyKey(
  validation: AdminShowWorkbookImportPreviewResponse,
  hasReviewNotes: boolean,
  notesAccepted: boolean,
) {
  if (validation.errorCount > 0) {
    return "admin.shows.validation.summary.readyNo";
  }

  if (hasReviewNotes && !notesAccepted) {
    return "admin.shows.validation.summary.readyPending";
  }

  return "admin.shows.validation.summary.readyYes";
}

export function ShowWorkbookValidationSummary({
  validation,
  isSummaryMode,
  hasReviewNotes,
  notesAccepted,
  onShowDetails,
}: ShowWorkbookValidationSummaryProps) {
  const { t, locale } = useI18n();
  const formatter = new Intl.NumberFormat(locale);

  return (
    <>
      <div className="rounded-lg border bg-muted/20 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("admin.shows.preview.validateTitle")}
            </p>
            <p className="truncate text-sm font-medium">
              {isSummaryMode ? validation.sheetName : validation.fileName}
            </p>
            {isSummaryMode ? null : (
              <p className="text-xs text-muted-foreground">
                {validation.sheetName}
              </p>
            )}
          </div>
          {isSummaryMode ? (
            <p className="text-xs text-muted-foreground">
              {t("admin.shows.validation.summary.previewHint")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("admin.shows.validation.summary.rows")}
          </div>
          <div className="mt-1 text-xl font-semibold">
            {formatter.format(validation.rowCount)}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("admin.shows.validation.summary.errors")}
          </div>
          <div className="mt-1 text-xl font-semibold">
            {formatter.format(validation.errorCount)}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("admin.shows.validation.summary.warnings")}
          </div>
          <div className="mt-1 text-xl font-semibold">
            {formatter.format(validation.warningCount)}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("admin.shows.validation.summary.notes")}
          </div>
          <div className="mt-1 text-xl font-semibold">
            {formatter.format(
              validation.warningCount + validation.schema.ignoredColumns.length,
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("admin.shows.validation.summary.ignored")}
          </div>
          <div className="mt-1 text-xl font-semibold">
            {formatter.format(validation.schema.ignoredColumns.length)}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("admin.shows.validation.summary.ready")}
          </div>
          <div className="mt-1 text-sm font-semibold">
            {t(getReadyKey(validation, hasReviewNotes, notesAccepted))}
          </div>
        </div>
      </div>

      {isSummaryMode && hasReviewNotes && notesAccepted ? (
        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {t("admin.shows.validation.summary.notesAccepted")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatter.format(validation.warningCount)}{" "}
                {t("admin.shows.validation.summary.warningsAccepted")} ·{" "}
                {formatter.format(validation.schema.ignoredColumns.length)}{" "}
                {t("admin.shows.validation.summary.ignoredAccepted")}
              </p>
            </div>
            {onShowDetails ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onShowDetails}
              >
                {t("admin.shows.validation.summary.showNotes")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
