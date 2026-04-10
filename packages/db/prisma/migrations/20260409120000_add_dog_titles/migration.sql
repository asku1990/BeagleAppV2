ALTER TYPE "ImportKind" ADD VALUE IF NOT EXISTS 'LEGACY_PHASE1_5';

CREATE TABLE "DogTitle" (
  "id" TEXT NOT NULL,
  "dogId" TEXT NOT NULL,
  "awardedOn" TIMESTAMP(3),
  "titleCode" TEXT NOT NULL,
  "titleName" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DogTitle_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DogTitle_dogId_idx" ON "DogTitle"("dogId");
CREATE INDEX "DogTitle_dogId_sortOrder_idx" ON "DogTitle"("dogId", "sortOrder");

ALTER TABLE "DogTitle"
ADD CONSTRAINT "DogTitle_dogId_fkey"
FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER trg_audit_dog_title
AFTER INSERT OR UPDATE OR DELETE ON "DogTitle"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();
