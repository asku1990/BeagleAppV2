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

function makeParent(
  id: string,
  name: string,
  registrationNo: string,
  ekNo: number | null = null,
) {
  return {
    id,
    name,
    ekNo,
    registrations: [makeRegistration(registrationNo, "2018-01-01")],
  };
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
      whelpedPuppies: [],
      siredPuppies: [],
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
    expect(result?.offspringSummary).toEqual({ litterCount: 0, puppyCount: 0 });
    expect(result?.litters).toEqual([]);
    expect(queryArgs.include).not.toHaveProperty("showResults");
    expect(queryArgs.include).not.toHaveProperty("trialResults");
    expect(queryArgs.include).toHaveProperty("whelpedPuppies");
    expect(queryArgs.include).toHaveProperty("siredPuppies");
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
      whelpedPuppies: [],
      siredPuppies: [],
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
      whelpedPuppies: [],
      siredPuppies: [],
    });

    const result = await getBeagleDogProfileDb("dog4");

    expect(result?.sire).toEqual({
      id: "sire-no-reg",
      name: "Sire Without Reg",
      registrationNo: null,
      ekNo: null,
    });
  });

  it("groups female offspring into litters by birth date and sire", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dam-profile",
      name: "Profile Dam",
      sex: DogSex.FEMALE,
      birthDate: new Date("2020-01-01"),
      ekNo: 44,
      registrations: [makeRegistration("DAM-REG", "2020-01-01")],
      sire: null,
      dam: null,
      siredPuppies: [],
      whelpedPuppies: [
        {
          id: "puppy-b",
          name: "B Puppy",
          sex: DogSex.MALE,
          birthDate: new Date("2024-06-10"),
          registrations: [makeRegistration("FI-11/24", "2024-06-10")],
          sire: makeParent("sire-1", "Co Sire", "SIRE-1"),
          dam: makeParent("dam-profile", "Profile Dam", "DAM-REG", 44),
        },
        {
          id: "puppy-a",
          name: "A Puppy",
          sex: DogSex.FEMALE,
          birthDate: new Date("2024-06-10"),
          registrations: [makeRegistration("FI-10/24", "2024-06-10")],
          sire: makeParent("sire-1", "Co Sire", "SIRE-1"),
          dam: makeParent("dam-profile", "Profile Dam", "DAM-REG", 44),
        },
        {
          id: "puppy-c",
          name: "C Puppy",
          sex: DogSex.FEMALE,
          birthDate: new Date("2023-05-01"),
          registrations: [makeRegistration("FI-20/23", "2023-05-01")],
          sire: makeParent("sire-2", "Older Sire", "SIRE-2"),
          dam: makeParent("dam-profile", "Profile Dam", "DAM-REG", 44),
        },
      ],
    });

    const result = await getBeagleDogProfileDb("dam-profile");

    expect(result?.offspringSummary).toEqual({ litterCount: 2, puppyCount: 3 });
    expect(result?.litters).toMatchObject([
      {
        birthDate: new Date("2024-06-10"),
        otherParent: {
          id: "sire-1",
          name: "Co Sire",
          registrationNo: "SIRE-1",
          ekNo: null,
        },
        puppyCount: 2,
        puppies: [
          {
            id: "puppy-a",
            dogId: "puppy-a",
            name: "A Puppy",
            registrationNo: "FI-10/24",
            sex: "N",
          },
          {
            id: "puppy-b",
            dogId: "puppy-b",
            name: "B Puppy",
            registrationNo: "FI-11/24",
            sex: "U",
          },
        ],
      },
      {
        birthDate: new Date("2023-05-01"),
        otherParent: {
          id: "sire-2",
          name: "Older Sire",
          registrationNo: "SIRE-2",
          ekNo: null,
        },
        puppyCount: 1,
      },
    ]);
  });

  it("groups male offspring into litters by birth date and dam", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "sire-profile",
      name: "Profile Sire",
      sex: DogSex.MALE,
      birthDate: new Date("2019-01-01"),
      ekNo: 55,
      registrations: [makeRegistration("SIRE-REG", "2019-01-01")],
      sire: null,
      dam: null,
      whelpedPuppies: [],
      siredPuppies: [
        {
          id: "puppy-1",
          name: "Puppy One",
          sex: DogSex.MALE,
          birthDate: new Date("2025-01-02"),
          registrations: [makeRegistration("FI-1/25", "2025-01-02")],
          sire: makeParent("sire-profile", "Profile Sire", "SIRE-REG", 55),
          dam: makeParent("dam-1", "First Dam", "DAM-1"),
        },
        {
          id: "puppy-2",
          name: "Puppy Two",
          sex: DogSex.FEMALE,
          birthDate: new Date("2025-01-02"),
          registrations: [makeRegistration("FI-2/25", "2025-01-02")],
          sire: makeParent("sire-profile", "Profile Sire", "SIRE-REG", 55),
          dam: makeParent("dam-2", "Second Dam", "DAM-2"),
        },
      ],
    });

    const result = await getBeagleDogProfileDb("sire-profile");

    expect(result?.offspringSummary).toEqual({ litterCount: 2, puppyCount: 2 });
    expect(result?.litters).toHaveLength(2);
    expect(result?.litters[0]?.otherParent?.name).toBe("First Dam");
    expect(result?.litters[1]?.otherParent?.name).toBe("Second Dam");
  });
});
