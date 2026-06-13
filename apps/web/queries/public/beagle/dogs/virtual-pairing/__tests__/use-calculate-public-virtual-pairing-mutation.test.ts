import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCalculatePublicVirtualPairingMutation } from "../use-calculate-public-virtual-pairing-mutation";

const { useMutationMock, calculatePublicVirtualPairingMock } = vi.hoisted(
  () => ({
    useMutationMock: vi.fn(),
    calculatePublicVirtualPairingMock: vi.fn(),
  }),
);

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
}));

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    calculatePublicVirtualPairing: calculatePublicVirtualPairingMock,
  },
}));

describe("useCalculatePublicVirtualPairingMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    calculatePublicVirtualPairingMock.mockReset();
  });

  it("returns the payload from the api client", async () => {
    useMutationMock.mockImplementation((options) => options);
    calculatePublicVirtualPairingMock.mockResolvedValue({
      ok: true,
      data: {
        generationDepth: 9,
        sire: {
          id: "sire",
          ekNo: 5588,
          registrationNo: "FI54321/20",
          name: "Korven Aatos",
          sex: "U",
        },
        dam: {
          id: "dam",
          ekNo: 4422,
          registrationNo: "FI77777/18",
          name: "Havupolun Helmi",
          sex: "N",
        },
        inbreedingCoefficientPct: 12.5,
        rawInbreedingCoefficientPct: 12.5,
        health: {
          epi: {
            value: 0.75,
            text: "-S--P",
            tier: 1,
            display: "0.750 -S--P",
          },
          risk: {
            value: 6,
            display: "6",
          },
        },
        summary: {
          sharedAncestorCount: 2,
          sharedOccurrenceCount: 3,
          includedOccurrenceCount: 2,
          includedSirePositionCount: 2,
          includedDamPositionCount: 2,
          includedPositionCount: 4,
          knownPedigreePct: 81.02,
          contributions: [],
        },
      },
    });

    useCalculatePublicVirtualPairingMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
        generationDepth: 9,
      }),
    ).resolves.toMatchObject({
      generationDepth: 9,
      inbreedingCoefficientPct: 12.5,
      health: expect.objectContaining({
        epi: expect.objectContaining({
          value: 0.75,
          text: "-S--P",
          tier: 1,
          display: "0.750 -S--P",
        }),
        risk: expect.objectContaining({
          value: 6,
          display: "6",
        }),
      }),
    });
  });

  it("throws when the api client returns an error", async () => {
    useMutationMock.mockImplementation((options) => options);
    calculatePublicVirtualPairingMock.mockResolvedValue({
      ok: false,
      error: "Sire and dam must be different dogs.",
    });

    useCalculatePublicVirtualPairingMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
      }),
    ).rejects.toThrow("Sire and dam must be different dogs.");
  });
});
