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
  koiriaLuokassa: null,
  kokokaudenkoe: null,
  keli: null,
  luopui: null,
  suljettu: null,
  keskeytetty: null,
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

  it("replaces lisatieto rows after entry upsert", async () => {
    const result = await upsertKoiratietokantaAjokResultDb({
      event: {
        sklKoeId: 431477,
        koepaiva: new Date("2025-09-07T00:00:00.000Z"),
        koekunta: "Ristijarvi",
        jarjestaja: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        koemuoto: "AJOK",
        ylituomariNimi: "Ylituomari",
        ylituomariNumero: null,
        ytKertomus: null,
      },
      entry: {
        ...entryInput,
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
    expect(txMock.trialEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          koemaasto: null,
          hyvaksytytAjominuutit: 51,
          ajoajanPisteet: 14.88,
          pin: null,
          haku: null,
          hauk: null,
          yva: 9.25,
          ansiopisteetYhteensa: null,
          lk: null,
          tuom1: "Ylituomari",
        }),
      }),
    );
    expect(txMock.trialEra.deleteMany).toHaveBeenCalledWith({
      where: { trialEntryId: "entry-1" },
    });
    expect(txMock.trialEra.create).toHaveBeenCalledTimes(2);
    expect(txMock.trialEraLisatieto.createMany).toHaveBeenCalledTimes(2);
    expect(txMock.trialEraLisatieto.createMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            trialEraId: "era-1",
            koodi: "11",
            arvo: "1",
          }),
          expect.objectContaining({
            trialEraId: "era-1",
            koodi: "17",
            arvo: "13",
          }),
        ]),
      }),
    );
    expect(txMock.trialEraLisatieto.createMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            trialEraId: "era-2",
            koodi: "11",
            arvo: "1",
          }),
          expect.objectContaining({
            trialEraId: "era-2",
            koodi: "17",
            arvo: "19",
          }),
        ]),
      }),
    );
    expect(
      txMock.trialEra.deleteMany.mock.invocationCallOrder[0],
    ).toBeGreaterThan(txMock.trialEntry.upsert.mock.invocationCallOrder[0]);
    expect(
      txMock.trialEraLisatieto.createMany.mock.invocationCallOrder[0],
    ).toBeGreaterThan(txMock.trialEra.deleteMany.mock.invocationCallOrder[0]);
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
        koemuoto: "AJOK",
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
});
