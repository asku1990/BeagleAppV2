import { beforeEach, describe, expect, it, vi } from "vitest";

const { getTrialDogPdfDataDbMock } = vi.hoisted(() => ({
  getTrialDogPdfDataDbMock: vi.fn(),
}));

vi.mock("@db/trials/pdf", () => ({
  getTrialDogPdfDataDb: getTrialDogPdfDataDbMock,
}));

import { getTrialDogPdfDataService } from "../get-trial-dog-pdf-data";

function dbRow(overrides: Record<string, unknown> = {}) {
  return {
    trialId: "entry-1",
    trialRuleWindowId: "trw_post_20230801",
    registrationNo: "FI123",
    dogName: null,
    dogSex: null,
    sireName: null,
    sireRegistrationNo: null,
    damName: null,
    damRegistrationNo: null,
    omistaja: null,
    omistajanKotikunta: null,
    kennelpiiri: null,
    kennelpiirinro: null,
    koekunta: "Koe",
    koemaasto: null,
    koepaiva: new Date("2025-09-07T00:00:00.000Z"),
    jarjestaja: null,
    hyvaksytytAjominuutit: null,
    ajoajanPisteet: null,
    haku: 8.5,
    hauk: 6.75,
    yva: 9.25,
    hlo: 2.5,
    alo: 1.5,
    pin: 12.5,
    ansiopisteetYhteensa: 36.75,
    tappiopisteetYhteensa: 4,
    loppupisteet: null,
    ke: null,
    huomautus: null,
    huomautusTeksti: null,
    koetyyppi: "NORMAL",
    sijoitus: null,
    koiriaLuokassa: null,
    palkinto: null,
    ylituomariNimi: null,
    ylituomariNimiSnapshot: null,
    ylituomariNumeroSnapshot: null,
    ryhmatuomariNimi: null,
    palkintotuomariNimi: null,
    eras: [
      {
        era: 1,
        alkoi: null,
        hakumin: null,
        ajomin: 51,
        haku: null,
        hauk: null,
        pin: 3.5,
        yva: null,
        hlo: null,
        alo: null,
        huomautusTeksti: null,
        lisatiedot: [],
      },
      {
        era: 2,
        alkoi: null,
        hakumin: null,
        ajomin: null,
        haku: null,
        hauk: null,
        pin: 4.5,
        yva: null,
        hlo: null,
        alo: null,
        huomautusTeksti: null,
        lisatiedot: [],
      },
    ],
    ...overrides,
  };
}

