import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminTrialEntry } from "@server/admin/trials/manage/update-trial-entry";

const { updateAdminTrialEntryWriteDbMock } = vi.hoisted(() => ({
  updateAdminTrialEntryWriteDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  updateAdminTrialEntryWriteDb: updateAdminTrialEntryWriteDbMock,
}));

function baseInput() {
  return {
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
      {
        era: 2,
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
}

describe("updateAdminTrialEntry", () => {
  beforeEach(() => {
    updateAdminTrialEntryWriteDbMock.mockReset();
  });

  it("rejects invalid era sequence", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          eras: [{ ...baseInput().eras[1] }],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Eras must be continuous starting from 1.",
        code: "INVALID_ERAS",
      },
    });
  });

  it("returns success when db update succeeds", async () => {
    updateAdminTrialEntryWriteDbMock.mockResolvedValue({
      status: "updated",
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });

    await expect(
      updateAdminTrialEntry(baseInput(), {
        id: "u_1",
        email: "admin@example.com",
        username: null,
        role: "ADMIN",
      }),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: { trialEventId: "event-1", trialEntryId: "entry-1" },
      },
    });
  });
});
