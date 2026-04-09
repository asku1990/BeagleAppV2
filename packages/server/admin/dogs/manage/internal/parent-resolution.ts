import { findDogByRegistrationNoDb } from "@beagle/db";

// Resolves optional sire/dam registration numbers into canonical parent refs.
export type ParentRef = {
  id: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
};

export async function resolveParentByRegistration(
  registrationNo: string | null,
): Promise<ParentRef | null> {
  if (!registrationNo) {
    return null;
  }

  const row = await findDogByRegistrationNoDb(registrationNo);
  if (!row) {
    return null;
  }

  return { id: row.id, sex: row.sex };
}
