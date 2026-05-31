/*
  Warnings:

  - You are about to drop the column `emaDogId` on the `KoiranSairaus` table. All the data in the column will be lost.
  - You are about to drop the column `isaDogId` on the `KoiranSairaus` table. All the data in the column will be lost.
  - Added the required column `evidenceKind` to the `KoiranSairaus` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KoiranSairausEvidenceKind" AS ENUM ('DOG', 'LITTER');

-- DropForeignKey
ALTER TABLE "KoiranSairaus" DROP CONSTRAINT "KoiranSairaus_emaDogId_fkey";

-- DropForeignKey
ALTER TABLE "KoiranSairaus" DROP CONSTRAINT "KoiranSairaus_isaDogId_fkey";

-- DropIndex
DROP INDEX "KoiranSairaus_emaDogId_idx";

-- DropIndex
DROP INDEX "KoiranSairaus_isaDogId_idx";

-- AlterTable
ALTER TABLE "DogTitle" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KoiranSairaus" DROP COLUMN "emaDogId",
DROP COLUMN "isaDogId",
ADD COLUMN     "emaRekisterinumero" TEXT,
ADD COLUMN     "evidenceKind" "KoiranSairausEvidenceKind" NOT NULL,
ADD COLUMN     "isaRekisterinumero" TEXT;

-- AlterTable
ALTER TABLE "ShowWorkbookColumnRule" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ShowWorkbookColumnValueMap" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "KoiranSairaus_evidenceKind_idx" ON "KoiranSairaus"("evidenceKind");

-- CreateIndex
CREATE INDEX "KoiranSairaus_isaRekisterinumero_idx" ON "KoiranSairaus"("isaRekisterinumero");

-- CreateIndex
CREATE INDEX "KoiranSairaus_emaRekisterinumero_idx" ON "KoiranSairaus"("emaRekisterinumero");
