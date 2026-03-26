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

describe("ShowWorkbookValidationPanel", () => {
  it("renders validation summary and notes", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowWorkbookValidationPanel, {
        isLoading: false,
        error: null,
        validation: {
          fileName: "Näyttelyt.xlsx",
          sheetName: "Näyttelytulokset",
          rowCount: 2,
          acceptedRowCount: 1,
          rejectedRowCount: 1,
          eventCount: 1,
          entryCount: 1,
          resultItemCount: 3,
          infoCount: 0,
          warningCount: 1,
          errorCount: 1,
          schema: {
            coverage: {
              totalWorkbookColumns: 12,
              importedColumnCount: 11,
              blockedColumnCount: 1,
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
                enabled: true,
                supported: true,
              },
            ],
            blockedColumns: [
              {
                headerName: "Rotukoodi",
                columnIndex: 10,
                reasonCode: "UNSUPPORTED_COLUMN",
                reasonText:
                  "Workbook column Rotukoodi is present but has no import mapping.",
              },
            ],
          },
          events: [],
          issues: [
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
  });

  it("renders a compact summary when preview is ready", () => {
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
          warningCount: 1,
          errorCount: 0,
          schema: {
            coverage: {
              totalWorkbookColumns: 0,
              importedColumnCount: 0,
              blockedColumnCount: 0,
            },
            structuralColumns: [],
            missingStructuralFields: [],
            definitionColumns: [],
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
  });
});
