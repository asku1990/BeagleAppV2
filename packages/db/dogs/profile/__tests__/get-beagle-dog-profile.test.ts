import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex, Prisma } from "@prisma/client";
const Decimal = Prisma.Decimal;

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

import { getBeagleDogProfileDb } from "../get-beagle-dog-profile";

function makeRegistration(no: string, dateStr: string) {
  return { registrationNo: no, createdAt: new Date(dateStr) };
}

describe("getBeagleDogProfileDb", () => {
  beforeEach(() => {
    dogFindUniqueMock.mockReset();
  });

  it("returns null when dog is not found", async () => {
    dogFindUniqueMock.mockResolvedValue(null);

    const result = await getBeagleDogProfileDb("missing-id");

    expect(result).toBeNull();
    expect(dogFindUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "missing-id" },
      }),
    );
  });

  it("returns mapped profile with pedigree generations", async () => {
    const mockDog = {
      id: "dog1",
      name: "Test Dog",
      sex: DogSex.FEMALE,
      birthDate: new Date("2020-01-01"),
      ekNo: 1234,
      registrations: [
        makeRegistration("REG-1", "2020-01-01"),
        makeRegistration("REG-2", "2021-01-01"), // Primary (latest)
      ],
      trialResults: [
        {
          id: "trial1",
          eventPlace: "Place1",
          eventDate: new Date("2021-05-05"),
          ke: "P",
          eventName: "Class1",
          sija: "1",
          piste: new Decimal(80.5),
        },
      ],
      showResults: [
        {
          id: "show1",
          eventPlace: "ShowPlace1",
          eventDate: new Date("2021-06-06"),
          resultText: "ERI",
          judge: "Judge1",
          heightText: "38.5",
        },
      ],
      sire: {
        id: "sire1",
        name: "Sire Dog",
        registrations: [makeRegistration("SIRE-REG", "2018-01-01")],
        sire: null,
        dam: null,
      },
      dam: {
        id: "dam1",
        name: "Dam Dog",
        registrations: [makeRegistration("DAM-REG", "2018-01-01")],
        sire: null,
        dam: null,
      },
    };

    dogFindUniqueMock.mockResolvedValue(mockDog);

    const result = await getBeagleDogProfileDb("dog1");

    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test Dog");
    expect(result?.registrationNo).toBe("REG-2");
    expect(result?.sex).toBe("N");
    expect(result?.birthDate).toEqual(mockDog.birthDate);
    expect(result?.trials).toHaveLength(1);
    expect(result?.trials[0].points).toBe(80.5);
    expect(result?.trials[0].date).toEqual(new Date("2021-05-05"));
    expect(result?.shows).toHaveLength(1);
    expect(result?.shows[0].heightCm).toBe(38.5);
    expect(result?.shows[0].date).toEqual(new Date("2021-06-06"));

    // Pedigree check
    expect(result?.pedigree).toHaveLength(2); // Gen 1 and Gen 2 (since sire/dam exist but their parents don't)
    expect(result?.pedigree[0].cards[0].sire?.name).toBe("Sire Dog");
    expect(result?.pedigree[0].cards[0].dam?.name).toBe("Dam Dog");
    expect(result?.pedigree[1].cards).toHaveLength(2);
    expect(result?.pedigree[1].cards[0].sire).toBeNull();
  });

  it("handles empty results and null fields gracefully", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog2",
      name: "Minimal Dog",
      sex: DogSex.UNKNOWN,
      birthDate: null,
      ekNo: null,
      registrations: [],
      trialResults: [],
      showResults: [],
      sire: null,
      dam: null,
    });

    const result = await getBeagleDogProfileDb("dog2");

    expect(result?.registrationNo).toBe("-");
    expect(result?.sex).toBe("-");
    expect(result?.trials).toEqual([]);
    expect(result?.shows).toEqual([]);
    expect(result?.pedigree).toHaveLength(1);
    expect(result?.pedigree[0].cards[0].sire).toBeNull();
  });

  it("keeps zero show height as a number", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog3",
      name: "Zero Height Dog",
      sex: DogSex.UNKNOWN,
      birthDate: null,
      ekNo: null,
      registrations: [],
      trialResults: [],
      showResults: [
        {
          id: "show-zero",
          eventPlace: "Zero Place",
          eventDate: new Date("2024-01-01"),
          resultText: null,
          judge: null,
          heightText: "0",
        },
      ],
      sire: null,
      dam: null,
    });

    const result = await getBeagleDogProfileDb("dog3");

    expect(result?.shows).toHaveLength(1);
    expect(result?.shows[0].heightCm).toBe(0);
  });

  it("returns null parent registration when parent has no registrations", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog4",
      name: "No Parent Reg Dog",
      sex: DogSex.UNKNOWN,
      birthDate: null,
      ekNo: null,
      registrations: [],
      trialResults: [],
      showResults: [],
      sire: {
        id: "sire-no-reg",
        name: "Sire Without Reg",
        registrations: [],
        sire: null,
        dam: null,
      },
      dam: null,
    });

    const result = await getBeagleDogProfileDb("dog4");

    expect(result?.sire).toEqual({
      name: "Sire Without Reg",
      registrationNo: null,
    });
  });
});
