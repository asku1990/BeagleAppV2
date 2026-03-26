export const WORKBOOK_FILE_PATTERN = /\.xlsx$/i;

export const STRUCTURAL_FIELD_CONFIG = [
  {
    key: "registrationNo",
    label: "Rekisterinumero",
    required: true,
    aliases: ["Rekisterinumero", "Rekisteri numero"],
  },
  {
    key: "eventDate",
    label: "Aika",
    required: true,
    aliases: ["Aika", "Paivamaara", "Pvm"],
  },
  {
    key: "eventCity",
    label: "Paikkakunta",
    required: true,
    aliases: ["Paikkakunta", "Paikka kunta", "Kunta"],
  },
  {
    key: "eventPlace",
    label: "Paikka",
    required: true,
    aliases: ["Paikka"],
  },
  {
    key: "eventType",
    label: "Näyttelytyyppi",
    required: true,
    aliases: ["Näyttelytyyppi", "Näyttely tyyppi"],
  },
  {
    key: "dogName",
    label: "Nimi",
    required: true,
    aliases: ["Nimi", "Koiran nimi"],
  },
  {
    key: "classValue",
    label: "Luokka",
    required: true,
    aliases: ["Luokka"],
  },
  {
    key: "qualityValue",
    label: "Laatuarvostelu",
    required: true,
    aliases: ["Laatuarvostelu", "Laatu arvostelu"],
  },
  {
    key: "judge",
    label: "Tuomari",
    required: false,
    aliases: ["Tuomari"],
  },
  {
    key: "critiqueText",
    label: "Arvostelu",
    required: false,
    aliases: ["Arvostelu"],
  },
] as const;

export const STRUCTURAL_FIELD_ALLOWED_VALUE_MAP = {
  classValue: {
    PEN: "PEN",
    JUN: "JUN",
    NUO: "NUO",
    AVO: "AVO",
    KÄY: "KÄY",
    VAL: "VAL",
    VET: "VET",
  },
  qualityValue: {
    ERI: "ERI",
    EH: "EH",
    H: "H",
    T: "T",
    EVA: "EVA",
    HYL: "HYL",
  },
} as const;

