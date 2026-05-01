import { describe, expect, it } from "vitest";

import { mapKoiratietokantaAjokLisatiedot } from "../map-ajok-lisatiedot";

describe("mapKoiratietokantaAjokLisatiedot", () => {
  it("maps official P-coded lisätiedot from the Koiratietokanta payload", () => {
    const lisatiedot = mapKoiratietokantaAjokLisatiedot({
      P10A1: "1",
      P10A2: "0",
      P19A1: "2",
      P23A1: "3",
      P24A2: "1.1",
      P26A1: "4",
      P37A2: "0.7",
      P57A1: "0.8",
      P58A1: "39",
      P59A2: "2",
      P62A1: "12",
    });

    expect(lisatiedot).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          koodi: "10",
          osa: "",
          nimi: "Vaativat olosuhteet",
          era1Arvo: "1",
          era2Arvo: "0",
        }),
        expect.objectContaining({
          koodi: "19",
          osa: "",
          nimi: "Lumipeitteen laatu",
          era1Arvo: "2",
        }),
        expect.objectContaining({
          koodi: "23",
          osa: "",
          nimi: "Hakukuvio",
          era1Arvo: "3",
        }),
        expect.objectContaining({
          koodi: "24",
          osa: "",
          nimi: "Suurin etäisyys",
          era2Arvo: "1.1",
        }),
        expect.objectContaining({
          koodi: "26",
          osa: "",
          nimi: "Eteneminen yöjäljellä",
          era1Arvo: "4",
        }),
        expect.objectContaining({
          koodi: "37",
          osa: "",
          nimi: "Todettu kuuluvuus",
          era2Arvo: "0.7",
        }),
        expect.objectContaining({
          koodi: "57",
          osa: "",
          nimi: "Tie ja esteajoa",
          era1Arvo: "0.8",
        }),
        expect.objectContaining({
          koodi: "58",
          osa: "",
          nimi: "Todellinen ajoaika",
          era1Arvo: "39",
        }),
        expect.objectContaining({
          koodi: "59",
          osa: "",
          nimi: "Hukkatyöskentely",
          era2Arvo: "2",
        }),
        expect.objectContaining({
          koodi: "62",
          osa: "",
          nimi: "Matka ajoerässä",
          era1Arvo: "12",
        }),
      ]),
    );
  });

  it("maps multi-part official lisätiedot as separate subpart rows", () => {
    const lisatiedot = mapKoiratietokantaAjokLisatiedot({
      P25A1a: "0.3",
      P25A1b: "0",
      P25A2c: "1",
      P27A1a: "32",
      P27A2b: "4",
      P27A2c: "0",
    });

    expect(
      lisatiedot
        .filter((item) => item.koodi === "25")
        .map((item) => ({
          osa: item.osa,
          era1Arvo: item.era1Arvo,
          era2Arvo: item.era2Arvo,
        })),
    ).toEqual([
      { osa: "a", era1Arvo: "0.3", era2Arvo: null },
      { osa: "b", era1Arvo: "0", era2Arvo: null },
      { osa: "c", era1Arvo: null, era2Arvo: "1" },
    ]);

    expect(
      lisatiedot
        .filter((item) => item.koodi === "27")
        .map((item) => ({
          osa: item.osa,
          era1Arvo: item.era1Arvo,
          era2Arvo: item.era2Arvo,
        })),
    ).toEqual([
      { osa: "a", era1Arvo: "32", era2Arvo: null },
      { osa: "b", era1Arvo: null, era2Arvo: "4" },
      { osa: "c", era1Arvo: null, era2Arvo: "0" },
    ]);
  });
});
