import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUserDto } from "@beagle/contracts";
import { updateAdminTrialEntry } from "@server/admin/trials/manage/update-trial-entry";

const { updateAdminTrialEntryWriteDbMock } = vi.hoisted(() => ({
  updateAdminTrialEntryWriteDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  updateAdminTrialEntryWriteDb: updateAdminTrialEntryWriteDbMock,
}));

const adminUser: CurrentUserDto = {
  id: "u_1",
  email: "admin@example.com",
  username: null,
  role: "ADMIN",
};

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

  it("returns 400 for invalid trial event id", async () => {
    await expect(
      updateAdminTrialEntry({ ...baseInput(), trialEventId: " " }, adminUser),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Trial event id is required.",
        code: "INVALID_TRIAL_EVENT_ID",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid trial entry id", async () => {
    await expect(
      updateAdminTrialEntry({ ...baseInput(), trialEntryId: " " }, adminUser),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Trial entry id is required.",
        code: "INVALID_TRIAL_ENTRY_ID",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("returns 401 for missing user", async () => {
    await expect(updateAdminTrialEntry(baseInput(), null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 when eras are missing", async () => {
    await expect(
      updateAdminTrialEntry({ ...baseInput(), eras: [] }, adminUser),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "At least one era is required.",
        code: "INVALID_ERAS",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("rejects invalid era sequence", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          eras: [{ ...baseInput().eras[1] }],
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Eras must be continuous starting from 1.",
        code: "INVALID_ERAS",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported lisatieto codes", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          lisatiedotRows: [
            {
              koodi: "99",
              osa: "",
              nimi: null,
              jarjestys: null,
              eraValues: [],
            },
          ],
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Unsupported lisatieto code: 99",
        code: "INVALID_LISATIETO_CODE",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("rejects lisatieto values for unknown eras", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          lisatiedotRows: [
            {
              koodi: "11",
              osa: "",
              nimi: null,
              jarjestys: null,
              eraValues: [{ era: 3, arvo: "1" }],
            },
          ],
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Lisatiedot era value references unknown era.",
        code: "INVALID_LISATIETO_ERA",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("returns 404 when db reports not_found", async () => {
    updateAdminTrialEntryWriteDbMock.mockResolvedValue({ status: "not_found" });

    await expect(
      updateAdminTrialEntry(baseInput(), adminUser),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "Entry not found in selected trial event.",
        code: "ENTRY_NOT_FOUND",
      },
    });
  });

  it("returns 500 when db update fails", async () => {
    updateAdminTrialEntryWriteDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      updateAdminTrialEntry(baseInput(), adminUser, {
        requestId: "req-1",
        actorUserId: "u_1",
      }),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to update admin trial entry.",
        code: "INTERNAL_ERROR",
      },
    });
  });

  it("returns success when db update succeeds and normalizes write input", async () => {
    updateAdminTrialEntryWriteDbMock.mockResolvedValue({
      status: "updated",
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });

    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          trialEventId: " event-1 ",
          trialEntryId: " entry-1 ",
          entry: {
            ...baseInput().entry,
            koemaasto: " Forest ",
            koemuoto: " ",
            points: Number.NaN,
            koiriaLuokassa: 1.5,
            haku: 12.5,
            huomautus: "LUOPUI",
            huomautusTeksti: " ",
            judge: " Judge ",
          },
          eras: [
            {
              ...baseInput().eras[0],
              alkoi: " 10:00 ",
              hakumin: 15.5,
              ajomin: 30,
              haku: Number.POSITIVE_INFINITY,
              huomautusTeksti: " Note ",
            },
          ],
          lisatiedotRows: [
            {
              koodi: "11",
              osa: " Osa ",
              nimi: " Nimi ",
              jarjestys: 1.5,
              eraValues: [{ era: 1, arvo: " 42 " }],
            },
            {
              koodi: "12",
              osa: " ",
              nimi: " ",
              jarjestys: 2,
              eraValues: [{ era: 1, arvo: " " }],
            },
          ],
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: { trialEventId: "event-1", trialEntryId: "entry-1" },
      },
    });

    expect(updateAdminTrialEntryWriteDbMock).toHaveBeenCalledWith({
      trialEventId: "event-1",
      trialEntryId: "entry-1",
      entry: expect.objectContaining({
        koemaasto: "Forest",
        koemuoto: null,
        points: null,
        koiriaLuokassa: null,
        haku: 12.5,
        huomautus: "LUOPUI",
        huomautusTeksti: null,
        judge: "Judge",
      }),
      eras: [
        expect.objectContaining({
          era: 1,
          alkoi: "10:00",
          hakumin: null,
          ajomin: 30,
          haku: null,
          huomautusTeksti: "Note",
        }),
      ],
      lisatiedotByEra: [
        {
          era: 1,
          items: [
            {
              koodi: "11",
              osa: "Osa",
              arvo: "42",
              nimi: "Nimi",
              jarjestys: null,
            },
          ],
        },
      ],
    });
  });
});
