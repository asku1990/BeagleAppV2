import { ShowResultValueType } from "@prisma/client";
import { prisma } from "../core/prisma";

// Seeds canonical show result definitions used by both legacy and workbook imports.
const SHOW_RESULT_CATEGORIES = [
  {
    code: "LUOKKA",
    labelFi: "Luokka",
    labelSv: null,
    descriptionFi: "Nayttelyluokat (esim. JUN, NUO, AVO, KÄY, VAL, VET).",
    descriptionSv: null,
    sortOrder: 10,
  },
  {
    code: "LAATUARVOSTELU",
    labelFi: "Laatuarvostelu",
    labelSv: null,
    descriptionFi: "Laatuarvostelukoodit (ERI, EH, H, T, HYL, EVA).",
    descriptionSv: null,
    sortOrder: 20,
  },
  {
    code: "ROTUSIJOITUS",
    labelFi: "Rotusijoitus",
    labelSv: null,
    descriptionFi:
      "Rotusijoitukseen liittyvat merkinnat (ROP, VSP, JUN/VET-variantit).",
    descriptionSv: null,
    sortOrder: 30,
  },
  {
    code: "SERTTIMERKINTA",
    labelFi: "Serttimerkinta",
    labelSv: null,
    descriptionFi: "Sertteihin ja palkintomerkintoihin liittyvat tulokset.",
    descriptionSv: null,
    sortOrder: 40,
  },
  {
    code: "JUNIORI_VETERAANI",
    labelFi: "Juniori ja veteraani",
    labelSv: null,
    descriptionFi: "Juniori- ja veteraanikohtaiset sertti- ja CACIB-merkinnat.",
    descriptionSv: null,
    sortOrder: 50,
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
    descriptionFi: "Kilpailuluokan sijoitusarvot.",
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
    valueType: ShowResultValueType.CODE,
    sortOrder: 20,
    categoryCode: "LUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "JUN", // Junioriluokka
    labelFi: "Junioriluokka",
    labelSv: null,
    valueType: ShowResultValueType.CODE,
    sortOrder: 30,
    categoryCode: "LUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "NUO", // Nuortenluokka
    labelFi: "Nuortenluokka",
    labelSv: null,
    valueType: ShowResultValueType.CODE,
    sortOrder: 40,
    categoryCode: "LUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "AVO", // Avoin luokka
    labelFi: "Avoin luokka",
    labelSv: null,
    valueType: ShowResultValueType.CODE,
    sortOrder: 50,
    categoryCode: "LUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "KÄY", // Käyttöluokka
    labelFi: "Käyttöluokka",
    labelSv: null,
    valueType: ShowResultValueType.CODE,
    sortOrder: 60,
    categoryCode: "LUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "VAL", // Valioluokka
    labelFi: "Valioluokka",
    labelSv: null,
    valueType: ShowResultValueType.CODE,
    sortOrder: 70,
    categoryCode: "LUOKKA",
    isVisibleByDefault: false,
  },
  {
    code: "VET", // Veteraaniluokka
    labelFi: "Veteraaniluokka",
    labelSv: null,
    valueType: ShowResultValueType.CODE,
    sortOrder: 80,
    categoryCode: "LUOKKA",
    isVisibleByDefault: false,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_LAATUARVOSTELU = [
  {
    code: "ERI", // Erinomainen
    labelFi: "ERI",
    labelSv: null,
    valueType: ShowResultValueType.FLAG,
    sortOrder: 10,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "EH", // Erittain hyva
    labelFi: "EH",
    labelSv: null,
    valueType: ShowResultValueType.FLAG,
    sortOrder: 20,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "H", // Hyva
    labelFi: "H",
    labelSv: null,
    valueType: ShowResultValueType.FLAG,
    sortOrder: 30,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "T", // Tyydyttava
    labelFi: "T",
    labelSv: null,
    valueType: ShowResultValueType.FLAG,
    sortOrder: 40,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "HYL", // Hylatty
    labelFi: "HYL",
    labelSv: null,
    valueType: ShowResultValueType.FLAG,
    sortOrder: 50,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
  {
    code: "EVA", // Ei voida arvostella
    labelFi: "EVA",
    labelSv: null,
    valueType: ShowResultValueType.FLAG,
    sortOrder: 60,
    categoryCode: "LAATUARVOSTELU",
    isVisibleByDefault: true,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_ROTUSIJOITUS = [
  {
    code: "ROP", // Rotunsa paras
    labelFi: "ROP",
    labelSv: "BIR",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 10,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "VSP", // Vastakkaisen sukupuolen paras
    labelFi: "VSP",
    labelSv: "BIM",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 20,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "JUN_ROP", // Rotunsa paras juniori
    labelFi: "JUN-ROP",
    labelSv: "JUN-BIR",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 130,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "JUN_VSP", // Vastakkaisen sukupuolen paras juniori
    labelFi: "JUN-VSP",
    labelSv: "JUN-BIM",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 140,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "VET_ROP", // Rotunsa paras veteraani
    labelFi: "VET-ROP",
    labelSv: "VET-BIR",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 150,
    categoryCode: "ROTUSIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "VET_VSP", // Vastakkaisen sukupuolen paras veteraani
    labelFi: "VET-VSP",
    labelSv: "VET-BIM",
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
    valueType: ShowResultValueType.FLAG,
    sortOrder: 30,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VARASERT", // Varasertifikaatti (vara-SERT)
    labelFi: "Vara-SERT",
    labelSv: "Reserv-CERT",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 40,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "NORD_SERT", // NORD-serti
    labelFi: "NORD-SERT",
    labelSv: "NORD-CERT",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 50,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "NORD_VARASERT", // NORD-vara-serti
    labelFi: "NORD-varaSERT",
    labelSv: "NORD-reserv-CERT",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 60,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "CACIB", // Kansainvälinen sertifikaatti (Certificat d'Aptitude au Championnat International de Beauté)
    labelFi: "CACIB",
    labelSv: "CACIB",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 70,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VARACACIB", // Vara-CACIB
    labelFi: "Vara-CACIB",
    labelSv: "Reserv-CACIB",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 80,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "CACIB_J", // Juniori-CACIB
    labelFi: "CACIB-J",
    labelSv: "CACIB-J",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 90,
    categoryCode: "JUNIORI_VETERAANI",
    isVisibleByDefault: true,
  },
  {
    code: "CACIB_V", // Veteraani-CACIB
    labelFi: "CACIB-V",
    labelSv: "CACIB-V",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 100,
    categoryCode: "JUNIORI_VETERAANI",
    isVisibleByDefault: true,
  },
  {
    code: "JUN_SERT", // Juniorisertifikaatti
    labelFi: "JUN-SERT",
    labelSv: "JUN-CERT",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 110,
    categoryCode: "JUNIORI_VETERAANI",
    isVisibleByDefault: true,
  },
  {
    code: "VET_SERT", // Veteraanisertifikaatti
    labelFi: "VET-SERT",
    labelSv: "VET-CERT",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 120,
    categoryCode: "JUNIORI_VETERAANI",
    isVisibleByDefault: true,
  },
  {
    code: "SA", // Sertifikaatin arvoinen
    labelFi: "SA",
    labelSv: "CK",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 170,
    categoryCode: "SERTTIMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "KP", // Kunniapalkinto
    labelFi: "KP",
    labelSv: "HP",
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
    valueType: ShowResultValueType.FLAG,
    sortOrder: 190,
    categoryCode: "VALIOARVO",
    isVisibleByDefault: true,
  },
  {
    code: "JMVA", // Suomen juniorimuotovalio (FI JMVA)
    labelFi: "JMVA",
    labelSv: "JUCH",
    valueType: ShowResultValueType.FLAG,
    sortOrder: 200,
    categoryCode: "VALIOARVO",
    isVisibleByDefault: true,
  },
  {
    code: "VMVA", // Suomen veteraanimuotovalio (FI VMVA)
    labelFi: "VMVA",
    labelSv: "VUCH",
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
    valueType: ShowResultValueType.NUMERIC,
    sortOrder: 220,
    categoryCode: "SIJOITUS",
    isVisibleByDefault: true,
  },
  {
    code: "PUPN", // Paras uros / paras narttu (PU/PN)
    labelFi: "Paras uros / paras narttu",
    labelSv: null,
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
        descriptionFi: null,
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
        descriptionFi: null,
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
