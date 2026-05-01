import { prisma } from "@db/core/prisma";
import type {
  LegacyTrialMirrorAkoeallValidationRow,
  LegacyTrialMirrorDetailTableName,
  LegacyTrialMirrorDetailValidationRow,
  LegacyTrialMirrorValidationRows,
} from "../types";

const DETAIL_TABLES: Array<{
  sourceTable: LegacyTrialMirrorDetailTableName;
  dbTable: string;
}> = [
  { sourceTable: "bealt", dbTable: "legacy_bealt" },
  { sourceTable: "bealt0", dbTable: "legacy_bealt0" },
  { sourceTable: "bealt1", dbTable: "legacy_bealt1" },
  { sourceTable: "bealt2", dbTable: "legacy_bealt2" },
  { sourceTable: "bealt3", dbTable: "legacy_bealt3" },
];

// Loads only the mirror columns needed for read-only trial validation.
export async function loadLegacyTrialMirrorValidationRowsDb(): Promise<LegacyTrialMirrorValidationRows> {
  const [akoeall, ...detailGroups] = await Promise.all([
    prisma.$queryRawUnsafe<LegacyTrialMirrorAkoeallValidationRow[]>(`
      SELECT
        'akoeall' AS "sourceTable",
        "REKNO" AS "rekno",
        "TAPPA" AS "tappa",
        "TAPPV" AS "tappv",
        "KENNELPIIRI" AS "kennelpiiri",
        "KENNELPIIRINRO" AS "kennelpiirinro",
        "KE" AS "ke",
        "LK" AS "lk",
        "PA" AS "pa",
        "PISTE"::text AS "piste",
        "SIJA" AS "sija",
        "HAKU"::text AS "haku",
        "HAUK"::text AS "hauk",
        "YVA"::text AS "yva",
        "HLO"::text AS "hlo",
        "ALO"::text AS "alo",
        "TJA"::text AS "tja",
        "PIN"::text AS "pin",
        "TUOM1" AS "tuom1",
        "MUOKATTU" AS "muokattuRaw",
        "VARA" AS "vara",
        "raw_payload_json" AS "rawPayloadJson",
        "source_hash" AS "sourceHash"
      FROM "legacy_akoeall"
    `),
    ...DETAIL_TABLES.map(({ sourceTable, dbTable }) =>
      prisma.$queryRawUnsafe<LegacyTrialMirrorDetailValidationRow[]>(`
        SELECT
          '${sourceTable}' AS "sourceTable",
          "REKNO" AS "rekno",
          "TAPPA" AS "tappa",
          "TAPPV" AS "tappv",
          "ERA" AS "era",
          "HAKUMIN" AS "hakumin",
          "AJOMIN" AS "ajomin",
          "HAKU"::text AS "haku",
          "HAUK"::text AS "hauk",
          "YVA"::text AS "yva",
          "HLO"::text AS "hlo",
          "ALO"::text AS "alo",
          "TJA"::text AS "tja",
          "PIN"::text AS "pin",
          "MUOKATTU" AS "muokattuRaw",
          "raw_payload_json" AS "rawPayloadJson",
          "source_hash" AS "sourceHash"
        FROM "${dbTable}"
      `),
    ),
  ]);

  return {
    akoeall,
    details: detailGroups.flat(),
  };
}
