-- AlterEnum
ALTER TYPE "ImportKind" ADD VALUE 'LEGACY_PHASE5';

-- CreateTable
CREATE TABLE "trial_rule_window" (
    "id" TEXT NOT NULL,
    "from_ymd" INTEGER,
    "to_ymd" INTEGER,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_rule_window_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trial_rule_window_from_ymd_to_ymd_idx" ON "trial_rule_window"("from_ymd", "to_ymd");

-- CreateIndex
CREATE INDEX "trial_rule_window_sort_order_idx" ON "trial_rule_window"("sort_order");

-- CreateIndex
CREATE INDEX "trial_rule_window_is_active_idx" ON "trial_rule_window"("is_active");

-- Seed inclusive legacy date windows (no gaps at rule boundaries).
INSERT INTO "trial_rule_window" ("id", "from_ymd", "to_ymd", "label", "sort_order", "is_active", "created_at", "updated_at")
VALUES
  ('trw_pre_20020801', NULL, 20020731, 'PRE_20020801', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('trw_range_2002_2005', 20020801, 20050731, 'RANGE_2002_2005', 20, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('trw_range_2005_2011', 20050801, 20110731, 'RANGE_2005_2011', 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('trw_post_20110801', 20110801, NULL, 'POST_20110801', 40, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add event-level pointer to the resolved rule window used for projection.
ALTER TABLE "TrialEvent"
ADD COLUMN "trialRuleWindowId" TEXT;

CREATE INDEX "TrialEvent_trialRuleWindowId_idx" ON "TrialEvent"("trialRuleWindowId");

ALTER TABLE "TrialEvent"
ADD CONSTRAINT "TrialEvent_trialRuleWindowId_fkey"
FOREIGN KEY ("trialRuleWindowId") REFERENCES "trial_rule_window"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "TrialEntry"
ADD COLUMN "rotukoodi" TEXT,
ADD COLUMN "ke" TEXT,
ADD COLUMN "lk" TEXT,
ADD COLUMN "pa" TEXT,
ADD COLUMN "piste" DECIMAL(6,2),
ADD COLUMN "sija" TEXT,
ADD COLUMN "haku" DECIMAL(6,2),
ADD COLUMN "hauk" DECIMAL(6,2),
ADD COLUMN "yva" DECIMAL(6,2),
ADD COLUMN "hlo" DECIMAL(6,2),
ADD COLUMN "alo" DECIMAL(6,2),
ADD COLUMN "tja" DECIMAL(6,2),
ADD COLUMN "pin" DECIMAL(6,2),
ADD COLUMN "tuom1" TEXT,
ADD COLUMN "vara" TEXT;

-- CreateTable
CREATE TABLE "TrialEra" (
    "id" TEXT NOT NULL,
    "trialEntryId" TEXT NOT NULL,
    "era" INTEGER NOT NULL,
    "alkoi" TEXT,
    "hakumin" INTEGER,
    "ajomin" INTEGER,
    "haku" DECIMAL(6,2),
    "hauk" DECIMAL(6,2),
    "yva" DECIMAL(6,2),
    "hlo" DECIMAL(6,2),
    "alo" DECIMAL(6,2),
    "tja" DECIMAL(6,2),
    "pin" DECIMAL(6,2),
    "raakadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialEra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialEraLisatieto" (
    "id" TEXT NOT NULL,
    "trialEraId" TEXT NOT NULL,
    "koodi" TEXT NOT NULL,
    "arvo" TEXT NOT NULL,
    "nimi" TEXT,
    "jarjestys" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialEraLisatieto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrialEra_trialEntryId_era_key" ON "TrialEra"("trialEntryId", "era");

-- CreateIndex
CREATE INDEX "TrialEra_trialEntryId_idx" ON "TrialEra"("trialEntryId");

-- CreateIndex
CREATE INDEX "TrialEra_era_idx" ON "TrialEra"("era");

-- CreateIndex
CREATE UNIQUE INDEX "TrialEraLisatieto_trialEraId_koodi_key" ON "TrialEraLisatieto"("trialEraId", "koodi");

-- CreateIndex
CREATE INDEX "TrialEraLisatieto_koodi_idx" ON "TrialEraLisatieto"("koodi");

-- CreateIndex
CREATE INDEX "TrialEraLisatieto_trialEraId_idx" ON "TrialEraLisatieto"("trialEraId");

-- AddForeignKey
ALTER TABLE "TrialEra" ADD CONSTRAINT "TrialEra_trialEntryId_fkey" FOREIGN KEY ("trialEntryId") REFERENCES "TrialEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialEraLisatieto" ADD CONSTRAINT "TrialEraLisatieto_trialEraId_fkey" FOREIGN KEY ("trialEraId") REFERENCES "TrialEra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old flat-era columns from TrialEntry.
ALTER TABLE "TrialEntry"
DROP COLUMN "era1Alkoi",
DROP COLUMN "era2Alkoi",
DROP COLUMN "era3Alkoi",
DROP COLUMN "era4Alkoi",
DROP COLUMN "hakuMin1",
DROP COLUMN "hakuMin2",
DROP COLUMN "hakuMin3",
DROP COLUMN "hakuMin4",
DROP COLUMN "ajoMin1",
DROP COLUMN "ajoMin2",
DROP COLUMN "ajoMin3",
DROP COLUMN "ajoMin4",
DROP COLUMN "hakuEra1",
DROP COLUMN "hakuEra2",
DROP COLUMN "hakuEra3",
DROP COLUMN "hakuEra4",
DROP COLUMN "haukkuEra1",
DROP COLUMN "haukkuEra2",
DROP COLUMN "haukkuEra3",
DROP COLUMN "haukkuEra4",
DROP COLUMN "ajotaitoEra1",
DROP COLUMN "ajotaitoEra2",
DROP COLUMN "ajotaitoEra3",
DROP COLUMN "ajotaitoEra4",
DROP COLUMN "hakuloysyysTappioEra1",
DROP COLUMN "hakuloysyysTappioEra2",
DROP COLUMN "hakuloysyysTappioEra3",
DROP COLUMN "hakuloysyysTappioEra4",
DROP COLUMN "ajoloysyysTappioEra1",
DROP COLUMN "ajoloysyysTappioEra2",
DROP COLUMN "ajoloysyysTappioEra3",
DROP COLUMN "ajoloysyysTappioEra4",
DROP COLUMN "luokka",
DROP COLUMN "hakuKeskiarvo",
DROP COLUMN "haukkuKeskiarvo",
DROP COLUMN "yleisvaikutelmaPisteet",
DROP COLUMN "ajotaitoKeskiarvo",
DROP COLUMN "ansiopisteetYhteensa",
DROP COLUMN "tieJaEstetyoskentelyPisteet",
DROP COLUMN "metsastysintoPisteet",
DROP COLUMN "hakuloysyysTappioYhteensa",
DROP COLUMN "ajoloysyysTappioYhteensa",
DROP COLUMN "tappiopisteetYhteensa",
DROP COLUMN "loppupisteet",
DROP COLUMN "palkinto",
DROP COLUMN "legacySijoitusRaw",
DROP COLUMN "sijoitus",
DROP COLUMN "koiriaLuokassa",
DROP COLUMN "kokokaudenkoe",
DROP COLUMN "keli",
DROP COLUMN "luopui",
DROP COLUMN "suljettu",
DROP COLUMN "keskeytetty",
DROP COLUMN "huomautusTeksti",
DROP COLUMN "ylituomariNimiSnapshot",
DROP COLUMN "ylituomariNumeroSnapshot",
DROP COLUMN "ryhmatuomariNimi",
DROP COLUMN "palkintotuomariNimi",
DROP COLUMN "notes";

-- Drop event-side rotukoodi after migration.
ALTER TABLE "TrialEvent" DROP COLUMN "rotukoodi";

-- Drop replaced lisatieto table.
DROP TABLE "TrialLisatietoItem";

-- Table/column comments for runtime trial projection schema.
COMMENT ON TABLE "trial_rule_window" IS 'Date-window rules used to resolve legacy trial detail rule periods.';
COMMENT ON COLUMN "trial_rule_window"."id" IS 'Technical identifier for the rule window.';
COMMENT ON COLUMN "trial_rule_window"."from_ymd" IS 'Inclusive first valid date as YYYYMMDD; null means open start.';
COMMENT ON COLUMN "trial_rule_window"."to_ymd" IS 'Inclusive last valid date as YYYYMMDD; null means open end.';
COMMENT ON COLUMN "trial_rule_window"."label" IS 'Human-readable rule window label for admin/UI visibility.';
COMMENT ON COLUMN "trial_rule_window"."sort_order" IS 'Stable display and resolution order.';
COMMENT ON COLUMN "trial_rule_window"."is_active" IS 'Whether this rule window is currently active.';
COMMENT ON COLUMN "trial_rule_window"."created_at" IS 'Row creation timestamp.';
COMMENT ON COLUMN "trial_rule_window"."updated_at" IS 'Row update timestamp.';

COMMENT ON TABLE "TrialEvent" IS 'Runtime trial event grouped by event date and source identity.';
COMMENT ON COLUMN "TrialEvent"."id" IS 'Technical identifier for the trial event.';
COMMENT ON COLUMN "TrialEvent"."sklKoeId" IS 'Koiratietokanta/SKL event identifier when source provides one.';
COMMENT ON COLUMN "TrialEvent"."koepaiva" IS 'Trial event date.';
COMMENT ON COLUMN "TrialEvent"."koekunta" IS 'Municipality or place of the trial event.';
COMMENT ON COLUMN "TrialEvent"."jarjestaja" IS 'Event organizer.';
COMMENT ON COLUMN "TrialEvent"."kennelpiiri" IS 'Kennel district name.';
COMMENT ON COLUMN "TrialEvent"."kennelpiirinro" IS 'Kennel district number/code.';
COMMENT ON COLUMN "TrialEvent"."koemuoto" IS 'Trial type/form when provided by source; null for legacy projection when absent.';
COMMENT ON COLUMN "TrialEvent"."ylituomariNimi" IS 'Event-level chief judge name.';
COMMENT ON COLUMN "TrialEvent"."ylituomariNumero" IS 'Event-level chief judge number.';
COMMENT ON COLUMN "TrialEvent"."legacyEventKey" IS 'Stable legacy event key for projected legacy rows.';
COMMENT ON COLUMN "TrialEvent"."trialRuleWindowId" IS 'Resolved legacy trial rule window for this event.';
COMMENT ON COLUMN "TrialEvent"."ytKertomus" IS 'Chief judge report text when provided by source.';
COMMENT ON COLUMN "TrialEvent"."createdAt" IS 'Row creation timestamp.';
COMMENT ON COLUMN "TrialEvent"."updatedAt" IS 'Row update timestamp.';

COMMENT ON TABLE "TrialEntry" IS 'Runtime trial entry for one dog in one trial event.';
COMMENT ON COLUMN "TrialEntry"."id" IS 'Technical identifier for the trial entry.';
COMMENT ON COLUMN "TrialEntry"."trialEventId" IS 'Parent trial event identifier.';
COMMENT ON COLUMN "TrialEntry"."dogId" IS 'Linked dog identifier when registration matching succeeds.';
COMMENT ON COLUMN "TrialEntry"."yksilointiAvain" IS 'Stable source-derived entry identity key.';
COMMENT ON COLUMN "TrialEntry"."lahde" IS 'Source system tag for the entry.';
COMMENT ON COLUMN "TrialEntry"."koemaasto" IS 'Trial terrain/ground description when source provides one.';
COMMENT ON COLUMN "TrialEntry"."rekisterinumeroSnapshot" IS 'Registration number snapshot from the source row.';
COMMENT ON COLUMN "TrialEntry"."rotukoodi" IS 'Breed code snapshot for the entry.';
COMMENT ON COLUMN "TrialEntry"."ke" IS 'Legacy weather/conditions code.';
COMMENT ON COLUMN "TrialEntry"."lk" IS 'Legacy class value.';
COMMENT ON COLUMN "TrialEntry"."pa" IS 'Legacy award/prize value.';
COMMENT ON COLUMN "TrialEntry"."piste" IS 'Final points for the entry.';
COMMENT ON COLUMN "TrialEntry"."sija" IS 'Placement/rank value from source.';
COMMENT ON COLUMN "TrialEntry"."hyvaksytytAjominuutit" IS 'Accepted driving minutes total from modern source when provided.';
COMMENT ON COLUMN "TrialEntry"."ajoajanPisteet" IS 'Driving-time points from modern source when provided.';
COMMENT ON COLUMN "TrialEntry"."haku" IS 'Entry-level search-work points from legacy summary.';
COMMENT ON COLUMN "TrialEntry"."hauk" IS 'Entry-level barking points from legacy summary.';
COMMENT ON COLUMN "TrialEntry"."yva" IS 'Entry-level general impression points from legacy summary.';
COMMENT ON COLUMN "TrialEntry"."hlo" IS 'Entry-level search looseness points/penalty value from legacy summary.';
COMMENT ON COLUMN "TrialEntry"."alo" IS 'Entry-level driving-skill or driving looseness value from legacy summary.';
COMMENT ON COLUMN "TrialEntry"."tja" IS 'Entry-level trail/backtrack work value from legacy summary.';
COMMENT ON COLUMN "TrialEntry"."pin" IS 'Entry-level hunting enthusiasm or total merit value from legacy summary.';
COMMENT ON COLUMN "TrialEntry"."tuom1" IS 'Primary/chief judge name snapshot from source.';
COMMENT ON COLUMN "TrialEntry"."vara" IS 'Legacy reserved/flag field.';
COMMENT ON COLUMN "TrialEntry"."omistajaSnapshot" IS 'Owner name snapshot from source.';
COMMENT ON COLUMN "TrialEntry"."omistajanKotikuntaSnapshot" IS 'Owner home municipality snapshot from source.';
COMMENT ON COLUMN "TrialEntry"."raakadataJson" IS 'Raw source payload for traceability.';
COMMENT ON COLUMN "TrialEntry"."createdAt" IS 'Row creation timestamp.';
COMMENT ON COLUMN "TrialEntry"."updatedAt" IS 'Row update timestamp.';

COMMENT ON TABLE "TrialEra" IS 'Runtime trial era/detail row for one selected era of one trial entry.';
COMMENT ON COLUMN "TrialEra"."id" IS 'Technical identifier for the trial era.';
COMMENT ON COLUMN "TrialEra"."trialEntryId" IS 'Parent trial entry identifier.';
COMMENT ON COLUMN "TrialEra"."era" IS 'Era number within the trial entry.';
COMMENT ON COLUMN "TrialEra"."alkoi" IS 'Era start time text from source.';
COMMENT ON COLUMN "TrialEra"."hakumin" IS 'Search minutes for the era.';
COMMENT ON COLUMN "TrialEra"."ajomin" IS 'Driving minutes for the era.';
COMMENT ON COLUMN "TrialEra"."haku" IS 'Search-work points for the era.';
COMMENT ON COLUMN "TrialEra"."hauk" IS 'Barking points for the era.';
COMMENT ON COLUMN "TrialEra"."yva" IS 'entinen Yleisvaikutelma, nykyinen ajotaitokeskiarvo';
COMMENT ON COLUMN "TrialEra"."hlo" IS 'Search looseness points/penalty value for the era.';
COMMENT ON COLUMN "TrialEra"."alo" IS 'Ajolöysyys or driving looseness value for the era.';
COMMENT ON COLUMN "TrialEra"."tja" IS 'Trail/backtrack work value for the era.';
COMMENT ON COLUMN "TrialEra"."pin" IS 'Hunting enthusiasm or merit value for the era.';
COMMENT ON COLUMN "TrialEra"."raakadataJson" IS 'Raw source payload for this era/detail row.';
COMMENT ON COLUMN "TrialEra"."createdAt" IS 'Row creation timestamp.';
COMMENT ON COLUMN "TrialEra"."updatedAt" IS 'Row update timestamp.';

COMMENT ON TABLE "TrialEraLisatieto" IS 'One additional legacy/detail value attached to a trial era.';
COMMENT ON COLUMN "TrialEraLisatieto"."id" IS 'Technical identifier for the era additional value.';
COMMENT ON COLUMN "TrialEraLisatieto"."trialEraId" IS 'Parent trial era identifier.';
COMMENT ON COLUMN "TrialEraLisatieto"."koodi" IS 'Legacy/detail code for the additional value.';
COMMENT ON COLUMN "TrialEraLisatieto"."arvo" IS 'Stored value for the additional code.';
COMMENT ON COLUMN "TrialEraLisatieto"."nimi" IS 'Optional display name for the code.';
COMMENT ON COLUMN "TrialEraLisatieto"."jarjestys" IS 'Optional display order for the code.';
COMMENT ON COLUMN "TrialEraLisatieto"."createdAt" IS 'Row creation timestamp.';
COMMENT ON COLUMN "TrialEraLisatieto"."updatedAt" IS 'Row update timestamp.';

-- Audit triggers for new trial projection tables.
CREATE TRIGGER trg_audit_trial_era
AFTER INSERT OR UPDATE OR DELETE ON "TrialEra"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_trial_era_lisatieto
AFTER INSERT OR UPDATE OR DELETE ON "TrialEraLisatieto"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_trial_rule_window
AFTER INSERT OR UPDATE OR DELETE ON "trial_rule_window"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();
