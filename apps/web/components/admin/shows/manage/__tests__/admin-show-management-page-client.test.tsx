import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShowManagementPageClient } from "../admin-show-management-page-client";

const { searchQueryMock, detailQueryMock } = vi.hoisted(() => ({
  searchQueryMock: vi.fn(),
  detailQueryMock: vi.fn(),
}));

vi.mock("@web/queries/admin/shows/manage/use-admin-show-events-query", () => ({
  useAdminShowEventsQuery: searchQueryMock,
}));

vi.mock("@web/queries/admin/shows/manage/use-admin-show-event-query", () => ({
  useAdminShowEventQuery: detailQueryMock,
}));

vi.mock("@web/components/listing", () => ({
  ListingSectionShell: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
}));

vi.mock("@web/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) =>
    asChild
      ? React.createElement(React.Fragment, null, children)
      : React.createElement(
          "button",
          props as Record<string, string>,
          children,
        ),
}));

vi.mock("@web/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@web/components/ui/input", () => ({
  Input: (props: Record<string, unknown>) =>
    React.createElement("input", props as Record<string, string>),
}));

vi.mock("@web/components/ui/separator", () => ({
  Separator: () => React.createElement("hr", null),
}));

describe("AdminShowManagementPageClient", () => {
  beforeEach(() => {
    searchQueryMock.mockReset();
    detailQueryMock.mockReset();

    searchQueryMock.mockReturnValue({
      data: {
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            showId: "show-1",
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            eventCity: "Helsinki",
            eventName: "Summer Show",
            eventType: "A",
            organizer: "Beagle Club",
            judge: "Judge",
            dogCount: 1,
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    detailQueryMock.mockReturnValue({
      data: {
        show: {
          showId: "show-1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          eventCity: "Helsinki",
          eventName: "Summer Show",
          eventType: "A",
          organizer: "Beagle Club",
          judge: "Judge",
          dogCount: 1,
          entries: [
            {
              id: "entry-1",
              registrationNo: "FI12345/21",
              dogName: "Metsapolun Kide",
              judge: "Judge",
              critiqueText: "Erittäin tasapainoinen esiintyminen.",
              heightCm: "38",
              classCode: "AVO",
              qualityGrade: "ERI",
              classPlacement: "1",
              pupn: "PU1",
              awards: ["SERT", "VSP"],
              classDisplay: "AVO 1",
              qualityDisplay: "ERI",
              pupnDisplay: "PU1",
              awardsDisplay: ["SERT", "VSP"],
            },
          ],
        },
        options: {
          classOptions: [{ value: "AVO", label: "AVO" }],
          qualityOptions: [{ value: "ERI", label: "ERI" }],
          awardOptions: [
            { value: "SERT", label: "SERT" },
            { value: "VSP", label: "VSP" },
          ],
          pupnOptions: [
            { value: "PU1", label: "PU1" },
            { value: "PN1", label: "PN1" },
          ],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("renders the live show management shell", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminShowManagementPageClient),
    );

    expect(html).toContain("Show management");
    expect(html).toContain(
      "Search shows, open one event, and edit its entries from the live read layer.",
    );
    expect(html).toContain("Summer Show");
    expect(html).toContain("Helsinki");
    expect(html).toContain("Metsapolun Kide");
    expect(html).toContain("Dog evaluations");
    expect(html).not.toContain("Apply event changes");
    expect(html).not.toContain("Apply entry changes");
  });
});
