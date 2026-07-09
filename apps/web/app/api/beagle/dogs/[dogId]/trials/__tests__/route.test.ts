import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getBeagleDogTrialsMock } = vi.hoisted(() => ({
  getBeagleDogTrialsMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  dogsService: {
    getBeagleDogTrials: getBeagleDogTrialsMock,
  },
}));

describe("public dog trials api route", () => {
  beforeEach(() => {
    getBeagleDogTrialsMock.mockReset();
  });

  it("returns dog trials for public clients", async () => {
    getBeagleDogTrialsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Ajometsan Aada",
          registrationNo: "FI-11/24",
          trials: [],
          summary: { allTrials: [] },
        },
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/beagle/dogs/dog_1/trials",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ dogId: "dog_1" }),
    });

    expect(response.status).toBe(200);
    expect(getBeagleDogTrialsMock).toHaveBeenCalledWith("dog_1");
  });

  it("forwards service error responses", async () => {
    getBeagleDogTrialsMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        error: "Dog profile not found.",
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/beagle/dogs/dog_1/trials",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ dogId: "dog_1" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Dog profile not found.",
    });
  });

  it("returns structured errors when the service throws", async () => {
    getBeagleDogTrialsMock.mockRejectedValue(new Error("boom"));

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/beagle/dogs/dog_1/trials",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ dogId: "dog_1" }),
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Failed to load dog trials.",
      code: "INTERNAL_ERROR",
    });
  });
});
