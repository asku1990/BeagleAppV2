import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HomeStatisticsResponse } from "@beagle/contracts";
import { useHomeStatisticsQuery } from "../use-home-statistics-query";

const { useQueryMock, getHomeStatisticsMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getHomeStatisticsMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    getHomeStatistics: getHomeStatisticsMock,
  },
}));

describe("useHomeStatisticsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getHomeStatisticsMock.mockReset();
  });

  it("configures react-query with expected cache and refresh options", () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    useHomeStatisticsQuery();

    expect(useQueryMock).toHaveBeenCalledTimes(1);
    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["home-statistics"],
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        queryFn: expect.any(Function),
      }),
    );
  });

  it("returns API data from queryFn when request succeeds", async () => {
    const data: HomeStatisticsResponse = {
      registrations: {
        registeredDogs: 99,
        youngestRegisteredBirthDate: null,
      },
      trials: {
        resultsPeriodStart: null,
        resultsPeriodEnd: null,
        totalEntries: 100,
        performedByDogs: 90,
      },
      shows: {
        resultsPeriodStart: null,
        resultsPeriodEnd: null,
        totalEntries: 80,
        performedByDogs: 70,
      },
      generatedAt: "2026-02-12T00:00:00.000Z",
    };

    getHomeStatisticsMock.mockResolvedValue({
      ok: true,
      data,
    });

    useQueryMock.mockImplementation((options) => options);
    useHomeStatisticsQuery();
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(data);
    expect(getHomeStatisticsMock).toHaveBeenCalledTimes(1);
  });

  it("throws API error text from queryFn when response is not ok", async () => {
    getHomeStatisticsMock.mockResolvedValue({
      ok: false,
      error: "backend unavailable",
    });

    useQueryMock.mockImplementation((options) => options);
    useHomeStatisticsQuery();
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow("backend unavailable");
  });
});
