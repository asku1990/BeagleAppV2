CREATE TYPE "ShowWorkbookColumnPolicy" AS ENUM ('IMPORT', 'IGNORE');

CREATE TYPE "ShowWorkbookColumnDestinationKind" AS ENUM (
  'SHOW_EVENT',
  'SHOW_ENTRY',
  'SHOW_RESULT_ITEM'
);

CREATE TYPE "ShowWorkbookTargetField" AS ENUM (
  'REGISTRATION_NO',
  'EVENT_DATE',
  'EVENT_CITY',
  'EVENT_PLACE',
  'EVENT_TYPE',
  'DOG_NAME',
  'CLASS_VALUE',
  'QUALITY_VALUE',
  'JUDGE',
  'CRITIQUE_TEXT'
);

CREATE TYPE "ShowWorkbookColumnParseMode" AS ENUM (
  'TEXT',
  'DATE',
  'DEFINITION_FROM_CELL',
  'FIXED_FLAG',
  'FIXED_NUMERIC',
  'FIXED_CODE',
  'VALUE_MAP'
);

CREATE TABLE "ShowWorkbookColumnRule" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "headerName" TEXT NOT NULL,
  "policy" "ShowWorkbookColumnPolicy" NOT NULL DEFAULT 'IMPORT',
  "destinationKind" "ShowWorkbookColumnDestinationKind",
  "targetField" "ShowWorkbookTargetField",
  "parseMode" "ShowWorkbookColumnParseMode" NOT NULL,
  "fixedDefinitionCode" TEXT,
  "allowedDefinitionCategoryCode" TEXT,
  "headerRequired" BOOLEAN NOT NULL DEFAULT false,
  "rowValueRequired" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShowWorkbookColumnRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShowWorkbookColumnValueMap" (
  "id" TEXT NOT NULL,
  "ruleId" TEXT NOT NULL,
  "workbookValue" TEXT NOT NULL,
  "definitionCode" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShowWorkbookColumnValueMap_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShowWorkbookColumnRule_code_key" ON "ShowWorkbookColumnRule"("code");
CREATE UNIQUE INDEX "ShowWorkbookColumnRule_headerName_key" ON "ShowWorkbookColumnRule"("headerName");
CREATE INDEX "ShowWorkbookColumnRule_isEnabled_sortOrder_idx" ON "ShowWorkbookColumnRule"("isEnabled", "sortOrder");

CREATE UNIQUE INDEX "ShowWorkbookColumnValueMap_ruleId_workbookValue_key" ON "ShowWorkbookColumnValueMap"("ruleId", "workbookValue");
CREATE INDEX "ShowWorkbookColumnValueMap_ruleId_sortOrder_idx" ON "ShowWorkbookColumnValueMap"("ruleId", "sortOrder");

ALTER TABLE "ShowWorkbookColumnValueMap"
ADD CONSTRAINT "ShowWorkbookColumnValueMap_ruleId_fkey"
FOREIGN KEY ("ruleId") REFERENCES "ShowWorkbookColumnRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShowWorkbookColumnRule"
ADD CONSTRAINT "ShowWorkbookColumnRule_fixedDefinitionCode_fkey"
FOREIGN KEY ("fixedDefinitionCode") REFERENCES "ShowResultDefinition"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShowWorkbookColumnRule"
ADD CONSTRAINT "ShowWorkbookColumnRule_allowedDefinitionCategoryCode_fkey"
FOREIGN KEY ("allowedDefinitionCategoryCode") REFERENCES "ShowResultCategory"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShowWorkbookColumnValueMap"
ADD CONSTRAINT "ShowWorkbookColumnValueMap_definitionCode_fkey"
FOREIGN KEY ("definitionCode") REFERENCES "ShowResultDefinition"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShowWorkbookColumnRule"
ADD CONSTRAINT "ShowWorkbookColumnRule_policy_destination_check"
CHECK (
  ("policy" = 'IMPORT' AND "destinationKind" IS NOT NULL) OR
  ("policy" = 'IGNORE' AND "destinationKind" IS NULL AND "targetField" IS NULL AND "fixedDefinitionCode" IS NULL AND "allowedDefinitionCategoryCode" IS NULL)
);

ALTER TABLE "ShowWorkbookColumnRule"
ADD CONSTRAINT "ShowWorkbookColumnRule_fixed_definition_check"
CHECK (
  ("parseMode" IN ('FIXED_FLAG', 'FIXED_NUMERIC', 'FIXED_CODE') AND "fixedDefinitionCode" IS NOT NULL) OR
  ("parseMode" IN ('TEXT', 'DATE', 'DEFINITION_FROM_CELL', 'VALUE_MAP') AND "fixedDefinitionCode" IS NULL)
);

ALTER TABLE "ShowWorkbookColumnRule"
ADD CONSTRAINT "ShowWorkbookColumnRule_definition_category_check"
CHECK (
  ("parseMode" = 'DEFINITION_FROM_CELL' AND "allowedDefinitionCategoryCode" IS NOT NULL) OR
  ("parseMode" <> 'DEFINITION_FROM_CELL' AND "allowedDefinitionCategoryCode" IS NULL)
);

ALTER TABLE "ShowWorkbookColumnRule"
ADD CONSTRAINT "ShowWorkbookColumnRule_value_map_shape_check"
CHECK (
  ("parseMode" = 'VALUE_MAP' AND "destinationKind" = 'SHOW_RESULT_ITEM' AND "targetField" IS NULL) OR
  ("parseMode" <> 'VALUE_MAP')
);

ALTER TABLE "ShowWorkbookColumnRule"
ADD CONSTRAINT "ShowWorkbookColumnRule_fixed_result_shape_check"
CHECK (
  ("parseMode" IN ('FIXED_FLAG', 'FIXED_NUMERIC', 'FIXED_CODE') AND "destinationKind" = 'SHOW_RESULT_ITEM' AND "targetField" IS NULL) OR
  ("parseMode" NOT IN ('FIXED_FLAG', 'FIXED_NUMERIC', 'FIXED_CODE'))
);

ALTER TABLE "ShowWorkbookColumnRule"
ADD CONSTRAINT "ShowWorkbookColumnRule_definition_from_cell_shape_check"
CHECK (
  ("parseMode" = 'DEFINITION_FROM_CELL' AND "destinationKind" = 'SHOW_RESULT_ITEM' AND "targetField" IS NOT NULL) OR
  ("parseMode" <> 'DEFINITION_FROM_CELL')
);

ALTER TABLE "ShowWorkbookColumnRule"
ADD CONSTRAINT "ShowWorkbookColumnRule_text_date_shape_check"
CHECK (
  ("parseMode" IN ('TEXT', 'DATE') AND ("policy" = 'IGNORE' OR "targetField" IS NOT NULL)) OR
  ("parseMode" NOT IN ('TEXT', 'DATE'))
);

CREATE TRIGGER trg_audit_show_workbook_column_rule
AFTER INSERT OR UPDATE OR DELETE ON "ShowWorkbookColumnRule"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_show_workbook_column_value_map
AFTER INSERT OR UPDATE OR DELETE ON "ShowWorkbookColumnValueMap"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();
