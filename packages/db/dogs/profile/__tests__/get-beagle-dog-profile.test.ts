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
        makeRegistration("REG-2", "2021-01-01"), // Primary (oldest inserted)
      ],
      trialResults: [
        {
          id: "trial1",
          eventPlace: "Place1",
          eventDate: new Date("2021-05-05"),
          ke: "P",
          eventName: "Class1",
          lk: "A",
          sija: "1",
          piste: new Decimal(80.5),
          pa: "1",
        },
        {
          id: "trial2",
          eventPlace: "Place2",
          eventDate: new Date("2021-04-05"),
          ke: "M",
          eventName: "Class2",
          lk: "V",
          sija: "2",
          piste: new Decimal(75),
          pa: "2",
        },
        {
          id: "trial3",
          eventPlace: "Place3",
          eventDate: new Date("2021-03-05"),
          ke: "R",
          eventName: "Class3",
          lk: null,
          sija: "3",
          piste: new Decimal(71),
          pa: "3",
        },
      ],
      showResults: [
        {
          id: "show1",
          eventPlace: "ShowPlace1",
          eventDate: new Date("2021-06-06"),
          resultText: "AVO 1",
          judge: "Judge1",
          heightText: "38.5",
        },
        {
          id: "show2",
          eventPlace: "ShowPlace2",
          eventDate: new Date("2021-06-05"),
          resultText: "VOI2",
          judge: "Judge2",
          heightText: "39",
        },
        {
          id: "show3",
          eventPlace: "ShowPlace3",
          eventDate: new Date("2021-06-04"),
          resultText: "BEJ 3",
          judge: "Judge3",
          heightText: "40",
        },
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

    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test Dog");
    expect(result?.registrationNo).toBe("REG-1");
    expect(result?.sex).toBe("N");
    expect(result?.birthDate).toEqual(mockDog.birthDate);
    expect(result?.trials).toHaveLength(3);
    expect(result?.trials[0].points).toBe(80.5);
    expect(result?.trials[0].award).toBe("1");
    expect(result?.trials[1].award).toBe("2");
    expect(result?.trials[2].award).toBe("3");
    expect(result?.trials[0].date).toEqual(new Date("2021-05-05"));
    expect(result?.shows).toHaveLength(3);
    expect(result?.shows[0].result).toBe("AVO 1");
    expect(result?.shows[1].result).toBe("VOI2");
    expect(result?.shows[2].result).toBe("BEJ 3");
    expect(result?.shows[0].heightCm).toBe(38.5);
    expect(result?.shows[0].date).toEqual(new Date("2021-06-06"));

    // Pedigree check
    expect(result?.pedigree).toHaveLength(3);
    expect(result?.pedigree[0].cards[0].sire?.name).toBe("Sire Dog");
    expect(result?.pedigree[0].cards[0].dam?.name).toBe("Dam Dog");
    expect(result?.pedigree[0].cards[0].sire?.ekNo).toBe(501);
    expect(result?.pedigree[0].cards[0].dam?.ekNo).toBe(777);
    expect(result?.pedigree[1].cards).toHaveLength(2);
    expect(result?.pedigree[1].cards[1].sire).toBeNull();
    expect(result?.pedigree[1].cards[0].sire).toBeNull();
    expect(result?.pedigree[2].cards).toHaveLength(4);
    expect(result?.pedigree[2].cards[3].dam).toBeNull();
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
    expect(result?.pedigree).toHaveLength(3);
    expect(result?.pedigree[0].cards[0].sire).toBeNull();
    expect(result?.pedigree[1].cards).toHaveLength(2);
    expect(result?.pedigree[2].cards).toHaveLength(4);
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
      id: "sire-no-reg",
      name: "Sire Without Reg",
      registrationNo: null,
      ekNo: null,
    });
    expect(result?.pedigree[1].cards).toHaveLength(2);
    expect(result?.pedigree[1].cards[0].sire).toBeNull();
    expect(result?.pedigree[1].cards[1].sire).toBeNull();
    expect(result?.pedigree[2].cards).toHaveLength(4);
  });

  it("keeps show result text unchanged", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog5",
      name: "Show Codes Dog",
      sex: DogSex.UNKNOWN,
      birthDate: null,
      ekNo: null,
      registrations: [makeRegistration("REG-5", "2020-01-01")],
      trialResults: [],
      showResults: [
        {
          id: "show-jun",
          eventPlace: "Show",
          eventDate: new Date("2024-01-01"),
          resultText: "JUN1",
          judge: null,
          heightText: null,
        },
        {
          id: "show-nuo",
          eventPlace: "Show",
          eventDate: new Date("2024-01-02"),
          resultText: "NUO2",
          judge: null,
          heightText: null,
        },
        {
          id: "show-avo",
          eventPlace: "Show",
          eventDate: new Date("2024-01-03"),
          resultText: "AVO3",
          judge: null,
          heightText: null,
        },
        {
          id: "show-kay",
          eventPlace: "Show",
          eventDate: new Date("2024-01-04"),
          resultText: "KAY4",
          judge: null,
          heightText: null,
        },
        {
          id: "show-val",
          eventPlace: "Show",
          eventDate: new Date("2024-01-05"),
          resultText: "VAL5",
          judge: null,
          heightText: null,
        },
        {
          id: "show-vet",
          eventPlace: "Show",
          eventDate: new Date("2024-01-06"),
          resultText: "VET6",
          judge: null,
          heightText: null,
        },
        {
          id: "show-vak",
          eventPlace: "Show",
          eventDate: new Date("2024-01-07"),
          resultText: "VAKL",
          judge: null,
          heightText: null,
        },
      ],
      sire: null,
      dam: null,
    });

    const result = await getBeagleDogProfileDb("dog5");
    const results = result?.shows.map((show) => show.result);
    expect(results).toEqual([
      "JUN1",
      "NUO2",
      "AVO3",
      "KAY4",
      "VAL5",
      "VET6",
      "VAKL",
    ]);
  });

  it("keeps pre-2003 show codes unchanged", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog6",
      name: "Pre 2003 Dog",
      sex: DogSex.UNKNOWN,
      birthDate: null,
      ekNo: null,
      registrations: [makeRegistration("REG-6", "2020-01-01")],
      trialResults: [],
      showResults: [
        {
          id: "show-old-1",
          eventPlace: "Old Show",
          eventDate: new Date("2000-03-04"),
          resultText: "KÄY2",
          judge: null,
          heightText: null,
        },
        {
          id: "show-old-2",
          eventPlace: "Old Show",
          eventDate: new Date("1995-08-06"),
          resultText: "AVO3",
          judge: null,
          heightText: null,
        },
      ],
      sire: null,
      dam: null,
    });

    const result = await getBeagleDogProfileDb("dog6");
    const normalized = result?.shows.map((show) => show.result);

    expect(normalized).toEqual(["KÄY2", "AVO3"]);
  });
});
