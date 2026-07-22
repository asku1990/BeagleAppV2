import type {
  CreateAdminTrialEventRequest,
  CreateAdminTrialEventResponse,
} from "@beagle/contracts";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { getAdminTrialEventHref } from "./trial-route";

export type AdminTrialEventCreationDraft = {
  eventDate: string;
  eventPlace: string;
  jarjestaja: string;
  ylituomari: string;
  ylituomariNumero: string;
  ytKertomus: string;
  kennelpiiri: string;
  kennelpiirinro: string;
  sklKoeId: string;
};

type CreationMessageKey =
  | "admin.trials.manage.eventModal.validation.invalidDate"
  | "admin.trials.manage.eventModal.validation.requiredPlace"
  | "admin.trials.manage.eventModal.validation.invalidSklKoeId"
  | "admin.trials.manage.create.conflict"
  | "admin.trials.manage.create.error";

type SubmitAdminTrialEventCreationOptions = {
  draft: AdminTrialEventCreationDraft;
  isPending: boolean;
  mutateAsync: (
    request: CreateAdminTrialEventRequest,
  ) => Promise<CreateAdminTrialEventResponse>;
  replace: (href: string) => void;
  setErrorText: (errorText: string | null) => void;
  t: (key: CreationMessageKey) => string;
};

const VALID_SKL_KOE_ID_PATTERN = /^[1-9]\d*$/;

export function parseSklKoeIdDraft(value: string): number | null {
  const normalized = value.trim();
  if (!VALID_SKL_KOE_ID_PATTERN.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

// Runs the create-form validation, mutation, error mapping, and continuation.
export async function submitAdminTrialEventCreation({
  draft,
  isPending,
  mutateAsync,
  replace,
  setErrorText,
  t,
}: SubmitAdminTrialEventCreationOptions): Promise<void> {
  if (isPending) {
    return;
  }

  setErrorText(null);
  const eventDate = draft.eventDate.trim();
  if (!eventDate) {
    setErrorText(t("admin.trials.manage.eventModal.validation.invalidDate"));
    return;
  }

  const eventPlace = draft.eventPlace.trim();
  if (!eventPlace) {
    setErrorText(t("admin.trials.manage.eventModal.validation.requiredPlace"));
    return;
  }

  const sklKoeId = parseSklKoeIdDraft(draft.sklKoeId);
  if (sklKoeId === null) {
    setErrorText(
      t("admin.trials.manage.eventModal.validation.invalidSklKoeId"),
    );
    return;
  }

  try {
    const result = await mutateAsync({
      eventDate,
      eventPlace,
      jarjestaja: draft.jarjestaja.trim() || null,
      ylituomari: draft.ylituomari.trim() || null,
      ylituomariNumero: draft.ylituomariNumero.trim() || null,
      ytKertomus: draft.ytKertomus.trim() || null,
      kennelpiiri: draft.kennelpiiri.trim() || null,
      kennelpiirinro: draft.kennelpiirinro.trim() || null,
      sklKoeId,
    });
    replace(getAdminTrialEventHref(result.trialEventId));
  } catch (error) {
    setErrorText(
      error instanceof AdminMutationError
        ? error.errorCode === "SKL_KOE_ID_CONFLICT"
          ? t("admin.trials.manage.create.conflict")
          : error.message
        : t("admin.trials.manage.create.error"),
    );
  }
}
