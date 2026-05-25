import { DogSex } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { findVirtualPairingDogByRegistrationNoDb } from "../find-dog-by-registration";

const { dogRegistrationFindManyMock, prismaMock } = vi.hoisted(() => {
  const dogRegistrationFindMany = vi.fn();
  return {
    dogRegistrationFindManyMock: dogRegistrationFindMany,
    prismaMock: {
      dogRegistration: {
        findMany: dogRegistrationFindMany,
      },
    },
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: prismaMock,
}));

describe("findVirtualPairingDogByRegistrationNoDb", () => {
  beforeEach(() => {
    dogRegistrationFindManyMock.mockReset();
  });

  it("maps the canonical option fields", async () => {
    dogRegistrationFindManyMock.mockResolvedValue([
      {
        registrationNo: "FI54321/20",
        dog: {
          id: "dog_1",
          name: "Korven Aatos",
          ekNo: 5588,
          sex: DogSex.MALE,
        },
      },
    ]);

    await expect(
      findVirtualPairingDogByRegistrationNoDb("FI54321/20"),
    ).resolves.toEqual({
      id: "dog_1",
      name: "Korven Aatos",
      ekNo: 5588,
      sex: DogSex.MALE,
      registrationNo: "FI54321/20",
    });
  });

  it.each([
    ["lowercase", "fi54321/20"],
    ["mixed-case", "Fi54321/20"],
    ["whitespace-padded", "  fi54321/20  "],
  ])("normalizes %s registration input before lookup", async (_, input) => {
    dogRegistrationFindManyMock.mockResolvedValue([
      {
        registrationNo: "FI54321/20",
        dog: {
          id: "dog_1",
          name: "Korven Aatos",
          ekNo: 5588,
          sex: DogSex.MALE,
        },
      },
    ]);

    await expect(
      findVirtualPairingDogByRegistrationNoDb(input),
    ).resolves.toEqual({
      id: "dog_1",
      name: "Korven Aatos",
      ekNo: 5588,
      sex: DogSex.MALE,
      registrationNo: "FI54321/20",
    });

    expect(dogRegistrationFindManyMock).toHaveBeenCalledWith({
      where: {
        registrationNo: {
          equals: "FI54321/20",
          mode: "insensitive",
        },
      },
      take: 2,
      orderBy: [{ registrationNo: "asc" }, { id: "asc" }],
      select: {
        registrationNo: true,
        dog: {
          select: {
            id: true,
            name: true,
            ekNo: true,
            sex: true,
          },
        },
      },
    });
  });

  it("returns null for unknown or blank registration numbers", async () => {
    dogRegistrationFindManyMock.mockResolvedValue([]);

    await expect(
      findVirtualPairingDogByRegistrationNoDb("unknown"),
    ).resolves.toBeNull();
    await expect(
      findVirtualPairingDogByRegistrationNoDb("   "),
    ).resolves.toBeNull();

    expect(dogRegistrationFindManyMock).toHaveBeenCalledTimes(1);
  });
});
