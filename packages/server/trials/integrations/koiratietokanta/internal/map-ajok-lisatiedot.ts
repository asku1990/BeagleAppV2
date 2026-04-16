import type { KoiratietokantaAjokLisatietoDbInput } from "@beagle/db";
import { normalizeText } from "./parse-ajok-payload";

type LisatietoMapping = {
  koodi: string;
  nimi: string;
  keys: readonly [string, string, string?, string?];
};

const LISATIETO_MAPPINGS: LisatietoMapping[] = [
  {
    koodi: "11",
    nimi: "Paljas maa",
    keys: ["111_PALJAS_MAA", "112_PALJAS_MAA", "113_PALJAS_MAA"],
  },
  {
    koodi: "12",
    nimi: "Lumikeli",
    keys: ["121_LUMIKELI", "122_LUMIKELI", "123_LUMIKELI"],
  },
  {
    koodi: "13",
    nimi: "Kohtalainen tai kova tuuli",
    keys: [
      "131_KOHT_TAI_KOVA_TUULI",
      "132_KOHT_TAI_KOVA_TUULI",
      "133_KOHT_TAI_KOVA_TUULI",
    ],
  },
  {
    koodi: "14",
    nimi: "Kuiva keli",
    keys: ["141_KUIVA_KELI", "142_KUIVA_KELI", "143_KUIVA_KELI"],
  },
  {
    koodi: "15",
    nimi: "Kostea keli",
    keys: ["151_KOSTEA_KELI", "152_KOSTEA_KELI", "153_KOSTEA_KELI"],
  },
  {
    koodi: "16",
    nimi: "Kohtalainen tai kova sade",
    keys: [
      "161_KOHT_TAI_KOVA_SADE",
      "162_KOHT_TAI_KOVA_SADE",
      "163_KOHT_TAI_KOVA_SADE",
    ],
  },
  {
    koodi: "17",
    nimi: "Lämpötila",
    keys: ["171_LAMPOTILA", "172_LAMPOTILA", "173_LAMPOTILA"],
  },
  {
    koodi: "18",
    nimi: "Maasto",
    keys: ["181_MAASTO", "182_MAASTO", "183_MAASTO"],
  },
  {
    koodi: "20",
    nimi: "Haun laajuus ilman yöjälkeä",
    keys: ["201_LAAJUUS", "202_LAAJUUS", "203_LAAJUUS"],
  },
  {
    koodi: "21",
    nimi: "Vainuamistapa haku",
    keys: ["211_VAINUAMISTAPA", "212_VAINUAMISTAPA", "213_VAINUAMISTAPA"],
  },
  {
    koodi: "22",
    nimi: "Hakulöysyyden laatu",
    keys: ["221_HAKULOYSYYS", "222_HAKULOYSYYS", "223_HAKULOYSYYS"],
  },
  {
    koodi: "30",
    nimi: "Kuuluvuus",
    keys: ["301_KUULUVUUS", "302_KUULUVUUS", "303_KUULUVUUS"],
  },
  {
    koodi: "31",
    nimi: "Kertovuus",
    keys: ["311_KERTOVUUS", "312_KERTOVUUS", "313_KERTOVUUS"],
  },
  {
    koodi: "32",
    nimi: "Intohimoisuus",
    keys: ["321_INTOHIMOISUUS", "322_INTOHIMOISUUS", "323_INTOHIMOISUUS"],
  },
  {
    koodi: "33",
    nimi: "Tiheys",
    keys: ["331_TIHEYS", "332_TIHEYS", "333_TIHEYS"],
  },
  {
    koodi: "34",
    nimi: "Äänien määrä",
    keys: ["341_AANIEN_MAARA", "342_AANIEN_MAARA", "343_AANIEN_MAARA"],
  },
  {
    koodi: "35",
    nimi: "Sukupuolileima",
    keys: ["351_SUKUPUOLILEIMA", "352_SUKUPUOLILEIMA", "353_SUKUPUOLILEIMA"],
  },
  {
    koodi: "36",
    nimi: "Beaglen haukku",
    keys: ["531_BEAGLEN_HAUKKU", "532_BEAGLEN_HAUKKU", "533_BEAGLEN_HAUKKU"],
  },
  {
    koodi: "40",
    nimi: "Metsästysinto haulla",
    keys: ["401_MTSINTO_HAULLA", "402_MTSINTO_HAULLA"],
  },
  {
    koodi: "41",
    nimi: "Metsästysinto ajolla",
    keys: ["411_MTSINTO_AJOLLA", "412_MTSINTO_AJOLLA"],
  },
  {
    koodi: "42",
    nimi: "Metsästysinto koettelu",
    keys: ["421_MTSINTO_KOETTELU", "422_MTSINTO_KOETTELU"],
  },
  {
    koodi: "50",
    nimi: "Ajotaito",
    keys: ["501_AJOTAITO", "502_AJOTAITO"],
  },
  {
    koodi: "51",
    nimi: "Nopeus",
    keys: ["511_NOPEUS", "512_NOPEUS"],
  },
  {
    koodi: "52",
    nimi: "Tie- ja estetyöskentely",
    keys: ["521_TIE_JA_ESTETYOSKENTELY", "522_TIE_JA_ESTETYOSKENTELY"],
  },
  {
    koodi: "53",
    nimi: "Vainuamistapa ajo",
    keys: ["531_VAINUAMISTAPA", "532_VAINUAMISTAPA"],
  },
  {
    koodi: "54",
    nimi: "Herkkyys",
    keys: ["541_HERKKYYS", "542_HERKKYYS"],
  },
  {
    koodi: "55",
    nimi: "Ajolöysyyden laatu",
    keys: ["551_AJOLOYSYYDEN_LAATU", "552_AJOLOYSYYDEN_LAATU"],
  },
  {
    koodi: "56",
    nimi: "Ajettava nähty",
    keys: ["561_AJETTAVA_NAHTY", "562_AJETTAVA_NAHTY"],
  },
  {
    koodi: "60",
    nimi: "Muiden eläinten ajo",
    keys: ["601_MUIDEN_EL_AJO", "602_MUIDEN_EL_AJO"],
  },
  {
    koodi: "61",
    nimi: "Hallittavuus",
    keys: ["611_HALLITTAVUUS", "612_HALLITTAVUUS"],
  },
];

// Builds normalized lisatieto rows from explicitly mapped yksi_tulos fields.
// Raw payload remains the source of truth for unmapped or null-only fields.
export function mapKoiratietokantaAjokLisatiedot(
  payload: Record<string, unknown>,
): KoiratietokantaAjokLisatietoDbInput[] {
  return LISATIETO_MAPPINGS.flatMap((mapping, index) => {
    const [era1Key, era2Key, era3Key, era4Key] = mapping.keys;
    const row = {
      koodi: mapping.koodi,
      nimi: mapping.nimi,
      era1Arvo: normalizeText(payload[era1Key]),
      era2Arvo: normalizeText(payload[era2Key]),
      era3Arvo: era3Key ? normalizeText(payload[era3Key]) : null,
      era4Arvo: era4Key ? normalizeText(payload[era4Key]) : null,
      jarjestys: index + 1,
    };
    return row.era1Arvo || row.era2Arvo || row.era3Arvo || row.era4Arvo
      ? [row]
      : [];
  });
}
