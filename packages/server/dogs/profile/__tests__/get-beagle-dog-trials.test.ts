import { beforeEach, describe, expect, it, vi } from "vitest";

const { getBeagleDogTrialsDbMock } = vi.hoisted(() => ({
  getBeagleDogTrialsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getBeagleDogTrialsDb: getBeagleDogTrialsDbMock,
}));

import { getBeagleDogTrialsService } from "../get-beagle-dog-trials";

describe("getBeagleDogTrialsService", () => {
  beforeEach(() => {
    getBeagleDogTrialsDbMock.mockReset();
  });

  it("returns 400 for invalid dog id", async () => {
    const result = await getBeagleDogTrialsService("   ");

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Dog ID is required." },
    });
    expect(getBeagleDogTrialsDbMock).not.toHaveBeenCalled();
  });

  it("returns 404 when dog is missing", async () => {
    getBeagleDogTrialsDbMock.mockResolvedValue(null);

    const result = await getBeagleDogTrialsService("dog_1");

    expect(result).toEqual({
      status: 404,
      body: { ok: false, error: "Dog profile not found." },
    });
  });

  it("returns mapped trials payload", async () => {
    getBeagleDogTrialsDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Ajometsan Aada",
      registrationNo: "FI-11/24",
      trials: [],
    });

    const result = await getBeagleDogTrialsService(" dog_1 ");

    expect(getBeagleDogTrialsDbMock).toHaveBeenCalledWith("dog_1");
    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Ajometsan Aada",
          registrationNo: "FI-11/24",
          trials: [],
        },
      },
    });
  });

  it("returns 500 when db fails", async () => {
    getBeagleDogTrialsDbMock.mockRejectedValue(new Error("boom"));

    const result = await getBeagleDogTrialsService("dog_1");

    expect(result).toEqual({
      status: 500,
      body: { ok: false, error: "Failed to load dog trials." },
    });
  });
});
