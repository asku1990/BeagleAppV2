import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminTrial } from "../get-trial";

const { getAdminTrialDetailsDbMock } = vi.hoisted(() => ({
  getAdminTrialDetailsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getAdminTrialDetailsDb: getAdminTrialDetailsDbMock,
}));

describe("getAdminTrial", () => {
  beforeEach(() => {
    getAdminTrialDetailsDbMock.mockReset();
  });

  it("returns bad request for an empty trial id", async () => {
    await expect(getAdminTrial({ trialId: "   " }, null)).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid trial id.",
        code: "INVALID_TRIAL_ID",
      },
    });

    expect(getAdminTrialDetailsDbMock).not.toHaveBeenCalled();
  });

  it("returns unauthorized when the user is missing", async () => {
    await expect(getAdminTrial({ trialId: "trial-1" }, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(getAdminTrialDetailsDbMock).not.toHaveBeenCalled();
  });

  it("returns not found when db has no matching row", async () => {
    getAdminTrialDetailsDbMock.mockResolvedValue(null);

    await expect(
      getAdminTrial(
        { trialId: "trial-404" },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "Trial not found.",
        code: "TRIAL_NOT_FOUND",
      },
    });

    expect(getAdminTrialDetailsDbMock).toHaveBeenCalledWith({
      trialId: "trial-404",
    });
  });

  it("maps trial details from db to contract format", async () => {
    getAdminTrialDetailsDbMock.mockResolvedValue({
      trialId: "trial-1",
      dogId: null,
      dogName: "Rex",
      registrationNo: "FI12345/21",
      sklKoeId: 54321,
      entryKey: "entry-1",
      eventDate: new Date("2026-04-10T06:00:00.000Z"),
      eventName: "Kevätkoe",
      eventPlace: "Helsinki",
      rotukoodi: "161/1",
      jarjestaja: "Kevätkoe",
      koemuoto: "AJOK",
      kennelDistrict: "Etelä",
      kennelDistrictNo: "01",
      ylituomariNumero: "123",
      keli: "KE",
      luokka: "A",
      koiriaLuokassa: 24,
      palkinto: "VOI1",
      loppupisteet: 87.5,
      sijoitus: "2",
      era1Alkoi: "07:30",
      era2Alkoi: "10:15",
      hakuMin1: 22,
      hakuMin2: 18,
      ajoMin1: 45,
      ajoMin2: 38,
      hyvaksytytAjominuutit: 83,
      ajoajanPisteet: 7.5,
      ansiopisteetYhteensa: 80,
      hakuKeskiarvo: 12.5,
      haukkuKeskiarvo: 10,
      ajotaitoKeskiarvo: 9.5,
      yleisvaikutelmaPisteet: 9,
      hakuloysyysTappioYhteensa: 1,
      ajoloysyysTappioYhteensa: 2,
      tappiopisteetYhteensa: 3,
      tieJaEstetyoskentelyPisteet: 3,
      metsastysintoPisteet: 4,
      ylituomariNimi: "Judge One",
      ryhmatuomariNimi: "Judge Group",
      palkintotuomariNimi: "Judge Prize",
      isanNimi: "Sire",
      isanRekisterinumero: "FI00001/20",
      emanNimi: "Dam",
      emanRekisterinumero: "FI00002/19",
      omistaja: "Owner One",
      omistajanKotikunta: "Helsinki",
      sukupuoli: "U",
      rokotusOk: true,
      tunnistusOk: false,
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      huomautusTeksti: null,
      lisatiedot: [
        {
          koodi: "11",
          nimi: "Paljas maa",
          era1Arvo: null,
          era2Arvo: null,
          era3Arvo: null,
          era4Arvo: null,
          jarjestys: 1,
        },
      ],
      rawPayloadJson: '{"source":"raw"}',
      notes: "L",
      createdAt: new Date("2026-04-10T06:30:00.000Z"),
      updatedAt: new Date("2026-04-10T07:00:00.000Z"),
    });

    await expect(
      getAdminTrial(
        { trialId: "trial-1" },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          trial: {
            trialId: "trial-1",
            dogId: null,
            dogName: "Rex",
            registrationNo: "FI12345/21",
            sklKoeId: 54321,
            entryKey: "entry-1",
            eventDate: "2026-04-10",
            eventName: "Kevätkoe",
            eventPlace: "Helsinki",
            rotukoodi: "161/1",
            jarjestaja: "Kevätkoe",
            koemuoto: "AJOK",
            kennelDistrict: "Etelä",
            kennelDistrictNo: "01",
            ylituomariNumero: "123",
            keli: "KE",
            luokka: "A",
            koiriaLuokassa: 24,
            palkinto: "VOI1",
            loppupisteet: 87.5,
            sijoitus: "2",
            era1Alkoi: "07:30",
            era2Alkoi: "10:15",
            hakuMin1: 22,
            hakuMin2: 18,
            ajoMin1: 45,
            ajoMin2: 38,
            hyvaksytytAjominuutit: 83,
            ajoajanPisteet: 7.5,
            ansiopisteetYhteensa: 80,
            hakuKeskiarvo: 12.5,
            haukkuKeskiarvo: 10,
            ajotaitoKeskiarvo: 9.5,
            yleisvaikutelmaPisteet: 9,
            hakuloysyysTappioYhteensa: 1,
            ajoloysyysTappioYhteensa: 2,
            tappiopisteetYhteensa: 3,
            tieJaEstetyoskentelyPisteet: 3,
            metsastysintoPisteet: 4,
            ylituomariNimi: "Judge One",
            ryhmatuomariNimi: "Judge Group",
            palkintotuomariNimi: "Judge Prize",
            isanNimi: "Sire",
            isanRekisterinumero: "FI00001/20",
            emanNimi: "Dam",
            emanRekisterinumero: "FI00002/19",
            omistaja: "Owner One",
            omistajanKotikunta: "Helsinki",
            sukupuoli: "U",
            rokotusOk: true,
            tunnistusOk: false,
            luopui: false,
            suljettu: false,
            keskeytetty: false,
            huomautusTeksti: null,
            lisatiedot: [
              {
                koodi: "11",
                nimi: "Paljas maa",
                era1Arvo: null,
                era2Arvo: null,
                era3Arvo: null,
                era4Arvo: null,
                jarjestys: 1,
              },
            ],
            rawPayloadJson: '{"source":"raw"}',
            notes: "L",
            createdAt: "2026-04-10T06:30:00.000Z",
            updatedAt: "2026-04-10T07:00:00.000Z",
          },
        },
      },
    });
  });

  it("returns internal error when db throws", async () => {
    getAdminTrialDetailsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      getAdminTrial(
        { trialId: "trial-1" },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin trial details.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
