import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDogProfileAction } from "../get-dog-profile";

const {
  createActionLoggerMock,
  getBeagleDogProfileMock,
  infoLogMock,
  warnLogMock,
  errorLogMock,
} = vi.hoisted(() => ({
  createActionLoggerMock: vi.fn(),
  getBeagleDogProfileMock: vi.fn(),
  infoLogMock: vi.fn(),
  warnLogMock: vi.fn(),
  errorLogMock: vi.fn(),
}));

vi.mock("@/lib/server/action-logger", () => ({
  createActionLogger: createActionLoggerMock,
}));

vi.mock("@beagle/server", () => ({
  dogsService: {
    getBeagleDogProfile: getBeagleDogProfileMock,
  },
  toErrorLog: (error: unknown) => ({ error }),
}));

describe("getDogProfileAction", () => {
  beforeEach(() => {
    createActionLoggerMock.mockReset();
    getBeagleDogProfileMock.mockReset();
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

  it("returns 400 for invalid dogId and skips service call", async () => {
    await expect(getDogProfileAction("??")).resolves.toEqual({
      data: null,
      hasError: true,
      status: 400,
      error: "Invalid dog id.",
    });

    expect(getBeagleDogProfileMock).not.toHaveBeenCalled();
    expect(warnLogMock).toHaveBeenCalled();
  });

  it("normalizes dogId and calls service", async () => {
    getBeagleDogProfileMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Aada",
          title: null,
          registrationNo: "FI-1/20",
          registrationNos: ["FI-1/20"],
          birthDate: "2020-01-01",
          sex: "N",
          color: null,
          ekNo: null,
          inbreedingCoefficientPct: null,
          sire: null,
          dam: null,
          pedigree: [],
          shows: [],
          trials: [],
        },
      },
    });

    await expect(getDogProfileAction(" dog_1 ")).resolves.toEqual({
      data: {
        id: "dog_1",
        name: "Aada",
        title: null,
        registrationNo: "FI-1/20",
        registrationNos: ["FI-1/20"],
        birthDate: "2020-01-01",
        sex: "N",
        color: null,
        ekNo: null,
        inbreedingCoefficientPct: null,
        sire: null,
        dam: null,
        pedigree: [],
        shows: [],
        trials: [],
      },
      hasError: false,
      status: 200,
    });

    expect(getBeagleDogProfileMock).toHaveBeenCalledWith("dog_1", {
      requestId: "req_1",
    });
  });

  it("returns error payload when service throws", async () => {
    getBeagleDogProfileMock.mockRejectedValue(new Error("boom"));

    await expect(getDogProfileAction("dog_1")).resolves.toEqual({
      data: null,
      hasError: true,
      status: 500,
      error: "Failed to load dog profile.",
    });

    expect(errorLogMock).toHaveBeenCalled();
  });
});
