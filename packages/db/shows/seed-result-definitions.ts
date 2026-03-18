import { ShowResultValueType } from "@prisma/client";
import { prisma } from "../core/prisma";

// Seeds canonical show result definitions used by both legacy and workbook imports.
const SHOW_RESULT_CATEGORIES = [
  {
    code: "KILPAILULUOKKA",
    labelFi: "Kilpailuluokka",
    labelSv: null,
    descriptionFi: "Kilpailuluokat (PEN, JUN, NUO, AVO, KÄY, VAL, VET).",
    descriptionSv: null,
    sortOrder: 10,
  },
  {
    code: "LAATUARVOSTELU",
    labelFi: "Laatuarvostelu",
    labelSv: null,
    descriptionFi:
      "Laatuarvostelut (ERI, EH, H, T, HYL, EVA) sekä ennen vuotta 2003 käytetty luokka+numero -muoto.",
    descriptionSv: null,
    sortOrder: 20,
  },
  {
    code: "ROTUSIJOITUS",
    labelFi: "Rotusijoitus",
    labelSv: null,
    descriptionFi:
      "Rotusijoitukseen liittyvät merkinnät (ROP, VSP, JUN/VET-variantit).",
    descriptionSv: null,
    sortOrder: 30,
  },
  {
    code: "SERTTIMERKINTA",
    labelFi: "Serttimerkinta",
    labelSv: null,
    descriptionFi:
      "Sertifikaatteihin ja muihin palkintomerkintöihin liittyvät tulokset.",
    descriptionSv: null,
    sortOrder: 40,
  },
  {
    code: "VALIOARVO",
    labelFi: "Valioarvo",
    labelSv: null,
    descriptionFi: "Valioarvomerkinnat (MVA, JMVA, VMVA).",
    descriptionSv: null,
    sortOrder: 60,
  },
  {
    code: "SIJOITUS",
    labelFi: "Sijoitus",
    labelSv: null,
    descriptionFi: "Kilpailuluokan sijoitusta kuvaavat arvot.",
    descriptionSv: null,
    sortOrder: 70,
  },
  {
    code: "PUPN",
    labelFi: "Paras uros / paras narttu",
    labelSv: null,
    descriptionFi: "PU/PN-sijoituskoodit (esim. PU1, PN2).",
    descriptionSv: null,
    sortOrder: 80,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_LUOKAT = [
  {
    code: "PEN", // Pentuluokka
    labelFi: "Pentuluokka",
    labelSv: null,
    descriptionFi: "Kilpailuluokka: pentuluokka.",
    valueType: ShowResultValueType.CODE,
    sortOrder: 20,
    categoryCode: "KILPAILULUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "JUN", // Junioriluokka
    labelFi: "Junioriluokka",
    labelSv: null,
    descriptionFi: "Kilpailuluokka: junioriluokka.",
    valueType: ShowResultValueType.CODE,
    sortOrder: 30,
    categoryCode: "KILPAILULUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "NUO", // Nuortenluokka
    labelFi: "Nuortenluokka",
    labelSv: null,
    descriptionFi: "Kilpailuluokka: nuortenluokka.",
    valueType: ShowResultValueType.CODE,
    sortOrder: 40,
    categoryCode: "KILPAILULUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "AVO", // Avoin luokka
    labelFi: "Avoin luokka",
    labelSv: null,
    descriptionFi: "Kilpailuluokka: avoin luokka.",
    valueType: ShowResultValueType.CODE,
    sortOrder: 50,
    categoryCode: "KILPAILULUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "KÄY", // Käyttöluokka
    labelFi: "Käyttöluokka",
    labelSv: null,
    descriptionFi: "Kilpailuluokka: käyttöluokka.",
    valueType: ShowResultValueType.CODE,
    sortOrder: 60,
    categoryCode: "KILPAILULUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "VAL", // Valioluokka
    labelFi: "Valioluokka",
    labelSv: null,
    descriptionFi: "Kilpailuluokka: valioluokka.",
    valueType: ShowResultValueType.CODE,
    sortOrder: 70,
    categoryCode: "KILPAILULUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "VET", // Veteraaniluokka
    labelFi: "Veteraaniluokka",
    labelSv: null,
    descriptionFi: "Kilpailuluokka: veteraaniluokka.",
    valueType: ShowResultValueType.CODE,
    sortOrder: 80,
    categoryCode: "KILPAILULUOKKA",
    isVisibleByDefault: false,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_LAATUARVOSTELU = [
  {
    code: "ERI", // Erinomainen
    labelFi: "ERI",
    labelSv: null,
    descriptionFi: "Laatuarvostelu: erinomainen.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 10,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "EH", // Erittain hyva
    labelFi: "EH",
    labelSv: null,
    descriptionFi: "Laatuarvostelu: erittäin hyvä.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 20,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "H", // Hyva
    labelFi: "H",
    labelSv: null,
    descriptionFi: "Laatuarvostelu: hyvä.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 30,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "T", // Tyydyttava
    labelFi: "T",
    labelSv: null,
    descriptionFi: "Laatuarvostelu: tyydyttävä.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 40,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "HYL", // Hylatty
    labelFi: "HYL",
    labelSv: null,
    descriptionFi: "Laatuarvostelu: hylätty.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 50,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "EVA", // Ei voida arvostella
    labelFi: "EVA",
    labelSv: null,
    descriptionFi: "Laatuarvostelu: ei voida arvostella.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 60,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "LEGACY-LAATUARVOSTELU", // Legacy laatuarvostelu numeroformaatissa (esim. JUN2)
    labelFi: "Legacy laatuarvostelu",
    labelSv: null,
    descriptionFi:
      "Ennen vuotta 2003 käytetty luokka+numero -laatuarvostelu (esim. JUN1).",
    valueType: ShowResultValueType.NUMERIC,
    sortOrder: 70,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: false,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_ROTUSIJOITUS = [
  {
    code: "ROP", // Rotunsa paras
    labelFi: "ROP",
    labelSv: "BIR",
    descriptionFi: "Rotunsa paras.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 10,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "VSP", // Vastakkaisen sukupuolen paras
    labelFi: "VSP",
    labelSv: "BIM",
    descriptionFi: "Vastakkaisen sukupuolen paras.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 20,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "JUN-ROP", // Rotunsa paras juniori
    labelFi: "JUN-ROP",
    labelSv: "JUN-BIR",
    descriptionFi: "Rotunsa paras juniori.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 130,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "JUN-VSP", // Vastakkaisen sukupuolen paras juniori
    labelFi: "JUN-VSP",
    labelSv: "JUN-BIM",
    descriptionFi: "Vastakkaisen sukupuolen paras juniori.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 140,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "VET-ROP", // Rotunsa paras veteraani
    labelFi: "VET-ROP",
    labelSv: "VET-BIR",
    descriptionFi: "Rotunsa paras veteraani.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 150,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "VET-VSP", // Vastakkaisen sukupuolen paras veteraani
    labelFi: "VET-VSP",
    labelSv: "VET-BIM",
    descriptionFi: "Vastakkaisen sukupuolen paras veteraani.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 160,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_SERTTIMERKINNAT = [
  {
    code: "SERT", // Sertifikaatti
    labelFi: "SERT",
    labelSv: "CERT",
    descriptionFi: "Sertifikaatti.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 30,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "varaSERT", // Varasertifikaatti (vara-SERT)
    labelFi: "varaSERT",
    labelSv: null,
    descriptionFi: "Varasertifikaatti.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 40,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "NORD-SERT", // NORD-serti
    labelFi: "NORD-SERT",
    labelSv: null,
    descriptionFi: "Pohjoismainen sertifikaatti (NORD-serti).",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 50,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "NORD-varaSERT", // NORD-vara-serti
    labelFi: "NORD-varaSERT",
    labelSv: null,
    descriptionFi: "Pohjoismainen varasertifikaatti (NORD-vara serti).",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 60,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "CACIB", // Kansainvälinen sertifikaatti (Certificat d'Aptitude au Championnat International de Beauté)
    labelFi: "CACIB",
    labelSv: "CACIB",
    descriptionFi: "Kansainvälinen sertifikaatti (CACIB).",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 70,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "varaCACIB", // Vara-CACIB
    labelFi: "varaCACIB",
    labelSv: null,
    descriptionFi: "Kansainvälisen sertifikaatin varasija (vara-CACIB).",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 80,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "CACIB-J", // Juniori-CACIB
    labelFi: "CACIB-J",
    labelSv: null,
    descriptionFi: "Kansainvälinen juniorisertifikaatti (CACIB-J).",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 90,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "CACIB-V", // Veteraani-CACIB
    labelFi: "CACIB-V",
    labelSv: null,
    descriptionFi: "Kansainvälinen veteraanisertifikaatti (CACIB-V).",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 100,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "JUN-SERT", // Juniorisertifikaatti
    labelFi: "JUN-SERT",
    labelSv: null,
    descriptionFi: "Juniorisertifikaatti.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 110,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VET-SERT", // Veteraanisertifikaatti
    labelFi: "VET-SERT",
    labelSv: null,
    descriptionFi: "Veteraanisertifikaatti.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 120,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "SA", // Sertifikaatin arvoinen
    labelFi: "SA",
    labelSv: "CK",
    descriptionFi: "Sertifikaatin arvoinen (SA).",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 170,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "KP", // Kunniapalkinto
    labelFi: "KP",
    labelSv: "HP",
    descriptionFi: "Kunniapalkinto.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 180,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_VALIOARVOT = [
  {
    code: "MVA", // Suomen muotovalio (FI MVA)
    labelFi: "MVA",
    labelSv: "UCH",
    descriptionFi: "Suomen muotovalio.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 190,
    categoryCode: "VALIOARVO",
    isVisibleByDefault: true,
  },
  {
    code: "JMVA", // Suomen juniorimuotovalio (FI JMVA)
    labelFi: "JMVA",
    labelSv: "JUCH",
    descriptionFi: "Suomen juniorimuotovalio.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 200,
    categoryCode: "VALIOARVO",
    isVisibleByDefault: true,
  },
  {
    code: "VMVA", // Suomen veteraanimuotovalio (FI VMVA)
    labelFi: "VMVA",
    labelSv: "VUCH",
    descriptionFi: "Suomen veteraanimuotovalio.",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 210,
    categoryCode: "VALIOARVO",
    isVisibleByDefault: true,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_SIJOITUS = [
  {
    code: "SIJOITUS", // Kilpailuluokan sijoitus (1-4)
    labelFi: "Sijoitus",
    labelSv: null,
    descriptionFi: "Kilpailuluokan sijoitus.",
    valueType: ShowResultValueType.NUMERIC,
    sortOrder: 220,
    categoryCode: "SIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "PUPN", // Paras uros / paras narttu (PU/PN)
    labelFi: "Paras uros / paras narttu",
    labelSv: null,
    descriptionFi: "Paras uros / paras narttu -sijoituskoodi (PU/PN).",
    valueType: ShowResultValueType.CODE,
    sortOrder: 230,
    categoryCode: "PUPN",
    isVisibleByDefault: true,
  },
] as const;

const SHOW_RESULT_DEFINITIONS = [
  ...SHOW_RESULT_DEFINITIONS_LUOKAT,
  ...SHOW_RESULT_DEFINITIONS_LAATUARVOSTELU,
  ...SHOW_RESULT_DEFINITIONS_ROTUSIJOITUS,
  ...SHOW_RESULT_DEFINITIONS_SERTTIMERKINNAT,
  ...SHOW_RESULT_DEFINITIONS_VALIOARVOT,
  ...SHOW_RESULT_DEFINITIONS_SIJOITUS,
] as const;

export async function seedShowResultDefinitions(): Promise<{
  upserted: number;
}> {
  const categoryIds = new Map<string, string>();
  for (const category of SHOW_RESULT_CATEGORIES) {
    const row = await prisma.showResultCategory.upsert({
      where: { code: category.code },
      create: {
        code: category.code,
        labelFi: category.labelFi,
        labelSv: category.labelSv,
        descriptionFi: category.descriptionFi,
        descriptionSv: category.descriptionSv,
        sortOrder: category.sortOrder,
        isEnabled: true,
      },
      update: {
        labelFi: category.labelFi,
        labelSv: category.labelSv,
        descriptionFi: category.descriptionFi,
        descriptionSv: category.descriptionSv,
        sortOrder: category.sortOrder,
        isEnabled: true,
      },
      select: { id: true },
    });
    categoryIds.set(category.code, row.id);
  }

  let upserted = 0;

  for (const definition of SHOW_RESULT_DEFINITIONS) {
    const categoryId = categoryIds.get(definition.categoryCode);
    if (!categoryId) {
      throw new Error(
        `Missing category for definition code=${definition.code}`,
      );
    }

    await prisma.showResultDefinition.upsert({
      where: { code: definition.code },
      create: {
        code: definition.code,
        labelFi: definition.labelFi,
        labelSv: definition.labelSv,
        descriptionFi: definition.descriptionFi ?? null,
        descriptionSv: null,
        valueType: definition.valueType,
        categoryId,
        sortOrder: definition.sortOrder,
        isVisibleByDefault: definition.isVisibleByDefault,
        isEnabled: true,
      },
      update: {
        labelFi: definition.labelFi,
        labelSv: definition.labelSv,
        descriptionFi: definition.descriptionFi ?? null,
        descriptionSv: null,
        valueType: definition.valueType,
        categoryId,
        sortOrder: definition.sortOrder,
        isVisibleByDefault: definition.isVisibleByDefault,
        isEnabled: true,
      },
    });
    upserted += 1;
  }

  return { upserted };
}
