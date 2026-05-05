import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { updateAdminTrialEntryWriteDb } from "../update-trial-entry";

const {
  prismaTransactionMock,
  trialEntryUpdateManyMock,
  trialEraDeleteManyMock,
  trialEraUpsertMock,
  trialEraLisatietoDeleteManyMock,
  trialEraLisatietoCreateManyMock,
} = vi.hoisted(() => {
  const trialEntryUpdateMany = vi.fn();
  const trialEraDeleteMany = vi.fn();
  const trialEraUpsert = vi.fn();
  const trialEraLisatietoDeleteMany = vi.fn();
  const trialEraLisatietoCreateMany = vi.fn();
  const tx = {
    trialEntry: { updateMany: trialEntryUpdateMany },
    trialEra: {
      deleteMany: trialEraDeleteMany,
      upsert: trialEraUpsert,
    },
    trialEraLisatieto: {
      deleteMany: trialEraLisatietoDeleteMany,
      createMany: trialEraLisatietoCreateMany,
    },
  };

  return {
    prismaTransactionMock: vi.fn(async (callback) => callback(tx)),
    trialEntryUpdateManyMock: trialEntryUpdateMany,
    trialEraDeleteManyMock: trialEraDeleteMany,
    trialEraUpsertMock: trialEraUpsert,
    trialEraLisatietoDeleteManyMock: trialEraLisatietoDeleteMany,
    trialEraLisatietoCreateManyMock: trialEraLisatietoCreateMany,
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: { $transaction: prismaTransactionMock },
}));

describe("updateAdminTrialEntryWriteDb", () => {
  beforeEach(() => {
    prismaTransactionMock.mockReset();
    trialEntryUpdateManyMock.mockReset();
    trialEraDeleteManyMock.mockReset();
    trialEraUpsertMock.mockReset();
    trialEraLisatietoDeleteManyMock.mockReset();
    trialEraLisatietoCreateManyMock.mockReset();
  });

  it("returns not_found when target entry is missing", async () => {
    trialEntryUpdateManyMock.mockResolvedValue({ count: 0 });
    await expect(
      updateAdminTrialEntryWriteDb({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
        entry: {
          koemaasto: null,
          koemuoto: null,
          koetyyppi: "NORMAL",
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
        eras: [],
        lisatiedotByEra: [],
      }),
    ).resolves.toEqual({ status: "not_found" });
  });

  it("updates entry, syncs eras and lisatiedot", async () => {
    trialEntryUpdateManyMock.mockResolvedValue({ count: 1 });
    trialEraUpsertMock
      .mockResolvedValueOnce({ id: "era-1", era: 1 })
      .mockResolvedValueOnce({ id: "era-2", era: 2 });

    await expect(
      updateAdminTrialEntryWriteDb({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
        entry: {
          koemaasto: "Metsa",
          koemuoto: "AJOK",
          koetyyppi: "NORMAL",
          ke: null,
          lk: null,
          award: null,
          rank: null,
          points: 98.5,
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
          judge: "Judge",
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
        lisatiedotByEra: [
          {
            era: 1,
            replaceKeys: [{ koodi: "11", osa: "" }],
            items: [
              { koodi: "11", osa: "", arvo: "1", nimi: null, jarjestys: null },
            ],
          },
          { era: 2, replaceKeys: [], items: [] },
        ],
      }),
    ).resolves.toEqual({
      status: "updated",
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });

    expect(prismaTransactionMock).toHaveBeenCalledWith(
      expect.any(Function),
      ADMIN_WRITE_TX_CONFIG,
    );
    expect(trialEraLisatietoCreateManyMock).toHaveBeenCalledTimes(1);
    expect(trialEraLisatietoDeleteManyMock).toHaveBeenCalledWith({
      where: {
        trialEraId: "era-1",
        OR: [{ koodi: "11", osa: "" }],
      },
    });
    expect(trialEraLisatietoDeleteManyMock).not.toHaveBeenCalledWith({
      where: { trialEraId: "era-2" },
    });
  });

  it("preserves existing lisatiedot that were not submitted for replacement", async () => {
    trialEntryUpdateManyMock.mockResolvedValue({ count: 1 });
    trialEraUpsertMock.mockResolvedValue({ id: "era-1", era: 1 });

    await updateAdminTrialEntryWriteDb({
      trialEventId: "event-1",
      trialEntryId: "entry-1",
      entry: {
        koemaasto: "Metsa",
        koemuoto: "AJOK",
        koetyyppi: "NORMAL",
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
      ],
      lisatiedotByEra: [
        {
          era: 1,
          replaceKeys: [{ koodi: "11", osa: "" }],
          items: [],
        },
      ],
    });

    expect(trialEraLisatietoDeleteManyMock).toHaveBeenCalledWith({
      where: {
        trialEraId: "era-1",
        OR: [{ koodi: "11", osa: "" }],
      },
    });
  });
});
