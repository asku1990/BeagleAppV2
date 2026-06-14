import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { calculatePublicVirtualPairingMock } = vi.hoisted(() => ({
  calculatePublicVirtualPairingMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  calculatePublicVirtualPairing: calculatePublicVirtualPairingMock,
}));

describe("public virtual pairing calculate api route", () => {
  beforeEach(() => {
    calculatePublicVirtualPairingMock.mockReset();
  });

  it("returns calculation results for public clients", async () => {
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

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/beagle/dogs/virtual-pairing/calculate?sireRegistrationNo=FI1%2F20&damRegistrationNo=FI2%2F20&generationDepth=9",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(calculatePublicVirtualPairingMock).toHaveBeenCalledWith({
      sireRegistrationNo: "FI1/20",
      damRegistrationNo: "FI2/20",
      generationDepth: 9,
    });
  });

  it("returns structured errors when the service throws", async () => {
    calculatePublicVirtualPairingMock.mockRejectedValue(new Error("boom"));

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/beagle/dogs/virtual-pairing/calculate?sireRegistrationNo=FI1%2F20&damRegistrationNo=FI2%2F20",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Failed to calculate virtual pairing data.",
      code: "INTERNAL_ERROR",
    });
  });
});
