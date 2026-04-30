import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

const { dogFindUniqueMock, dogFindManyMock, prismaMock } = vi.hoisted(() => {
  const dogFindUnique = vi.fn();
  const dogFindMany = vi.fn();

  return {
    dogFindUniqueMock: dogFindUnique,
    dogFindManyMock: dogFindMany,
    prismaMock: {
      dog: {
        findUnique: dogFindUnique,
        findMany: dogFindMany,
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

function makeOffspringLitterParent(id: string, registrationNo: string) {
  return {
    id,
    registrations: [makeRegistration(registrationNo, "2018-01-01")],
  };
}

function makeOffspringCounts(
  overrides?: Partial<{
    showEntries: number;
    trialEntries: number;
  }>,
) {
  return {
    showEntries: overrides?.showEntries ?? 0,
    trialEntries: overrides?.trialEntries ?? 0,
  };
}

function makeOffspringLitterRelation(
  id: string,
  birthDate: string | Date | null,
  overrides?: Partial<{
    sire: ReturnType<typeof makeOffspringLitterParent> | null;
    dam: ReturnType<typeof makeOffspringLitterParent> | null;
  }>,
) {
  return {
    id,
    birthDate:
      birthDate == null
        ? null
        : birthDate instanceof Date
          ? birthDate
          : new Date(birthDate),
    sire: overrides?.sire ?? null,
    dam: overrides?.dam ?? null,
  };
}

describe("getBeagleDogProfileDb", () => {
  beforeEach(() => {
    dogFindUniqueMock.mockReset();
    dogFindManyMock.mockReset();
    dogFindManyMock.mockResolvedValue([]);
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
    expect(result?.siblingsSummary).toEqual({ siblingCount: 0 });
    expect(result?.siblings).toEqual([]);
    expect(queryArgs.include).not.toHaveProperty("showResults");
    expect(queryArgs.include).toHaveProperty("whelpedPuppies");
    expect(queryArgs.include).toHaveProperty("siredPuppies");
    expect(queryArgs.include).toHaveProperty("titles");
  });

  it("maps title rows in stored row order", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog-titles",
      name: "Dog Titles",
      sex: DogSex.FEMALE,
      birthDate: null,
      ekNo: null,
      registrations: [makeRegistration("FI-9/20", "2020-01-01")],
      sire: null,
      dam: null,
      whelpedPuppies: [],
      siredPuppies: [],
      titles: [
        {
          id: "title-1",
          awardedOn: new Date("2020-06-01"),
          titleCode: "FI MVA",
          titleName: "Suomen muotovalio",
          sortOrder: 0,
          createdAt: new Date("2020-06-01"),
        },
        {
          id: "title-2",
          awardedOn: null,
          titleCode: "SE MVA",
          titleName: null,
          sortOrder: 1,
          createdAt: new Date("2020-06-02"),
        },
      ],
    });

    const result = await getBeagleDogProfileDb("dog-titles");
    const queryArgs = dogFindUniqueMock.mock.calls[0]?.[0] as {
      include: Record<string, unknown>;
    };

    expect(result?.titles).toEqual([
      {
        awardedOn: new Date("2020-06-01"),
        titleCode: "FI MVA",
        titleName: "Suomen muotovalio",
      },
      {
        awardedOn: null,
        titleCode: "SE MVA",
        titleName: null,
      },
    ]);
    expect(queryArgs.include).toMatchObject({
      titles: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      },
    });
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
    expect(result?.titles).toEqual([]);
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
          ekNo: 201,
          registrations: [makeRegistration("FI-11/24", "2024-06-10")],
          sire: makeParent("sire-1", "Co Sire", "SIRE-1"),
          dam: makeParent("dam-profile", "Profile Dam", "DAM-REG", 44),
          whelpedPuppies: [],
          siredPuppies: [
            makeOffspringLitterRelation("pb-child-1", "2025-01-15", {
              dam: makeOffspringLitterParent("dam-a", "DAM-A"),
            }),
            makeOffspringLitterRelation("pb-child-2", "2025-01-15", {
              dam: makeOffspringLitterParent("dam-a", "DAM-A"),
            }),
            makeOffspringLitterRelation("pb-child-3", "2025-06-20", {
              dam: makeOffspringLitterParent("dam-b", "DAM-B"),
            }),
          ],
          _count: makeOffspringCounts({
            showEntries: 1,
            trialEntries: 2,
          }),
        },
        {
          id: "puppy-a",
          name: "A Puppy",
          sex: DogSex.FEMALE,
          birthDate: new Date("2024-06-10"),
          ekNo: 200,
          registrations: [makeRegistration("FI-10/24", "2024-06-10")],
          sire: makeParent("sire-1", "Co Sire", "SIRE-1"),
          dam: makeParent("dam-profile", "Profile Dam", "DAM-REG", 44),
          whelpedPuppies: [
            makeOffspringLitterRelation("pa-child-1", "2025-03-01", {
              sire: makeOffspringLitterParent("sire-a", "SIRE-A"),
            }),
            makeOffspringLitterRelation("pa-child-2", "2025-03-01", {
              sire: makeOffspringLitterParent("sire-a", "SIRE-A"),
            }),
          ],
          siredPuppies: [],
          _count: makeOffspringCounts({
            showEntries: 3,
            trialEntries: 1,
          }),
        },
        {
          id: "puppy-c",
          name: "C Puppy",
          sex: DogSex.FEMALE,
          birthDate: new Date("2023-05-01"),
          ekNo: null,
          registrations: [makeRegistration("FI-20/23", "2023-05-01")],
          sire: makeParent("sire-2", "Older Sire", "SIRE-2"),
          dam: makeParent("dam-profile", "Profile Dam", "DAM-REG", 44),
          whelpedPuppies: [],
          siredPuppies: [],
          _count: makeOffspringCounts(),
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
            ekNo: 200,
            trialCount: 1,
            showCount: 3,
            litterCount: 1,
          },
          {
            id: "puppy-b",
            dogId: "puppy-b",
            name: "B Puppy",
            registrationNo: "FI-11/24",
            sex: "U",
            ekNo: 201,
            trialCount: 2,
            showCount: 1,
            litterCount: 2,
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
          ekNo: 301,
          registrations: [makeRegistration("FI-1/25", "2025-01-02")],
          sire: makeParent("sire-profile", "Profile Sire", "SIRE-REG", 55),
          dam: makeParent("dam-1", "First Dam", "DAM-1"),
          whelpedPuppies: [],
          siredPuppies: [
            makeOffspringLitterRelation("p1-child-1", "2026-01-05", {
              dam: makeOffspringLitterParent("dam-1a", "DAM-1A"),
            }),
            makeOffspringLitterRelation("p1-child-2", "2026-01-05", {
              dam: makeOffspringLitterParent("dam-1a", "DAM-1A"),
            }),
          ],
          _count: makeOffspringCounts({
            showEntries: 2,
            trialEntries: 4,
          }),
        },
        {
          id: "puppy-2",
          name: "Puppy Two",
          sex: DogSex.FEMALE,
          birthDate: new Date("2025-01-02"),
          ekNo: null,
          registrations: [makeRegistration("FI-2/25", "2025-01-02")],
          sire: makeParent("sire-profile", "Profile Sire", "SIRE-REG", 55),
          dam: makeParent("dam-2", "Second Dam", "DAM-2"),
          whelpedPuppies: [
            makeOffspringLitterRelation("p2-child-1", "2026-02-01", {
              sire: makeOffspringLitterParent("sire-2a", "SIRE-2A"),
            }),
            makeOffspringLitterRelation("p2-child-2", "2026-02-01", {
              sire: makeOffspringLitterParent("sire-2a", "SIRE-2A"),
            }),
            makeOffspringLitterRelation("p2-child-3", "2026-07-10", {
              sire: makeOffspringLitterParent("sire-2b", "SIRE-2B"),
            }),
          ],
          siredPuppies: [],
          _count: makeOffspringCounts({ trialEntries: 1 }),
        },
      ],
    });

    const result = await getBeagleDogProfileDb("sire-profile");

    expect(result?.offspringSummary).toEqual({ litterCount: 2, puppyCount: 2 });
    expect(result?.litters).toHaveLength(2);
    expect(result?.litters[0]?.otherParent?.name).toBe("First Dam");
    expect(result?.litters[1]?.otherParent?.name).toBe("Second Dam");
    expect(result?.litters[0]?.puppies[0]).toMatchObject({
      ekNo: 301,
      trialCount: 4,
      showCount: 2,
      litterCount: 1,
    });
    expect(result?.litters[1]?.puppies[0]?.litterCount).toBe(2);
  });

  it("uses Helsinki business dates for litter grouping and litter counts", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dam-timezone",
      name: "Timezone Dam",
      sex: DogSex.FEMALE,
      birthDate: new Date("2020-01-01"),
      ekNo: 77,
      registrations: [makeRegistration("DAM-TZ", "2020-01-01")],
      sire: null,
      dam: null,
      siredPuppies: [],
      whelpedPuppies: [
        {
          id: "puppy-early",
          name: "Early Puppy",
          sex: DogSex.FEMALE,
          birthDate: new Date("2020-01-01T00:00:00+02:00"),
          ekNo: null,
          registrations: [makeRegistration("FI-1/20", "2020-01-01")],
          sire: makeParent("sire-tz", "Timezone Sire", "SIRE-TZ"),
          dam: makeParent("dam-timezone", "Timezone Dam", "DAM-TZ", 77),
          whelpedPuppies: [
            makeOffspringLitterRelation(
              "grandchild-1",
              new Date("2026-03-01T00:00:00+02:00"),
              {
                sire: makeOffspringLitterParent("sire-a", "SIRE-A"),
              },
            ),
            makeOffspringLitterRelation(
              "grandchild-2",
              new Date("2026-03-01T12:00:00+02:00"),
              {
                sire: makeOffspringLitterParent("sire-a", "SIRE-A"),
              },
            ),
          ],
          siredPuppies: [],
          _count: makeOffspringCounts(),
        },
        {
          id: "puppy-late",
          name: "Late Puppy",
          sex: DogSex.MALE,
          birthDate: new Date("2020-01-01T12:00:00+02:00"),
          ekNo: null,
          registrations: [makeRegistration("FI-2/20", "2020-01-01")],
          sire: makeParent("sire-tz", "Timezone Sire", "SIRE-TZ"),
          dam: makeParent("dam-timezone", "Timezone Dam", "DAM-TZ", 77),
          whelpedPuppies: [],
          siredPuppies: [],
          _count: makeOffspringCounts(),
        },
      ],
    });

    const result = await getBeagleDogProfileDb("dam-timezone");

    expect(result?.litters).toHaveLength(1);
    expect(result?.litters[0]?.puppyCount).toBe(2);
    expect(result?.litters[0]?.puppies[0]?.litterCount).toBe(1);
  });

  it("keeps sparse unknown offspring in separate synthetic litters", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dam-sparse",
      name: "Sparse Dam",
      sex: DogSex.FEMALE,
      birthDate: new Date("2020-01-01"),
      ekNo: null,
      registrations: [makeRegistration("DAM-SPARSE", "2020-01-01")],
      sire: null,
      dam: null,
      siredPuppies: [],
      whelpedPuppies: [
        {
          id: "puppy-unknown-a",
          name: "Unknown Puppy A",
          sex: DogSex.FEMALE,
          birthDate: null,
          ekNo: null,
          registrations: [makeRegistration("FI-1/19", "2019-01-01")],
          sire: null,
          dam: makeParent("dam-sparse", "Sparse Dam", "DAM-SPARSE"),
          whelpedPuppies: [
            makeOffspringLitterRelation("grandchild-unknown-a", null),
            makeOffspringLitterRelation("grandchild-unknown-b", null),
          ],
          siredPuppies: [],
          _count: makeOffspringCounts(),
        },
        {
          id: "puppy-unknown-b",
          name: "Unknown Puppy B",
          sex: DogSex.MALE,
          birthDate: null,
          ekNo: null,
          registrations: [makeRegistration("FI-2/19", "2019-01-01")],
          sire: null,
          dam: makeParent("dam-sparse", "Sparse Dam", "DAM-SPARSE"),
          whelpedPuppies: [],
          siredPuppies: [],
          _count: makeOffspringCounts(),
        },
      ],
    });

    const result = await getBeagleDogProfileDb("dam-sparse");

    expect(result?.offspringSummary).toEqual({ litterCount: 2, puppyCount: 2 });
    expect(result?.litters).toHaveLength(2);
    expect(result?.litters?.every((litter) => litter.puppyCount === 1)).toBe(
      true,
    );
    expect(result?.litters[0]?.puppies[0]?.litterCount).toBe(2);
  });

  it("does not merge same-day litters when the co-parent is unknown", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "sire-unknown-parent",
      name: "Unknown Parent Sire",
      sex: DogSex.MALE,
      birthDate: new Date("2020-01-01"),
      ekNo: null,
      registrations: [makeRegistration("SIRE-UP", "2020-01-01")],
      sire: null,
      dam: null,
      whelpedPuppies: [],
      siredPuppies: [
        {
          id: "puppy-up-1",
          name: "Unknown Dam Puppy 1",
          sex: DogSex.FEMALE,
          birthDate: new Date("2024-08-01"),
          ekNo: null,
          registrations: [makeRegistration("FI-50/24", "2024-08-01")],
          sire: makeParent(
            "sire-unknown-parent",
            "Unknown Parent Sire",
            "SIRE-UP",
          ),
          dam: null,
          whelpedPuppies: [],
          siredPuppies: [],
          _count: makeOffspringCounts(),
        },
        {
          id: "puppy-up-2",
          name: "Unknown Dam Puppy 2",
          sex: DogSex.MALE,
          birthDate: new Date("2024-08-01"),
          ekNo: null,
          registrations: [makeRegistration("FI-51/24", "2024-08-01")],
          sire: makeParent(
            "sire-unknown-parent",
            "Unknown Parent Sire",
            "SIRE-UP",
          ),
          dam: null,
          whelpedPuppies: [],
          siredPuppies: [],
          _count: makeOffspringCounts(),
        },
      ],
    });

    const result = await getBeagleDogProfileDb("sire-unknown-parent");

    expect(result?.offspringSummary).toEqual({ litterCount: 2, puppyCount: 2 });
    expect(result?.litters).toHaveLength(2);
    expect(result?.litters?.every((litter) => litter.puppyCount === 1)).toBe(
      true,
    );
  });

  it("maps siblings from the same litter and excludes the profile dog", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "profile",
      name: "Profile Dog",
      sex: DogSex.FEMALE,
      birthDate: new Date("2020-04-01"),
      ekNo: 10,
      registrations: [makeRegistration("FI-1/20", "2020-04-01")],
      sire: makeParent("sire-1", "Sire", "SIRE-1"),
      dam: makeParent("dam-1", "Dam", "DAM-1"),
      whelpedPuppies: [],
      siredPuppies: [],
    });
    dogFindManyMock.mockResolvedValue([
      {
        id: "sib-b",
        name: "Sibling B",
        sex: DogSex.MALE,
        birthDate: new Date("2020-04-01"),
        ekNo: 22,
        registrations: [makeRegistration("FI-3/20", "2020-04-01")],
        sire: makeParent("sire-1", "Sire", "SIRE-1"),
        dam: makeParent("dam-1", "Dam", "DAM-1"),
        whelpedPuppies: [],
        siredPuppies: [],
        _count: makeOffspringCounts({ showEntries: 1, trialEntries: 2 }),
      },
      {
        id: "sib-a",
        name: "Sibling A",
        sex: DogSex.FEMALE,
        birthDate: new Date("2020-04-01"),
        ekNo: 21,
        registrations: [makeRegistration("FI-2/20", "2020-04-01")],
        sire: makeParent("sire-1", "Sire", "SIRE-1"),
        dam: makeParent("dam-1", "Dam", "DAM-1"),
        whelpedPuppies: [],
        siredPuppies: [],
        _count: makeOffspringCounts({ showEntries: 3, trialEntries: 4 }),
      },
    ]);

    const result = await getBeagleDogProfileDb("profile");

    expect(result?.siblingsSummary).toEqual({ siblingCount: 2 });
    expect(result?.siblings).toMatchObject([
      {
        id: "sib-a",
        registrationNo: "FI-2/20",
        showCount: 3,
        trialCount: 4,
      },
      {
        id: "sib-b",
        registrationNo: "FI-3/20",
        showCount: 1,
        trialCount: 2,
      },
    ]);
    expect(dogFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { not: "profile" },
          sireId: "sire-1",
          damId: "dam-1",
          birthDate: {
            gte: new Date("2020-03-31T21:00:00.000Z"),
            lt: new Date("2020-04-01T21:00:00.000Z"),
          },
        }),
      }),
    );
  });

  it("counts sibling offspring litters separately when co-parent is unknown", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "profile-sibling-unknown",
      name: "Profile Dog",
      sex: DogSex.FEMALE,
      birthDate: new Date("2020-04-01"),
      ekNo: 10,
      registrations: [makeRegistration("FI-1/20", "2020-04-01")],
      sire: makeParent("sire-1", "Sire", "SIRE-1"),
      dam: makeParent("dam-1", "Dam", "DAM-1"),
      whelpedPuppies: [],
      siredPuppies: [],
    });
    dogFindManyMock.mockResolvedValue([
      {
        id: "sib-unknown-litters",
        name: "Sibling Unknown Litters",
        sex: DogSex.FEMALE,
        birthDate: new Date("2020-04-01"),
        ekNo: 22,
        registrations: [makeRegistration("FI-9/20", "2020-04-01")],
        sire: makeParent("sire-1", "Sire", "SIRE-1"),
        dam: makeParent("dam-1", "Dam", "DAM-1"),
        whelpedPuppies: [
          makeOffspringLitterRelation("sib-child-1", "2025-03-01", {
            sire: null,
          }),
          makeOffspringLitterRelation("sib-child-2", "2025-03-01", {
            sire: null,
          }),
        ],
        siredPuppies: [],
        _count: makeOffspringCounts(),
      },
    ]);

    const result = await getBeagleDogProfileDb("profile-sibling-unknown");

    expect(result?.siblingsSummary).toEqual({ siblingCount: 1 });
    expect(result?.siblings[0]?.id).toBe("sib-unknown-litters");
    expect(result?.siblings[0]?.litterCount).toBe(2);
  });

  it("uses registration fallback when a parent id is missing", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "profile-reg-fallback",
      name: "Profile",
      sex: DogSex.FEMALE,
      birthDate: new Date("2020-04-01"),
      ekNo: null,
      registrations: [makeRegistration("FI-1/20", "2020-04-01")],
      sire: {
        id: "",
        name: "Sire Missing Id",
        ekNo: null,
        registrations: [makeRegistration("SIRE-REG", "2018-01-01")],
      },
      dam: makeParent("dam-1", "Dam", "DAM-1"),
      whelpedPuppies: [],
      siredPuppies: [],
    });
    dogFindManyMock.mockResolvedValue([]);

    const result = await getBeagleDogProfileDb("profile-reg-fallback");

    expect(result?.siblingsSummary).toEqual({ siblingCount: 0 });
    expect(result?.siblings).toEqual([]);
    expect(dogFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          damId: "dam-1",
          sire: {
            registrations: {
              some: { registrationNo: "SIRE-REG" },
            },
          },
        }),
      }),
    );
  });

  it("does not merge missing-date litters that only share the same co-parent", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dam-missing-date",
      name: "Missing Date Dam",
      sex: DogSex.FEMALE,
      birthDate: new Date("2020-01-01"),
      ekNo: null,
      registrations: [makeRegistration("DAM-MD", "2020-01-01")],
      sire: null,
      dam: null,
      siredPuppies: [],
      whelpedPuppies: [
        {
          id: "puppy-md-a",
          name: "Missing Date Puppy A",
          sex: DogSex.FEMALE,
          birthDate: null,
          ekNo: null,
          registrations: [makeRegistration("FI-3/19", "2019-01-01")],
          sire: makeParent("sire-md", "Shared Sire", "SIRE-MD"),
          dam: makeParent("dam-missing-date", "Missing Date Dam", "DAM-MD"),
          whelpedPuppies: [
            makeOffspringLitterRelation("grandchild-md-a", null, {
              sire: makeOffspringLitterParent("sire-shared", "SIRE-SHARED"),
            }),
            makeOffspringLitterRelation("grandchild-md-b", null, {
              sire: makeOffspringLitterParent("sire-shared", "SIRE-SHARED"),
            }),
          ],
          siredPuppies: [],
          _count: makeOffspringCounts(),
        },
        {
          id: "puppy-md-b",
          name: "Missing Date Puppy B",
          sex: DogSex.MALE,
          birthDate: null,
          ekNo: null,
          registrations: [makeRegistration("FI-4/19", "2019-01-01")],
          sire: makeParent("sire-md", "Shared Sire", "SIRE-MD"),
          dam: makeParent("dam-missing-date", "Missing Date Dam", "DAM-MD"),
          whelpedPuppies: [],
          siredPuppies: [],
          _count: makeOffspringCounts(),
        },
      ],
    });

    const result = await getBeagleDogProfileDb("dam-missing-date");

    expect(result?.offspringSummary).toEqual({ litterCount: 2, puppyCount: 2 });
    expect(result?.litters).toHaveLength(2);
    expect(result?.litters?.every((litter) => litter.puppyCount === 1)).toBe(
      true,
    );
    expect(result?.litters[0]?.puppies[0]?.litterCount).toBe(2);
  });

  it("includes offspring and descendant litter counts even when sex is stale", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "stale-sex-profile",
      name: "Stale Sex Profile",
      sex: DogSex.FEMALE,
      birthDate: new Date("2020-01-01"),
      ekNo: null,
      registrations: [makeRegistration("STALE-REG", "2020-01-01")],
      sire: null,
      dam: null,
      whelpedPuppies: [],
      siredPuppies: [
        {
          id: "stale-puppy-1",
          name: "Stale Puppy",
          sex: DogSex.FEMALE,
          birthDate: new Date("2024-07-01"),
          ekNo: 88,
          registrations: [makeRegistration("FI-100/24", "2024-07-01")],
          sire: makeParent(
            "stale-sex-profile",
            "Stale Sex Profile",
            "STALE-REG",
          ),
          dam: makeParent("co-dam-1", "Co Dam", "CO-DAM-1"),
          whelpedPuppies: [],
          siredPuppies: [
            makeOffspringLitterRelation("stale-grandchild-1", "2026-01-01", {
              dam: makeOffspringLitterParent("stale-gd-dam", "GD-DAM-1"),
            }),
            makeOffspringLitterRelation("stale-grandchild-2", "2026-01-01", {
              dam: makeOffspringLitterParent("stale-gd-dam", "GD-DAM-1"),
            }),
          ],
          _count: makeOffspringCounts({
            showEntries: 2,
            trialEntries: 3,
          }),
        },
      ],
    });

    const result = await getBeagleDogProfileDb("stale-sex-profile");

    expect(result?.offspringSummary).toEqual({ litterCount: 1, puppyCount: 1 });
    expect(result?.litters).toHaveLength(1);
    expect(result?.litters[0]).toMatchObject({
      puppyCount: 1,
      otherParent: {
        id: "co-dam-1",
        name: "Co Dam",
        registrationNo: "CO-DAM-1",
      },
    });
    expect(result?.litters[0]?.puppies[0]).toMatchObject({
      id: "stale-puppy-1",
      litterCount: 1,
      trialCount: 3,
      showCount: 2,
    });
  });
});
