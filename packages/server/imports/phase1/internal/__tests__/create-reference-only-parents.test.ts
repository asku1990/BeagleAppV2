import { beforeEach, describe, expect, it, vi } from "vitest";
import { createReferenceOnlyParents } from "../create-reference-only-parents";

const { dogCreateMock } = vi.hoisted(() => ({
  dogCreateMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  DogSex: {
    MALE: "MALE",
    FEMALE: "FEMALE",
    UNKNOWN: "UNKNOWN",
  },
  DogStatus: {
    NORMAL: "NORMAL",
    REFERENCE_ONLY: "REFERENCE_ONLY",
  },
  prisma: {
    dog: { create: dogCreateMock },
  },
}));

describe("createReferenceOnlyParents", () => {
  beforeEach(() => {
    dogCreateMock.mockReset();
    dogCreateMock.mockResolvedValue({ id: "reference-parent" });
  });

  it("retains matching source details while inferring sex from the parent role", async () => {
    const dogIdByRegistration = new Map([["FI12345/21", "child"]]);
    const recordIssue = vi.fn();

    const result = await createReferenceOnlyParents({
      rows: [
        {
          registrationNo: "FI12345/21",
          name: "Child",
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: "FI99999/19",
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI99999/19",
          name: "Known sire",
          sex: "N",
          birthDateRaw: "20190506",
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: "Known Kennel",
          colorCode: 121,
        },
      ],
      dogIdByRegistration,
      breederIdByNameKey: new Map([["KNOWN KENNEL", "breeder-1"]]),
      importedDogColorCodes: new Set([121]),
      recordIssue,
    });

    expect(dogCreateMock).toHaveBeenCalledWith({
      data: {
        name: "Known sire",
        sex: "MALE",
        status: "REFERENCE_ONLY",
        birthDate: new Date("2019-05-06T00:00:00.000Z"),
        breederNameText: "Known Kennel",
        breederId: "breeder-1",
        colorCode: 121,
        registrations: {
          create: {
            registrationNo: "FI99999/19",
            source: "CANONICAL",
          },
        },
      },
      select: { id: true },
    });
    expect(dogIdByRegistration.get("FI99999/19")).toBe("reference-parent");
    expect(result.createdByRegistration.get("FI99999/19")).toEqual(
      expect.objectContaining({
        role: "sire",
        sex: "MALE",
        sourceDetailsMatched: true,
        usedRegistrationNameFallback: false,
      }),
    );
    expect(recordIssue).not.toHaveBeenCalled();
  });

  it("reuses an existing registration even when it appears in both parent roles", async () => {
    const dogIdByRegistration = new Map([
      ["FI12345/21", "child"],
      ["FI99999/19", "existing-parent"],
    ]);
    const recordIssue = vi.fn();

    const result = await createReferenceOnlyParents({
      rows: [
        {
          registrationNo: "FI12345/21",
          name: "Child",
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: "FI99999/19",
          damRegistrationNo: "FI99999/19",
          breederName: null,
          colorCode: null,
        },
      ],
      dogIdByRegistration,
      breederIdByNameKey: new Map(),
      importedDogColorCodes: new Set(),
      recordIssue,
    });

    expect(dogCreateMock).not.toHaveBeenCalled();
    expect(recordIssue).not.toHaveBeenCalled();
    expect(result.createdByRegistration.size).toBe(0);
    expect(result.ambiguousRegistrations.size).toBe(0);
  });

  it("ignores parent references from rows whose dog cannot write relations", async () => {
    dogCreateMock.mockResolvedValue({ id: "reference-sire" });
    const dogIdByRegistration = new Map([["FI12345/21", "child"]]);
    const recordIssue = vi.fn();

    const result = await createReferenceOnlyParents({
      rows: [
        {
          registrationNo: "FI12345/21",
          name: "Imported child",
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: "FI99999/19",
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI-NOT-IMPORTED/21",
          name: null,
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: "FI88888/18",
          damRegistrationNo: "FI99999/19",
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "INVALID REGISTRATION",
          name: "Invalid child",
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: "FI77777/17",
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
      ],
      dogIdByRegistration,
      breederIdByNameKey: new Map(),
      importedDogColorCodes: new Set(),
      recordIssue,
    });

    expect(dogCreateMock).toHaveBeenCalledTimes(1);
    expect(dogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "FI99999/19",
          sex: "MALE",
          status: "REFERENCE_ONLY",
        }),
      }),
    );
    expect(result.createdByRegistration.has("FI99999/19")).toBe(true);
    expect(result.createdByRegistration.has("FI88888/18")).toBe(false);
    expect(result.createdByRegistration.has("FI77777/17")).toBe(false);
    expect(result.ambiguousRegistrations.has("FI99999/19")).toBe(false);
    expect(recordIssue).not.toHaveBeenCalled();
  });
});
