-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DogSex" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ImportKind" AS ENUM ('LEGACY_PHASE1');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportIssueSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "AuditSource" AS ENUM ('WEB', 'SCRIPT', 'SYSTEM');

-- CreateTable
CREATE TABLE "BetterAuthUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BetterAuthUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetterAuthSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BetterAuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetterAuthAccount" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BetterAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetterAuthVerification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BetterAuthVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sex" "DogSex" NOT NULL DEFAULT 'UNKNOWN',
    "birthDate" TIMESTAMP(3),
    "breederNameText" TEXT,
    "sireId" TEXT,
    "damId" TEXT,
    "breederId" TEXT,
    "ekNo" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DogRegistration" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DogRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Breeder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT,
    "grantedAtRaw" TEXT,
    "modifiedAtRaw" TEXT,
    "ownerName" TEXT,
    "city" TEXT,
    "legacyFlag" TEXT,
    "detailsSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Breeder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DogOwnership" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "ownershipDate" TIMESTAMP(3),
    "ownershipDateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DogOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialResult" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT,
    "eventPlace" TEXT NOT NULL,
    "kennelDistrict" TEXT,
    "kennelDistrictNo" TEXT,
    "ke" TEXT,
    "lk" TEXT,
    "pa" TEXT,
    "piste" DECIMAL(6,2),
    "sija" TEXT,
    "haku" DECIMAL(6,2),
    "hauk" DECIMAL(6,2),
    "yva" DECIMAL(6,2),
    "hlo" DECIMAL(6,2),
    "alo" DECIMAL(6,2),
    "tja" DECIMAL(6,2),
    "pin" DECIMAL(6,2),
    "judge" TEXT,
    "legacyFlag" TEXT,
    "sourceKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowResult" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT,
    "eventPlace" TEXT NOT NULL,
    "resultText" TEXT,
    "heightText" TEXT,
    "judge" TEXT,
    "legacyFlag" TEXT,
    "sourceKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportRun" (
    "id" TEXT NOT NULL,
    "kind" "ImportKind" NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "dogsUpserted" INTEGER NOT NULL DEFAULT 0,
    "ownersUpserted" INTEGER NOT NULL DEFAULT 0,
    "ownershipsUpserted" INTEGER NOT NULL DEFAULT 0,
    "trialResultsUpserted" INTEGER NOT NULL DEFAULT 0,
    "showResultsUpserted" INTEGER NOT NULL DEFAULT 0,
    "errorsCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "errorSummary" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportRunIssue" (
    "id" TEXT NOT NULL,
    "importRunId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "severity" "ImportIssueSeverity" NOT NULL DEFAULT 'WARNING',
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "registrationNo" TEXT,
    "sourceRowId" INTEGER,
    "sourceTable" TEXT,
    "payloadJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportRunIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "AuditAction" NOT NULL,
    "tableName" TEXT NOT NULL,
    "rowId" TEXT,
    "actorUserId" TEXT,
    "actorSessionId" TEXT,
    "source" "AuditSource" NOT NULL DEFAULT 'SYSTEM',
    "intent" TEXT,
    "requestId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BetterAuthUser_email_key" ON "BetterAuthUser"("email");

-- CreateIndex
CREATE INDEX "BetterAuthUser_role_idx" ON "BetterAuthUser"("role");

-- CreateIndex
CREATE UNIQUE INDEX "BetterAuthSession_token_key" ON "BetterAuthSession"("token");

-- CreateIndex
CREATE INDEX "BetterAuthSession_userId_idx" ON "BetterAuthSession"("userId");

-- CreateIndex
CREATE INDEX "BetterAuthAccount_userId_idx" ON "BetterAuthAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BetterAuthAccount_providerId_accountId_key" ON "BetterAuthAccount"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "BetterAuthVerification_identifier_value_key" ON "BetterAuthVerification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Dog_ekNo_key" ON "Dog"("ekNo");

-- CreateIndex
CREATE INDEX "Dog_name_idx" ON "Dog"("name");

-- CreateIndex
CREATE INDEX "Dog_sex_idx" ON "Dog"("sex");

-- CreateIndex
CREATE INDEX "Dog_birthDate_idx" ON "Dog"("birthDate");

-- CreateIndex
CREATE INDEX "Dog_sireId_idx" ON "Dog"("sireId");

-- CreateIndex
CREATE INDEX "Dog_damId_idx" ON "Dog"("damId");

-- CreateIndex
CREATE INDEX "Dog_breederId_idx" ON "Dog"("breederId");

-- CreateIndex
CREATE UNIQUE INDEX "DogRegistration_registrationNo_key" ON "DogRegistration"("registrationNo");

-- CreateIndex
CREATE INDEX "DogRegistration_dogId_idx" ON "DogRegistration"("dogId");

-- CreateIndex
CREATE UNIQUE INDEX "Breeder_name_key" ON "Breeder"("name");

-- CreateIndex
CREATE INDEX "Owner_name_idx" ON "Owner"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_name_postalCode_city_key" ON "Owner"("name", "postalCode", "city");

-- CreateIndex
CREATE INDEX "DogOwnership_dogId_idx" ON "DogOwnership"("dogId");

-- CreateIndex
CREATE INDEX "DogOwnership_ownerId_idx" ON "DogOwnership"("ownerId");

-- CreateIndex
CREATE INDEX "DogOwnership_ownershipDate_idx" ON "DogOwnership"("ownershipDate");

-- CreateIndex
CREATE UNIQUE INDEX "DogOwnership_dogId_ownerId_ownershipDateKey_key" ON "DogOwnership"("dogId", "ownerId", "ownershipDateKey");

-- CreateIndex
CREATE UNIQUE INDEX "TrialResult_sourceKey_key" ON "TrialResult"("sourceKey");

-- CreateIndex
CREATE INDEX "TrialResult_eventDate_idx" ON "TrialResult"("eventDate");

-- CreateIndex
CREATE INDEX "TrialResult_dogId_eventDate_idx" ON "TrialResult"("dogId", "eventDate");

-- CreateIndex
CREATE UNIQUE INDEX "ShowResult_sourceKey_key" ON "ShowResult"("sourceKey");

-- CreateIndex
CREATE INDEX "ShowResult_eventDate_idx" ON "ShowResult"("eventDate");

-- CreateIndex
CREATE INDEX "ShowResult_dogId_eventDate_idx" ON "ShowResult"("dogId", "eventDate");

-- CreateIndex
CREATE INDEX "ImportRun_kind_status_idx" ON "ImportRun"("kind", "status");

-- CreateIndex
CREATE INDEX "ImportRun_createdByUserId_idx" ON "ImportRun"("createdByUserId");

-- CreateIndex
CREATE INDEX "ImportRunIssue_importRunId_idx" ON "ImportRunIssue"("importRunId");

-- CreateIndex
CREATE INDEX "ImportRunIssue_importRunId_stage_idx" ON "ImportRunIssue"("importRunId", "stage");

-- CreateIndex
CREATE INDEX "ImportRunIssue_importRunId_severity_idx" ON "ImportRunIssue"("importRunId", "severity");

-- CreateIndex
CREATE INDEX "ImportRunIssue_importRunId_code_idx" ON "ImportRunIssue"("importRunId", "code");

-- CreateIndex
CREATE INDEX "AuditEvent_happenedAt_idx" ON "AuditEvent"("happenedAt");

-- CreateIndex
CREATE INDEX "AuditEvent_tableName_rowId_happenedAt_idx" ON "AuditEvent"("tableName", "rowId", "happenedAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorUserId_happenedAt_idx" ON "AuditEvent"("actorUserId", "happenedAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorSessionId_happenedAt_idx" ON "AuditEvent"("actorSessionId", "happenedAt");

-- CreateIndex
CREATE INDEX "AuditEvent_requestId_idx" ON "AuditEvent"("requestId");

-- AddForeignKey
ALTER TABLE "BetterAuthSession" ADD CONSTRAINT "BetterAuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "BetterAuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetterAuthAccount" ADD CONSTRAINT "BetterAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "BetterAuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dog" ADD CONSTRAINT "Dog_sireId_fkey" FOREIGN KEY ("sireId") REFERENCES "Dog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dog" ADD CONSTRAINT "Dog_damId_fkey" FOREIGN KEY ("damId") REFERENCES "Dog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dog" ADD CONSTRAINT "Dog_breederId_fkey" FOREIGN KEY ("breederId") REFERENCES "Breeder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DogRegistration" ADD CONSTRAINT "DogRegistration_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DogOwnership" ADD CONSTRAINT "DogOwnership_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DogOwnership" ADD CONSTRAINT "DogOwnership_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialResult" ADD CONSTRAINT "TrialResult_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowResult" ADD CONSTRAINT "ShowResult_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportRun" ADD CONSTRAINT "ImportRun_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "BetterAuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportRunIssue" ADD CONSTRAINT "ImportRunIssue_importRunId_fkey" FOREIGN KEY ("importRunId") REFERENCES "ImportRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
