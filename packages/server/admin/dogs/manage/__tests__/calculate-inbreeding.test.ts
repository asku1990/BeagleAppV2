import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateAdminDogInbreeding } from "../calculate-inbreeding";

const { findDogByRegistrationNoDbMock, loadAncestryForParentsDbMock } =
  vi.hoisted(() => ({
    findDogByRegistrationNoDbMock: vi.fn(),
    loadAncestryForParentsDbMock: vi.fn(),
  }));

vi.mock("@beagle/db", () => ({
  findDogByRegistrationNoDb: findDogByRegistrationNoDbMock,
  loadDogPedigreeAncestryForParentsDb: loadAncestryForParentsDbMock,
}));

const adminUser = {
  id: "admin_1",
  email: "admin@example.com",
  username: "admin",
  role: "ADMIN" as const,
};

describe("calculateAdminDogInbreeding", () => {
  beforeEach(() => {
    findDogByRegistrationNoDbMock.mockReset();
    loadAncestryForParentsDbMock.mockReset();
  });

  it("calculates inbreeding for selected parents", async () => {
    findDogByRegistrationNoDbMock
      .mockResolvedValueOnce({ id: "sire", sex: "MALE" })
      .mockResolvedValueOnce({ id: "dam", sex: "FEMALE" });
    loadAncestryForParentsDbMock.mockResolvedValue({
      rootId: "sire:dam",
      nodes: {
        sire: {
          id: "sire",
          sireId: "ancestor",
          damId: null,
          siitosasteProsentti: null,
        },
        dam: {
          id: "dam",
          sireId: "ancestor",
          damId: null,
          siitosasteProsentti: null,
        },
        ancestor: {
          id: "ancestor",
          sireId: null,
          damId: null,
          siitosasteProsentti: null,
        },
      },
    });

    await expect(
      calculateAdminDogInbreeding(
        {
          sireRegistrationNo: "SIRE-1",
          damRegistrationNo: "DAM-1",
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: { inbreedingCoefficientPct: 12.5 },
      },
    });

    expect(loadAncestryForParentsDbMock).toHaveBeenCalledWith(
      "sire",
      "dam",
      17,
    );
  });

  it("returns 400 when sire registration is missing", async () => {
    await expect(
      calculateAdminDogInbreeding(
        {
          sireRegistrationNo: " ",
          damRegistrationNo: "DAM-1",
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Sire registration number was not found.",
        code: "INVALID_SIRE_REGISTRATION",
      },
    });
    expect(loadAncestryForParentsDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 when dam registration cannot resolve", async () => {
    findDogByRegistrationNoDbMock
      .mockResolvedValueOnce({ id: "sire", sex: "MALE" })
      .mockResolvedValueOnce(null);

    await expect(
      calculateAdminDogInbreeding(
        {
          sireRegistrationNo: "SIRE-1",
          damRegistrationNo: "DAM-1",
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Dam registration number was not found.",
        code: "INVALID_DAM_REGISTRATION",
      },
    });
    expect(loadAncestryForParentsDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 when selected sire is not male", async () => {
    findDogByRegistrationNoDbMock
      .mockResolvedValueOnce({ id: "sire", sex: "FEMALE" })
      .mockResolvedValueOnce({ id: "dam", sex: "FEMALE" });

    await expect(
      calculateAdminDogInbreeding(
        {
          sireRegistrationNo: "SIRE-1",
          damRegistrationNo: "DAM-1",
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Selected sire must be a male dog.",
        code: "INVALID_SIRE_SEX",
      },
    });
    expect(loadAncestryForParentsDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 when selected dam is not female", async () => {
    findDogByRegistrationNoDbMock
      .mockResolvedValueOnce({ id: "sire", sex: "MALE" })
      .mockResolvedValueOnce({ id: "dam", sex: "MALE" });

    await expect(
      calculateAdminDogInbreeding(
        {
          sireRegistrationNo: "SIRE-1",
          damRegistrationNo: "DAM-1",
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Selected dam must be a female dog.",
        code: "INVALID_DAM_SEX",
      },
    });
    expect(loadAncestryForParentsDbMock).not.toHaveBeenCalled();
  });
});
