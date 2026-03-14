import { ShowResultValueType } from "@prisma/client";
import { prisma } from "../core/prisma";

// Seeds canonical show result definitions used by both legacy and workbook imports.
const SHOW_RESULT_DEFINITIONS_ROTUSIJOITUS = [
  {
    code: "ROP", // Rotunsa paras
    labelFi: "ROP",
    labelSv: "BIR",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 100,
    defaultSortOrder: 10,
    groupKey: "ROTUSIJOITUS",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VSP", // Vastakkaisen sukupuolen paras
    labelFi: "VSP",
    labelSv: "BIM",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 95,
    defaultSortOrder: 20,
    groupKey: "ROTUSIJOITUS",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "JUN_ROP", // Rotunsa paras juniori
    labelFi: "JUN-ROP",
    labelSv: "JUN-BIR",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 76,
    defaultSortOrder: 130,
    groupKey: "ROTUSIJOITUS",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "JUN_VSP", // Vastakkaisen sukupuolen paras juniori
    labelFi: "JUN-VSP",
    labelSv: "JUN-BIM",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 75,
    defaultSortOrder: 140,
    groupKey: "ROTUSIJOITUS",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VET_ROP", // Rotunsa paras veteraani
    labelFi: "VET-ROP",
    labelSv: "VET-BIR",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 74,
    defaultSortOrder: 150,
    groupKey: "ROTUSIJOITUS",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VET_VSP", // Vastakkaisen sukupuolen paras veteraani
    labelFi: "VET-VSP",
    labelSv: "VET-BIM",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 73,
    defaultSortOrder: 160,
    groupKey: "ROTUSIJOITUS",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_SERTTIMERKINNAT = [
  {
    code: "SERT", // Sertifikaatti
    labelFi: "SERT",
    labelSv: "CERT",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 90,
    defaultSortOrder: 30,
    groupKey: "SERTTIMERKINTA",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VARASERT", // Varasertifikaatti (vara-SERT)
    labelFi: "Vara-SERT",
    labelSv: "Reserv-CERT",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 88,
    defaultSortOrder: 40,
    groupKey: "SERTTIMERKINTA",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "NORD_SERT", // NORD-serti
    labelFi: "NORD-SERT",
    labelSv: "NORD-CERT",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 87,
    defaultSortOrder: 50,
    groupKey: "SERTTIMERKINTA",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "NORD_VARASERT", // NORD-vara-serti
    labelFi: "NORD-varaSERT",
    labelSv: "NORD-reserv-CERT",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 85,
    defaultSortOrder: 60,
    groupKey: "SERTTIMERKINTA",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "CACIB", // Kansainvälinen sertifikaatti (Certificat d'Aptitude au Championnat International de Beauté)
    labelFi: "CACIB",
    labelSv: "CACIB",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 84,
    defaultSortOrder: 70,
    groupKey: "SERTTIMERKINTA",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VARACACIB", // Vara-CACIB
    labelFi: "Vara-CACIB",
    labelSv: "Reserv-CACIB",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 82,
    defaultSortOrder: 80,
    groupKey: "SERTTIMERKINTA",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "CACIB_J", // Juniori-CACIB
    labelFi: "CACIB-J",
    labelSv: "CACIB-J",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 80,
    defaultSortOrder: 90,
    groupKey: "JUNIORI_VETERAANI",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "CACIB_V", // Veteraani-CACIB
    labelFi: "CACIB-V",
    labelSv: "CACIB-V",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 79,
    defaultSortOrder: 100,
    groupKey: "JUNIORI_VETERAANI",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "JUN_SERT", // Juniorisertifikaatti
    labelFi: "JUN-SERT",
    labelSv: "JUN-CERT",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 78,
    defaultSortOrder: 110,
    groupKey: "JUNIORI_VETERAANI",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VET_SERT", // Veteraanisertifikaatti
    labelFi: "VET-SERT",
    labelSv: "VET-CERT",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 77,
    defaultSortOrder: 120,
    groupKey: "JUNIORI_VETERAANI",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "SA", // Sertifikaatin arvoinen
    labelFi: "SA",
    labelSv: "CK",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 60,
    defaultSortOrder: 170,
    groupKey: "SERTTIMERKINTA",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "KP", // Kunniapalkinto
    labelFi: "KP",
    labelSv: "HP",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 55,
    defaultSortOrder: 180,
    groupKey: "SERTTIMERKINTA",
    kindKey: "PALKINTOMERKINTA",
    isVisibleByDefault: true,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_VALIOARVOT = [
  {
    code: "MVA", // Suomen muotovalio (FI MVA)
    labelFi: "MVA",
    labelSv: "UCH",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 50,
    defaultSortOrder: 190,
    groupKey: "VALIOARVO",
    kindKey: "VALIOARVOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "JMVA", // Suomen juniorimuotovalio (FI JMVA)
    labelFi: "JMVA",
    labelSv: "JUCH",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 49,
    defaultSortOrder: 200,
    groupKey: "VALIOARVO",
    kindKey: "VALIOARVOMERKINTA",
    isVisibleByDefault: true,
  },
  {
    code: "VMVA", // Suomen veteraanimuotovalio (FI VMVA)
    labelFi: "VMVA",
    labelSv: "VUCH",
    valueType: ShowResultValueType.FLAG,
    defaultImportance: 48,
    defaultSortOrder: 210,
    groupKey: "VALIOARVO",
    kindKey: "VALIOARVOMERKINTA",
    isVisibleByDefault: true,
  },
] as const;

const SHOW_RESULT_DEFINITIONS_SIJOITUS = [
  {
    code: "SIJOITUS", // Kilpailuluokan sijoitus (1-4)
    labelFi: "Sijoitus",
    labelSv: null,
    valueType: ShowResultValueType.NUMERIC,
    defaultImportance: 45,
    defaultSortOrder: 220,
    groupKey: "SIJOITUS",
    kindKey: "TULOS",
    isVisibleByDefault: true,
  },
  {
    code: "PUPN", // Paras uros / paras narttu (PU/PN)
    labelFi: "Paras uros / paras narttu",
    labelSv: null,
    valueType: ShowResultValueType.CODE,
    defaultImportance: 45,
    defaultSortOrder: 230,
    groupKey: "PUPN",
    kindKey: "TULOS",
    isVisibleByDefault: true,
  },
] as const;

const SHOW_RESULT_DEFINITIONS = [
  ...SHOW_RESULT_DEFINITIONS_ROTUSIJOITUS,
  ...SHOW_RESULT_DEFINITIONS_SERTTIMERKINNAT,
  ...SHOW_RESULT_DEFINITIONS_VALIOARVOT,
  ...SHOW_RESULT_DEFINITIONS_SIJOITUS,
] as const;

export async function seedShowResultDefinitions(): Promise<{
  upserted: number;
}> {
  let upserted = 0;

  for (const definition of SHOW_RESULT_DEFINITIONS) {
    await prisma.showResultDefinition.upsert({
      where: { code: definition.code },
      create: {
        code: definition.code,
        labelFi: definition.labelFi,
        labelSv: definition.labelSv,
        valueType: definition.valueType,
        defaultImportance: definition.defaultImportance,
        defaultSortOrder: definition.defaultSortOrder,
        groupKey: definition.groupKey,
        kindKey: definition.kindKey,
        isVisibleByDefault: definition.isVisibleByDefault,
        isEnabled: true,
      },
      update: {
        labelFi: definition.labelFi,
        labelSv: definition.labelSv,
        valueType: definition.valueType,
        defaultImportance: definition.defaultImportance,
        defaultSortOrder: definition.defaultSortOrder,
        groupKey: definition.groupKey,
        kindKey: definition.kindKey,
        isVisibleByDefault: definition.isVisibleByDefault,
        isEnabled: true,
      },
    });
    upserted += 1;
  }

  return { upserted };
}
