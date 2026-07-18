import type { MessageKey } from "@/lib/i18n/messages";
import { AdminMutationError } from "@/queries/admin/mutation-error";

// Maps feature-specific create failures to localized admin disease messages.
export function getAdminDogDiseaseCreateErrorMessageKey(
  error: unknown,
): MessageKey | null {
  if (
    error instanceof AdminMutationError &&
    error.errorCode === "LITTER_REGISTRATION_MATCHES_DOG"
  ) {
    return "admin.dogs.diseases.create.errorLitterRegistrationMatchesDog";
  }

  return null;
}
