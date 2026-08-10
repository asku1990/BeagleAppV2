import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialsPageClient } from "../admin-trials-page-client";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));
const eventQueryMock = vi.hoisted(() => vi.fn());
const resultsPropsRef = vi.hoisted(() => ({
  current: null as null | {
    onOpenEvent: (trialEventId: string) => void;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../admin-trial-events-filters", () => ({
  AdminTrialEventsFilters: ({
    mode,
    query,
    yearInput,
    dateFrom,
    dateTo,
    sort,
    filterError,
  }: {
    mode: string;
    query: string;
    yearInput: string;
    dateFrom: string;
    dateTo: string;
    sort: string;
    filterError: string | null;
  }) =>
    React.createElement(
      "section",
      { "data-testid": "filters" },
      `${mode}|${query}|${yearInput}|${dateFrom}|${dateTo}|${sort}|${filterError ?? ""}`,
    ),
}));

vi.mock("../admin-trial-events-results", () => ({
  AdminTrialEventsResults: ({
    totalCount,
    page,
    totalPages,
    errorText,
    onOpenEvent,
  }: {
    totalCount: number;
    page: number;
    totalPages: number;
    errorText: string;
    onOpenEvent: (trialEventId: string) => void;
  }) => {
    resultsPropsRef.current = { onOpenEvent };
    return React.createElement(
      "section",
      { "data-testid": "events" },
      `${totalCount}|${page}|${totalPages}|${errorText}`,
    );
  },
}));

vi.mock("@/queries/admin/trials", () => ({
  useAdminTrialEventsQuery: () => ({
    data: {
      total: 2,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: "Kevatkoe",
          jarjestaja: "Jarjestaja",
          ylituomari: "Judge",
          ylituomariNumero: null,
          ytKertomus: null,
          kennelpiiri: null,
          kennelpiirinro: null,
          sklKoeId: 12345,
          dogCount: 2,
        },
        {
          trialEventId: "event-2",
          eventDate: "2026-04-13",
          eventPlace: "Espoo",
          eventName: "Talvikoe",
          jarjestaja: "Jarjestaja",
          ylituomari: "Judge",
          ylituomariNumero: null,
          ytKertomus: null,
          kennelpiiri: null,
          kennelpiirinro: null,
          sklKoeId: 22222,
          dogCount: 1,
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useAdminTrialEventQuery: eventQueryMock,
}));

describe("AdminTrialsPageClient", () => {
  it("renders the navigation-only event index", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialsPageClient),
    );

    expect(html).toContain("admin.trials.title");
    expect(html).toContain("admin.trials.description");
    expect(html).toContain("admin.trials.manage.create.action");
    expect(html).toContain("/admin/trials/new");
    expect(html).toContain("year|||");
    expect(html).toContain("2|1|1|admin.trials.manage.error");
    expect(html).not.toContain('data-testid="selected"');
    expect(eventQueryMock).not.toHaveBeenCalled();
  });

  it("opens the exact encoded event workspace", () => {
    renderToStaticMarkup(React.createElement(AdminTrialsPageClient));

    resultsPropsRef.current?.onOpenEvent("event/with spaces");

    expect(pushMock).toHaveBeenCalledWith(
      "/admin/trials/event%2Fwith%20spaces",
    );
  });
});
