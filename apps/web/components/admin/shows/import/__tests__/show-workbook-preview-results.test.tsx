import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { MessageKey } from "@/lib/i18n/messages";
import { ShowWorkbookPreviewResults } from "../show-workbook-preview-results";

vi.mock("@/components/listing", () => ({
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
    border: "border",
    surface: "surface",
    mutedText: "muted",
  },
}));

vi.mock("@/lib/utils", () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

describe("ShowWorkbookPreviewResults", () => {
  it("renders preview rows in responsive results", () => {
    const t = ((key: MessageKey) => key) as (key: MessageKey) => string;
    const html = renderToStaticMarkup(
      React.createElement(ShowWorkbookPreviewResults, {
        t,
        issues: [
          {
            rowNumber: 2,
            columnName: "Rekisterinumero",
            severity: "ERROR",
            code: "SHOW_WORKBOOK_INVALID_REGISTRATION_NO",
            message: "Registration number has an invalid format.",
            registrationNo: "FI123",
            eventLookupKey: "event",
          },
        ],
        event: {
          eventLookupKey: "event",
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
              status: "REJECTED",
              issueCount: 1,
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
      }),
    );

    expect(html).toContain("FI123");
    expect(html).toContain("Test Dog");
    expect(html).toContain("Strong outline");
    expect(html).toContain("Registration number has an invalid format.");
  });
});
