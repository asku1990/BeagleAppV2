import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHomeStatisticsAction } from "../get-home-statistics";

const { getHomeStatisticsMock } = vi.hoisted(() => ({
  getHomeStatisticsMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  statsService: {
    getHomeStatistics: getHomeStatisticsMock,
  },
}));

describe("getHomeStatisticsAction", () => {
  beforeEach(() => {
    getHomeStatisticsMock.mockReset();
  });

  it("returns data when service succeeds", async () => {
    const data = {
      registrations: {
        registeredDogs: 10,
        youngestRegisteredBirthDate: "2026-01-01T00:00:00.000Z",
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

    getHomeStatisticsMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data },
    });

    await expect(getHomeStatisticsAction()).resolves.toEqual({
      data,
      hasError: false,
    });
  });

  it("returns error state when service fails", async () => {
    getHomeStatisticsMock.mockResolvedValue({
      status: 500,
      body: { ok: false, error: "Failed to load statistics." },
    });

    await expect(getHomeStatisticsAction()).resolves.toEqual({
      data: null,
      hasError: true,
    });
  });
});
