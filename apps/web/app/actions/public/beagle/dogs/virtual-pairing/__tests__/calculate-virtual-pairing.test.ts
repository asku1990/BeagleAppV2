import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculatePublicVirtualPairingAction } from "../calculate-virtual-pairing";

const {
  createActionLoggerMock,
  calculatePublicVirtualPairingMock,
  infoLogMock,
  warnLogMock,
  errorLogMock,
} = vi.hoisted(() => ({
  createActionLoggerMock: vi.fn(),
  calculatePublicVirtualPairingMock: vi.fn(),
  infoLogMock: vi.fn(),
  warnLogMock: vi.fn(),
  errorLogMock: vi.fn(),
}));

vi.mock("@/lib/server/action-logger", () => ({
  createActionLogger: createActionLoggerMock,
}));

vi.mock("@beagle/server", () => ({
  calculatePublicVirtualPairing: calculatePublicVirtualPairingMock,
  toErrorLog: (error: unknown) => ({ error }),
}));

describe("calculatePublicVirtualPairingAction", () => {
  beforeEach(() => {
    createActionLoggerMock.mockReset();
    calculatePublicVirtualPairingMock.mockReset();
    infoLogMock.mockReset();
    warnLogMock.mockReset();
    errorLogMock.mockReset();
    createActionLoggerMock.mockResolvedValue({
      log: {
        info: infoLogMock,
        warn: warnLogMock,
        error: errorLogMock,
      },
      requestId: "req_1",
    });
  });

  it("returns public calculation data", async () => {
    calculatePublicVirtualPairingMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          generationDepth: 9,
          sire: {
            id: "sire",
            ekNo: 1,
            registrationNo: "FI1/20",
            name: "Sire",
            sex: "U",
          },
          dam: {
            id: "dam",
            ekNo: 2,
            registrationNo: "FI2/20",
            name: "Dam",
            sex: "N",
          },
          inbreedingCoefficientPct: 12.5,
          rawInbreedingCoefficientPct: 12.5,
          health: {
            epi: {
              value: 0,
              text: "-----",
              tier: 1,
              display: "0.000 -----",
            },
            risk: {
              value: 4,
              display: "4",
            },
          },
          summary: {
            sharedAncestorCount: 1,
            sharedOccurrenceCount: 1,
            includedOccurrenceCount: 1,
            includedSirePositionCount: 1,
            includedDamPositionCount: 1,
            includedPositionCount: 2,
            knownPedigreePct: 100,
            contributions: [],
          },
        },
      },
    });

    await expect(
      calculatePublicVirtualPairingAction({
        sireRegistrationNo: "FI1/20",
        damRegistrationNo: "FI2/20",
        generationDepth: 9,
      }),
    ).resolves.toEqual({
      data: expect.objectContaining({
        generationDepth: 9,
        sire: expect.objectContaining({ registrationNo: "FI1/20" }),
        dam: expect.objectContaining({ registrationNo: "FI2/20" }),
        inbreedingCoefficientPct: 12.5,
      }),
      hasError: false,
    });
  });
});
