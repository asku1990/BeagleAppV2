import { beforeEach, describe, expect, it, vi } from "vitest";
import { beagleTrialSearchQueryKey } from "../query-keys";
import { useBeagleTrialsQuery } from "../use-beagle-trials-query";

const { useQueryMock, searchBeagleTrialsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  searchBeagleTrialsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/public/beagle/trials/search-trials", () => ({
  searchBeagleTrialsAction: searchBeagleTrialsActionMock,
}));

describe("useBeagleTrialsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    searchBeagleTrialsActionMock.mockReset();
  });

  it("uses expected query key", () => {
    useQueryMock.mockImplementation((options) => options);
    const input = {
      year: 2025,
      page: 2,
      pageSize: 25,
      sort: "date-asc" as const,
    };

    useBeagleTrialsQuery(input);

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
    };
    expect(options.queryKey).toEqual(beagleTrialSearchQueryKey(input));
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
    searchBeagleTrialsActionMock.mockResolvedValue({
      hasError: false,
      status: 200,
      data,
    });

    useBeagleTrialsQuery({ year: 2025 });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(data);
    expect(searchBeagleTrialsActionMock).toHaveBeenCalledWith({ year: 2025 });
  });

  it("throws mapped action error", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchBeagleTrialsActionMock.mockResolvedValue({
      hasError: true,
      status: 400,
      data: null,
      error: "Invalid year value.",
    });

    useBeagleTrialsQuery({ year: 1000 });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Invalid year value.",
      status: 400,
    });
  });
});
