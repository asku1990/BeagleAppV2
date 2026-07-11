CREATE TYPE "DogStatus" AS ENUM ('NORMAL', 'REFERENCE_ONLY');

ALTER TABLE "Dog"
ADD COLUMN "status" "DogStatus" NOT NULL DEFAULT 'NORMAL';

CREATE INDEX "Dog_status_idx" ON "Dog"("status");
