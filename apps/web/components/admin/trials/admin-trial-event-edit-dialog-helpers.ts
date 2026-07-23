import type { AdminTrialEventDetails } from "@beagle/contracts";
export { parseSklKoeIdDraft } from "@/lib/admin/trials/submit-admin-trial-event-creation";

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

export function createEmptyTrialEventDraft(): TrialEventDraft {
  return {
    eventDate: "",
    eventPlace: "",
    jarjestaja: "",
    ylituomari: "",
    ylituomariNumero: "",
    ytKertomus: "",
    kennelpiiri: "",
    kennelpiirinro: "",
    sklKoeId: "",
  };
}

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
