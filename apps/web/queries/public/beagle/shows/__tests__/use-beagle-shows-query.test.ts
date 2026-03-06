import { beforeEach, describe, expect, it, vi } from "vitest";
import { beagleShowSearchQueryKey } from "../query-keys";
import { useBeagleShowsQuery } from "../use-beagle-shows-query";

const { useQueryMock, searchBeagleShowsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  searchBeagleShowsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/public/beagle/shows/search-shows", () => ({
  searchBeagleShowsAction: searchBeagleShowsActionMock,
}));

describe("useBeagleShowsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    searchBeagleShowsActionMock.mockReset();
  });

  it("uses expected query key", () => {
    useQueryMock.mockImplementation((options) => options);
    const input = {
      year: 2025,
      page: 2,
      pageSize: 25,
      sort: "date-asc" as const,
    };

    useBeagleShowsQuery(input);

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
    };
    expect(options.queryKey).toEqual(beagleShowSearchQueryKey(input));
  });

  it("returns data when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    const data = {
      filters: {
        mode: "year" as const,
        year: 2025,
        dateFrom: null,
        dateTo: null,
      },
      availableYears: [2025],
      total: 1,
      totalPages: 1,
      page: 1,
      items: [],
    };
    searchBeagleShowsActionMock.mockResolvedValue({
      hasError: false,
      status: 200,
      data,
    });

    useBeagleShowsQuery({ year: 2025 });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(data);
    expect(searchBeagleShowsActionMock).toHaveBeenCalledWith({ year: 2025 });
  });

  it("throws mapped action error", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchBeagleShowsActionMock.mockResolvedValue({
      hasError: true,
      status: 400,
      data: null,
      error: "Invalid year value.",
    });

    useBeagleShowsQuery({ year: 1000 });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Invalid year value.",
      status: 400,
    });
  });

  it("throws fallback message when action error text is missing", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchBeagleShowsActionMock.mockResolvedValue({
      hasError: true,
      status: 500,
      data: null,
    });

    useBeagleShowsQuery({ year: 2025 });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Failed to load beagle shows.",
      status: 500,
    });
  });
});
