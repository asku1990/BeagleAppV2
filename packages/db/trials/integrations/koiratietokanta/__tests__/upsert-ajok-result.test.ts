import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, txMock } = vi.hoisted(() => {
  const tx = {
    trialEvent: { upsert: vi.fn() },
    dogRegistration: { findUnique: vi.fn() },
    trialEntry: { findUnique: vi.fn(), upsert: vi.fn() },
    trialEra: { deleteMany: vi.fn(), create: vi.fn() },
    trialEraLisatieto: { createMany: vi.fn() },
  };
  return {
    txMock: tx,
    prismaMock: {
      $transaction: vi.fn((callback) => callback(tx)),
    },
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: prismaMock,
}));

import { upsertKoiratietokantaAjokResultDb } from "../upsert-ajok-result";

const entryInput = {
  rekisterinumeroSnapshot: "FI33413/18",
  yksilointiAvain: "SKL:431477|REG:FI33413/18",
  raakadataJson: "{}",
  luokka: null,
  omistajaSnapshot: null,
  omistajanKotikuntaSnapshot: null,
  koemaasto: null,
  era1Alkoi: null,
  era2Alkoi: null,
  era3Alkoi: null,
  era4Alkoi: null,
  hakuMin1: null,
  hakuMin2: null,
  hakuMin3: null,
  hakuMin4: null,
  ajoMin1: null,
  ajoMin2: null,
  ajoMin3: null,
  ajoMin4: null,
  hyvaksytytAjominuutit: null,
  ajoajanPisteet: null,
  pin: null,
  hakuEra1: null,
  hakuEra2: null,
  hakuEra3: null,
  hakuEra4: null,
  haku: null,
  haukkuEra1: null,
  haukkuEra2: null,
  haukkuEra3: null,
  haukkuEra4: null,
  hauk: null,
  ajotaitoEra1: null,
  ajotaitoEra2: null,
  ajotaitoEra3: null,
  ajotaitoEra4: null,
  yva: null,
  hlo: null,
  alo: null,
  ansiopisteetYhteensa: null,
  hakuloysyysTappioEra1: null,
  hakuloysyysTappioEra2: null,
  hakuloysyysTappioEra3: null,
  hakuloysyysTappioEra4: null,
  hakuloysyysTappioYhteensa: null,
  ajoloysyysTappioEra1: null,
  ajoloysyysTappioEra2: null,
  ajoloysyysTappioEra3: null,
  ajoloysyysTappioEra4: null,
  ajoloysyysTappioYhteensa: null,
  tappiopisteetYhteensa: null,
  loppupisteet: null,
  palkinto: null,
  sijoitus: null,
  koemuoto: null,
  koiriaLuokassa: null,
  koetyyppi: "NORMAL" as const,
  keli: null,
  huomautus: null,
  huomautusTeksti: null,
  ylituomariNimiSnapshot: null,
  ylituomariNumeroSnapshot: null,
  ryhmatuomariNimi: null,
  palkintotuomariNimi: null,
};

const eraInputs = [
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
    lisatiedot: [
      { koodi: "11", nimi: "Paljas maa", arvo: "1", jarjestys: 1 },
      { koodi: "17", nimi: "Lämpötila", arvo: "13", jarjestys: 7 },
    ],
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
    lisatiedot: [
      { koodi: "11", nimi: "Paljas maa", arvo: "1", jarjestys: 1 },
      { koodi: "17", nimi: "Lämpötila", arvo: "19", jarjestys: 7 },
    ],
  },
];

