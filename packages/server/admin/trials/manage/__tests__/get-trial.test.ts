import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminTrial } from "../get-trial";

const { getAdminTrialDetailsDbMock } = vi.hoisted(() => ({
  getAdminTrialDetailsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getAdminTrialDetailsDb: getAdminTrialDetailsDbMock,
}));

describe("getAdminTrial", () => {
  beforeEach(() => {
    getAdminTrialDetailsDbMock.mockReset();
  });

  it("returns bad request for an empty trial id", async () => {
    await expect(getAdminTrial({ trialId: "   " }, null)).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid trial id.",
        code: "INVALID_TRIAL_ID",
      },
    });

    expect(getAdminTrialDetailsDbMock).not.toHaveBeenCalled();
  });

  it("returns unauthorized when the user is missing", async () => {
    await expect(getAdminTrial({ trialId: "trial-1" }, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(getAdminTrialDetailsDbMock).not.toHaveBeenCalled();
  });

  it("returns not found when db has no matching row", async () => {
    getAdminTrialDetailsDbMock.mockResolvedValue(null);

    await expect(
      getAdminTrial(
        { trialId: "trial-404" },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "Trial not found.",
        code: "TRIAL_NOT_FOUND",
      },
    });

    expect(getAdminTrialDetailsDbMock).toHaveBeenCalledWith({
      trialId: "trial-404",
    });
  });

  it("maps trial details from db to contract format", async () => {
    getAdminTrialDetailsDbMock.mockResolvedValue({
      trialId: "trial-1",
      dogId: "dog-1",
      dogName: "Rex",
      registrationNo: "FI12345/21",
      eventDate: new Date("2026-04-10T06:00:00.000Z"),
      eventName: "Kevätkoe",
      eventPlace: "Helsinki",
      kennelDistrict: "Etelä",
      kennelDistrictNo: "01",
      ke: "KE",
      lk: "A",
      pa: "VOI1",
      piste: 87.5,
      sija: "2",
      haku: 12.5,
      hauk: 10,
      yva: 9,
      hlo: 1,
      alo: 2,
      tja: 3,
      pin: 4,
      judge: "Judge One",
      legacyFlag: "L",
      sourceKey: "source-1",
      createdAt: new Date("2026-04-10T06:30:00.000Z"),
      updatedAt: new Date("2026-04-10T07:00:00.000Z"),
    });

    await expect(
      getAdminTrial(
        { trialId: "trial-1" },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          trial: {
            trialId: "trial-1",
            dogId: "dog-1",
            dogName: "Rex",
            registrationNo: "FI12345/21",
            eventDate: "2026-04-10",
            eventName: "Kevätkoe",
            eventPlace: "Helsinki",
            kennelDistrict: "Etelä",
            kennelDistrictNo: "01",
            ke: "KE",
            lk: "A",
            pa: "VOI1",
            piste: 87.5,
            sija: "2",
            haku: 12.5,
            hauk: 10,
            yva: 9,
            hlo: 1,
            alo: 2,
            tja: 3,
            pin: 4,
            judge: "Judge One",
            legacyFlag: "L",
            sourceKey: "source-1",
            rawPayloadJson: null,
            rawPayloadAvailable: false,
            createdAt: "2026-04-10T06:30:00.000Z",
            updatedAt: "2026-04-10T07:00:00.000Z",
          },
        },
      },
    });
  });

  it("returns internal error when db throws", async () => {
    getAdminTrialDetailsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      getAdminTrial(
        { trialId: "trial-1" },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin trial details.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
