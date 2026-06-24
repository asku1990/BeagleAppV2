CREATE TABLE "DogColor" (
  "code" INTEGER NOT NULL,
  "nameFi" TEXT NOT NULL,
  "nameSv" TEXT,
  "nameEn" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DogColor_pkey" PRIMARY KEY ("code")
);

ALTER TABLE "Dog" ADD COLUMN "colorCode" INTEGER;

CREATE INDEX "Dog_colorCode_idx" ON "Dog"("colorCode");

ALTER TABLE "Dog"
ADD CONSTRAINT "Dog_colorCode_fkey"
FOREIGN KEY ("colorCode") REFERENCES "DogColor"("code") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TRIGGER trg_audit_dog_color
AFTER INSERT OR UPDATE OR DELETE ON "DogColor"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

-- AlterTable
ALTER TABLE "DogColor" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DogTitle" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ShowWorkbookColumnRule" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ShowWorkbookColumnValueMap" ALTER COLUMN "updatedAt" DROP DEFAULT;
