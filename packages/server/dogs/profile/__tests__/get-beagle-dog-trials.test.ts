import { beforeEach, describe, expect, it, vi } from "vitest";

const { getBeagleDogTrialsDbMock } = vi.hoisted(() => ({
  getBeagleDogTrialsDbMock: vi.fn(),
}));

const { formatTrialAwardMock, toBusinessDateOnlyMock } = vi.hoisted(() => ({
  formatTrialAwardMock: vi.fn(),
  toBusinessDateOnlyMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getBeagleDogTrialsDb: getBeagleDogTrialsDbMock,
}));

vi.mock("@server/core/date-only", () => ({
  toBusinessDateOnly: toBusinessDateOnlyMock,
}));

vi.mock("@server/trials/core", () => ({
  formatTrialAward: formatTrialAwardMock,
}));

import { getBeagleDogTrialsService } from "../get-beagle-dog-trials";

describe("getBeagleDogTrialsService", () => {
  beforeEach(() => {
    getBeagleDogTrialsDbMock.mockReset();
    formatTrialAwardMock.mockReset();
    toBusinessDateOnlyMock.mockReset();
  });

  it("returns 400 for invalid dog id", async () => {
    const result = await getBeagleDogTrialsService("   ");

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Dog ID is required." },
    });
    expect(getBeagleDogTrialsDbMock).not.toHaveBeenCalled();
  });

  it("returns 404 when dog is missing", async () => {
    getBeagleDogTrialsDbMock.mockResolvedValue(null);

    const result = await getBeagleDogTrialsService("dog_1");

    expect(result).toEqual({
      status: 404,
      body: { ok: false, error: "Dog profile not found." },
    });
  });

  it("returns mapped trials payload", async () => {
    getBeagleDogTrialsDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Ajometsan Aada",
      registrationNo: "FI-11/24",
      trials: [
        {
          id: "trial_1",
          trialId: "event_1",
          place: "Turku",
          date: new Date("2024-02-01T00:00:00.000Z"),
          weather: "L",
          koetyyppi: "NORMAL",
          koiriaLuokassa: 12,
          rank: "1",
          pa: "1",
          lk: "A",
          tuom1: " ",
          ylituomariNimi: "Chief Judge",
          points: {
            toNumber: () => 85.5,
          },
          haku: {
            toNumber: () => 4,
          },
          hauk: {
            toNumber: () => 4,
          },
          yva: {
            toNumber: () => 4,
          },
          hlo: {
            toNumber: () => 0,
          },
          alo: {
            toNumber: () => 0,
          },
          tja: {
            toNumber: () => 0,
          },
          pin: {
            toNumber: () => 8,
          },
        },
      ],
    });
    formatTrialAwardMock.mockReturnValue("Avo 1");
    toBusinessDateOnlyMock.mockReturnValue("2024-02-01");

    const result = await getBeagleDogTrialsService(" dog_1 ");

    expect(getBeagleDogTrialsDbMock).toHaveBeenCalledWith("dog_1");
    expect(toBusinessDateOnlyMock).toHaveBeenCalledWith(
      new Date("2024-02-01T00:00:00.000Z"),
    );
    expect(formatTrialAwardMock).toHaveBeenCalledWith("1", "A");
    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Ajometsan Aada",
          registrationNo: "FI-11/24",
          trials: [
            {
              id: "trial_1",
              trialId: "event_1",
              place: "Turku",
              date: "2024-02-01",
              weather: "L",
              koetyyppi: "NORMAL",
              koiriaLuokassa: 12,
              rank: "1",
              points: 85.5,
              award: "Avo 1",
              judge: "Chief Judge",
              haku: 4,
              hauk: 4,
              yva: 4,
              hlo: 0,
              alo: 0,
              tja: 0,
              pin: 8,
            },
          ],
        },
      },
    });
  });

  it("returns 500 when db fails", async () => {
    getBeagleDogTrialsDbMock.mockRejectedValue(new Error("boom"));

    const result = await getBeagleDogTrialsService("dog_1");

    expect(result).toEqual({
      status: 500,
      body: { ok: false, error: "Failed to load dog trials." },
    });
  });
});
