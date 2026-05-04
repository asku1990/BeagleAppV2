import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminTrialEntryAction } from "../update-admin-trial-entry";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  updateAdminTrialEntryMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  updateAdminTrialEntryMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  updateAdminTrialEntry: updateAdminTrialEntryMock,
}));

const payload = {
  trialEventId: "event-1",
  trialEntryId: "entry-1",
  entry: {
    koemaasto: null,
    koemuoto: "AJOK",
    koetyyppi: "NORMAL" as const,
    ke: null,
    lk: null,
    award: null,
    rank: null,
    points: null,
    koiriaLuokassa: null,
    hyvaksytytAjominuutit: null,
    ajoajanPisteet: null,
    haku: null,
    hauk: null,
    yva: null,
    hlo: null,
    alo: null,
    tja: null,
    pin: null,
    ansiopisteetYhteensa: null,
    tappiopisteetYhteensa: null,
    judge: null,
    huomautus: null,
    huomautusTeksti: null,
    ylituomariNimiSnapshot: null,
    ylituomariNumeroSnapshot: null,
    ryhmatuomariNimi: null,
    palkintotuomariNimi: null,
    omistajaSnapshot: null,
    omistajanKotikuntaSnapshot: null,
  },
  eras: [
    {
      era: 1,
      alkoi: null,
      hakumin: null,
      ajomin: null,
      haku: null,
      hauk: null,
      yva: null,
      hlo: null,
      alo: null,
      tja: null,
      pin: null,
      huomautusTeksti: null,
    },
  ],
  lisatiedotRows: [],
};

describe("updateAdminTrialEntryAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    updateAdminTrialEntryMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });
    await expect(updateAdminTrialEntryAction(payload)).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
  });

  it("returns success data", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      role: "ADMIN",
    });
    updateAdminTrialEntryMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          trialEventId: "event-1",
          trialEntryId: "entry-1",
        },
      },
    });

    await expect(updateAdminTrialEntryAction(payload)).resolves.toEqual({
      data: {
        trialEventId: "event-1",
        trialEntryId: "entry-1",
      },
      hasError: false,
    });
  });
});
