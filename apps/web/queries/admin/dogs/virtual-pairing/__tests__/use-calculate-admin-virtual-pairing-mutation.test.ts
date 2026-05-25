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
          epi: {
            label: "EPI-luku (5 sp)",
            value: "Tulossa myöhemmässä vaiheessa",
          },
          lafora: {
            label: "Lafora-luku (-1..7)",
            value: "Tulossa myöhemmässä vaiheessa",
          },
          pur: {
            label: "PUR-luku (5 sp)",
            value: "Tulossa myöhemmässä vaiheessa",
          },
          risk: {
            label: "Riskiluku (1-8)",
            value: "Tulossa myöhemmässä vaiheessa",
          },
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
