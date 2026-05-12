-- CreateEnum
CREATE TYPE "SairausRyhma" AS ENUM ('EPILEPSIA', 'LAFORA', 'PURENTA', 'MLS', 'MUU');

-- AlterEnum
ALTER TYPE "ImportKind" ADD VALUE 'LEGACY_PHASE1_25';

-- AlterTable
ALTER TABLE "Dog" ADD COLUMN     "siitosasteProsentti" DECIMAL(10,7);

-- CreateTable
CREATE TABLE "Sairaus" (
    "id" TEXT NOT NULL,
    "vanhaId" INTEGER NOT NULL,
    "koodi" TEXT NOT NULL,
    "sairausTeksti" TEXT NOT NULL,
    "sairausRyhma" "SairausRyhma" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sairaus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KoiranSairaus" (
    "id" TEXT NOT NULL,
    "vanhaId" INTEGER NOT NULL,
    "dogId" TEXT,
    "isaDogId" TEXT,
    "emaDogId" TEXT,
    "rekisterinumero" TEXT NOT NULL,
    "sairausId" TEXT NOT NULL,
    "sairausKoodi" TEXT NOT NULL,
    "pentue" TEXT,
    "kuvaus" TEXT,
    "julkinen" BOOLEAN NOT NULL DEFAULT false,
    "tietolahde" TEXT,
    "muokattuLahteessa" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KoiranSairaus_pkey" PRIMARY KEY ("id")
);


-- CreateIndex
CREATE UNIQUE INDEX "Sairaus_vanhaId_key" ON "Sairaus"("vanhaId");

-- CreateIndex
CREATE UNIQUE INDEX "Sairaus_koodi_key" ON "Sairaus"("koodi");

-- CreateIndex
CREATE INDEX "Sairaus_sairausRyhma_idx" ON "Sairaus"("sairausRyhma");

-- CreateIndex
CREATE UNIQUE INDEX "KoiranSairaus_vanhaId_key" ON "KoiranSairaus"("vanhaId");

-- CreateIndex
CREATE INDEX "KoiranSairaus_dogId_idx" ON "KoiranSairaus"("dogId");

-- CreateIndex
CREATE INDEX "KoiranSairaus_isaDogId_idx" ON "KoiranSairaus"("isaDogId");

-- CreateIndex
CREATE INDEX "KoiranSairaus_emaDogId_idx" ON "KoiranSairaus"("emaDogId");

-- CreateIndex
CREATE INDEX "KoiranSairaus_rekisterinumero_idx" ON "KoiranSairaus"("rekisterinumero");

-- CreateIndex
CREATE INDEX "KoiranSairaus_sairausId_idx" ON "KoiranSairaus"("sairausId");

-- CreateIndex
CREATE INDEX "KoiranSairaus_sairausKoodi_idx" ON "KoiranSairaus"("sairausKoodi");


-- AddForeignKey
ALTER TABLE "KoiranSairaus" ADD CONSTRAINT "KoiranSairaus_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KoiranSairaus" ADD CONSTRAINT "KoiranSairaus_isaDogId_fkey" FOREIGN KEY ("isaDogId") REFERENCES "Dog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KoiranSairaus" ADD CONSTRAINT "KoiranSairaus_emaDogId_fkey" FOREIGN KEY ("emaDogId") REFERENCES "Dog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KoiranSairaus" ADD CONSTRAINT "KoiranSairaus_sairausId_fkey" FOREIGN KEY ("sairausId") REFERENCES "Sairaus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Comments for phase1.25 virtual pairing support tables.
COMMENT ON COLUMN "Dog"."siitosasteProsentti" IS 'Legacy inbreeding percentage imported from bearek_id.SIITOSASTE with source precision preserved; null when source is missing.';

COMMENT ON TABLE "Sairaus" IS 'Legacy disease/status definition catalog imported from beasairaudet.';
COMMENT ON COLUMN "Sairaus"."id" IS 'Technical identifier for the imported disease/status definition.';
COMMENT ON COLUMN "Sairaus"."vanhaId" IS 'Legacy beasairaudet.ID source row identifier.';
COMMENT ON COLUMN "Sairaus"."koodi" IS 'Legacy beasairaudet.SAIRAUS code, for example epi, ap, lepik, or mls_t.';
COMMENT ON COLUMN "Sairaus"."sairausTeksti" IS 'Legacy beasairaudet.SAIRAUS_TEKSTI display text.';
COMMENT ON COLUMN "Sairaus"."sairausRyhma" IS 'Derived v2 grouping for virtual pairing calculations and filtering.';
COMMENT ON COLUMN "Sairaus"."createdAt" IS 'Row creation timestamp.';
COMMENT ON COLUMN "Sairaus"."updatedAt" IS 'Row update timestamp.';

COMMENT ON TABLE "KoiranSairaus" IS 'Legacy dog disease/status row imported from beasairaat.';
COMMENT ON COLUMN "KoiranSairaus"."id" IS 'Technical identifier for the imported dog disease/status row.';
COMMENT ON COLUMN "KoiranSairaus"."vanhaId" IS 'Legacy beasairaat.ID source row identifier.';
COMMENT ON COLUMN "KoiranSairaus"."dogId" IS 'Linked dog identifier resolved from beasairaat.REKNO through DogRegistration.';
COMMENT ON COLUMN "KoiranSairaus"."isaDogId" IS 'Linked sire identifier resolved from beasairaat.ISREK through DogRegistration.';
COMMENT ON COLUMN "KoiranSairaus"."emaDogId" IS 'Linked dam identifier resolved from beasairaat.EMREK through DogRegistration.';
COMMENT ON COLUMN "KoiranSairaus"."rekisterinumero" IS 'Legacy beasairaat.REKNO value kept as source identity for the row dog.';
COMMENT ON COLUMN "KoiranSairaus"."sairausId" IS 'Linked Sairaus definition.';
COMMENT ON COLUMN "KoiranSairaus"."sairausKoodi" IS 'Legacy beasairaat.SAIRAUS code copied for direct filtering and traceability.';
COMMENT ON COLUMN "KoiranSairaus"."pentue" IS 'Legacy beasairaat.PENTUE value.';
COMMENT ON COLUMN "KoiranSairaus"."kuvaus" IS 'Legacy beasairaat.V_KUVAUS free-text description.';
COMMENT ON COLUMN "KoiranSairaus"."julkinen" IS 'Whether the legacy row was marked public in beasairaat.JULKISUUS.';
COMMENT ON COLUMN "KoiranSairaus"."tietolahde" IS 'Legacy beasairaat.TIETOLAHDE source text.';
COMMENT ON COLUMN "KoiranSairaus"."muokattuLahteessa" IS 'Legacy beasairaat.MUOKATTU timestamp when parseable.';
COMMENT ON COLUMN "KoiranSairaus"."createdAt" IS 'Row creation timestamp.';
COMMENT ON COLUMN "KoiranSairaus"."updatedAt" IS 'Row update timestamp.';


-- Audit triggers for phase1.25 virtual pairing support tables.
CREATE TRIGGER trg_audit_sairaus
AFTER INSERT OR UPDATE OR DELETE ON "Sairaus"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_koiran_sairaus
AFTER INSERT OR UPDATE OR DELETE ON "KoiranSairaus"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();
