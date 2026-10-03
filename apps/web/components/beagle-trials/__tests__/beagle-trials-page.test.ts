import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BeagleTrialsPage } from "../beagle-trials-page";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useEffect: (effect: () => void) => effect(),
  };
});

const { useBeagleTrialsUiStateMock, useBeagleTrialsQueryMock } = vi.hoisted(
  () => ({
    useBeagleTrialsUiStateMock: vi.fn(),
    useBeagleTrialsQueryMock: vi.fn(),
  }),
);

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) =>
    React.createElement("img", props),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "fi",
  }),
}));

vi.mock("@/hooks/public/beagle/trials", () => ({
  useBeagleTrialsUiState: useBeagleTrialsUiStateMock,
}));

vi.mock("@/queries/public/beagle/trials/use-beagle-trials-query", () => ({
  useBeagleTrialsQuery: useBeagleTrialsQueryMock,
}));

function baseUiState() {
  return {
    formState: {
      mode: "season" as const,
      season: "",
      dateFrom: "",
      dateTo: "",
    },
    urlState: {
      mode: "season" as const,
      season: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
      pageSize: 10,
      sort: "date-desc" as const,
    },
    isPending: false,
    setMode: vi.fn(),
    setSeason: vi.fn(),
    setDefaultSeason: vi.fn(),
    setDateFrom: vi.fn(),
    setDateTo: vi.fn(),
    submitSearch: vi.fn(),
    resetSearch: vi.fn(),
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    setSort: vi.fn(),
  };
}

