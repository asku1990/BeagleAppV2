import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HomeStatisticsResponse } from "@beagle/contracts";
import { useHomeStatisticsQuery } from "../use-home-statistics-query";

const { useQueryMock, getHomeStatisticsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getHomeStatisticsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/home/get-home-statistics", () => ({
  getHomeStatisticsAction: getHomeStatisticsActionMock,
}));

describe("useHomeStatisticsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getHomeStatisticsActionMock.mockReset();
  });

  it("configures react-query with expected options", () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isError: false,
    });
    useHomeStatisticsQuery();

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

  it("queryFn returns data when action succeeds", async () => {
    const data: HomeStatisticsResponse = {
      registrations: {
        registeredDogs: 10,
        youngestRegisteredBirthDate: null,
      },
      trials: {
        resultsPeriodStart: null,
        resultsPeriodEnd: null,
        totalEntries: 20,
        performedByDogs: 7,
      },
      shows: {
        resultsPeriodStart: null,
        resultsPeriodEnd: null,
        totalEntries: 12,
        performedByDogs: 5,
      },
      generatedAt: "2026-02-12T00:00:00.000Z",
    };
    getHomeStatisticsActionMock.mockResolvedValue({ data, hasError: false });
    useQueryMock.mockImplementation((options) => options);

    useHomeStatisticsQuery();
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(data);
  });

  it("queryFn throws when action fails", async () => {
    getHomeStatisticsActionMock.mockResolvedValue({
      data: null,
      hasError: true,
    });
    useQueryMock.mockImplementation((options) => options);

    useHomeStatisticsQuery();
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to refresh home statistics.",
    );
  });
});
