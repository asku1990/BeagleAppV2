import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ShowWorkbookPreviewSection } from "../show-workbook-preview-section";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "fi",
  }),
}));

vi.mock("@/components/listing", () => ({
  ListingSectionShell: ({
    title,
    count,
    children,
  }: {
    title: React.ReactNode;
    count?: React.ReactNode;
    children: React.ReactNode;
  }) => React.createElement("section", null, title, count ?? null, children),
  ListingResponsiveResults: ({
    desktop,
    mobile,
  }: {
    desktop: React.ReactNode;
    mobile: React.ReactNode;
  }) => React.createElement("div", null, desktop, mobile),
}));

vi.mock("@/components/ui/beagle-theme", () => ({
  beagleTheme: {
    panel: "panel",
    headingLg: "heading-lg",
    headingMd: "heading-md",
    inkStrongText: "ink-strong",
    mutedText: "muted",
    border: "border",
    surface: "surface",
  },
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  CardHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  CardTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h3", null, children),
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

vi.mock("@/lib/utils", () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

describe("ShowWorkbookPreviewSection", () => {
  it("renders page-level preview content", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowWorkbookPreviewSection, {
        preview: {
          fileName: "Näyttelyt.xlsx",
          sheetName: "Näyttelyt 2024",
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
              totalWorkbookColumns: 0,
              importedColumnCount: 0,
              blockedColumnCount: 0,
            },
            structuralColumns: [],
            missingStructuralFields: [],
            definitionColumns: [],
            blockedColumns: [],
          },
          events: [
            {
              eventLookupKey: "2024-01-01|helsinki|messukeskus|n",
              groupLabel: "Helsinki, Messukeskus",
              eventDateIso: "2024-01-01",
              eventCity: "Helsinki",
              eventPlace: "Messukeskus",
              eventType: "Kansainvälinen näyttely",
              entries: [
                {
                  rowNumber: 2,
                  registrationNo: "FI123",
                  dogName: "Test Dog",
                  dogMatched: false,
                  status: "ACCEPTED",
                  issueCount: 2,
                  judge: "Judge One",
                  critiqueText: "Strong outline",
                  classValue: "AVO",
                  qualityValue: "ERI",
                  resultItems: [
                    {
                      columnName: "Luokka",
                      definitionCode: "AVO",
                      valueCode: null,
                      valueNumeric: null,
                    },
                  ],
                },
              ],
            },
          ],
          issues: [
            {
              rowNumber: 2,
              columnName: "Laatuarvostelu",
              severity: "WARNING",
              code: "SHOW_WORKBOOK_REVIEW_REQUIRED",
              message: "Review this row for a warning.",
              registrationNo: "FI123",
              eventLookupKey: "2024-01-01|Helsinki|Messukeskus|N",
            },
            {
              rowNumber: 2,
              columnName: "Rekisterinumero",
              severity: "ERROR",
              code: "SHOW_WORKBOOK_INVALID_REGISTRATION_NO",
              message: "Registration number has an invalid format.",
              registrationNo: "FI123",
              eventLookupKey: "2024-01-01|Helsinki|Messukeskus|N",
            },
          ],
        },
      }),
    );

    expect(html).toContain("admin.shows.preview.title");
    expect(html).toContain("admin.shows.preview.filters.label");
    expect(html).toContain("admin.shows.preview.filters.warnings");
    expect(html).toContain("Helsinki, Messukeskus");
    expect(html).toContain("Test Dog");
    expect(html).not.toContain("Näyttelyt.xlsx");
    expect(html).not.toContain("admin.shows.preview.summary.errors");
  });
});
