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
            koepaiva: new Date("2024-02-01T00:00:00.000Z"),
            ylituomariNimi: "Chief Judge",
          },
        },
      ],
    });

    const result = await getBeagleDogTrialsDb("dog_1");

    expect(result).toMatchObject({
      id: "dog_1",
      name: "Ajometsan Aada",
      registrationNo: "FI-11/24",
      trials: [
        {
          id: "trial_1",
          trialId: "event_1",
          place: "Turku",
          weather: "L",
          koetyyppi: "NORMAL",
          koiriaLuokassa: 12,
          rank: "1",
          pa: "Beaj 1",
          lk: "A",
          tuom1: "Judge A",
          ylituomariNimi: "Chief Judge",
        },
      ],
    });
    expect(result?.trials[0]?.date).toEqual(
      new Date("2024-02-01T00:00:00.000Z"),
    );
    expect(result?.trials[0]?.points).toEqual({
      toNumber: expect.any(Function),
    });
  });
});
