-- CreateEnum
CREATE TYPE "ShowSourceTag" AS ENUM ('LEGACY_NAY9599', 'LEGACY_BEANAY', 'LEGACY_BEANAY_TEXT', 'WORKBOOK_KENNELLIITTO', 'MANUAL_ADMIN');

-- CreateEnum
CREATE TYPE "ShowResultValueType" AS ENUM ('FLAG', 'CODE', 'TEXT', 'NUMERIC', 'DATE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ImportKind" ADD VALUE 'LEGACY_PHASE2';
ALTER TYPE "ImportKind" ADD VALUE 'LEGACY_PHASE3';

-- CreateTable
CREATE TABLE "ShowEvent" (
    "id" TEXT NOT NULL,
    "eventLookupKey" TEXT NOT NULL,
    "sourceRowHash" TEXT,
    "sourceTag" "ShowSourceTag" NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT,
    "eventCity" TEXT,
    "eventPlace" TEXT NOT NULL,
    "eventType" TEXT,
    "organizer" TEXT,
    "importRunId" TEXT,
    "sourceTable" TEXT,
    "sourceRef" TEXT,
    "rawPayloadJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowEntry" (
    "id" TEXT NOT NULL,
    "entryLookupKey" TEXT NOT NULL,
    "sourceRowHash" TEXT,
    "showEventId" TEXT NOT NULL,
    "dogId" TEXT,
    "sourceTag" "ShowSourceTag" NOT NULL,
    "registrationNoSnapshot" TEXT NOT NULL,
    "dogNameSnapshot" TEXT NOT NULL,
    "judge" TEXT,
    "heightText" TEXT,
    "critiqueText" TEXT,
    "importRunId" TEXT,
    "sourceTable" TEXT,
    "sourceRef" TEXT,
    "legacyFlag" TEXT,
    "rawPayloadJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowResultCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "labelFi" TEXT NOT NULL,
    "labelSv" TEXT,
    "descriptionFi" TEXT,
    "descriptionSv" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowResultCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowResultDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "labelFi" TEXT NOT NULL,
    "labelSv" TEXT,
    "descriptionFi" TEXT,
    "descriptionSv" TEXT,
    "valueType" "ShowResultValueType" NOT NULL DEFAULT 'FLAG',
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisibleByDefault" BOOLEAN NOT NULL DEFAULT true,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowResultDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowResultItem" (
    "id" TEXT NOT NULL,
    "itemLookupKey" TEXT NOT NULL,
    "sourceRowHash" TEXT,
    "showEntryId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "sourceTag" "ShowSourceTag" NOT NULL,
    "valueCode" TEXT,
    "valueText" TEXT,
    "valueNumeric" DECIMAL(8,2),
    "valueDate" TIMESTAMP(3),
    "isAwarded" BOOLEAN,
    "importRunId" TEXT,
    "sourceTable" TEXT,
    "sourceRef" TEXT,
    "rawPayloadJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowResultItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShowEvent_eventLookupKey_key" ON "ShowEvent"("eventLookupKey");

-- CreateIndex
CREATE UNIQUE INDEX "ShowEvent_sourceRowHash_key" ON "ShowEvent"("sourceRowHash");

-- CreateIndex
CREATE INDEX "ShowEvent_eventDate_idx" ON "ShowEvent"("eventDate");

-- CreateIndex
CREATE INDEX "ShowEvent_eventPlace_eventDate_idx" ON "ShowEvent"("eventPlace", "eventDate");

-- CreateIndex
CREATE INDEX "ShowEvent_sourceTag_eventDate_idx" ON "ShowEvent"("sourceTag", "eventDate");

-- CreateIndex
CREATE UNIQUE INDEX "ShowEntry_entryLookupKey_key" ON "ShowEntry"("entryLookupKey");

-- CreateIndex
CREATE UNIQUE INDEX "ShowEntry_sourceRowHash_key" ON "ShowEntry"("sourceRowHash");

-- CreateIndex
CREATE INDEX "ShowEntry_showEventId_idx" ON "ShowEntry"("showEventId");

-- CreateIndex
CREATE INDEX "ShowEntry_dogId_idx" ON "ShowEntry"("dogId");

-- CreateIndex
CREATE INDEX "ShowEntry_showEventId_dogId_idx" ON "ShowEntry"("showEventId", "dogId");

-- CreateIndex
CREATE INDEX "ShowEntry_sourceTag_idx" ON "ShowEntry"("sourceTag");

-- CreateIndex
CREATE UNIQUE INDEX "ShowResultCategory_code_key" ON "ShowResultCategory"("code");

-- CreateIndex
CREATE INDEX "ShowResultCategory_isEnabled_sortOrder_idx" ON "ShowResultCategory"("isEnabled", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ShowResultDefinition_code_key" ON "ShowResultDefinition"("code");

-- CreateIndex
CREATE INDEX "ShowResultDefinition_isEnabled_sortOrder_idx" ON "ShowResultDefinition"("isEnabled", "sortOrder");

-- CreateIndex
CREATE INDEX "ShowResultDefinition_categoryId_idx" ON "ShowResultDefinition"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ShowResultItem_itemLookupKey_key" ON "ShowResultItem"("itemLookupKey");

-- CreateIndex
CREATE UNIQUE INDEX "ShowResultItem_sourceRowHash_key" ON "ShowResultItem"("sourceRowHash");

-- CreateIndex
CREATE INDEX "ShowResultItem_showEntryId_idx" ON "ShowResultItem"("showEntryId");

-- CreateIndex
CREATE INDEX "ShowResultItem_definitionId_idx" ON "ShowResultItem"("definitionId");

-- CreateIndex
CREATE INDEX "ShowResultItem_showEntryId_definitionId_idx" ON "ShowResultItem"("showEntryId", "definitionId");

-- CreateIndex
CREATE INDEX "ShowResultItem_sourceTag_idx" ON "ShowResultItem"("sourceTag");

-- AddForeignKey
ALTER TABLE "ShowEvent" ADD CONSTRAINT "ShowEvent_importRunId_fkey" FOREIGN KEY ("importRunId") REFERENCES "ImportRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowEntry" ADD CONSTRAINT "ShowEntry_showEventId_fkey" FOREIGN KEY ("showEventId") REFERENCES "ShowEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowEntry" ADD CONSTRAINT "ShowEntry_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowEntry" ADD CONSTRAINT "ShowEntry_importRunId_fkey" FOREIGN KEY ("importRunId") REFERENCES "ImportRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowResultDefinition" ADD CONSTRAINT "ShowResultDefinition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ShowResultCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowResultItem" ADD CONSTRAINT "ShowResultItem_showEntryId_fkey" FOREIGN KEY ("showEntryId") REFERENCES "ShowEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowResultItem" ADD CONSTRAINT "ShowResultItem_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "ShowResultDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowResultItem" ADD CONSTRAINT "ShowResultItem_importRunId_fkey" FOREIGN KEY ("importRunId") REFERENCES "ImportRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Table/column comments (Finnish) for canonical show schema
COMMENT ON TABLE "ShowEvent" IS 'Näyttelytapahtuman kanoninen päätaso.';
COMMENT ON COLUMN "ShowEvent"."id" IS 'Tapahtumarivin tekninen tunniste.';
COMMENT ON COLUMN "ShowEvent"."eventLookupKey" IS 'Yhtenäinen tapahtuman hakutunniste.';
COMMENT ON COLUMN "ShowEvent"."sourceRowHash" IS 'Lähderivin tiiviste duplikaattisuojaukseen.';
COMMENT ON COLUMN "ShowEvent"."sourceTag" IS 'Lähdejärjestelmän tunniste.';
COMMENT ON COLUMN "ShowEvent"."eventDate" IS 'Näyttelyn päivä.';
COMMENT ON COLUMN "ShowEvent"."eventName" IS 'Näyttelyn nimi.';
COMMENT ON COLUMN "ShowEvent"."eventCity" IS 'Näyttelyn paikkakunta.';
COMMENT ON COLUMN "ShowEvent"."eventPlace" IS 'Näyttelyn paikka.';
COMMENT ON COLUMN "ShowEvent"."eventType" IS 'Näyttelytyyppi.';
COMMENT ON COLUMN "ShowEvent"."organizer" IS 'Järjestäjä.';
COMMENT ON COLUMN "ShowEvent"."importRunId" IS 'Viittaus import-ajoon.';
COMMENT ON COLUMN "ShowEvent"."sourceTable" IS 'Alkuperäinen lähdetaulu.';
COMMENT ON COLUMN "ShowEvent"."sourceRef" IS 'Alkuperäisen lähteen rivitunniste.';
COMMENT ON COLUMN "ShowEvent"."rawPayloadJson" IS 'Raakalähteen payload JSON-muodossa.';
COMMENT ON COLUMN "ShowEvent"."createdAt" IS 'Luontiaika.';
COMMENT ON COLUMN "ShowEvent"."updatedAt" IS 'Päivitysaika.';

COMMENT ON TABLE "ShowEntry" IS 'Yhden koiran osallistuminen yhteen näyttelytapahtumaan.';
COMMENT ON COLUMN "ShowEntry"."id" IS 'Osallistumisrivin tekninen tunniste.';
COMMENT ON COLUMN "ShowEntry"."entryLookupKey" IS 'Yhtenäinen osallistumisrivin hakutunniste.';
COMMENT ON COLUMN "ShowEntry"."sourceRowHash" IS 'Lähderivin tiiviste duplikaattisuojaukseen.';
COMMENT ON COLUMN "ShowEntry"."showEventId" IS 'Viittaus tapahtumaan.';
COMMENT ON COLUMN "ShowEntry"."dogId" IS 'Viittaus koiraan.';
COMMENT ON COLUMN "ShowEntry"."sourceTag" IS 'Lähdejärjestelmän tunniste.';
COMMENT ON COLUMN "ShowEntry"."registrationNoSnapshot" IS 'Rekisterinumeron snapshot import-hetkellä.';
COMMENT ON COLUMN "ShowEntry"."dogNameSnapshot" IS 'Koiran nimen snapshot import-hetkellä.';
COMMENT ON COLUMN "ShowEntry"."judge" IS 'Tuomari.';
COMMENT ON COLUMN "ShowEntry"."heightText" IS 'Korkeustieto tekstimuodossa.';
COMMENT ON COLUMN "ShowEntry"."critiqueText" IS 'Arvosteluteksti.';
COMMENT ON COLUMN "ShowEntry"."importRunId" IS 'Viittaus import-ajoon.';
COMMENT ON COLUMN "ShowEntry"."sourceTable" IS 'Alkuperäinen lähdetaulu.';
COMMENT ON COLUMN "ShowEntry"."sourceRef" IS 'Alkuperäisen lähteen rivitunniste.';
COMMENT ON COLUMN "ShowEntry"."legacyFlag" IS 'Legacy-lipputieto.';
COMMENT ON COLUMN "ShowEntry"."rawPayloadJson" IS 'Raakalähteen payload JSON-muodossa.';
COMMENT ON COLUMN "ShowEntry"."createdAt" IS 'Luontiaika.';
COMMENT ON COLUMN "ShowEntry"."updatedAt" IS 'Päivitysaika.';

COMMENT ON TABLE "ShowResultCategory" IS 'Tulosmääritelmien hallittavat kategoriat.';
COMMENT ON COLUMN "ShowResultCategory"."id" IS 'Kategorian tekninen tunniste.';
COMMENT ON COLUMN "ShowResultCategory"."code" IS 'Vakioitu kategoria-avain.';
COMMENT ON COLUMN "ShowResultCategory"."labelFi" IS 'Kategorian nimi suomeksi.';
COMMENT ON COLUMN "ShowResultCategory"."labelSv" IS 'Kategorian nimi ruotsiksi.';
COMMENT ON COLUMN "ShowResultCategory"."descriptionFi" IS 'Kategorian kuvaus suomeksi.';
COMMENT ON COLUMN "ShowResultCategory"."descriptionSv" IS 'Kategorian kuvaus ruotsiksi.';
COMMENT ON COLUMN "ShowResultCategory"."sortOrder" IS 'Kategorian oletusjärjestys.';
COMMENT ON COLUMN "ShowResultCategory"."isEnabled" IS 'Onko kategoria käytössä.';
COMMENT ON COLUMN "ShowResultCategory"."createdAt" IS 'Luontiaika.';
COMMENT ON COLUMN "ShowResultCategory"."updatedAt" IS 'Päivitysaika.';

COMMENT ON TABLE "ShowResultDefinition" IS 'Tulosattribuuttien kanoniset määritelmät (esim. SA, SERT, CACIB).';
COMMENT ON COLUMN "ShowResultDefinition"."id" IS 'Määritelmän tekninen tunniste.';
COMMENT ON COLUMN "ShowResultDefinition"."code" IS 'Vakioitu koneellinen koodi.';
COMMENT ON COLUMN "ShowResultDefinition"."labelFi" IS 'Nimi suomeksi.';
COMMENT ON COLUMN "ShowResultDefinition"."labelSv" IS 'Nimi ruotsiksi.';
COMMENT ON COLUMN "ShowResultDefinition"."descriptionFi" IS 'Määritelmän kuvaus suomeksi.';
COMMENT ON COLUMN "ShowResultDefinition"."descriptionSv" IS 'Määritelmän kuvaus ruotsiksi.';
COMMENT ON COLUMN "ShowResultDefinition"."valueType" IS 'Attribuutin arvotyyppi.';
COMMENT ON COLUMN "ShowResultDefinition"."categoryId" IS 'Viittaus tuloskategoriaan.';
COMMENT ON COLUMN "ShowResultDefinition"."sortOrder" IS 'Määritelmän lajittelujärjestys.';
COMMENT ON COLUMN "ShowResultDefinition"."isVisibleByDefault" IS 'Näkyykö oletuksena.';
COMMENT ON COLUMN "ShowResultDefinition"."isEnabled" IS 'Onko määritelmä käytössä.';
COMMENT ON COLUMN "ShowResultDefinition"."createdAt" IS 'Luontiaika.';
COMMENT ON COLUMN "ShowResultDefinition"."updatedAt" IS 'Päivitysaika.';

COMMENT ON TABLE "ShowResultItem" IS 'Joustava tulosattribuutti yksittäiselle osallistumisriville.';
COMMENT ON COLUMN "ShowResultItem"."id" IS 'Tulosattribuuttirivin tekninen tunniste.';
COMMENT ON COLUMN "ShowResultItem"."itemLookupKey" IS 'Yhtenäinen tulosattribuuttirivin hakutunniste.';
COMMENT ON COLUMN "ShowResultItem"."sourceRowHash" IS 'Lähderivin tiiviste duplikaattisuojaukseen.';
COMMENT ON COLUMN "ShowResultItem"."showEntryId" IS 'Viittaus osallistumisriviin.';
COMMENT ON COLUMN "ShowResultItem"."definitionId" IS 'Viittaus tulosmääritelmään.';
COMMENT ON COLUMN "ShowResultItem"."sourceTag" IS 'Lähdejärjestelmän tunniste.';
COMMENT ON COLUMN "ShowResultItem"."valueCode" IS 'Koodiarvo.';
COMMENT ON COLUMN "ShowResultItem"."valueText" IS 'Tekstiarvo.';
COMMENT ON COLUMN "ShowResultItem"."valueNumeric" IS 'Numeroarvo.';
COMMENT ON COLUMN "ShowResultItem"."valueDate" IS 'Päivämääräarvo.';
COMMENT ON COLUMN "ShowResultItem"."isAwarded" IS 'Boolean-lippuarvo.';
COMMENT ON COLUMN "ShowResultItem"."importRunId" IS 'Viittaus import-ajoon.';
COMMENT ON COLUMN "ShowResultItem"."sourceTable" IS 'Alkuperäinen lähdetaulu.';
COMMENT ON COLUMN "ShowResultItem"."sourceRef" IS 'Alkuperäisen lähteen rivitunniste.';
COMMENT ON COLUMN "ShowResultItem"."rawPayloadJson" IS 'Raakalähteen payload JSON-muodossa.';
COMMENT ON COLUMN "ShowResultItem"."createdAt" IS 'Luontiaika.';
COMMENT ON COLUMN "ShowResultItem"."updatedAt" IS 'Päivitysaika.';

-- Audit triggers for canonical show tables
CREATE TRIGGER trg_audit_show_event
AFTER INSERT OR UPDATE OR DELETE ON "ShowEvent"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_show_entry
AFTER INSERT OR UPDATE OR DELETE ON "ShowEntry"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_show_result_category
AFTER INSERT OR UPDATE OR DELETE ON "ShowResultCategory"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_show_result_definition
AFTER INSERT OR UPDATE OR DELETE ON "ShowResultDefinition"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_show_result_item
AFTER INSERT OR UPDATE OR DELETE ON "ShowResultItem"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();
