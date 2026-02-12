import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHomeStatistics } from "../get-home-statistics";

const { getHomeStatisticsSnapshotMock } = vi.hoisted(() => ({
  getHomeStatisticsSnapshotMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getHomeStatisticsSnapshot: getHomeStatisticsSnapshotMock,
}));

describe("getHomeStatistics", () => {
  beforeEach(() => {
    getHomeStatisticsSnapshotMock.mockReset();
  });

  it("returns mapped statistics data on success", async () => {
    const generatedAt = new Date("2026-01-01T12:00:00.000Z");
    const youngest = new Date("2025-12-01T00:00:00.000Z");
    const trialStart = new Date("2025-01-01T00:00:00.000Z");
    const trialEnd = new Date("2025-12-31T00:00:00.000Z");

    getHomeStatisticsSnapshotMock.mockResolvedValue({
      registrations: {
        registeredDogs: 1500,
        youngestRegisteredBirthDate: youngest,
      },
      trials: {
        resultsPeriodStart: trialStart,
        resultsPeriodEnd: trialEnd,
        totalEntries: 320,
        performedByDogs: 210,
      },
      shows: {
        resultsPeriodStart: null,
        resultsPeriodEnd: null,
        totalEntries: 90,
        performedByDogs: 80,
      },
      generatedAt,
    });

    const result = await getHomeStatistics();

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      ok: true,
      data: {
        registrations: {
          registeredDogs: 1500,
          youngestRegisteredBirthDate: youngest.toISOString(),
        },
        trials: {
          resultsPeriodStart: trialStart.toISOString(),
          resultsPeriodEnd: trialEnd.toISOString(),
          totalEntries: 320,
          performedByDogs: 210,
        },
        shows: {
          resultsPeriodStart: null,
          resultsPeriodEnd: null,
          totalEntries: 90,
          performedByDogs: 80,
        },
        generatedAt: generatedAt.toISOString(),
      },
    });
  });

  it("returns null iso fields when source dates are null", async () => {
    getHomeStatisticsSnapshotMock.mockResolvedValue({
      registrations: {
        registeredDogs: 10,
        youngestRegisteredBirthDate: null,
      },
      trials: {
        resultsPeriodStart: null,
        resultsPeriodEnd: null,
        totalEntries: 1,
        performedByDogs: 1,
      },
      shows: {
        resultsPeriodStart: null,
        resultsPeriodEnd: null,
        totalEntries: 2,
        performedByDogs: 2,
      },
      generatedAt: new Date("2026-02-01T00:00:00.000Z"),
    });

    const result = await getHomeStatistics();

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected successful result.");
    }
    expect(
      result.body.data.registrations.youngestRegisteredBirthDate,
    ).toBeNull();
    expect(result.body.data.trials.resultsPeriodStart).toBeNull();
    expect(result.body.data.trials.resultsPeriodEnd).toBeNull();
    expect(result.body.data.shows.resultsPeriodStart).toBeNull();
    expect(result.body.data.shows.resultsPeriodEnd).toBeNull();
  });

  it("returns 500 when snapshot fetch fails", async () => {
    getHomeStatisticsSnapshotMock.mockRejectedValue(new Error("db failed"));

    const result = await getHomeStatistics();

    expect(result).toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load statistics.",
      },
    });
  });
});
