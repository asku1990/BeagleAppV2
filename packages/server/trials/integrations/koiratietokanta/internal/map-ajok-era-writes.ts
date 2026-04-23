import type {
  KoiratietokantaAjokEraDbInput,
  KoiratietokantaAjokEraLisatietoDbInput,
  KoiratietokantaAjokEntryDbInput,
  KoiratietokantaAjokLisatietoDbInput,
} from "@beagle/db";

type KoiratietokantaAjokEraSourceInput = Pick<
  KoiratietokantaAjokEntryDbInput,
  | "era1Alkoi"
  | "era2Alkoi"
  | "era3Alkoi"
  | "era4Alkoi"
  | "hakuMin1"
  | "hakuMin2"
  | "hakuMin3"
  | "hakuMin4"
  | "ajoMin1"
  | "ajoMin2"
  | "ajoMin3"
  | "ajoMin4"
  | "hakuEra1"
  | "hakuEra2"
  | "hakuEra3"
  | "hakuEra4"
  | "haukkuEra1"
  | "haukkuEra2"
  | "haukkuEra3"
  | "haukkuEra4"
  | "ajotaitoEra1"
  | "ajotaitoEra2"
  | "ajotaitoEra3"
  | "ajotaitoEra4"
>;

type KoiratietokantaAjokEraSourceRow = {
  era: number;
  alkoi: string | null;
  hakumin: number | null;
  ajomin: number | null;
  haku: number | null;
  hauk: number | null;
  alo: number | null;
  lisatiedot: KoiratietokantaAjokLisatietoDbInput[];
};

// Builds runtime era rows from the parsed AJOK entry and lisätiedot payload.
// Keeps source-shape translation on the server side, not in the DB writer.
export function mapKoiratietokantaAjokEraWrites(
  entry: KoiratietokantaAjokEraSourceInput,
  lisatiedot: KoiratietokantaAjokLisatietoDbInput[],
): KoiratietokantaAjokEraDbInput[] {
  const eras: KoiratietokantaAjokEraSourceRow[] = [
    {
      era: 1,
      alkoi: entry.era1Alkoi,
      hakumin: entry.hakuMin1,
      ajomin: entry.ajoMin1,
      haku: entry.hakuEra1,
      hauk: entry.haukkuEra1,
      alo: entry.ajotaitoEra1,
      lisatiedot,
    },
    {
      era: 2,
      alkoi: entry.era2Alkoi,
      hakumin: entry.hakuMin2,
      ajomin: entry.ajoMin2,
      haku: entry.hakuEra2,
      hauk: entry.haukkuEra2,
      alo: entry.ajotaitoEra2,
      lisatiedot,
    },
    {
      era: 3,
      alkoi: entry.era3Alkoi,
      hakumin: entry.hakuMin3,
      ajomin: entry.ajoMin3,
      haku: entry.hakuEra3,
      hauk: entry.haukkuEra3,
      alo: entry.ajotaitoEra3,
      lisatiedot,
    },
    {
      era: 4,
      alkoi: entry.era4Alkoi,
      hakumin: entry.hakuMin4,
      ajomin: entry.ajoMin4,
      haku: entry.hakuEra4,
      hauk: entry.haukkuEra4,
      alo: entry.ajotaitoEra4,
      lisatiedot,
    },
  ];

  return eras
    .map((era) => ({
      ...era,
      lisatiedot: era.lisatiedot
        .map((item) => {
          const arvo =
            item[
              `era${era.era}Arvo` as keyof KoiratietokantaAjokLisatietoDbInput
            ];
          if (arvo === null || arvo === undefined) {
            return null;
          }
          return {
            koodi: item.koodi,
            nimi: item.nimi,
            arvo: String(arvo),
            jarjestys: item.jarjestys,
          };
        })
        .filter(
          (item): item is KoiratietokantaAjokEraLisatietoDbInput =>
            item !== null,
        ),
    }))
    .filter((era) => {
      const hasCoreData =
        era.alkoi !== null ||
        era.hakumin !== null ||
        era.ajomin !== null ||
        era.haku !== null ||
        era.hauk !== null ||
        era.alo !== null;
      return hasCoreData || era.lisatiedot.length > 0;
    });
}
