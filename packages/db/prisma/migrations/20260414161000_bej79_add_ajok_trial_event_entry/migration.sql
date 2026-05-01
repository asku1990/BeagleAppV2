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
    "luokka" TEXT,
    "omistajaSnapshot" TEXT,
    "omistajanKotikuntaSnapshot" TEXT,
    "era1Alkoi" TEXT,
    "era2Alkoi" TEXT,
    "era3Alkoi" TEXT,
    "era4Alkoi" TEXT,
    "hyvaksytytAjominuutit" INTEGER,
    "ajoajanPisteet" DECIMAL(6,2),
    "hakuEra1" DECIMAL(6,2),
    "hakuEra2" DECIMAL(6,2),
    "hakuEra3" DECIMAL(6,2),
    "hakuEra4" DECIMAL(6,2),
    "haukkuEra1" DECIMAL(6,2),
    "haukkuEra2" DECIMAL(6,2),
    "haukkuEra3" DECIMAL(6,2),
    "haukkuEra4" DECIMAL(6,2),
    "ajotaitoEra1" DECIMAL(6,2),
    "ajotaitoEra2" DECIMAL(6,2),
    "ajotaitoEra3" DECIMAL(6,2),
    "ajotaitoEra4" DECIMAL(6,2),
    "ansiopisteetYhteensa" DECIMAL(6,2),
    "hakuloysyysTappioEra1" DECIMAL(6,2),
    "hakuloysyysTappioEra2" DECIMAL(6,2),
    "hakuloysyysTappioEra3" DECIMAL(6,2),
    "hakuloysyysTappioEra4" DECIMAL(6,2),
    "ajoloysyysTappioEra1" DECIMAL(6,2),
    "ajoloysyysTappioEra2" DECIMAL(6,2),
    "ajoloysyysTappioEra3" DECIMAL(6,2),
    "ajoloysyysTappioEra4" DECIMAL(6,2),
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
    "yleisvaikutelmaPisteet" DECIMAL(6,2),
    "ajotaitoKeskiarvo" DECIMAL(6,2),
    "hakuloysyysTappioYhteensa" DECIMAL(6,2),
    "ajoloysyysTappioYhteensa" DECIMAL(6,2),
    "tappiopisteetYhteensa" DECIMAL(6,2),
    "tieJaEstetyoskentelyPisteet" DECIMAL(6,2),
    "metsastysintoPisteet" DECIMAL(6,2),
    "keli" TEXT,
    "koemaasto" TEXT,
    "luopui" BOOLEAN,
    "suljettu" BOOLEAN,
    "keskeytetty" BOOLEAN,
    "huomautusTeksti" TEXT,
    "ylituomariNimiSnapshot" TEXT,
    "ylituomariNumeroSnapshot" TEXT,
    "ryhmatuomariNimi" TEXT,
    "palkintotuomariNimi" TEXT,
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
COMMENT ON COLUMN "TrialEntry"."luokka" IS 'Koirakohtainen AJOK-luokka.';
COMMENT ON COLUMN "TrialEntry"."omistajaSnapshot" IS 'Omistajatieto snapshot-muodossa.';
COMMENT ON COLUMN "TrialEntry"."omistajanKotikuntaSnapshot" IS 'Omistajan kotikunta snapshot-muodossa.';
COMMENT ON COLUMN "TrialEntry"."era1Alkoi" IS 'Koe-eran 1 aloitusaika tekstimuodossa.';
COMMENT ON COLUMN "TrialEntry"."era2Alkoi" IS 'Koe-eran 2 aloitusaika tekstimuodossa.';
COMMENT ON COLUMN "TrialEntry"."era3Alkoi" IS 'Koe-eran 3 aloitusaika tekstimuodossa.';
COMMENT ON COLUMN "TrialEntry"."era4Alkoi" IS 'Koe-eran 4 aloitusaika tekstimuodossa.';
COMMENT ON COLUMN "TrialEntry"."hyvaksytytAjominuutit" IS 'Hyvaksyttyjen ajominuuttien kokonaismaara.';
COMMENT ON COLUMN "TrialEntry"."ajoajanPisteet" IS 'Ajoajan pisteet.';
COMMENT ON COLUMN "TrialEntry"."hakuEra1" IS 'Haun erakohtainen arvo, era 1.';
COMMENT ON COLUMN "TrialEntry"."hakuEra2" IS 'Haun erakohtainen arvo, era 2.';
COMMENT ON COLUMN "TrialEntry"."hakuEra3" IS 'Haun erakohtainen arvo, era 3.';
COMMENT ON COLUMN "TrialEntry"."hakuEra4" IS 'Haun erakohtainen arvo, era 4.';
COMMENT ON COLUMN "TrialEntry"."haukkuEra1" IS 'Haukun erakohtainen arvo, era 1.';
COMMENT ON COLUMN "TrialEntry"."haukkuEra2" IS 'Haukun erakohtainen arvo, era 2.';
COMMENT ON COLUMN "TrialEntry"."haukkuEra3" IS 'Haukun erakohtainen arvo, era 3.';
COMMENT ON COLUMN "TrialEntry"."haukkuEra4" IS 'Haukun erakohtainen arvo, era 4.';
COMMENT ON COLUMN "TrialEntry"."ajotaitoEra1" IS 'Ajotaidon erakohtainen arvo, era 1.';
COMMENT ON COLUMN "TrialEntry"."ajotaitoEra2" IS 'Ajotaidon erakohtainen arvo, era 2.';
COMMENT ON COLUMN "TrialEntry"."ajotaitoEra3" IS 'Ajotaidon erakohtainen arvo, era 3.';
COMMENT ON COLUMN "TrialEntry"."ajotaitoEra4" IS 'Ajotaidon erakohtainen arvo, era 4.';
COMMENT ON COLUMN "TrialEntry"."ansiopisteetYhteensa" IS 'Ansiopisteiden yhteissumma.';
COMMENT ON COLUMN "TrialEntry"."hakuloysyysTappioEra1" IS 'Hakuloysyyden tappiopisteet, era 1.';
COMMENT ON COLUMN "TrialEntry"."hakuloysyysTappioEra2" IS 'Hakuloysyyden tappiopisteet, era 2.';
COMMENT ON COLUMN "TrialEntry"."hakuloysyysTappioEra3" IS 'Hakuloysyyden tappiopisteet, era 3.';
COMMENT ON COLUMN "TrialEntry"."hakuloysyysTappioEra4" IS 'Hakuloysyyden tappiopisteet, era 4.';
COMMENT ON COLUMN "TrialEntry"."ajoloysyysTappioEra1" IS 'Ajoloysyyden tappiopisteet, era 1.';
COMMENT ON COLUMN "TrialEntry"."ajoloysyysTappioEra2" IS 'Ajoloysyyden tappiopisteet, era 2.';
COMMENT ON COLUMN "TrialEntry"."ajoloysyysTappioEra3" IS 'Ajoloysyyden tappiopisteet, era 3.';
COMMENT ON COLUMN "TrialEntry"."ajoloysyysTappioEra4" IS 'Ajoloysyyden tappiopisteet, era 4.';
COMMENT ON COLUMN "TrialEntry"."tappiopisteetYhteensa" IS 'AJOK tappiopisteiden yhteissumma.';
COMMENT ON COLUMN "TrialEntry"."palkinto" IS 'Palkintoluokka.';
COMMENT ON COLUMN "TrialEntry"."sijoitus" IS 'Sijoitus luokassa.';
COMMENT ON COLUMN "TrialEntry"."koiriaLuokassa" IS 'Koirien lukumaara luokassa.';
COMMENT ON COLUMN "TrialEntry"."loppupisteet" IS 'Loppupisteet.';
COMMENT ON COLUMN "TrialEntry"."yleisvaikutelmaPisteet" IS 'AJOK yleisvaikutelma (legacy YVA).';
COMMENT ON COLUMN "TrialEntry"."tieJaEstetyoskentelyPisteet" IS 'AJOK tie- ja estetyoskentely (legacy TJA).';
COMMENT ON COLUMN "TrialEntry"."metsastysintoPisteet" IS 'AJOK metsastysinto (legacy PIN).';
COMMENT ON COLUMN "TrialEntry"."keli" IS 'Kelitunnus (esim. P).';
COMMENT ON COLUMN "TrialEntry"."koemaasto" IS 'Kokeen maasto, snapshot per entry.';
COMMENT ON COLUMN "TrialEntry"."luopui" IS 'Koe keskeytetty luopumisen vuoksi.';
COMMENT ON COLUMN "TrialEntry"."suljettu" IS 'Koe suljettu.';
COMMENT ON COLUMN "TrialEntry"."keskeytetty" IS 'Koe keskeytetty.';
COMMENT ON COLUMN "TrialEntry"."huomautusTeksti" IS 'Vapaa huomautusteksti.';
COMMENT ON COLUMN "TrialEntry"."ylituomariNimiSnapshot" IS 'Rivikohtainen ylituomarin nimi payload-snapshotina.';
COMMENT ON COLUMN "TrialEntry"."ylituomariNumeroSnapshot" IS 'Rivikohtainen ylituomarin numero payload-snapshotina.';
COMMENT ON COLUMN "TrialEntry"."ryhmatuomariNimi" IS 'Ryhmatuomarin nimi.';
COMMENT ON COLUMN "TrialEntry"."palkintotuomariNimi" IS 'Palkintotuomarin nimi.';
COMMENT ON COLUMN "TrialEntry"."notes" IS 'Tekninen lisahuomio tai lahdeteksti.';

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
