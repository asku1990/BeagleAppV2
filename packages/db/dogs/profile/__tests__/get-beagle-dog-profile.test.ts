import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

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
        makeRegistration("REG-2", "2021-01-01"),
      ],
      sire: {
        id: "sire1",
        name: "Sire Dog",
        ekNo: 501,
        registrations: [makeRegistration("SIRE-REG", "2018-01-01")],
        sire: null,
        dam: null,
      },
      dam: {
        id: "dam1",
        name: "Dam Dog",
        ekNo: 777,
        registrations: [makeRegistration("DAM-REG", "2018-01-01")],
        sire: null,
        dam: null,
      },
    };

    dogFindUniqueMock.mockResolvedValue(mockDog);

    const result = await getBeagleDogProfileDb("dog1");
    const queryArgs = dogFindUniqueMock.mock.calls[0]?.[0] as {
      include: Record<string, unknown>;
    };

    expect(result).toMatchObject({
      id: "dog1",
      name: "Test Dog",
      registrationNo: "REG-1",
      sex: "N",
      ekNo: 1234,
      sire: {
        id: "sire1",
        name: "Sire Dog",
        registrationNo: "SIRE-REG",
        ekNo: 501,
      },
      dam: {
        id: "dam1",
        name: "Dam Dog",
        registrationNo: "DAM-REG",
        ekNo: 777,
      },
    });
    expect(result?.birthDate).toEqual(new Date("2020-01-01"));
    expect(result?.pedigree).toHaveLength(3);
    expect(result?.pedigree[0].cards).toHaveLength(1);
    expect(result?.pedigree[1].cards).toHaveLength(2);
    expect(result?.pedigree[2].cards).toHaveLength(4);
    expect(queryArgs.include).not.toHaveProperty("showResults");
    expect(queryArgs.include).not.toHaveProperty("trialResults");
  });

  it("handles empty fields gracefully", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog2",
      name: "Minimal Dog",
      sex: DogSex.UNKNOWN,
      birthDate: null,
      ekNo: null,
      registrations: [],
      sire: null,
      dam: null,
    });

    const result = await getBeagleDogProfileDb("dog2");

    expect(result?.registrationNo).toBe("-");
    expect(result?.sex).toBe("-");
    expect(result?.pedigree).toHaveLength(3);
    expect(result?.pedigree[0].cards[0].sire).toBeNull();
  });

  it("returns null parent registration when parent has no registrations", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog4",
      name: "No Parent Reg Dog",
      sex: DogSex.UNKNOWN,
      birthDate: null,
      ekNo: null,
      registrations: [],
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
      id: "sire-no-reg",
      name: "Sire Without Reg",
      registrationNo: null,
      ekNo: null,
    });
  });
});
