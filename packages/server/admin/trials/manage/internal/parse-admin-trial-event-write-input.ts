import { parseIsoDateOnlyToUtcDate } from "@server/trials/internal/iso-date";

type AdminTrialEventWriteInput = {
  eventDate: string;
  eventPlace: string;
  jarjestaja: string | null;
  ylituomari: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  sklKoeId: number | null;
};

type ParsedAdminTrialEventWriteInput = {
  normalizedEventDate: string;
  eventDate: Date;
  eventPlace: string;
  jarjestaja: string | null;
  ylituomari: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  sklKoeId: number | null;
};

type AdminTrialEventWriteValidationIssue = {
  event: "invalid_event_date" | "invalid_event_place" | "invalid_skl_koe_id";
  code: "INVALID_EVENT_DATE" | "INVALID_EVENT_PLACE" | "INVALID_SKL_KOE_ID";
  error: string;
};

function normalizeOptionalText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

// Normalizes the event metadata shared by admin event creation and editing.
export function parseAdminTrialEventWriteInput(
  input: AdminTrialEventWriteInput,
  options: { requireSklKoeId: boolean },
):
  | { ok: true; data: ParsedAdminTrialEventWriteInput }
  | { ok: false; issue: AdminTrialEventWriteValidationIssue } {
  const normalizedEventDate = input.eventDate.trim();
  const eventDate = parseIsoDateOnlyToUtcDate(normalizedEventDate);
  if (!eventDate) {
    return {
      ok: false,
      issue: {
        event: "invalid_event_date",
        code: "INVALID_EVENT_DATE",
        error: "Event date must use YYYY-MM-DD format.",
      },
    };
  }

  const eventPlace = input.eventPlace.trim();
  if (!eventPlace) {
    return {
      ok: false,
      issue: {
        event: "invalid_event_place",
        code: "INVALID_EVENT_PLACE",
        error: "Event place is required.",
      },
    };
  }

  const sklKoeId = input.sklKoeId;
  if (
    (options.requireSklKoeId && sklKoeId === null) ||
    (sklKoeId !== null &&
      (!Number.isInteger(sklKoeId) ||
        !Number.isFinite(sklKoeId) ||
        sklKoeId < 1))
  ) {
    return {
      ok: false,
      issue: {
        event: "invalid_skl_koe_id",
        code: "INVALID_SKL_KOE_ID",
        error: "SKL koe id must be a positive integer.",
      },
    };
  }

  return {
    ok: true,
    data: {
      normalizedEventDate,
      eventDate,
      eventPlace,
      jarjestaja: normalizeOptionalText(input.jarjestaja),
      ylituomari: normalizeOptionalText(input.ylituomari),
      ylituomariNumero: normalizeOptionalText(input.ylituomariNumero),
      ytKertomus: normalizeOptionalText(input.ytKertomus),
      kennelpiiri: normalizeOptionalText(input.kennelpiiri),
      kennelpiirinro: normalizeOptionalText(input.kennelpiirinro),
      sklKoeId,
    },
  };
}
