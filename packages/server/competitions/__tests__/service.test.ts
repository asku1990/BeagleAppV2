import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCompetitionsService } from "../service";
import { getCurrentBestDriverSeason } from "../best-driver/internal/season";

const { getBestDriverSourceDbMock } = vi.hoisted(() => ({
  getBestDriverSourceDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getBestDriverSourceDb: getBestDriverSourceDbMock,
}));

describe("competitions service", () => {
  beforeEach(() => {
    getBestDriverSourceDbMock.mockReset();
  });

  it("rejects seasons before the supported v1 range", async () => {
    const service = createCompetitionsService();

    await expect(
      service.getBestDriverRanking({ season: 2015 }),
    ).resolves.toEqual({
      status: 400,
      body: { ok: false, error: "Invalid season value." },
    });
    expect(getBestDriverSourceDbMock).not.toHaveBeenCalled();
  });

  it("accepts the first supported season and filters older inferred seasons", async () => {
    getBestDriverSourceDbMock.mockResolvedValue({
      availableEventDates: [
        new Date("2015-08-02T00:00:00.000Z"),
        new Date("2016-02-28T00:00:00.000Z"),
        new Date("2016-08-02T00:00:00.000Z"),
      ],
      candidates: [],
    });
    const service = createCompetitionsService();

    const result = await service.getBestDriverRanking({ season: 2016 });

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true response");
    expect(result.body.data.season).toBe(2016);
    expect(result.body.data.availableSeasons).toEqual(
      [...new Set([getCurrentBestDriverSeason(), 2016])].sort(
        (left, right) => right - left,
      ),
    );
  });
});