describe("BeagleTrialsPage", () => {
  beforeEach(() => {
    useBeagleTrialsUiStateMock.mockReset();
    useBeagleTrialsQueryMock.mockReset();

    useBeagleTrialsUiStateMock.mockReturnValue(baseUiState());
    useBeagleTrialsQueryMock.mockReturnValue({
      data: null,
      isFetching: false,
      isError: false,
      error: null,
    });
  });

  it("renders loading state while fetch is pending", () => {
    useBeagleTrialsQueryMock.mockReturnValue({
      data: null,
      isFetching: true,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(React.createElement(BeagleTrialsPage));
    expect(html).toContain('data-slot="skeleton"');
  });

  it("renders error state when fetch fails", () => {
    useBeagleTrialsQueryMock.mockReturnValue({
      data: null,
      isFetching: false,
      isError: true,
      error: new Error("Show fetch failed"),
    });

    const html = renderToStaticMarkup(React.createElement(BeagleTrialsPage));
    expect(html).toContain("Show fetch failed");
  });

  it("renders empty state when no rows are returned", () => {
    useBeagleTrialsQueryMock.mockReturnValue({
      data: {
        filters: {
          mode: "season",
          season: "2025-2026",
          dateFrom: null,
          dateTo: null,
        },
        availableSeasons: ["2025-2026"],
        total: 0,
        totalPages: 0,
        page: 1,
        items: [],
        searchSummary: {
          trialCount: 0,
          entryCount: 0,
          awarded: { count: 0, percentage: 0 },
          first: { count: 0, percentage: 0 },
          second: { count: 0, percentage: 0 },
          third: { count: 0, percentage: 0 },
          noPrize: { count: 0, percentage: 0 },
          withdrew: { count: 0, percentage: 0 },
          excluded: { count: 0, percentage: 0 },
        },
        awardSummary: {
          dateFrom: "2005-08-20",
          dateTo: "2026-02-28",
          rows: [
            {
              trialType: "long",
              first: { count: 1, percentage: 100 },
              second: { count: 0, percentage: 0 },
              third: { count: 0, percentage: 0 },
              noPrize: { count: 0, percentage: 0 },
              withdrew: { count: 0, percentage: 0 },
              excluded: { count: 0, percentage: 0 },
              awarded: { count: 1, percentage: 100 },
              total: 1,
            },
          ],
        },
      },
      isFetching: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(React.createElement(BeagleTrialsPage));
    expect(html).toContain("trials.empty.noResults");
    expect(html).toContain("trials.awardSummary.title");
  });

  it("adopts the resolved default season for URL state", () => {
    const uiState = baseUiState();
    useBeagleTrialsUiStateMock.mockReturnValue(uiState);
    useBeagleTrialsQueryMock.mockReturnValue({
      data: {
        filters: {
          mode: "season",
          season: "2025-2026",
          dateFrom: null,
          dateTo: null,
        },
        availableSeasons: ["2025-2026"],
        total: 0,
        totalPages: 0,
        page: 1,
        items: [],
        awardSummary: { dateFrom: null, dateTo: null, rows: [] },
        searchSummary: {
          trialCount: 0,
          entryCount: 0,
          awarded: { count: 0, percentage: 0 },
          first: { count: 0, percentage: 0 },
          second: { count: 0, percentage: 0 },
          third: { count: 0, percentage: 0 },
          noPrize: { count: 0, percentage: 0 },
          withdrew: { count: 0, percentage: 0 },
          excluded: { count: 0, percentage: 0 },
        },
      },
      isFetching: false,
      isError: false,
      error: null,
    });

    renderToStaticMarkup(React.createElement(BeagleTrialsPage));

    expect(uiState.setDefaultSeason).toHaveBeenCalledWith("2025-2026");
  });

  it("renders desktop/mobile results and pagination when rows exist", () => {
    useBeagleTrialsQueryMock.mockReturnValue({
      data: {
        filters: {
          mode: "season",
          season: "2025-2026",
          dateFrom: null,
          dateTo: null,
        },
        availableSeasons: ["2025-2026"],
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            trialId: "s_1",
            pdfTrialEntryIds: ["entry_1"],
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            judge: "Judge Main",
            dogCount: 9,
            weather: { kind: "single", value: "P" },
            average: 75.5,
          },
        ],
        awardSummary: {
          dateFrom: "2005-08-20",
          dateTo: "2026-02-28",
          rows: [
            {
              trialType: "normal",
              first: { count: 1, percentage: 25 },
              second: { count: 1, percentage: 25 },
              third: { count: 0, percentage: 0 },
              noPrize: { count: 2, percentage: 50 },
              withdrew: { count: 0, percentage: 0 },
              excluded: { count: 0, percentage: 0 },
              awarded: { count: 2, percentage: 50 },
              total: 4,
            },
          ],
        },
        searchSummary: {
          trialCount: 2,
          entryCount: 4,
          awarded: { count: 2, percentage: 50 },
          first: { count: 1, percentage: 25 },
          second: { count: 1, percentage: 25 },
          third: { count: 0, percentage: 0 },
          noPrize: { count: 2, percentage: 50 },
          withdrew: { count: 0, percentage: 0 },
          excluded: { count: 0, percentage: 0 },
        },
      },
      isFetching: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(React.createElement(BeagleTrialsPage));

    expect(html).toContain("trials.results.count 1");
    expect(html).toContain("Helsinki");
    expect(html).toContain("Judge Main");
    expect(html).toContain("75.50");
    expect(html).toContain("trials.results.col.weather");
    expect(html).toContain("trials.results.col.average");
    expect(html).toContain("trials.results.weather.bareGround");
    expect(html).toContain("trials.results.copy.button");
    expect(html).toContain('href="/beagle/trials/s_1"');
    expect(html).not.toContain("trials.results.open");
    expect(html).not.toContain("trials.results.col.details");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('aria-label="trials.results.actions.pdf"');
    expect(html).toContain("trials.pagination.range 1-1 / 1");
    expect(html).toContain("trials.awardSummary.title");
    expect(html).toContain("1 (25.00%)");
    expect(html).toContain("trials.searchSummary.title");
    expect(html).toContain("trials.searchSummary.row.entries");
    expect(html).toContain("trials.results.filter.season 2025-2026");
  });
});
