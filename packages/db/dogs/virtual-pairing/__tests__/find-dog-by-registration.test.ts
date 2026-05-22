import { DogSex } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { findVirtualPairingDogByRegistrationNoDb } from "../find-dog-by-registration";

const { dogRegistrationFindUniqueMock, prismaMock } = vi.hoisted(() => {
  const dogRegistrationFindUnique = vi.fn();
  return {
    dogRegistrationFindUniqueMock: dogRegistrationFindUnique,
    prismaMock: {
      dogRegistration: {
        findUnique: dogRegistrationFindUnique,
      },
    },
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: prismaMock,
}));

describe("findVirtualPairingDogByRegistrationNoDb", () => {
  beforeEach(() => {
    dogRegistrationFindUniqueMock.mockReset();
  });

  it("maps the canonical option fields", async () => {
    dogRegistrationFindUniqueMock.mockResolvedValue({
      registrationNo: "FI54321/20",
      dog: {
        id: "dog_1",
        name: "Korven Aatos",
        ekNo: 5588,
        sex: DogSex.MALE,
      },
    });

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
});
