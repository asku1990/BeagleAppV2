CREATE TYPE "TrialEntryHuomautus" AS ENUM ('LUOPUI', 'SULJETTU', 'KESKEYTETTY');

ALTER TABLE "TrialEntry"
ADD COLUMN "huomautus" "TrialEntryHuomautus";

ALTER TABLE "TrialEntry"
DROP COLUMN "vara";

COMMENT ON COLUMN "TrialEntry"."huomautus" IS 'Canonical entry-level huomautus marker: luopui, suljettu, or keskeytetty.';

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
