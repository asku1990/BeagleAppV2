import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getBeagleDogProfileIdentityDbMock,
  getBeagleTrialsForDogDbMock,
  getBeagleTrialSummarySourceForDogDbMock,
} = vi.hoisted(() => ({
  getBeagleDogProfileIdentityDbMock: vi.fn(),
  getBeagleTrialsForDogDbMock: vi.fn(),
  getBeagleTrialSummarySourceForDogDbMock: vi.fn(),
}));

const { formatTrialAwardMock, toBusinessDateOnlyMock } = vi.hoisted(() => ({
  formatTrialAwardMock: vi.fn(),
  toBusinessDateOnlyMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getBeagleDogProfileIdentityDb: getBeagleDogProfileIdentityDbMock,
  getBeagleTrialsForDogDb: getBeagleTrialsForDogDbMock,
  getBeagleTrialSummarySourceForDogDb: getBeagleTrialSummarySourceForDogDbMock,
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
    getBeagleDogProfileIdentityDbMock.mockReset();
    getBeagleTrialsForDogDbMock.mockReset();
    getBeagleTrialSummarySourceForDogDbMock.mockReset();
    formatTrialAwardMock.mockReset();
    toBusinessDateOnlyMock.mockReset();
  });

  it("returns 400 for invalid dog id", async () => {
    const result = await getBeagleDogTrialsService("   ");

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Dog ID is required." },
    });
    expect(getBeagleDogProfileIdentityDbMock).not.toHaveBeenCalled();
    expect(getBeagleTrialsForDogDbMock).not.toHaveBeenCalled();
  });

  it("returns 404 when dog is missing", async () => {
    getBeagleDogProfileIdentityDbMock.mockResolvedValue(null);
    getBeagleTrialsForDogDbMock.mockResolvedValue([]);

    const result = await getBeagleDogTrialsService("dog_1");

    expect(result).toEqual({
      status: 404,
      body: { ok: false, error: "Dog profile not found." },
    });
  });

  it("returns mapped trials payload", async () => {
    getBeagleDogProfileIdentityDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Ajometsan Aada",
      registrationNo: "FI-11/24",
    });
    getBeagleTrialsForDogDbMock.mockResolvedValue([
      {
        id: "trial_1",
        trialEventId: "event_1",
        trialRuleWindowId: "trw_post_20230801",
        place: "Turku",
        date: new Date("2024-02-01T00:00:00.000Z"),
        weather: "L",
        koetyyppi: "NORMAL",
        koiriaLuokassa: 12,
        rank: "1",
        classCode: "A",
        award: "1",
        judge: "Chief Judge",
        points: 85.5,
        haku: 4,
        hauk: 4,
        yva: 4,
        hlo: 0,
        alo: 0,
        tja: 0,
        pin: 8,
        eras: [
          {
            era: 1,
            alkoi: "08:15",
            hakumin: 35,
            ajomin: 120,
            haku: 4,
            hauk: 4.5,
            yva: 4.25,
            hlo: 0,
            alo: 0,
            tja: 0.5,
            pin: 8,
            huomautusTeksti: "Hyvä erä",
          },
        ],
      },
    ]);
    getBeagleTrialSummarySourceForDogDbMock.mockResolvedValue({
      dogRows: [
        {
          piste: 85.5,
          haku: 4,
          hauk: 4,
          yva: 4,
          hlo: 0,
          alo: 0,
          pin: 8,
          trialRuleWindowId: "trw_range_2005_2011",
        },
      ],
      breedSummary: {
        count: 2,
        points: 80,
        haku: 3.75,
        hauk: 4,
        yva: 4,
        hlo: 0,
        alo: 0,
        mi: 7,
        pmi: null,
      },
    });
    formatTrialAwardMock.mockReturnValue("Avo 1");
    toBusinessDateOnlyMock.mockReturnValue("2024-02-01");

    const result = await getBeagleDogTrialsService(" dog_1 ");

    expect(getBeagleDogProfileIdentityDbMock).toHaveBeenCalledWith("dog_1");
    expect(getBeagleTrialsForDogDbMock).toHaveBeenCalledWith("dog_1", {
      includeEras: true,
    });
    expect(getBeagleTrialSummarySourceForDogDbMock).toHaveBeenCalledWith(
      "dog_1",
    );
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
              trialEntryId: "trial_1",
              trialId: "event_1",
              trialRuleWindowId: "trw_post_20230801",
              hasDogTrialPdf: true,
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
              eras: [
                {
                  era: 1,
                  alkoi: "08:15",
                  hakumin: 35,
                  ajomin: 120,
                  haku: 4,
                  hauk: 4.5,
                  yva: 4.25,
                  hlo: 0,
                  alo: 0,
                  tja: 0.5,
                  pin: 8,
                  huomautusTeksti: "Hyvä erä",
                },
              ],
            },
          ],
          summary: {
            allTrials: [
              {
                label: "dog",
                name: "Ajometsan Aada",
                count: 1,
                points: 85.5,
                haku: 4,
                hauk: 4,
                yva: 4,
                hlo: 0,
                alo: 0,
                mi: 8,
                pmi: null,
              },
              {
                label: "breed",
                name: "KOKO ROTU",
                count: 2,
                points: 80,
                haku: 3.75,
                hauk: 4,
                yva: 4,
                hlo: 0,
                alo: 0,
                mi: 7,
                pmi: null,
              },
            ],
          },
        },
      },
    });
  });

  it("returns 500 when db fails", async () => {
    getBeagleDogProfileIdentityDbMock.mockRejectedValue(new Error("boom"));
    getBeagleTrialsForDogDbMock.mockResolvedValue([]);

    const result = await getBeagleDogTrialsService("dog_1");

    expect(result).toEqual({
      status: 500,
      body: { ok: false, error: "Failed to load dog trials." },
    });
  });
});
