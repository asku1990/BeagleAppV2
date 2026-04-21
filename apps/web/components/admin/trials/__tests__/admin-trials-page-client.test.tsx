import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialsPageClient } from "../admin-trials-page-client";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
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
    selectedEventId,
    errorText,
  }: {
    totalCount: number;
    page: number;
    totalPages: number;
    selectedEventId?: string;
    errorText: string;
  }) =>
    React.createElement(
      "section",
      { "data-testid": "events" },
      `${totalCount}|${page}|${totalPages}|${selectedEventId ?? ""}|${errorText}`,
    ),
}));

vi.mock("../admin-trial-selected-event-panel", () => ({
  AdminTrialSelectedEventPanel: ({
    selectedEvent,
    isLoading,
    isError,
    errorText,
  }: {
    selectedEvent: { trialEventId: string } | null;
    isLoading: boolean;
    isError: boolean;
    errorText: string;
  }) =>
    React.createElement(
      "section",
      { "data-testid": "selected" },
      `${selectedEvent?.trialEventId ?? ""}|${isLoading}|${isError}|${errorText}`,
    ),
}));

vi.mock("@/queries/admin/trials", () => ({
  useAdminTrialEventsQuery: () => ({
    data: {
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: "Kevatkoe",
          organizer: "Jarjestaja",
          judge: "Judge",
          sklKoeId: 12345,
          dogCount: 2,
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useAdminTrialEventQuery: () => ({
    data: {
      event: {
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        eventName: "Kevatkoe",
        organizer: "Jarjestaja",
        judge: "Judge",
        sklKoeId: 12345,
        koemuoto: "AJOK",
        dogCount: 2,
        entries: [],
      },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

describe("AdminTrialsPageClient", () => {
  it("passes coordinator state into the split admin trials panels", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialsPageClient),
    );

    expect(html).toContain("admin.trials.title");
    expect(html).toContain("admin.trials.description");
    expect(html).toContain("year|||");
    expect(html).toContain("1|1|1|event-1|admin.trials.manage.error");
    expect(html).toContain(
      "event-1|false|false|admin.trials.manage.selected.error",
    );
  });
});
