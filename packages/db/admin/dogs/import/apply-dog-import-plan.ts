import { DOG_REGISTRY_IMPORT_TX_CONFIG } from "@db/core/interactive-write-transaction";
import {
  runInAuditContextDb,
  type AuditContextDb,
} from "@db/core/audit-context";
import type { DogImportWritePlanDb } from "./types";

const date = (value: string | null | undefined) =>
  value ? new Date(`${value}T00:00:00.000Z`) : null;

export async function applyDogImportPlanDb(
  plan: DogImportWritePlanDb,
  audit: AuditContextDb,
) {
  return runInAuditContextDb(
    audit,
    async (tx) => {
      const ids = new Map<string, string>();
      for (const create of plan.creates) {
        const dog = await tx.dog.create({
          data: {
            status: "NORMAL",
            name: create.name,
            sex: create.sex,
            birthDate: date(create.birthDate),
            breederNameText: create.breederNameText,
            originTypeText: create.originTypeText,
            originCountryText: create.originCountryText,
            tailText: create.tailText,
            colorCode: create.colorCode,
          },
        });
        await tx.dogRegistration.create({
          data: {
            dogId: dog.id,
            registrationNo: create.registrationNo,
            registeredOn: date(create.registeredOn),
            source: "FINNISH_KENNEL_CLUB",
          },
        });
        ids.set(create.registrationNo, dog.id);
      }
      for (const reference of plan.references) {
        const dog = await tx.dog.create({
          data: {
            status: "REFERENCE_ONLY",
            name: reference.registrationNo,
            sex: reference.sex,
          },
        });
        await tx.dogRegistration.create({
          data: {
            dogId: dog.id,
            registrationNo: reference.registrationNo,
            source: "FINNISH_KENNEL_CLUB",
          },
        });
        ids.set(reference.registrationNo, dog.id);
      }
      const all = await tx.dogRegistration.findMany({
        where: {
          registrationNo: {
            in: [
              ...ids.keys(),
              ...plan.creates.map((x) => x.sireRegistrationNo),
              ...plan.creates.map((x) => x.damRegistrationNo),
              ...plan.updates.map((x) => x.sireRegistrationNo),
              ...plan.updates.map((x) => x.damRegistrationNo),
            ],
          },
        },
      });
      for (const registration of all)
        ids.set(registration.registrationNo, registration.dogId);
      const resolveParent = (registrationNo: string) => {
        const id = ids.get(registrationNo);
        if (!id) throw new Error("DOG_IMPORT_STALE");
        return id;
      };
      for (const update of plan.updates) {
        const result = await tx.dog.updateMany({
          where: { id: update.id, updatedAt: update.expectedUpdatedAt },
          data: {
            ...update.data,
            sireId: resolveParent(update.sireRegistrationNo),
            damId: resolveParent(update.damRegistrationNo),
          },
        });
        if (result.count !== 1) throw new Error("DOG_IMPORT_STALE");
        if (update.registeredOn !== undefined) {
          const registrationResult = await tx.dogRegistration.updateMany({
            where: {
              id: update.registrationId,
              updatedAt: update.expectedRegistrationUpdatedAt,
            },
            data: { registeredOn: date(update.registeredOn) },
          });
          if (registrationResult.count !== 1)
            throw new Error("DOG_IMPORT_STALE");
        }
      }
      for (const create of plan.creates)
        await tx.dog.update({
          where: { id: resolveParent(create.registrationNo) },
          data: {
            sireId: resolveParent(create.sireRegistrationNo),
            damId: resolveParent(create.damRegistrationNo),
          },
        });
      return {
        createdCount: plan.creates.length,
        updatedCount: plan.updates.length,
        referenceCount: plan.references.length,
      };
    },
    DOG_REGISTRY_IMPORT_TX_CONFIG,
  );
}