export const RESULT_COLUMN_CONFIG = [
  {
    headerName: "Sijoitus",
    aliases: ["Sijoitus"],
    importMode: "NUMERIC",
    definitionCodes: ["SIJOITUS"],
  },
  {
    headerName: "PuPn",
    aliases: ["PuPn", "PU/PN"],
    importMode: "PUPN",
    definitionCodes: ["PUPN"],
  },
  {
    headerName: "ROP",
    aliases: ["ROP"],
    importMode: "VALUE_MAP",
    definitionCodes: ["ROP", "VSP"],
    allowedValues: {
      ROP: "ROP",
      VSP: "VSP",
    },
  },
  {
    headerName: "SERT",
    aliases: ["SERT"],
    importMode: "VALUE_MAP",
    definitionCodes: ["SERT", "varaSERT"],
    allowedValues: {
      SERT: "SERT",
      varaSERT: "varaSERT",
    },
  },
  {
    headerName: "NORD-SERT",
    aliases: ["NORD-SERT", "NORD SERT"],
    importMode: "VALUE_MAP",
    definitionCodes: ["NORD-SERT", "NORD-varaSERT"],
    allowedValues: {
      "NORD-SERT": "NORD-SERT",
      "NORD-varaSERT": "NORD-varaSERT",
    },
  },
  {
    headerName: "JUN-SERT",
    aliases: ["JUN-SERT", "JUN SERT"],
    importMode: "VALUE_MAP",
    definitionCodes: ["JUN-SERT"],
    allowedValues: {
      "JUN-SERT": "JUN-SERT",
    },
  },
  {
    headerName: "VET-SERT",
    aliases: ["VET-SERT", "VET SERT"],
    importMode: "VALUE_MAP",
    definitionCodes: ["VET-SERT"],
    allowedValues: {
      "VET-SERT": "VET-SERT",
    },
  },
  {
    headerName: "MVA",
    aliases: ["MVA"],
    importMode: "VALUE_MAP",
    definitionCodes: ["MVA"],
    allowedValues: {
      MVA: "MVA",
    },
  },
  {
    headerName: "JMVA",
    aliases: ["JMVA"],
    importMode: "VALUE_MAP",
    definitionCodes: ["JMVA"],
    allowedValues: {
      JMVA: "JMVA",
    },
  },
  {
    headerName: "VMVA",
    aliases: ["VMVA"],
    importMode: "VALUE_MAP",
    definitionCodes: ["VMVA"],
    allowedValues: {
      VMVA: "VMVA",
    },
  },
  {
    headerName: "CACIB",
    aliases: ["CACIB"],
    importMode: "VALUE_MAP",
    definitionCodes: ["CACIB", "varaCACIB"],
    allowedValues: {
      CACIB: "CACIB",
      varaCACIB: "varaCACIB",
    },
  },
  {
    headerName: "CACIB-J",
    aliases: ["CACIB-J", "CACIB J"],
    importMode: "VALUE_MAP",
    definitionCodes: ["CACIB-J"],
    allowedValues: {
      "CACIB-J": "CACIB-J",
    },
  },
  {
    headerName: "CACIB-V",
    aliases: ["CACIB-V", "CACIB V"],
    importMode: "VALUE_MAP",
    definitionCodes: ["CACIB-V"],
    allowedValues: {
      "CACIB-V": "CACIB-V",
    },
  },
  {
    headerName: "VET-ROP",
    aliases: ["VET-ROP", "VET ROP"],
    importMode: "VALUE_MAP",
    definitionCodes: ["VET-ROP", "VET-VSP"],
    allowedValues: {
      "VET-ROP": "VET-ROP",
      "VET-VSP": "VET-VSP",
    },
  },
  {
    headerName: "JUN-ROP",
    aliases: ["JUN-ROP", "JUN ROP"],
    importMode: "VALUE_MAP",
    definitionCodes: ["JUN-ROP", "JUN-VSP"],
    allowedValues: {
      "JUN-ROP": "JUN-ROP",
      "JUN-VSP": "JUN-VSP",
    },
  },
  {
    headerName: "SA",
    aliases: ["SA"],
    importMode: "VALUE_MAP",
    definitionCodes: ["SA"],
    allowedValues: {
      SA: "SA",
    },
  },
  {
    headerName: "KP",
    aliases: ["KP"],
    importMode: "VALUE_MAP",
    definitionCodes: ["KP"],
    allowedValues: {
      KP: "KP",
    },
  },
] as const;

export const DIRECT_DEFINITION_HEADER_ALIASES = {
  "NORD-VARASERT": "NORD-varaSERT",
  VARACACIB: "varaCACIB",
  VARASERT: "varaSERT",
} as const;

export const TRUTHY_WORKBOOK_TOKENS = [
  "1",
  "TRUE",
  "X",
  "KYLLA",
  "YES",
  "JA",
] as const;

export const ISSUE_CODES = {
  invalidFile: "SHOW_WORKBOOK_INVALID_FILE",
  unreadable: "SHOW_WORKBOOK_UNREADABLE",
  missingColumns: "SHOW_WORKBOOK_MISSING_COLUMNS",
  missingRequiredField: "SHOW_WORKBOOK_REQUIRED_FIELD_MISSING",
  unsupportedColumn: "SHOW_WORKBOOK_UNSUPPORTED_COLUMN",
  duplicateHeader: "SHOW_WORKBOOK_DUPLICATE_HEADER",
  unnamedColumnWithData: "SHOW_WORKBOOK_UNNAMED_COLUMN_WITH_DATA",
  unsupportedDefinitionColumn: "SHOW_WORKBOOK_UNSUPPORTED_DEFINITION_COLUMN",
  invalidRegistration: "SHOW_WORKBOOK_INVALID_REGISTRATION_NO",
  invalidDate: "SHOW_WORKBOOK_INVALID_DATE",
  invalidResultValue: "SHOW_WORKBOOK_INVALID_RESULT_VALUE",
  definitionMissing: "SHOW_WORKBOOK_DEFINITION_NOT_FOUND",
  dogMissing: "SHOW_WORKBOOK_DOG_NOT_FOUND",
  duplicateRow: "SHOW_WORKBOOK_DUPLICATE_ROW",
  definitionsMissing: "SHOW_WORKBOOK_DEFINITIONS_MISSING",
} as const;
