import type {
  AdminShowDetailsEvent,
  AdminShowResultOptions,
} from "@beagle/contracts";
import { createManageShowAward } from "./show-management";
import type {
  ManageShowAward,
  ManageShowEditOptions,
  ManageShowEntry,
  ManageShowEvent,
} from "@/components/admin/shows/manage/show-management-types";

const EMPTY_SHOW_OPTIONS: ManageShowEditOptions = {
  classOptions: [],
  qualityOptions: [],
  awardOptions: [],
  pupnOptions: [],
};

export function mapAwardCodesToDraftAwards(
  entryId: string,
  awardCodes: string[],
): ManageShowAward[] {
  return awardCodes.map((awardCode, index) =>
    createManageShowAward(`${entryId}:${awardCode.trim()}:${index}`, awardCode),
  );
}

export function toManageShowEvent(
  show: AdminShowDetailsEvent,
): ManageShowEvent {
  return {
    id: show.showId,
    eventDate: show.eventDate,
    eventPlace: show.eventPlace,
    eventCity: show.eventCity,
    eventName: show.eventName,
    eventType: show.eventType,
    organizer: show.organizer,
    judge: show.judge,
    entries: show.entries.map((entry) => ({
      ...entry,
      dogId: entry.dogId ?? null,
      awards: mapAwardCodesToDraftAwards(entry.id, entry.awards),
    })),
  };
}

export function cloneManageShowEvent(event: ManageShowEvent): ManageShowEvent {
  return {
    ...event,
    entries: event.entries.map((entry) => ({
      ...entry,
      awards: entry.awards.map((award) => ({ ...award })),
    })),
  };
}

export function cloneManageShowEntry(entry: ManageShowEntry): ManageShowEntry {
  return {
    ...entry,
    awards: entry.awards.map((award) => ({ ...award })),
  };
}

export function toManageShowEditOptions(
  options: AdminShowResultOptions | null | undefined,
): ManageShowEditOptions {
  const source = options ?? EMPTY_SHOW_OPTIONS;

  return {
    classOptions: source.classOptions.map((option) => ({ ...option })),
    qualityOptions: source.qualityOptions.map((option) => ({ ...option })),
    awardOptions: source.awardOptions.map((option) => ({ ...option })),
    pupnOptions: source.pupnOptions.map((option) => ({ ...option })),
  };
}
