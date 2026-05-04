import type { AdminTrialEventDetails } from "@beagle/contracts";

export type TrialEventDraft = {
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

export function toTrialEventDraft(
  event: AdminTrialEventDetails,
): TrialEventDraft {
  return {
    eventDate: event.eventDate,
    eventPlace: event.eventPlace,
    jarjestaja: event.jarjestaja ?? "",
    ylituomari: event.ylituomari ?? "",
    ylituomariNumero: event.ylituomariNumero ?? "",
    ytKertomus: event.ytKertomus ?? "",
    kennelpiiri: event.kennelpiiri ?? "",
    kennelpiirinro: event.kennelpiirinro ?? "",
    sklKoeId: event.sklKoeId === null ? "" : String(event.sklKoeId),
  };
}

export function areTrialEventDraftsEqual(
  left: AdminTrialEventDetails,
  right: TrialEventDraft,
): boolean {
  return (
    left.eventDate === right.eventDate &&
    left.eventPlace === right.eventPlace &&
    (left.jarjestaja ?? "") === right.jarjestaja &&
    (left.ylituomari ?? "") === right.ylituomari &&
    (left.ylituomariNumero ?? "") === right.ylituomariNumero &&
    (left.ytKertomus ?? "") === right.ytKertomus &&
    (left.kennelpiiri ?? "") === right.kennelpiiri &&
    (left.kennelpiirinro ?? "") === right.kennelpiirinro &&
    (left.sklKoeId === null ? "" : String(left.sklKoeId)) === right.sklKoeId
  );
}

const VALID_SKL_KOE_ID_PATTERN = /^[1-9]\d*$/;

export function parseSklKoeIdDraft(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!VALID_SKL_KOE_ID_PATTERN.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}
