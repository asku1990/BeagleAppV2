import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBeagleTrialDetailsAction } from "../get-trial-details";

const {
  createActionLoggerMock,
  getBeagleTrialDetailsMock,
  infoLogMock,
  warnLogMock,
  errorLogMock,
} = vi.hoisted(() => ({
  createActionLoggerMock: vi.fn(),
  getBeagleTrialDetailsMock: vi.fn(),
  infoLogMock: vi.fn(),
  warnLogMock: vi.fn(),
  errorLogMock: vi.fn(),
}));

vi.mock("@/lib/server/action-logger", () => ({
  createActionLogger: createActionLoggerMock,
}));

vi.mock("@beagle/server", () => ({
  trialsService: {
    getBeagleTrialDetails: getBeagleTrialDetailsMock,
  },
  toErrorLog: (error: unknown) => ({ error }),
}));

describe("getBeagleTrialDetailsAction", () => {
  beforeEach(() => {
    createActionLoggerMock.mockReset();
    getBeagleTrialDetailsMock.mockReset();
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

  it("returns 400 for empty trial id and skips service", async () => {
    await expect(getBeagleTrialDetailsAction("   ")).resolves.toEqual({
      data: null,
      hasError: true,
      status: 400,
      error: "Invalid trial id.",
    });

    expect(getBeagleTrialDetailsMock).not.toHaveBeenCalled();
  });

  it("returns mapped status and error on failure", async () => {
    getBeagleTrialDetailsMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        error: "Trial not found.",
      },
    });

    await expect(getBeagleTrialDetailsAction("s_missing")).resolves.toEqual({
      data: null,
      hasError: true,
      status: 404,
      error: "Trial not found.",
    });
  });
});
