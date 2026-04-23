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
    pin: 12.5,
    ansiopisteetYhteensa: 36.75,
    loppupisteet: null,
    ke: null,
    sijoitus: null,
    palkinto: null,
    ylituomariNimi: null,
    eras: [
      {
        era: 1,
        alkoi: null,
        hakumin: null,
        ajomin: 51,
        haku: null,
        hauk: null,
        yva: null,
        lisatiedot: [],
      },
      {
        era: 2,
        alkoi: null,
        hakumin: null,
        ajomin: null,
        haku: null,
        hauk: null,
        yva: null,
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
      ajotaitoKeskiarvo: 9.25,
      ansiopisteetYhteensa: 36.75,
    });
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
      ajotaitoKeskiarvo: 9.25,
      ansiopisteetYhteensa: 36.75,
    });
  });
});
