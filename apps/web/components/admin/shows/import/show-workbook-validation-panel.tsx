"use client";

import React from "react";
import type {
  AdminShowWorkbookImportIssueSeverity,
  AdminShowWorkbookImportPreviewResponse,
} from "@beagle/contracts";
import { useI18n } from "@/hooks/i18n";

type ShowWorkbookValidationPanelProps = {
  validation: AdminShowWorkbookImportPreviewResponse | null;
  error: string | null;
  isLoading: boolean;
  mode?: "full" | "summary";
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

  if (validation.warningCount > 0) {
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

  if (validation.warningCount > 0) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700";
  }

  return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";
}

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

function joinDefinitionCodes(definitionCodes: string[]) {
  return definitionCodes.join(", ");
}

export function ShowWorkbookValidationPanel({
  validation,
  error,
  isLoading,
  mode = "full",
}: ShowWorkbookValidationPanelProps) {
  const { t, locale } = useI18n();
  const formatter = new Intl.NumberFormat(locale);
  const isSummaryMode = mode === "summary";

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
                {t("admin.shows.validation.summary.accepted")}
              </div>
              <div className="mt-1 text-xl font-semibold">
                {formatter.format(validation.acceptedRowCount)}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("admin.shows.validation.summary.rejected")}
              </div>
              <div className="mt-1 text-xl font-semibold">
                {formatter.format(validation.rejectedRowCount)}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("admin.shows.validation.summary.ready")}
              </div>
              <div className="mt-1 text-sm font-semibold">
                {validation.errorCount === 0
                  ? t("admin.shows.validation.summary.readyYes")
                  : t("admin.shows.validation.summary.readyNo")}
              </div>
            </div>
          </div>

          {isSummaryMode ? null : (
            <div className="space-y-3">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">
                  {t("admin.shows.validation.schema.title")}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("admin.shows.validation.schema.coverage")}:{" "}
                  {formatter.format(
                    validation.schema.coverage.importedColumnCount,
                  )}
                  /
                  {formatter.format(
                    validation.schema.coverage.totalWorkbookColumns,
                  )}{" "}
                  {t("admin.shows.validation.schema.coverageImported")} ·{" "}
                  {formatter.format(
                    validation.schema.coverage.blockedColumnCount,
                  )}{" "}
                  {t("admin.shows.validation.schema.coverageBlocked")}
                </p>

                <div className="grid gap-3 xl:grid-cols-2">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("admin.shows.validation.schema.structural")}
                    </h5>
                    {validation.schema.structuralColumns.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("admin.shows.validation.schema.empty")}
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm">
                        {validation.schema.structuralColumns.map((column) => (
                          <li key={`${column.fieldKey}-${column.headerName}`}>
                            <span className="font-medium">
                              {column.expectedHeader}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              → {column.headerName}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-lg border bg-muted/20 p-3">
                    <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("admin.shows.validation.schema.missing")}
                    </h5>
                    {validation.schema.missingStructuralFields.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("admin.shows.validation.schema.none")}
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm">
                        {validation.schema.missingStructuralFields.map(
                          (field) => (
                            <li key={field.fieldKey}>{field.expectedHeader}</li>
                          ),
                        )}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-lg border bg-muted/20 p-3">
                    <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("admin.shows.validation.schema.definitions")}
                    </h5>
                    {validation.schema.definitionColumns.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("admin.shows.validation.schema.none")}
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm">
                        {validation.schema.definitionColumns.map((column) => (
                          <li
                            key={`${column.headerName}-${joinDefinitionCodes(column.definitionCodes)}`}
                          >
                            <div className="font-medium">
                              {column.headerName}
                            </div>
                            <div className="text-muted-foreground">
                              {joinDefinitionCodes(column.definitionCodes)} ·{" "}
                              {column.importMode} ·{" "}
                              {column.enabled
                                ? t("admin.shows.validation.schema.enabled")
                                : t(
                                    "admin.shows.validation.schema.disabled",
                                  )}{" "}
                              ·{" "}
                              {column.supported
                                ? t("admin.shows.validation.schema.supported")
                                : t(
                                    "admin.shows.validation.schema.unsupported",
                                  )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-lg border bg-muted/20 p-3">
                    <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("admin.shows.validation.schema.blocked")}
                    </h5>
                    {validation.schema.blockedColumns.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("admin.shows.validation.schema.none")}
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm">
                        {validation.schema.blockedColumns.map((column) => (
                          <li
                            key={`${column.columnIndex}-${column.headerName}`}
                          >
                            <div className="font-medium">
                              {column.headerName}
                            </div>
                            <div className="text-muted-foreground">
                              {column.reasonText}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold">
                  {t("admin.shows.validation.notes.title")}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatter.format(validation.issues.length)}{" "}
                  {t("admin.shows.validation.notes.countSuffix")}
                </p>
              </div>

              {validation.issues.length === 0 ? (
                <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  {t("admin.shows.validation.notes.empty")}
                </div>
              ) : (
                <ul className="space-y-2">
                  {validation.issues.map((issue, index) => (
                    <li
                      key={`${issue.rowNumber ?? "x"}-${issue.code}-${index}`}
                      className="rounded-lg border bg-muted/20 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
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
          )}
        </>
      ) : null}
    </div>
  );
}
