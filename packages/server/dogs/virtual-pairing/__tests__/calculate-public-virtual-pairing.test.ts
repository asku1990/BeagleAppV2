import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  calculateVirtualPairingMock: vi.fn(),
}));

const calculateVirtualPairingMock = hoisted.calculateVirtualPairingMock;

vi.mock("../calculate-virtual-pairing", () => ({
  calculateVirtualPairing: hoisted.calculateVirtualPairingMock,
}));

const { calculatePublicVirtualPairing } =
  await import("../calculate-public-virtual-pairing");

describe("calculatePublicVirtualPairing", () => {
  beforeEach(() => {
    calculateVirtualPairingMock.mockReset();
  });

  it("maps the core result to the public response", async () => {
    calculateVirtualPairingMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          generationDepth: 9,
          sire: {
            id: "sire-1",
            ekNo: 123,
            registrationNo: "FI12345/21",
            name: "Sire",
            sex: "U",
          },
          dam: {
            id: "dam-1",
            ekNo: 456,
            registrationNo: "FI54321/21",
            name: "Dam",
            sex: "N",
          },
          inbreedingCoefficientPct: 1.2345,
          rawInbreedingCoefficientPct: 1.5,
          health: {
            epi: { value: 0.1, text: "epi", tier: 1, display: "0.1 epi" },
            risk: { value: 2, display: "2" },
          },
          diagnostics: {
            sharedAncestorCount: 2,
            sharedOccurrenceCount: 3,
            includedOccurrenceCount: 2,
            includedSirePositionCount: 1,
            includedDamPositionCount: 1,
            includedPositionCount: 2,
            knownPedigreePct: 75,
            contributionPct: 1.2345,
            contributions: [
              {
                id: "anc-1",
                adjustedContributionPct: 0.75,
                rawContributionPct: 1,
                occurrenceCount: 2,
                includedOccurrences: [
                  {
                    sireGeneration: 1,
                    sireIndex: 1,
                    damGeneration: 2,
                    damIndex: 3,
                  },
                ],
              },
            ],
          },
          ancestorDetailsById: new Map([
            [
              "anc-1",
              {
                id: "anc-1",
                name: "Ancestor One",
                registrationNo: "FI00001/20",
                ekNo: 99,
              },
            ],
          ]),
        },
      },
    });

    await expect(
      calculatePublicVirtualPairing({
        sireRegistrationNo: " fi12345/21 ",
        damRegistrationNo: " fi54321/21 ",
        generationDepth: 9,
      }),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          generationDepth: 9,
          sire: {
            id: "sire-1",
            ekNo: 123,
            registrationNo: "FI12345/21",
            name: "Sire",
            sex: "U",
          },
          dam: {
            id: "dam-1",
            ekNo: 456,
            registrationNo: "FI54321/21",
            name: "Dam",
            sex: "N",
          },
          inbreedingCoefficientPct: 1.2345,
          rawInbreedingCoefficientPct: 1.5,
          health: {
            epi: { value: 0.1, text: "epi", tier: 1, display: "0.1 epi" },
            risk: { value: 2, display: "2" },
          },
          summary: {
            sharedAncestorCount: 2,
            sharedOccurrenceCount: 3,
            includedOccurrenceCount: 2,
            includedSirePositionCount: 1,
            includedDamPositionCount: 1,
            includedPositionCount: 2,
            knownPedigreePct: 75,
            contributions: [
              {
                ancestorId: "anc-1",
                label: "Ancestor One EK:99 FI00001/20",
                contributionPct: 0.75,
                rawContributionPct: 1,
                occurrenceCount: 2,
                positions: [
                  {
                    sireGeneration: 1,
                    sireIndex: 1,
                    damGeneration: 2,
                    damIndex: 3,
                  },
                ],
              },
            ],
          },
        },
      },
    });

    expect(calculateVirtualPairingMock).toHaveBeenCalledWith({
      sireRegistrationNo: " fi12345/21 ",
      damRegistrationNo: " fi54321/21 ",
      generationDepth: 9,
    });
  });

  it("passes through a failing service result", async () => {
    calculateVirtualPairingMock.mockResolvedValue({
      status: 400,
      body: {
        ok: false,
        code: "INVALID_SIRE_REGISTRATION",
        error: "Sire registration number was not found.",
      },
    });

    await expect(
      calculatePublicVirtualPairing({
        sireRegistrationNo: "bad",
        damRegistrationNo: "good",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        code: "INVALID_SIRE_REGISTRATION",
        error: "Sire registration number was not found.",
      },
    });
  });
});
