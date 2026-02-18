import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BeagleSearchPage } from "../beagle-search-page";

const {
  useBeagleSearchUiStateMock,
  useBeagleSearchQueryMock,
  useBeagleNewestQueryMock,
} = vi.hoisted(() => ({
  useBeagleSearchUiStateMock: vi.fn(),
  useBeagleSearchQueryMock: vi.fn(),
  useBeagleNewestQueryMock: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) =>
    React.createElement("img", props),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/beagle-search", () => ({
  useBeagleSearchUiState: useBeagleSearchUiStateMock,
}));

vi.mock("@/queries/beagle-search/use-beagle-search-query", () => ({
  useBeagleSearchQuery: useBeagleSearchQueryMock,
}));

vi.mock("@/queries/beagle-search/use-beagle-newest-query", () => ({
  useBeagleNewestQuery: useBeagleNewestQueryMock,
}));

function baseUiState() {
  return {
    formState: {
      ek: "",
      reg: "",
      name: "",
      sex: "any" as const,
      birthYearFrom: "",
      birthYearTo: "",
      ekOnly: false,
      multipleRegsOnly: false,
    },
    urlState: {
      ek: "",
      reg: "",
      name: "",
      sex: "any" as const,
      birthYearFrom: "",
      birthYearTo: "",
      ekOnly: false,
      multipleRegsOnly: false,
      page: 1,
      pageSize: 10,
      sort: "name-asc" as const,
      adv: false,
    },
    isPending: false,
    setFormField: vi.fn(),
    submitSearch: vi.fn(),
    resetSearch: vi.fn(),
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    setSort: vi.fn(),
    setSex: vi.fn(),
    setBirthYearFrom: vi.fn(),
    setBirthYearTo: vi.fn(),
    setEkOnly: vi.fn(),
    setMultipleRegsOnly: vi.fn(),
    toggleAdvanced: vi.fn(),
  };
}

describe("BeagleSearchPage", () => {
  beforeEach(() => {
    useBeagleSearchUiStateMock.mockReset();
    useBeagleSearchQueryMock.mockReset();
    useBeagleNewestQueryMock.mockReset();

    useBeagleSearchUiStateMock.mockReturnValue(baseUiState());
    useBeagleSearchQueryMock.mockReturnValue({
      data: null,
      isFetching: false,
      isError: false,
    });
    useBeagleNewestQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
  });

  it("renders loading state while search fetch is pending", () => {
    useBeagleSearchQueryMock.mockReturnValue({
      data: null,
      isFetching: true,
      isError: false,
    });

    const html = renderToStaticMarkup(React.createElement(BeagleSearchPage));
    expect(html).toContain('data-slot="skeleton"');
  });

  it("renders error empty state when search fails", () => {
    useBeagleSearchQueryMock.mockReturnValue({
      data: null,
      isFetching: false,
      isError: true,
    });

    const html = renderToStaticMarkup(React.createElement(BeagleSearchPage));
    expect(html).toContain("search.empty.fetchFailed");
  });

  it("renders start empty state when mode is none", () => {
    useBeagleSearchQueryMock.mockReturnValue({
      data: {
        mode: "none",
        total: 0,
        totalPages: 0,
        page: 1,
        items: [],
      },
      isFetching: false,
      isError: false,
    });

    const html = renderToStaticMarkup(React.createElement(BeagleSearchPage));
    expect(html).toContain("search.empty.start");
  });

  it("renders results table/cards and pagination when search has items", () => {
    useBeagleSearchQueryMock.mockReturnValue({
      data: {
        mode: "name",
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            id: "d1",
            ekNo: 1,
            registrationNo: "FI-1/24",
            registrationNos: ["FI-1/24"],
            createdAt: "2026-01-01T00:00:00.000Z",
            sex: "U",
            name: "Alpha",
            birthDate: null,
            sire: "S",
            dam: "D",
            trialCount: 1,
            showCount: 1,
          },
        ],
      },
      isFetching: false,
      isError: false,
    });

    const html = renderToStaticMarkup(React.createElement(BeagleSearchPage));
    expect(html).toContain("FI-1/24");
    expect(html).toContain("search.pagination.range");
    expect(html).toContain("search.results.count 1");
  });
});