describe("upsertKoiratietokantaAjokResultDb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation((callback) => callback(txMock));
    txMock.trialEvent.upsert.mockResolvedValue({ id: "event-1" });
    txMock.dogRegistration.findUnique.mockResolvedValue({ dogId: "dog-1" });
    txMock.trialEntry.findUnique.mockResolvedValue(null);
    txMock.trialEntry.upsert.mockResolvedValue({ id: "entry-1" });
    txMock.trialEra.deleteMany.mockResolvedValue({ count: 0 });
    txMock.trialEra.create
      .mockResolvedValueOnce({ id: "era-1", era: 1 })
      .mockResolvedValueOnce({ id: "era-2", era: 2 });
    txMock.trialEraLisatieto.createMany.mockResolvedValue({ count: 2 });
  });

  it("writes entry-level koemuoto, koetyyppi, ke and class count", async () => {
    const result = await upsertKoiratietokantaAjokResultDb({
      event: {
        sklKoeId: 431477,
        koepaiva: new Date("2025-09-07T00:00:00.000Z"),
        koekunta: "Ristijarvi",
        jarjestaja: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        trialRuleWindowId: null,
        ylituomariNimi: "Ylituomari",
        ylituomariNumero: null,
        ytKertomus: null,
      },
      entry: {
        ...entryInput,
        koemuoto: "AJOK",
        koetyyppi: "PITKAKOE",
        koiriaLuokassa: 4,
        sijoitus: "1",
        keli: "P",
        hyvaksytytAjominuutit: 51,
        ajoajanPisteet: 14.88,
        yva: 9.25,
      },
      eras: eraInputs,
    });

    expect(result).toMatchObject({
      trialEntryId: "entry-1",
      created: true,
      updated: false,
    });
    expect(txMock.trialEvent.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.not.objectContaining({ koemuoto: expect.anything() }),
        update: expect.not.objectContaining({ koemuoto: expect.anything() }),
      }),
    );
    expect(txMock.trialEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          koemaasto: null,
          koemuoto: "AJOK",
          koetyyppi: "PITKAKOE",
          koiriaLuokassa: 4,
          ke: "P",
          sija: "1",
          hyvaksytytAjominuutit: 51,
          ajoajanPisteet: 14.88,
          pin: null,
          haku: null,
          hauk: null,
          yva: 9.25,
          hlo: null,
          alo: null,
          ansiopisteetYhteensa: null,
          tappiopisteetYhteensa: null,
          lk: null,
          tuom1: "Ylituomari",
          huomautus: null,
        }),
      }),
    );
    expect(txMock.trialEra.deleteMany).toHaveBeenCalledWith({
      where: { trialEntryId: "entry-1" },
    });
    expect(txMock.trialEra.create).toHaveBeenCalledTimes(2);
    expect(txMock.trialEraLisatieto.createMany).toHaveBeenCalledTimes(2);
  });

  it("deletes old lisatieto rows and skips createMany when no rows are mapped", async () => {
    await upsertKoiratietokantaAjokResultDb({
      event: {
        sklKoeId: 431477,
        koepaiva: new Date("2025-09-07T00:00:00.000Z"),
        koekunta: "Ristijarvi",
        jarjestaja: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        trialRuleWindowId: null,
        ylituomariNimi: null,
        ylituomariNumero: null,
        ytKertomus: null,
      },
      entry: entryInput,
      eras: [],
    });

    expect(txMock.trialEra.deleteMany).toHaveBeenCalledWith({
      where: { trialEntryId: "entry-1" },
    });
    expect(txMock.trialEraLisatieto.createMany).not.toHaveBeenCalled();
  });

  it("writes canonical huomautus status", async () => {
    await upsertKoiratietokantaAjokResultDb({
      event: {
        sklKoeId: 431477,
        koepaiva: new Date("2025-09-07T00:00:00.000Z"),
        koekunta: "Ristijarvi",
        jarjestaja: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        trialRuleWindowId: null,
        ylituomariNimi: null,
        ylituomariNumero: null,
        ytKertomus: null,
      },
      entry: {
        ...entryInput,
        huomautus: "KESKEYTETTY",
      },
      eras: [],
    });

    expect(txMock.trialEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          huomautus: "KESKEYTETTY",
        }),
        update: expect.objectContaining({
          huomautus: "KESKEYTETTY",
        }),
      }),
    );
  });
});
