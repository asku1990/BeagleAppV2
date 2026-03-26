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
CREATE INDEX "ShowWorkbookColumnRule_isEnabled_sortOrder_idx" ON "ShowWorkbookColumnRule"("isEnabled", "sortOrder");

CREATE UNIQUE INDEX "ShowWorkbookColumnValueMap_ruleId_workbookValue_key" ON "ShowWorkbookColumnValueMap"("ruleId", "workbookValue");
CREATE INDEX "ShowWorkbookColumnValueMap_ruleId_sortOrder_idx" ON "ShowWorkbookColumnValueMap"("ruleId", "sortOrder");

ALTER TABLE "ShowWorkbookColumnValueMap"
ADD CONSTRAINT "ShowWorkbookColumnValueMap_ruleId_fkey"
FOREIGN KEY ("ruleId") REFERENCES "ShowWorkbookColumnRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER trg_audit_show_workbook_column_rule
AFTER INSERT OR UPDATE OR DELETE ON "ShowWorkbookColumnRule"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_show_workbook_column_value_map
AFTER INSERT OR UPDATE OR DELETE ON "ShowWorkbookColumnValueMap"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();
