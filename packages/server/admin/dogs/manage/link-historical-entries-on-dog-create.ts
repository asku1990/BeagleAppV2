import {
  createAdminDogWriteDb,
  linkUnlinkedShowTrialEntriesByRegistrationDb,
  type LinkUnlinkedShowTrialEntriesDbResult,
} from "@beagle/db";
import { normalizeRegistrationNos } from "./normalization";

export type LinkHistoricalEntriesOnDogCreateInput = {
  dogId: string;
  primaryRegistrationNo: string;
  secondaryRegistrationNos?: string[];
};

type AdminDogWriteTx = Parameters<typeof createAdminDogWriteDb>[1];

export async function linkHistoricalEntriesOnDogCreate(
  input: LinkHistoricalEntriesOnDogCreateInput,
  tx: AdminDogWriteTx,
): Promise<LinkUnlinkedShowTrialEntriesDbResult> {
  const registrationNos = normalizeRegistrationNos([
    input.primaryRegistrationNo,
    ...(input.secondaryRegistrationNos ?? []),
  ]);

  return linkUnlinkedShowTrialEntriesByRegistrationDb(
    {
      dogId: input.dogId,
      registrationNos,
    },
    tx,
  );
}
