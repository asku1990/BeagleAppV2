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
      season: "2025-2026",
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
        mode: "season" as const,
        season: "2025-2026",
        dateFrom: null,
        dateTo: null,
      },
      availableSeasons: ["2025-2026"],
      total: 1,
      totalPages: 1,
      page: 1,
      items: [],
      awardSummary: { dateFrom: null, dateTo: null, rows: [] },
    };
    searchBeagleTrialsActionMock.mockResolvedValue({
      hasError: false,
      status: 200,
      data,
    });

    useBeagleTrialsQuery({ season: "2025-2026" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(data);
    expect(searchBeagleTrialsActionMock).toHaveBeenCalledWith({
      season: "2025-2026",
    });
  });

  it("throws mapped action error", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchBeagleTrialsActionMock.mockResolvedValue({
      hasError: true,
      status: 400,
      data: null,
      error: "Invalid season value.",
    });

    useBeagleTrialsQuery({ season: "1000-1001" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Invalid season value.",
      status: 400,
    });
  });
});
