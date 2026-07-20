import type { MessageKey } from "@/lib/i18n/messages";
import { AdminMutationError } from "@/queries/admin/mutation-error";

// Maps feature-specific create failures to localized admin disease messages.
export function getAdminDogDiseaseCreateErrorMessageKey(
  error: unknown,
): MessageKey | null {
  if (!(error instanceof AdminMutationError)) {
    return null;
  }

  const messageKeys: Partial<Record<string, MessageKey>> = {
    LITTER_REGISTRATION_MATCHES_DOG:
      "admin.dogs.diseases.create.errorLitterRegistrationMatchesDog",
    INVALID_PARENT_COMBINATION:
      "admin.dogs.mutation.errorInvalidParentCombination",
    INVALID_SIRE_SEX: "admin.dogs.mutation.errorInvalidSireSex",
    INVALID_DAM_SEX: "admin.dogs.mutation.errorInvalidDamSex",
  };

  return error.errorCode ? (messageKeys[error.errorCode] ?? null) : null;
}
