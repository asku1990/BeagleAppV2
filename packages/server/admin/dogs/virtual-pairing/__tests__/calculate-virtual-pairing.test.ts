import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateAdminVirtualPairing } from "../calculate-virtual-pairing";

const {
  findVirtualPairingDogByRegistrationNoDbMock,
  findVirtualPairingAncestorDetailsDbMock,
  loadDogPedigreeAncestryForParentsDbMock,
} = vi.hoisted(() => ({
  findVirtualPairingDogByRegistrationNoDbMock: vi.fn(),
  findVirtualPairingAncestorDetailsDbMock: vi.fn(),
  loadDogPedigreeAncestryForParentsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  findVirtualPairingDogByRegistrationNoDb:
    findVirtualPairingDogByRegistrationNoDbMock,
  findVirtualPairingAncestorDetailsDb: findVirtualPairingAncestorDetailsDbMock,
  loadDogPedigreeAncestryForParentsDb: loadDogPedigreeAncestryForParentsDbMock,
}));

const adminUser = {
  id: "admin_1",
  email: "admin@example.com",
  username: "admin",
  role: "ADMIN" as const,
};

describe("calculateAdminVirtualPairing", () => {
  beforeEach(() => {
    findVirtualPairingDogByRegistrationNoDbMock.mockReset();
    findVirtualPairingAncestorDetailsDbMock.mockReset();
    loadDogPedigreeAncestryForParentsDbMock.mockReset();
  });

  it("calculates inbreeding and passes the selected generation depth", async () => {
    findVirtualPairingDogByRegistrationNoDbMock
      .mockResolvedValueOnce({
        id: "sire",
        name: "Korven Aatos",
        ekNo: 5588,
        sex: "MALE",
        registrationNo: "FI54321/20",
      })
      .mockResolvedValueOnce({
        id: "dam",
        name: "Havupolun Helmi",
        ekNo: 4422,
        sex: "FEMALE",
        registrationNo: "FI77777/18",
      });
    loadDogPedigreeAncestryForParentsDbMock.mockResolvedValue({
      rootId: "sire:dam",
      nodes: {
        sire: {
          id: "sire",
          sireId: "ancestor",
          damId: null,
          siitosasteProsentti: null,
        },
        dam: {
          id: "dam",
          sireId: "ancestor",
          damId: null,
          siitosasteProsentti: null,
        },
        ancestor: {
          id: "ancestor",
          sireId: null,
          damId: null,
          siitosasteProsentti: null,
        },
      },
    });
    findVirtualPairingAncestorDetailsDbMock.mockResolvedValue([
      {
        id: "ancestor",
        name: "Ancestor",
        ekNo: 1,
        registrationNo: "FI0001/00",
      },
    ]);

    await expect(
      calculateAdminVirtualPairing(
        {
          sireRegistrationNo: "fi54321/20",
          damRegistrationNo: "fi77777/18",
          generationDepth: 5,
        },
        adminUser,
      ),
    ).resolves.toMatchObject({
      status: 200,
      body: {
        ok: true,
        data: {
          generationDepth: 5,
          sire: {
            id: "sire",
            registrationNo: "FI54321/20",
          },
          dam: {
            id: "dam",
            registrationNo: "FI77777/18",
          },
          inbreedingCoefficientPct: 12.5,
          diagnostics: expect.objectContaining({
            sharedAncestorCount: 1,
            sharedOccurrenceCount: 1,
            includedOccurrenceCount: 1,
            includedSirePositionCount: 1,
            includedDamPositionCount: 1,
            includedPositionCount: 2,
            contributions: [
              expect.objectContaining({
                ancestorId: "ancestor",
                contributionPct: 12.5,
                rawContributionPct: 12.5,
                occurrenceCount: 1,
                displayPct: "12.50000 %",
              }),
            ],
          }),
        },
      },
    });

    expect(loadDogPedigreeAncestryForParentsDbMock).toHaveBeenCalledWith(
      "sire",
      "dam",
      5,
    );
  });

  it("normalizes registration numbers before lookup", async () => {
    findVirtualPairingDogByRegistrationNoDbMock
      .mockResolvedValueOnce({
        id: "sire",
        name: "Korven Aatos",
        ekNo: 5588,
        sex: "MALE",
        registrationNo: "FI54321/20",
      })
      .mockResolvedValueOnce({
        id: "dam",
        name: "Havupolun Helmi",
        ekNo: 4422,
        sex: "FEMALE",
        registrationNo: "FI77777/18",
      });
    loadDogPedigreeAncestryForParentsDbMock.mockResolvedValue({
      rootId: "sire:dam",
      nodes: {
        sire: {
          id: "sire",
          sireId: null,
          damId: null,
          siitosasteProsentti: null,
        },
        dam: {
          id: "dam",
          sireId: null,
          damId: null,
          siitosasteProsentti: null,
        },
      },
    });
    findVirtualPairingAncestorDetailsDbMock.mockResolvedValue([]);

    await calculateAdminVirtualPairing(
      {
        sireRegistrationNo: " fi54321/20 ",
        damRegistrationNo: " Fi77777/18 ",
        generationDepth: 5,
      },
      adminUser,
    );

    expect(findVirtualPairingDogByRegistrationNoDbMock).toHaveBeenNthCalledWith(
      1,
      "FI54321/20",
    );
    expect(findVirtualPairingDogByRegistrationNoDbMock).toHaveBeenNthCalledWith(
      2,
      "FI77777/18",
    );
  });

  it("rejects unauthenticated requests", async () => {
    await expect(
      calculateAdminVirtualPairing(
        {
          sireRegistrationNo: "FI54321/20",
          damRegistrationNo: "FI77777/18",
        },
        null,
      ),
    ).resolves.toMatchObject({
      status: 401,
      body: {
        ok: false,
        code: "UNAUTHENTICATED",
      },
    });
  });

  it("rejects same-dog selections", async () => {
    findVirtualPairingDogByRegistrationNoDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Korven Aatos",
      ekNo: 5588,
      sex: "MALE",
      registrationNo: "FI54321/20",
    });

    await expect(
      calculateAdminVirtualPairing(
        {
          sireRegistrationNo: "FI54321/20",
          damRegistrationNo: "FI54321/20",
        },
        adminUser,
      ),
    ).resolves.toMatchObject({
      status: 400,
      body: {
        ok: false,
        code: "INVALID_PARENT_COMBINATION",
      },
    });

    expect(loadDogPedigreeAncestryForParentsDbMock).not.toHaveBeenCalled();
  });

  it("rejects wrong-sex selections", async () => {
    findVirtualPairingDogByRegistrationNoDbMock
      .mockResolvedValueOnce({
        id: "sire",
        name: "Korven Aatos",
        ekNo: 5588,
        sex: "FEMALE",
        registrationNo: "FI54321/20",
      })
      .mockResolvedValueOnce({
        id: "dam",
        name: "Havupolun Helmi",
        ekNo: 4422,
        sex: "MALE",
        registrationNo: "FI77777/18",
      });

    await expect(
      calculateAdminVirtualPairing(
        {
          sireRegistrationNo: "FI54321/20",
          damRegistrationNo: "FI77777/18",
        },
        adminUser,
      ),
    ).resolves.toMatchObject({
      status: 400,
      body: {
        ok: false,
        code: "INVALID_SIRE_SEX",
      },
    });
  });
});
