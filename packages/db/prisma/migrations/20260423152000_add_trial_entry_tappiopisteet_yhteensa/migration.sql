ALTER TABLE "TrialEntry"
ADD COLUMN "tappiopisteetYhteensa" DECIMAL(6,2);

COMMENT ON COLUMN "TrialEntry"."tappiopisteetYhteensa" IS 'Entry-level tappiopisteiden yhteissumma from KOIRATIETOKANTA payload.';
