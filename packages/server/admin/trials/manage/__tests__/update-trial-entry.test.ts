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

  it("accepts one era starting at 1", async () => {
    updateAdminTrialEntryWriteDbMock.mockResolvedValue({
      status: "updated",
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });

    await expect(
      updateAdminTrialEntry(
        { ...baseInput(), eras: [baseInput().eras[0]] },
        adminUser,
      ),
    ).resolves.toMatchObject({
      status: 200,
      body: { ok: true },
    });

    expect(updateAdminTrialEntryWriteDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eras: [expect.objectContaining({ era: 1 })],
      }),
    );
  });

  it("accepts two continuous eras starting at 1", async () => {
    updateAdminTrialEntryWriteDbMock.mockResolvedValue({
      status: "updated",
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });

    await expect(
      updateAdminTrialEntry(baseInput(), adminUser),
    ).resolves.toMatchObject({
      status: 200,
      body: { ok: true },
    });

    expect(updateAdminTrialEntryWriteDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eras: [
          expect.objectContaining({ era: 1 }),
          expect.objectContaining({ era: 2 }),
        ],
      }),
    );
  });

  it("rejects eras that do not start at 1", async () => {
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

  it("rejects non-continuous era sequences", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          eras: [baseInput().eras[0], { ...baseInput().eras[1], era: 3 }],
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

  it("rejects malformed lisatieto codes", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          lisatiedotRows: [
            {
              koodi: "abc",
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
        error: "Unsupported lisatieto code: abc",
        code: "INVALID_LISATIETO_CODE",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("accepts canonical and existing numeric lisatieto codes by koodi and osa", async () => {
    updateAdminTrialEntryWriteDbMock.mockResolvedValue({
      status: "updated",
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });

    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          lisatiedotRows: [
            {
              koodi: "10",
              osa: "",
              nimi: "Vaativat olosuhteet",
              jarjestys: 10,
              eraValues: [{ era: 1, arvo: "1" }],
            },
            {
              koodi: "25",
              osa: " a ",
              nimi: "Yöjälki löytyi",
              jarjestys: 25,
              eraValues: [{ era: 1, arvo: "0.3" }],
            },
            {
              koodi: "27",
              osa: "c",
              nimi: "Aika yöjäljellä",
              jarjestys: 27,
              eraValues: [{ era: 2, arvo: "5" }],
            },
            {
              koodi: "62",
              osa: "",
              nimi: "Matka ajoerässä",
              jarjestys: 62,
              eraValues: [{ era: 1, arvo: "12" }],
            },
            {
              koodi: "90",
              osa: "legacy",
              nimi: "Legacy field",
              jarjestys: 900,
              eraValues: [{ era: 1, arvo: "free" }],
            },
          ],
        },
        adminUser,
      ),
    ).resolves.toMatchObject({
      status: 200,
      body: { ok: true },
    });

    expect(updateAdminTrialEntryWriteDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        lisatiedotByEra: [
          {
            era: 1,
            replaceKeys: [
              { koodi: "10", osa: "" },
              { koodi: "25", osa: "a" },
              { koodi: "27", osa: "c" },
              { koodi: "62", osa: "" },
              { koodi: "90", osa: "legacy" },
            ],
            items: [
              {
                koodi: "10",
                osa: "",
                arvo: "1",
                nimi: "Vaativat olosuhteet",
                jarjestys: 10,
              },
              {
                koodi: "25",
                osa: "a",
                arvo: "0.3",
                nimi: "Yöjälki löytyi",
                jarjestys: 25,
              },
              {
                koodi: "62",
                osa: "",
                arvo: "12",
                nimi: "Matka ajoerässä",
                jarjestys: 62,
              },
              {
                koodi: "90",
                osa: "legacy",
                arvo: "free",
                nimi: "Legacy field",
                jarjestys: 900,
              },
            ],
          },
          {
            era: 2,
            replaceKeys: [
              { koodi: "10", osa: "" },
              { koodi: "25", osa: "a" },
              { koodi: "27", osa: "c" },
              { koodi: "62", osa: "" },
              { koodi: "90", osa: "legacy" },
            ],
            items: [
              {
                koodi: "27",
                osa: "c",
                arvo: "5",
                nimi: "Aika yöjäljellä",
                jarjestys: 27,
              },
            ],
          },
        ],
      }),
    );
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

  it("rejects duplicate era numbers clearly", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          eras: [baseInput().eras[0], baseInput().eras[0]],
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Duplicate era numbers are not allowed.",
        code: "DUPLICATE_ERAS",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("rejects non-positive era numbers", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          eras: [{ ...baseInput().eras[0], era: 0 }],
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Era numbers must be positive safe integers.",
        code: "INVALID_ERAS",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("rejects invalid runtime enum values", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          entry: { ...baseInput().entry, koetyyppi: "BAD" },
        } as unknown as Parameters<typeof updateAdminTrialEntry>[0],
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Unsupported koetyyppi.",
        code: "INVALID_KOETYYPPI",
      },
    });

    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          entry: { ...baseInput().entry, huomautus: "BAD" },
        } as unknown as Parameters<typeof updateAdminTrialEntry>[0],
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Unsupported huomautus.",
        code: "INVALID_HUOMAUTUS",
      },
    });
    expect(updateAdminTrialEntryWriteDbMock).not.toHaveBeenCalled();
  });

  it("rejects invalid runtime numeric values", async () => {
    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          entry: { ...baseInput().entry, points: Number.NaN },
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Numeric fields must be finite numbers or null.",
        code: "INVALID_NUMERIC_FIELD",
      },
    });

    await expect(
      updateAdminTrialEntry(
        {
          ...baseInput(),
          entry: { ...baseInput().entry, koiriaLuokassa: 1.5 },
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Integer fields must be safe integers or null.",
        code: "INVALID_INTEGER_FIELD",
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
            points: 80.5,
            koiriaLuokassa: 2,
            haku: 12.5,
            huomautus: "LUOPUI",
            huomautusTeksti: " ",
            judge: " Judge ",
          },
          eras: [
            {
              ...baseInput().eras[0],
              alkoi: " 10:00 ",
              hakumin: 15,
              ajomin: 30,
              haku: 5.5,
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
        points: 80.5,
        koiriaLuokassa: 2,
        haku: 12.5,
        huomautus: "LUOPUI",
        huomautusTeksti: null,
        judge: "Judge",
      }),
      eras: [
        expect.objectContaining({
          era: 1,
          alkoi: "10:00",
          hakumin: 15,
          ajomin: 30,
          haku: 5.5,
          huomautusTeksti: "Note",
        }),
      ],
      lisatiedotByEra: [
        {
          era: 1,
          replaceKeys: [
            { koodi: "11", osa: "Osa" },
            { koodi: "12", osa: "" },
          ],
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
