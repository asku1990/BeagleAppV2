CREATE TYPE "TrialEntryHuomautus" AS ENUM ('LUOPUI', 'SULJETTU', 'KESKEYTETTY');

ALTER TABLE "TrialEntry"
ADD COLUMN "huomautus" "TrialEntryHuomautus";

ALTER TABLE "TrialEntry"
ADD COLUMN "huomautusTeksti" TEXT;

ALTER TABLE "TrialEntry"
ADD COLUMN "ylituomariNimiSnapshot" TEXT,
ADD COLUMN "ylituomariNumeroSnapshot" TEXT,
ADD COLUMN "ryhmatuomariNimi" TEXT,
ADD COLUMN "palkintotuomariNimi" TEXT;

ALTER TABLE "TrialEntry"
DROP COLUMN "vara";

COMMENT ON COLUMN "TrialEntry"."huomautus" IS 'Canonical entry-level huomautus marker: luopui, suljettu, or keskeytetty.';
COMMENT ON COLUMN "TrialEntry"."huomautusTeksti" IS 'Free-text trial entry note rendered in the PDF huomautus section.';
COMMENT ON COLUMN "TrialEntry"."ylituomariNimiSnapshot" IS 'Entry-level chief judge name snapshot rendered in the PDF signature section.';
COMMENT ON COLUMN "TrialEntry"."ylituomariNumeroSnapshot" IS 'Entry-level chief judge number snapshot rendered in the PDF signature section.';
COMMENT ON COLUMN "TrialEntry"."ryhmatuomariNimi" IS 'Group judge name rendered in the PDF signature section.';
COMMENT ON COLUMN "TrialEntry"."palkintotuomariNimi" IS 'Prize judge name rendered in the PDF signature section.';

UPDATE "trial_rule_window"
SET
  "label" = 'AJOKOKEEN SÄÄNNÖT JA OHJEET (AJOK ja BEAJ), voimassa ennen 1.8.2002',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'trw_pre_20020801';

UPDATE "trial_rule_window"
SET
  "label" = 'AJOKOKEEN SÄÄNNÖT JA OHJEET (AJOK ja BEAJ), voimassa 1.8.2002-31.7.2005',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'trw_range_2002_2005';

UPDATE "trial_rule_window"
SET
  "label" = 'AJOKOKEEN SÄÄNNÖT JA OHJEET (AJOK ja BEAJ), voimassa 1.8.2005-31.7.2011',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'trw_range_2005_2011';

UPDATE "trial_rule_window"
SET
  "to_ymd" = 20230731,
  "label" = 'AJOKOKEEN SÄÄNNÖT JA OHJEET (AJOK ja BEAJ), voimassa 1.8.2011-31.7.2023',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'trw_post_20110801';

INSERT INTO "trial_rule_window" ("id", "from_ymd", "to_ymd", "label", "sort_order", "is_active", "created_at", "updated_at")
VALUES
  (
    'trw_post_20230801',
    20230801,
    NULL,
    'AJOKOKEEN SÄÄNNÖT JA OHJEET (AJOK ja BEAJ), voimassa 1.8.2023 alkaen',
    50,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
