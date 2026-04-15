-- NOTE: In this repository's current workflow, legacy-import schema is developed
-- against fresh bootstrap databases in `develop`. Editing this migration in-place
-- is intentional for that flow; forward-only follow-up migrations are only needed
-- once this migration is treated as immutable in shared deployed environments.

-- CreateEnum
CREATE TYPE "TrialSourceTag" AS ENUM ('LEGACY_AKOEALL', 'KOIRATIETOKANTA_API');

-- CreateTable
CREATE TABLE "TrialEvent" (
    "id" TEXT NOT NULL,
    "sklKoeId" INTEGER,
    "legacyEventKey" TEXT,
    "koepaiva" TIMESTAMP(3) NOT NULL,
    "koekunta" TEXT NOT NULL,
    "jarjestaja" TEXT,
    "kennelpiiri" TEXT,
    "kennelpiirinro" TEXT,
    "koemuoto" TEXT,
    "rotukoodi" TEXT,
    "ylituomariNimi" TEXT,
    "ylituomariNumero" TEXT,
    "ytKertomus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialEntry" (
    "id" TEXT NOT NULL,
    "trialEventId" TEXT NOT NULL,
    "dogId" TEXT,
    "rekisterinumeroSnapshot" TEXT NOT NULL,
    "yksilointiAvain" TEXT NOT NULL,
    "lahde" "TrialSourceTag" NOT NULL,
    "raakadataJson" TEXT,
    "koiranNimiSnapshot" TEXT,
    "omistajaSnapshot" TEXT,
    "palkinto" TEXT,
    "sijoitus" TEXT,
    "koiriaLuokassa" INTEGER,
    "loppupisteet" DECIMAL(6,2),
    "hakuMin1" INTEGER,
    "hakuMin2" INTEGER,
    "hakuMin3" INTEGER,
    "hakuMin4" INTEGER,
    "ajoMin1" INTEGER,
    "ajoMin2" INTEGER,
    "ajoMin3" INTEGER,
    "ajoMin4" INTEGER,
    "hakuKeskiarvo" DECIMAL(6,2),
    "haukkuKeskiarvo" DECIMAL(6,2),
    "ajotaitoKeskiarvo" DECIMAL(6,2),
    "hakuloysyysTappioYhteensa" DECIMAL(6,2),
    "ajoloysyysTappioYhteensa" DECIMAL(6,2),
    "keli" TEXT,
    "luopui" BOOLEAN,
    "suljettu" BOOLEAN,
    "keskeytetty" BOOLEAN,
    "huomautusTeksti" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialLisatietoItem" (
    "id" TEXT NOT NULL,
    "trialEntryId" TEXT NOT NULL,
    "koodi" TEXT NOT NULL,
    "nimi" TEXT NOT NULL,
    "era1Arvo" TEXT,
    "era2Arvo" TEXT,
    "era3Arvo" TEXT,
    "era4Arvo" TEXT,
    "jarjestys" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialLisatietoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrialEvent_sklKoeId_key" ON "TrialEvent"("sklKoeId");
CREATE UNIQUE INDEX "TrialEvent_legacyEventKey_key" ON "TrialEvent"("legacyEventKey");

-- CreateIndex
CREATE INDEX "TrialEvent_koepaiva_idx" ON "TrialEvent"("koepaiva");

-- CreateIndex
CREATE INDEX "TrialEvent_koekunta_koepaiva_idx" ON "TrialEvent"("koekunta", "koepaiva");

-- CreateIndex
CREATE UNIQUE INDEX "TrialEntry_yksilointiAvain_key" ON "TrialEntry"("yksilointiAvain");

-- CreateIndex
CREATE UNIQUE INDEX "TrialEntry_trialEventId_rekisterinumeroSnapshot_key" ON "TrialEntry"("trialEventId", "rekisterinumeroSnapshot");

-- CreateIndex
CREATE INDEX "TrialEntry_dogId_idx" ON "TrialEntry"("dogId");

-- CreateIndex
CREATE INDEX "TrialEntry_trialEventId_idx" ON "TrialEntry"("trialEventId");

-- CreateIndex
CREATE INDEX "TrialEntry_loppupisteet_idx" ON "TrialEntry"("loppupisteet");

-- CreateIndex
CREATE UNIQUE INDEX "TrialLisatietoItem_trialEntryId_koodi_key" ON "TrialLisatietoItem"("trialEntryId", "koodi");

-- CreateIndex
CREATE INDEX "TrialLisatietoItem_koodi_idx" ON "TrialLisatietoItem"("koodi");

-- CreateIndex
CREATE INDEX "TrialLisatietoItem_trialEntryId_idx" ON "TrialLisatietoItem"("trialEntryId");

-- AddForeignKey
ALTER TABLE "TrialEntry" ADD CONSTRAINT "TrialEntry_trialEventId_fkey" FOREIGN KEY ("trialEventId") REFERENCES "TrialEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialEntry" ADD CONSTRAINT "TrialEntry_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialLisatietoItem" ADD CONSTRAINT "TrialLisatietoItem_trialEntryId_fkey" FOREIGN KEY ("trialEntryId") REFERENCES "TrialEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Table/column comments for AJOK canonical trial schema
COMMENT ON TABLE "TrialEvent" IS 'AJOK-kokeen tapahtumatason kanoninen rivi.';
COMMENT ON COLUMN "TrialEvent"."sklKoeId" IS 'SKL:n tapahtuma-avain (uniikki).';
COMMENT ON COLUMN "TrialEvent"."legacyEventKey" IS 'Legacy fallback-avain kun SKL-id puuttuu.';
COMMENT ON COLUMN "TrialEvent"."koepaiva" IS 'Kokeen paivamaara.';
COMMENT ON COLUMN "TrialEvent"."koekunta" IS 'Kokeen paikkakunta.';
COMMENT ON COLUMN "TrialEvent"."ylituomariNimi" IS 'Ylituomarin nimi tapahtumatasolla.';
COMMENT ON COLUMN "TrialEvent"."ylituomariNumero" IS 'Ylituomarin numero tapahtumatasolla.';

COMMENT ON TABLE "TrialEntry" IS 'AJOK-kokeen koirakohtainen tulosrivi tapahtuman alla.';
COMMENT ON COLUMN "TrialEntry"."rekisterinumeroSnapshot" IS 'Koiran rekisterinumero snapshot import/upsert-hetkella.';
COMMENT ON COLUMN "TrialEntry"."yksilointiAvain" IS 'Tekninen yksilointiavain import/upsert-ajoon.';
COMMENT ON COLUMN "TrialEntry"."lahde" IS 'Lahdetunniste (legacy/API).';
COMMENT ON COLUMN "TrialEntry"."raakadataJson" IS 'Koko alkuperainen payload audit/debug/replay-kayttoon.';

COMMENT ON TABLE "TrialLisatietoItem" IS 'AJOK-lisatieto (koodi 11-61) koirakohtaiselle trial entrylle.';
COMMENT ON COLUMN "TrialLisatietoItem"."koodi" IS 'Lisatietokoodi (esim. 11, 42, 61).';
COMMENT ON COLUMN "TrialLisatietoItem"."nimi" IS 'Lisatietorivin nimi.';

CREATE TRIGGER trg_audit_trial_event
AFTER INSERT OR UPDATE OR DELETE ON "TrialEvent"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_trial_entry
AFTER INSERT OR UPDATE OR DELETE ON "TrialEntry"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_trial_lisatieto_item
AFTER INSERT OR UPDATE OR DELETE ON "TrialLisatietoItem"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();
