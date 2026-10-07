-- Keep legacy PA outcome markers canonical in TrialEntry.huomautus.
UPDATE "TrialEntry"
SET "huomautus" = CASE
  WHEN "pa" = 'L' THEN 'LUOPUI'::"TrialEntryHuomautus"
  WHEN "pa" = 'S' THEN 'SULJETTU'::"TrialEntryHuomautus"
END
WHERE "lahde" = 'LEGACY_AKOEALL'
  AND "pa" IN ('L', 'S')
  AND "huomautus" IS DISTINCT FROM CASE
    WHEN "pa" = 'L' THEN 'LUOPUI'::"TrialEntryHuomautus"
    WHEN "pa" = 'S' THEN 'SULJETTU'::"TrialEntryHuomautus"
  END;
