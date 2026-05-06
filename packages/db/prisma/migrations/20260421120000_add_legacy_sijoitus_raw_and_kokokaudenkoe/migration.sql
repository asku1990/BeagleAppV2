-- Rename the legacy placement column and add the new canonical fields.
ALTER TABLE "TrialEntry" RENAME COLUMN "sijoitus" TO "legacySijoitusRaw";

ALTER TABLE "TrialEntry"
ADD COLUMN "sijoitus" TEXT,
ADD COLUMN "kokokaudenkoe" BOOLEAN;

COMMENT ON COLUMN "TrialEntry"."legacySijoitusRaw" IS 'Raw legacy placement text from akoeall.SIJA. Vanhasassa muodossa oleva sarake. esim. 1| 2 tai - | kk';
COMMENT ON COLUMN "TrialEntry"."sijoitus" IS 'Canonical placement text for modern AJOK writes.';
COMMENT ON COLUMN "TrialEntry"."kokokaudenkoe" IS 'Entry-level flag for koko kauden koe results.';
