CREATE TYPE "TrialEntryKoetyyppi" AS ENUM ('NORMAL', 'KOKOKAUDENKOE', 'PITKAKOE');

ALTER TABLE "TrialEvent"
DROP COLUMN "koemuoto";

ALTER TABLE "TrialEntry"
ADD COLUMN "koemuoto" TEXT,
ADD COLUMN "koiriaLuokassa" INTEGER,
ADD COLUMN "koetyyppi" "TrialEntryKoetyyppi" NOT NULL DEFAULT 'NORMAL';

COMMENT ON COLUMN "TrialEntry"."koemuoto" IS 'Entry-level trial form from source data (for example AJOK), canonical per row.';
COMMENT ON COLUMN "TrialEntry"."koiriaLuokassa" IS 'Number of dogs in class for the entry result row.';
COMMENT ON COLUMN "TrialEntry"."koetyyppi" IS 'Entry-level result row type: normal, koko kauden koe, or pitkakoe.';
