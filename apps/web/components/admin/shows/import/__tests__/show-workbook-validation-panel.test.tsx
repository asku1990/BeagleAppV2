import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ShowWorkbookValidationPanel } from "../show-workbook-validation-panel";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "fi",
  }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("button", props as Record<string, string>, children),
}));

describe("ShowWorkbookValidationPanel", () => {
  it("renders validation summary and notes", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowWorkbookValidationPanel, {
        isLoading: false,
        error: null,
        showAcceptanceActions: true,
        onAcceptNotes: () => undefined,
        validation: {
          fileName: "Näyttelyt.xlsx",
          sheetName: "Näyttelytulokset",
          rowCount: 2,
          acceptedRowCount: 1,
          rejectedRowCount: 1,
          eventCount: 1,
          entryCount: 1,
          resultItemCount: 3,
          infoCount: 1,
          warningCount: 1,
          errorCount: 1,
          schema: {
            coverage: {
              totalWorkbookColumns: 12,
              importedColumnCount: 11,
              ignoredColumnCount: 1,
              blockedColumnCount: 0,
            },
            structuralColumns: [
              {
                fieldKey: "registrationNo",
                expectedHeader: "Rekisterinumero",
                headerName: "Rekisterinumero",
                required: true,
              },
            ],
            missingStructuralFields: [],
            definitionColumns: [
              {
                headerName: "SERT",
                definitionCodes: ["SERT", "varaSERT"],
                importMode: "VALUE_MAP",
                valueType: "FLAG",
              },
            ],
            ignoredColumns: [
              {
                headerName: "Rotukoodi",
                columnIndex: 10,
                reasonText:
                  "Workbook column Rotukoodi is allowed by import metadata but ignored by policy.",
                ruleCode: "BREED_CODE",
              },
            ],
            blockedColumns: [],
          },
          events: [],
          issues: [
            {
              rowNumber: 1,
              columnName: "Rotukoodi",
              severity: "INFO",
              code: "SHOW_WORKBOOK_COLUMN_IGNORED",
              message:
                "Workbook column Rotukoodi is allowed by import metadata but ignored by policy.",
              registrationNo: null,
              eventLookupKey: null,
            },
            {
              rowNumber: 2,
              columnName: "SERT",
              severity: "ERROR",
              code: "SHOW_WORKBOOK_INVALID_RESULT_VALUE",
              message: "Unsupported value for SERT: bogus.",
              registrationNo: "FI123",
              eventLookupKey: "key",
            },
          ],
        },
      }),
    );

    expect(html).toContain("admin.shows.validation.title");
    expect(html).toContain("admin.shows.validation.summary.errors");
    expect(html).toContain("admin.shows.validation.schema.title");
    expect(html).toContain("Rotukoodi");
    expect(html).toContain("Unsupported value for SERT: bogus.");
    expect(html).toContain("admin.shows.validation.review.title");
    expect(html).toContain("admin.shows.validation.review.accept");
    expect(html).toContain("admin.shows.validation.notes.filters.errors");
    expect(html).toContain("admin.shows.validation.notes.filters.warnings");
  });

  it("renders a compact summary when preview is ready", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowWorkbookValidationPanel, {
        mode: "summary",
        isLoading: false,
        error: null,
        notesAccepted: true,
        onShowDetails: () => undefined,
        validation: {
          fileName: "Näyttelyt.xlsx",
          sheetName: "Näyttelytulokset",
          rowCount: 2,
          acceptedRowCount: 2,
          rejectedRowCount: 0,
          eventCount: 1,
          entryCount: 1,
          resultItemCount: 3,
          infoCount: 0,
          warningCount: 1,
          errorCount: 0,
          schema: {
            coverage: {
              totalWorkbookColumns: 1,
              importedColumnCount: 0,
              ignoredColumnCount: 1,
              blockedColumnCount: 0,
            },
            structuralColumns: [],
            missingStructuralFields: [],
            definitionColumns: [],
            ignoredColumns: [
              {
                headerName: "Rotukoodi",
                columnIndex: 0,
                ruleCode: "BREED_CODE",
                reasonText:
                  "Workbook column Rotukoodi is allowed by import metadata but ignored by policy.",
              },
            ],
            blockedColumns: [],
          },
          events: [],
          issues: [],
        },
      }),
    );

    expect(html).toContain("Näyttelytulokset");
    expect(html).toContain("admin.shows.validation.summary.previewHint");
    expect(html).not.toContain("admin.shows.validation.notes.title");
    expect(html).toContain("admin.shows.validation.summary.notesAccepted");
    expect(html).toContain("admin.shows.validation.summary.showNotes");
  });

  it("renders a compact summary without notes when none were accepted", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowWorkbookValidationPanel, {
        mode: "summary",
        isLoading: false,
        error: null,
        validation: {
          fileName: "Näyttelyt.xlsx",
          sheetName: "Näyttelytulokset",
          rowCount: 2,
          acceptedRowCount: 2,
          rejectedRowCount: 0,
          eventCount: 1,
          entryCount: 1,
          resultItemCount: 3,
          infoCount: 0,
          warningCount: 0,
          errorCount: 0,
          schema: {
            coverage: {
              totalWorkbookColumns: 0,
              importedColumnCount: 0,
              ignoredColumnCount: 0,
              blockedColumnCount: 0,
            },
            structuralColumns: [],
            missingStructuralFields: [],
            definitionColumns: [],
            ignoredColumns: [],
            blockedColumns: [],
          },
          events: [],
          issues: [],
        },
      }),
    );

    expect(html).toContain("Näyttelytulokset");
    expect(html).toContain("admin.shows.validation.summary.previewHint");
    expect(html).not.toContain("admin.shows.validation.notes.title");
    expect(html).not.toContain("admin.shows.validation.summary.notesAccepted");
  });

  it("surfaces blocking schema reasons near the summary", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowWorkbookValidationPanel, {
        isLoading: false,
        error: null,
        validation: {
          fileName: "Näyttelyt.xlsx",
          sheetName: "Näyttelytulokset",
          rowCount: 1,
          acceptedRowCount: 0,
          rejectedRowCount: 1,
          eventCount: 0,
          entryCount: 0,
          resultItemCount: 0,
          infoCount: 0,
          warningCount: 0,
          errorCount: 1,
          schema: {
            coverage: {
              totalWorkbookColumns: 10,
              importedColumnCount: 9,
              ignoredColumnCount: 0,
              blockedColumnCount: 1,
            },
            structuralColumns: [],
            missingStructuralFields: [],
            definitionColumns: [],
            ignoredColumns: [],
            blockedColumns: [
              {
                headerName: "SERT_TEST",
                columnIndex: 9,
                reasonCode: "MISSING_DEFINITION",
                reasonText:
                  "Workbook column SERT_TEST references missing definition SERT_TEST.",
              },
            ],
          },
          events: [],
          issues: [
            {
              rowNumber: 1,
              columnName: "SERT_TEST",
              severity: "ERROR",
              code: "SHOW_WORKBOOK_DEFINITION_NOT_FOUND",
              message:
                "Workbook column SERT_TEST references missing definition SERT_TEST.",
              registrationNo: null,
              eventLookupKey: null,
            },
          ],
        },
      }),
    );

    expect(html).toContain("admin.shows.validation.blocking.title");
    expect(html).toContain(
      "Workbook column SERT_TEST references missing definition SERT_TEST.",
    );
  });
});
