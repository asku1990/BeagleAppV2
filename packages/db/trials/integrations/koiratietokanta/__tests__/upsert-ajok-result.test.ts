import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, txMock } = vi.hoisted(() => {
  const tx = {
    trialEvent: { upsert: vi.fn() },
    dogRegistration: { findUnique: vi.fn() },
    trialEntry: { findUnique: vi.fn(), upsert: vi.fn() },
    trialLisatietoItem: { deleteMany: vi.fn(), createMany: vi.fn() },
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
  hakuEra1: null,
  hakuEra2: null,
  hakuEra3: null,
  hakuEra4: null,
  hakuKeskiarvo: null,
  haukkuEra1: null,
  haukkuEra2: null,
  haukkuEra3: null,
  haukkuEra4: null,
  haukkuKeskiarvo: null,
  ajotaitoEra1: null,
  ajotaitoEra2: null,
  ajotaitoEra3: null,
  ajotaitoEra4: null,
  ajotaitoKeskiarvo: null,
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

describe("upsertKoiratietokantaAjokResultDb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation((callback) => callback(txMock));
    txMock.trialEvent.upsert.mockResolvedValue({ id: "event-1" });
    txMock.dogRegistration.findUnique.mockResolvedValue({ dogId: "dog-1" });
    txMock.trialEntry.findUnique.mockResolvedValue(null);
    txMock.trialEntry.upsert.mockResolvedValue({ id: "entry-1" });
    txMock.trialLisatietoItem.deleteMany.mockResolvedValue({ count: 0 });
    txMock.trialLisatietoItem.createMany.mockResolvedValue({ count: 2 });
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
        ylituomariNimi: null,
        ylituomariNumero: null,
        ytKertomus: null,
      },
      entry: entryInput,
      lisatiedot: [
        {
          koodi: "11",
          nimi: "Paljas maa",
          era1Arvo: "1",
          era2Arvo: "1",
          era3Arvo: null,
          era4Arvo: null,
          jarjestys: 1,
        },
        {
          koodi: "17",
          nimi: "Lämpötila",
          era1Arvo: "13",
          era2Arvo: "19",
          era3Arvo: null,
          era4Arvo: null,
          jarjestys: 7,
        },
      ],
    });

    expect(result).toMatchObject({
      trialEntryId: "entry-1",
      created: true,
      updated: false,
    });
    expect(txMock.trialLisatietoItem.deleteMany).toHaveBeenCalledWith({
      where: { trialEntryId: "entry-1" },
    });
    expect(txMock.trialLisatietoItem.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          trialEntryId: "entry-1",
          koodi: "11",
          era1Arvo: "1",
          era2Arvo: "1",
        }),
        expect.objectContaining({
          trialEntryId: "entry-1",
          koodi: "17",
          era1Arvo: "13",
          era2Arvo: "19",
        }),
      ],
    });
    expect(
      txMock.trialLisatietoItem.deleteMany.mock.invocationCallOrder[0],
    ).toBeGreaterThan(txMock.trialEntry.upsert.mock.invocationCallOrder[0]);
    expect(
      txMock.trialLisatietoItem.createMany.mock.invocationCallOrder[0],
    ).toBeGreaterThan(
      txMock.trialLisatietoItem.deleteMany.mock.invocationCallOrder[0],
    );
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
      lisatiedot: [],
    });

    expect(txMock.trialLisatietoItem.deleteMany).toHaveBeenCalledWith({
      where: { trialEntryId: "entry-1" },
    });
    expect(txMock.trialLisatietoItem.createMany).not.toHaveBeenCalled();
  });
});
