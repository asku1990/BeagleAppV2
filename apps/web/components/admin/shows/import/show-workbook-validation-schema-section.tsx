"use client";

import React from "react";
import type { AdminShowWorkbookImportPreviewResponse } from "@beagle/contracts";
import { useI18n } from "@/hooks/i18n";

type ShowWorkbookValidationSchemaSectionProps = {
  validation: AdminShowWorkbookImportPreviewResponse;
};

function joinDefinitionCodes(definitionCodes: string[]) {
  return definitionCodes.join(", ");
}

// Renders the metadata-driven workbook column coverage and schema mapping summary.
export function ShowWorkbookValidationSchemaSection({
  validation,
}: ShowWorkbookValidationSchemaSectionProps) {
  const { t, locale } = useI18n();
  const formatter = new Intl.NumberFormat(locale);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">
        {t("admin.shows.validation.schema.title")}
      </h4>
      <p className="text-xs text-muted-foreground">
        {t("admin.shows.validation.schema.coverage")}:{" "}
        {formatter.format(validation.schema.coverage.importedColumnCount)}/
        {formatter.format(validation.schema.coverage.totalWorkbookColumns)}{" "}
        {t("admin.shows.validation.schema.coverageImported")} ·{" "}
        {formatter.format(validation.schema.coverage.ignoredColumnCount)}{" "}
        {t("admin.shows.validation.schema.coverageIgnored")} ·{" "}
        {formatter.format(validation.schema.coverage.blockedColumnCount)}{" "}
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
                  <span className="font-medium">{column.expectedHeader}</span>{" "}
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
              {validation.schema.missingStructuralFields.map((field) => (
                <li key={field.fieldKey}>{field.expectedHeader}</li>
              ))}
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
                  <div className="font-medium">{column.headerName}</div>
                  <div className="text-muted-foreground">
                    {joinDefinitionCodes(column.definitionCodes)} ·{" "}
                    {column.importMode}
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
                <li key={`${column.columnIndex}-${column.headerName}`}>
                  <div className="font-medium">{column.headerName}</div>
                  <div className="text-muted-foreground">
                    {column.reasonText}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-muted/20 p-3">
          <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("admin.shows.validation.schema.ignored")}
          </h5>
          {validation.schema.ignoredColumns.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("admin.shows.validation.schema.none")}
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {validation.schema.ignoredColumns.map((column) => (
                <li key={`${column.columnIndex}-${column.headerName}`}>
                  <div className="font-medium">{column.headerName}</div>
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
  );
}
