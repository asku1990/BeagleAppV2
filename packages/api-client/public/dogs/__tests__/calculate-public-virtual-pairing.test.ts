import { describe, expect, it, vi } from "vitest";
import { calculatePublicVirtualPairing } from "../calculate-public-virtual-pairing";

describe("calculatePublicVirtualPairing", () => {
  it("calls request with expected path and method", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await calculatePublicVirtualPairing(requestMock, {
      sireRegistrationNo: "FI12345/21",
      damRegistrationNo: "FI54321/21",
      generationDepth: 9,
    });

    expect(requestMock).toHaveBeenCalledWith(
      "/api/beagle/dogs/virtual-pairing/calculate?sireRegistrationNo=FI12345%2F21&damRegistrationNo=FI54321%2F21&generationDepth=9",
      { method: "GET" },
    );
  });

  it("omits optional generation depth when not provided", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await calculatePublicVirtualPairing(requestMock, {
      sireRegistrationNo: "FI12345/21",
      damRegistrationNo: "FI54321/21",
    });

    expect(requestMock).toHaveBeenCalledWith(
      "/api/beagle/dogs/virtual-pairing/calculate?sireRegistrationNo=FI12345%2F21&damRegistrationNo=FI54321%2F21",
      { method: "GET" },
    );
  });
});
