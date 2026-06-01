import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { useCalculateAdminVirtualPairingMutation } from "../use-calculate-admin-virtual-pairing-mutation";

const { useMutationMock, calculateAdminVirtualPairingActionMock } = vi.hoisted(
  () => ({
    useMutationMock: vi.fn(),
    calculateAdminVirtualPairingActionMock: vi.fn(),
  }),
);

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
}));

vi.mock("@/app/actions/admin/dogs/virtual-pairing", () => ({
  calculateAdminVirtualPairingAction: calculateAdminVirtualPairingActionMock,
}));

describe("useCalculateAdminVirtualPairingMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    calculateAdminVirtualPairingActionMock.mockReset();
  });

  it("calls the action and returns the payload", async () => {
    useMutationMock.mockImplementation((options) => options);
    calculateAdminVirtualPairingActionMock.mockResolvedValue({
      hasError: false,
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
        health: {
          epi: {
            value: 0.75,
            text: "-S--P",
            tier: 1,
            display: "0.750 -S--P",
          },
          lafora: {
            value: 5,
            display: "5",
          },
          risk: {
            value: 6,
            display: "6",
          },
          pur: {
            value: 0.75,
            text: "-S--P",
            display: "0.750 -S--P",
          },
        },
        diagnostics: {
          sharedAncestorCount: 2,
          sharedOccurrenceCount: 3,
          includedOccurrenceCount: 2,
          includedSirePositionCount: 2,
          includedDamPositionCount: 2,
          includedPositionCount: 4,
          knownSlotCount: 10,
          knownPedigreePct: 81.02,
          contributions: [],
        },
        placeholders: {
          diagnostics: {
            label: "Tulossa myöhemmässä vaiheessa: diagnostiikka",
            value: "Tulossa myöhemmässä vaiheessa",
          },
          pedigree: {
            label: "Siirry sukutauluun",
            value: "Tulossa myöhemmässä vaiheessa",
          },
        },
      },
    });

    useCalculateAdminVirtualPairingMutation();
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
      inbreedingCoefficientPct: 12.5,
      health: expect.objectContaining({
        epi: expect.objectContaining({
          value: 0.75,
          text: "-S--P",
          tier: 1,
          display: "0.750 -S--P",
        }),
        lafora: expect.objectContaining({
          value: 5,
          display: "5",
        }),
        risk: expect.objectContaining({
          value: 6,
          display: "6",
        }),
        pur: expect.objectContaining({
          value: 0.75,
          text: "-S--P",
          display: "0.750 -S--P",
        }),
      }),
    });
  });

  it("throws AdminMutationError when the action fails", async () => {
    useMutationMock.mockImplementation((options) => options);
    calculateAdminVirtualPairingActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INVALID_PARENT_COMBINATION",
      message: "Sire and dam must be different dogs.",
    });

    useCalculateAdminVirtualPairingMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
      }),
    ).rejects.toBeInstanceOf(AdminMutationError);
  });
});
