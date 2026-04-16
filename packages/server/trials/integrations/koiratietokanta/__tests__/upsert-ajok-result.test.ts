import { beforeEach, describe, expect, it, vi } from "vitest";
import { upsertKoiratietokantaAjokResultService } from "../upsert-ajok-result";

const { upsertDbMock } = vi.hoisted(() => ({
  upsertDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  DogSex: {
    MALE: "MALE",
    FEMALE: "FEMALE",
    UNKNOWN: "UNKNOWN",
  },
  upsertKoiratietokantaAjokResultDb: upsertDbMock,
}));

describe("upsertKoiratietokantaAjokResultService", () => {
  beforeEach(() => {
    upsertDbMock.mockReset();
    upsertDbMock.mockResolvedValue({
      trialEventId: "event-1",
      trialEntryId: "entry-1",
      created: true,
      updated: false,
      dogFound: true,
    });
  });

  it("maps core yksi_tulos fields and saves full raw payload", async () => {
    const payload = {
      SKLid: "431477",
      REKISTERINUMERO: " fi33413/18 ",
      Koepvm: "2025-09-07 00:00:00",
      KOEPAIKKA: "Ristijärvi",
      JARJESTAJA: "Kainuun Ajokoirakerho",
      KENNELPIIRI: "Kainuun kennelpiiri ry",
      KENNELPIIRINRO: "3",
      SKLkoemuoto: "AJOK",
      yt: "Fors Jari",
      ytnro: "402762",
      Omistaja: "Marja ja Kari Virtanen",
      Omistajankotipaikka: "Hyrynsalmi",
      I_ERA_KLO: " 5:49",
      i_haku_min: "201",
      I_AJO_MIN: "51",
      II_AJO_MIN: "-",
      I_HAKU: "5",
      I_HAUKKU: "7",
      AJOPISTEET: "14.88",
      LOPPUPISTEET: "29.38",
      luopui: "0",
      suljettu: "0",
      keskeytti: "0",
      palkintotuomari1: "Mikko Kemppainen",
      palkintotuomari2: "-",
    };

    const result = await upsertKoiratietokantaAjokResultService(payload);

    expect(result.status).toBe(201);
    expect(upsertDbMock).toHaveBeenCalledWith({
      event: expect.objectContaining({
        sklKoeId: 431477,
        koekunta: "Ristijärvi",
        jarjestaja: "Kainuun Ajokoirakerho",
        ylituomariNimi: "Fors Jari",
        ylituomariNumero: "402762",
      }),
      entry: expect.objectContaining({
        rekisterinumeroSnapshot: "FI33413/18",
        yksilointiAvain: "SKL:431477|REG:FI33413/18",
        raakadataJson: JSON.stringify(payload),
        omistajaSnapshot: "Marja ja Kari Virtanen",
        era1Alkoi: "5:49",
        hakuMin1: 201,
        ajoMin1: 51,
        ajoMin2: null,
        hakuEra1: 5,
        haukkuEra1: 7,
        ajoajanPisteet: 14.88,
        loppupisteet: 29.38,
        luopui: false,
        suljettu: false,
        keskeytetty: false,
        ryhmatuomariNimi: "Mikko Kemppainen",
        palkintotuomariNimi: null,
      }),
    });
    expect(result.body.ok).toBe(true);
    if (result.body.ok) {
      expect(result.body.data.warnings).toEqual([]);
    }
  });

  it("warns when optional numeric fields contain malformed values", async () => {
    const result = await upsertKoiratietokantaAjokResultService({
      SKLid: "431477",
      REKISTERINUMERO: "FI33413/18",
      Koepvm: "2025-09-07",
      KOEPAIKKA: "Ristijärvi",
      II_AJO_MIN: "not-a-number",
    });

    expect(result.status).toBe(201);
    expect(result.body.ok).toBe(true);
    if (result.body.ok) {
      expect(result.body.data.warnings).toEqual([
        expect.objectContaining({
          code: "OPTIONAL_FIELD_PARSE_FAILED",
          field: "II_AJO_MIN",
        }),
      ]);
    }
  });

  it("rejects payloads missing required identity fields", async () => {
    const result = await upsertKoiratietokantaAjokResultService({
      SKLid: "431477",
    });

    expect(result.status).toBe(400);
    expect(upsertDbMock).not.toHaveBeenCalled();
    expect(result.body.ok).toBe(false);
    if (!result.body.ok) {
      expect(result.body.code).toBe("VALIDATION_ERROR");
      expect(result.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "REKISTERINUMERO" }),
          expect.objectContaining({ field: "Koepvm" }),
          expect.objectContaining({ field: "KOEPAIKKA" }),
        ]),
      );
    }
  });

  it("returns warnings for missing dog link", async () => {
    upsertDbMock.mockResolvedValueOnce({
      trialEventId: "event-1",
      trialEntryId: "entry-1",
      created: false,
      updated: true,
      dogFound: false,
    });

    const result = await upsertKoiratietokantaAjokResultService({
      SKLid: "431477",
      REKISTERINUMERO: "FI33413/18",
      Koepvm: "2025-09-07",
      KOEPAIKKA: "Ristijärvi",
      yt: "Different Judge",
    });

    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    if (result.body.ok) {
      expect(result.body.data).toMatchObject({
        created: false,
        updated: true,
      });
      expect(result.body.data.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "DOG_NOT_FOUND" }),
        ]),
      );
    }
  });
});