describe("getTrialDogPdfDataService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses stored accepted driving minutes and driving time points first", async () => {
    getTrialDogPdfDataDbMock.mockResolvedValue(
      dbRow({
        hyvaksytytAjominuutit: 60,
        ajoajanPisteet: 17.5,
      }),
    );

    const result = await getTrialDogPdfDataService("entry-1");

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");
    expect(result.body.data).toMatchObject({
      hyvaksytytAjominuutit: 60,
      ajoajanPisteet: 17.5,
      hakuKeskiarvo: 8.5,
      haukkuKeskiarvo: 6.75,
      metsastysintoEra1: 3.5,
      metsastysintoEra2: 4.5,
      metsastysintoKeskiarvo: 12.5,
      ajotaitoKeskiarvo: 9.25,
      hakuloysyysTappioYhteensa: 2.5,
      ajoloysyysTappioYhteensa: 1.5,
      tappiopisteetYhteensa: 4,
      ansiopisteetYhteensa: 36.75,
      trialRuleWindowId: "trw_post_20230801",
    });
  });

  it("passes the resolved trial rule window through to PDF data", async () => {
    getTrialDogPdfDataDbMock.mockResolvedValue(
      dbRow({ trialRuleWindowId: "trw_range_2005_2011" }),
    );

    const result = await getTrialDogPdfDataService("entry-1");

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");
    expect(result.body.data.trialRuleWindowId).toBe("trw_range_2005_2011");
  });

  it("derives accepted driving minutes and driving time points for legacy rows", async () => {
    getTrialDogPdfDataDbMock.mockResolvedValue(dbRow());

    const result = await getTrialDogPdfDataService("entry-1");

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");
    expect(result.body.data).toMatchObject({
      hyvaksytytAjominuutit: 51,
      ajoajanPisteet: 14.88,
      hakuKeskiarvo: 8.5,
      haukkuKeskiarvo: 6.75,
      metsastysintoEra1: 3.5,
      metsastysintoEra2: 4.5,
      metsastysintoKeskiarvo: 12.5,
      ajotaitoKeskiarvo: 9.25,
      hakuloysyysTappioYhteensa: 2.5,
      ajoloysyysTappioYhteensa: 1.5,
      tappiopisteetYhteensa: 4,
      ansiopisteetYhteensa: 36.75,
    });
  });

  it.each([
    ["LUOPUI", { luopui: true, suljettu: false, keskeytetty: false }],
    ["SULJETTU", { luopui: false, suljettu: true, keskeytetty: false }],
    ["KESKEYTETTY", { luopui: false, suljettu: false, keskeytetty: true }],
    [null, { luopui: false, suljettu: false, keskeytetty: false }],
  ])(
    "derives status markers from huomautus %s",
    async (huomautus, expected) => {
      getTrialDogPdfDataDbMock.mockResolvedValue(dbRow({ huomautus }));

      const result = await getTrialDogPdfDataService("entry-1");

      expect(result.status).toBe(200);
      if (!result.body.ok) throw new Error("Expected ok=true");
      expect(result.body.data).toMatchObject(expected);
    },
  );

  it("passes free-text huomautus through to PDF data", async () => {
    getTrialDogPdfDataDbMock.mockResolvedValue(
      dbRow({ huomautusTeksti: "Koira kävi tiellä." }),
    );

    const result = await getTrialDogPdfDataService("entry-1");

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");
    expect(result.body.data.huomautusTeksti).toBe("Koira kävi tiellä.");
  });

  it("joins entry and era huomautus texts for PDF data", async () => {
    getTrialDogPdfDataDbMock.mockResolvedValue(
      dbRow({
        huomautusTeksti: "Koira kävi tiellä.",
        eras: [
          {
            era: 1,
            alkoi: null,
            hakumin: null,
            ajomin: 51,
            haku: null,
            hauk: null,
            pin: 3.5,
            yva: null,
            hlo: null,
            alo: null,
            huomautusTeksti: "Ensimmäisen erän huomautus.",
            lisatiedot: [],
          },
          {
            era: 2,
            alkoi: null,
            hakumin: null,
            ajomin: null,
            haku: null,
            hauk: null,
            pin: 4.5,
            yva: null,
            hlo: null,
            alo: null,
            huomautusTeksti: "Ensimmäisen erän huomautus.",
            lisatiedot: [],
          },
        ],
      }),
    );

    const result = await getTrialDogPdfDataService("entry-1");

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");
    expect(result.body.data.huomautusTeksti).toBe(
      "Koira kävi tiellä. Ensimmäisen erän huomautus.",
    );
  });

  it("passes signature name fields through to PDF data", async () => {
    getTrialDogPdfDataDbMock.mockResolvedValue(
      dbRow({
        ylituomariNimi: "Fallback Ylituomari",
        ylituomariNimiSnapshot: "Ylituomari",
        ylituomariNumeroSnapshot: "123",
        ryhmatuomariNimi: "Ryhmätuomari",
        palkintotuomariNimi: "Palkintotuomari",
      }),
    );

    const result = await getTrialDogPdfDataService("entry-1");

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");
    expect(result.body.data).toMatchObject({
      ylituomariNimiSnapshot: "Ylituomari",
      ylituomariNumeroSnapshot: "123",
      ryhmatuomariNimi: "Ryhmätuomari",
      palkintotuomariNimi: "Palkintotuomari",
    });
  });
});
