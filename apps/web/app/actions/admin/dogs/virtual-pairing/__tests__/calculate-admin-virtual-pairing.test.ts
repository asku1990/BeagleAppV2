import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateAdminVirtualPairingAction } from "../calculate-admin-virtual-pairing";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  calculateAdminVirtualPairingMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  calculateAdminVirtualPairingMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  calculateAdminVirtualPairing: calculateAdminVirtualPairingMock,
}));

describe("calculateAdminVirtualPairingAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    calculateAdminVirtualPairingMock.mockReset();
  });

  it("returns mapped service data when calculation succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    calculateAdminVirtualPairingMock.mockResolvedValue({
      status: 200,
      body: {
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
            contributions: [
              {
                ancestorId: "a_1",
                label: "Ancestor One FI123/20",
                contributionPct: 0.83008,
                rawContributionPct: 0.78125,
                occurrenceCount: 1,
                displayPct: "0.83008 %",
                sireGeneration: 2,
                sireIndex: 1,
                damGeneration: 2,
                damIndex: 1,
              },
            ],
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
      },
    });

    await expect(
      calculateAdminVirtualPairingAction({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
        generationDepth: 9,
      }),
    ).resolves.toEqual({
      data: expect.objectContaining({
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
      }),
      hasError: false,
    });
  });

  it("returns unauthenticated when admin access is missing", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 401 });

    await expect(
      calculateAdminVirtualPairingAction({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
      }),
    ).resolves.toMatchObject({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    });
  });
});
