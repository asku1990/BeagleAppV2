import type { KoiranSairausEvidenceKind, Prisma } from "@prisma/client";
import {
  runInAuditContextDb,
  type AuditContextDb,
} from "@db/core/audit-context";
import { prisma } from "@db/core/prisma";

type AdminDogDiseaseDbClient = Prisma.TransactionClient | typeof prisma;

export type CreateAdminDogDiseaseDbInput = {
  evidenceKind: KoiranSairausEvidenceKind;
  dogId: string | null;
  rekisterinumero: string;
  isaRekisterinumero: string | null;
  emaRekisterinumero: string | null;
  sairausId: string;
  sairausKoodi: string;
  pentue: string | null;
  kuvaus: string | null;
  julkinen: boolean;
  tietolahde: string | null;
};

export type CreatedAdminDogDiseaseDb = {
  id: string;
};

export type AdminDogDiseaseDefinitionDb = {
  id: string;
  koodi: string;
};

export type AdminDogDiseaseDuplicateLookupDb = {
  id: string;
};

export type FindAdminDogDiseaseDuplicateDbInput = {
  evidenceKind: KoiranSairausEvidenceKind;
  dogId: string | null;
  sairausId: string;
  rekisterinumero: string;
  isaRekisterinumero: string | null;
  emaRekisterinumero: string | null;
};

export async function findAdminDogDiseaseDefinitionByCodeDb(
  diseaseCode: string,
  dbClient: AdminDogDiseaseDbClient = prisma,
): Promise<AdminDogDiseaseDefinitionDb | null> {
  return dbClient.sairaus.findUnique({
    where: { koodi: diseaseCode },
    select: {
      id: true,
      koodi: true,
    },
  });
}

export async function findAdminDogDiseaseDuplicateDb(
  input: FindAdminDogDiseaseDuplicateDbInput,
  dbClient: AdminDogDiseaseDbClient = prisma,
): Promise<AdminDogDiseaseDuplicateLookupDb | null> {
  const where: Prisma.KoiranSairausWhereInput =
    input.evidenceKind === "DOG"
      ? {
          evidenceKind: "DOG",
          dogId: input.dogId,
          sairausId: input.sairausId,
          rekisterinumero: input.rekisterinumero,
        }
      : {
          evidenceKind: "LITTER",
          dogId: null,
          sairausId: input.sairausId,
          rekisterinumero: input.rekisterinumero,
          isaRekisterinumero: input.isaRekisterinumero,
          emaRekisterinumero: input.emaRekisterinumero,
        };

  return dbClient.koiranSairaus.findFirst({
    where,
    select: {
      id: true,
    },
  });
}

export async function createAdminDogDiseaseDb(
  input: CreateAdminDogDiseaseDbInput,
  dbClient: AdminDogDiseaseDbClient = prisma,
): Promise<CreatedAdminDogDiseaseDb> {
  const data: Prisma.KoiranSairausCreateInput = {
    vanhaId: null,
    evidenceKind: input.evidenceKind,
    rekisterinumero: input.rekisterinumero,
    isaRekisterinumero: input.isaRekisterinumero,
    emaRekisterinumero: input.emaRekisterinumero,
    sairausKoodi: input.sairausKoodi,
    sairaus: {
      connect: {
        id: input.sairausId,
      },
    },
    pentue: input.pentue,
    kuvaus: input.kuvaus,
    julkinen: input.julkinen,
    tietolahde: input.tietolahde,
    muokattuLahteessa: null,
    ...(input.dogId
      ? {
          dog: {
            connect: {
              id: input.dogId,
            },
          },
        }
      : {}),
  };

  return dbClient.koiranSairaus.create({
    data,
    select: {
      id: true,
    },
  });
}

export async function runAdminDogDiseaseWriteTransactionDb<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  auditContext?: AuditContextDb,
): Promise<T> {
  return runInAuditContextDb(auditContext ?? {}, callback);
}
