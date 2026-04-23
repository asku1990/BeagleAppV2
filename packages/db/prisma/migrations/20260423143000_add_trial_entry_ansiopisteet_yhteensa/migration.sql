-- Reintroduce entry-level ansiopisteet total for AJOK runtime rows.
ALTER TABLE "TrialEntry"
ADD COLUMN "ansiopisteetYhteensa" DECIMAL(6,2);

COMMENT ON COLUMN "TrialEntry"."ansiopisteetYhteensa" IS 'Entry-level ansiopisteiden yhteissumma; may be derived from legacy row fields when missing.';
