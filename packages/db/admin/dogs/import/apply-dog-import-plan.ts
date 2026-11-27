import { DOG_REGISTRY_IMPORT_TX_CONFIG } from "@db/core/interactive-write-transaction";
import {
  runInAuditContextDb,
  type AuditContextDb,
} from "@db/core/audit-context";
import type { DogImportStateDb, DogImportWritePlanDb } from "./types";
import { loadDogImportStateDb } from "./load-dog-import-state";

const date = (value: string | null | undefined) =>
  value ? new Date(`${value}T00:00:00.000Z`) : null;
const normalizeRegistrationNo = (value: string) =>
  value.trim().toLocaleUpperCase("fi-FI");

export async function applyDogImportPlanDb(
  registrations: readonly string[],
  kennelNames: readonly (string | null)[],
  audit: AuditContextDb,
  verifyPlan: (state: DogImportStateDb) => DogImportWritePlanDb,
) {
  return runInAuditContextDb(
    audit,
    async (tx) => {
      const state = await loadDogImportStateDb(registrations, kennelNames, tx);
      const plan = verifyPlan(state);
      const ids = new Map(
        state.dogs.map(({ registrationNo, id }) => [registrationNo, id]),
      );
      for (const create of plan.creates) {
        const dog = await tx.dog.create({
          data: {
            status: "NORMAL",
            name: create.name,
            sex: create.sex,
            birthDate: date(create.birthDate),
            breederId: create.breederId,
            originTypeText: create.originTypeText,
            originCountryText: create.originCountryText,
            tailText: create.tailText,
            colorCode: create.colorCode,
          },
        });
        const registration = await tx.dogRegistration.create({
          data: {
            dogId: dog.id,
            registrationNo: create.registrationNo,
            registeredOn: date(create.registeredOn),
            source: "FINNISH_KENNEL_CLUB",
          },
        });
        if (registration.dogId !== dog.id) throw new Error("DOG_IMPORT_STALE");
        ids.set(normalizeRegistrationNo(registration.registrationNo), dog.id);
      }
      for (const reference of plan.references) {
        const dog = await tx.dog.create({
          data: {
            status: "REFERENCE_ONLY",
            name: reference.registrationNo,
            sex: reference.sex,
          },
        });
        const registration = await tx.dogRegistration.create({
          data: {
            dogId: dog.id,
            registrationNo: reference.registrationNo,
            source: "FINNISH_KENNEL_CLUB",
          },
        });
        if (registration.dogId !== dog.id) throw new Error("DOG_IMPORT_STALE");
        ids.set(normalizeRegistrationNo(registration.registrationNo), dog.id);
      }
      const resolveParent = (registrationNo: string) => {
        const id = ids.get(normalizeRegistrationNo(registrationNo));
        if (!id) throw new Error("DOG_IMPORT_STALE");
        return id;
      };
      for (const update of plan.updates) {
        const result = await tx.dog.updateMany({
          where: { id: update.id, updatedAt: update.expectedUpdatedAt },
          data: {
            ...update.data,
            ...(update.data.birthDate !== undefined
              ? { birthDate: date(update.data.birthDate) }
              : {}),
            sireId: resolveParent(update.sireRegistrationNo),
            damId: resolveParent(update.damRegistrationNo),
          },
        });
        if (result.count !== 1) throw new Error("DOG_IMPORT_STALE");
        if (update.registeredOn !== undefined) {
          const registrationResult = await tx.dogRegistration.updateMany({
            where: {
              id: update.registrationId,
              dogId: update.id,
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
      for (const links of plan.historicalLinks) {
        const dogId = ids.get(normalizeRegistrationNo(links.registrationNo));
        if (!dogId) throw new Error("DOG_IMPORT_STALE");
        const showEntryIds = [...new Set(links.showEntryIds)];
        const trialEntryIds = [...new Set(links.trialEntryIds)];
        const showUpdate = await tx.showEntry.updateMany({
          where: { id: { in: showEntryIds }, dogId: null },
          data: { dogId },
        });
        if (showUpdate.count !== showEntryIds.length) {
          throw new Error("DOG_IMPORT_STALE");
        }

        const trialUpdate = await tx.trialEntry.updateMany({
          where: { id: { in: trialEntryIds }, dogId: null },
          data: { dogId },
        });
        if (trialUpdate.count !== trialEntryIds.length) {
          throw new Error("DOG_IMPORT_STALE");
        }
      }
      return {
        createdCount: plan.creates.length,
        updatedCount: plan.updates.length,
        referenceCount: plan.references.length,
      };
    },
    DOG_REGISTRY_IMPORT_TX_CONFIG,
  );
}
