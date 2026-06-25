import { beforeEach, describe, expect, it, vi } from "vitest";

const { dogFindUniqueMock, prismaMock } = vi.hoisted(() => {
  const dogFindUnique = vi.fn();

  return {
    dogFindUniqueMock: dogFindUnique,
    prismaMock: {
      dog: {
        findUnique: dogFindUnique,
      },
    },
  };
});

vi.mock("../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { getBeagleDogTrialsDb } from "../get-beagle-dog-trials";

describe("getBeagleDogTrialsDb", () => {
  beforeEach(() => {
    dogFindUniqueMock.mockReset();
  });

  it("returns null when dog is not found", async () => {
    dogFindUniqueMock.mockResolvedValue(null);

    const result = await getBeagleDogTrialsDb("missing-id");

    expect(result).toBeNull();
    expect(dogFindUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "missing-id" },
      }),
    );
  });

  it("maps trials with the expected public row shape", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog_1",
      name: "Ajometsan Aada",
      registrations: [{ registrationNo: "FI-11/24" }],
      trialEntries: [
        {
          id: "trial_1",
          ke: "L",
          koetyyppi: "NORMAL",
          lk: "A",
          sija: "1",
          koiriaLuokassa: 12,
          piste: {
            toNumber: () => 85.5,
          },
          pa: "Beaj 1",
          tuom1: "Judge A",
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
          trialEvent: {
            id: "event_1",
            koekunta: "Turku",
            koepaiva: new Date("2024-02-01"),
            ylituomariNimi: null,
          },
        },
      ],
    });

    const result = await getBeagleDogTrialsDb("dog_1");

    expect(result).toEqual({
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
          award: "Beaj 1",
          judge: "Judge A",
          haku: 4,
          hauk: 4,
          yva: 4,
          hlo: 0,
          alo: 0,
          tja: 0,
          pin: 8,
        },
      ],
    });
  });
});
