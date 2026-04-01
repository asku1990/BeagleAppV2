import type {
  EntryPatch,
  ManageShowEntry,
  ManageShowEvent,
} from "@/components/admin/shows/manage/show-management-types";

export function areShowEntriesEqual(
  current: ManageShowEntry,
  applied: ManageShowEntry,
): boolean {
  return (
    current.registrationNo === applied.registrationNo &&
    current.dogName === applied.dogName &&
    current.judge === applied.judge &&
    current.critiqueText === applied.critiqueText &&
    current.heightCm === applied.heightCm &&
    current.classCode === applied.classCode &&
    current.qualityGrade === applied.qualityGrade &&
    current.classPlacement === applied.classPlacement &&
    current.pupn === applied.pupn &&
    current.awards.join("|") === applied.awards.join("|")
  );
}

export function areShowEventFieldsEqual(
  current: ManageShowEvent,
  applied: ManageShowEvent,
): boolean {
  return (
    current.eventDate === applied.eventDate &&
    current.eventPlace === applied.eventPlace &&
    current.eventCity === applied.eventCity &&
    current.eventName === applied.eventName &&
    current.eventType === applied.eventType &&
    current.organizer === applied.organizer &&
    current.judge === applied.judge
  );
}

export function getDirtyEntryIds(
  current: ManageShowEvent,
  applied: ManageShowEvent | undefined,
): string[] {
  if (!applied) {
    return current.entries.map((entry) => entry.id);
  }

  return current.entries
    .filter(
      (entry) =>
        !areShowEntriesEqual(
          entry,
          applied.entries.find((item) => item.id === entry.id) ?? entry,
        ),
    )
    .map((entry) => entry.id);
}

export function updateEntry(
  entries: ManageShowEntry[],
  entryId: string,
  patch: EntryPatch,
): ManageShowEntry[] {
  return entries.map((entry) =>
    entry.id === entryId ? { ...entry, ...patch } : entry,
  );
}

export function addEntryAward(
  entries: ManageShowEntry[],
  entryId: string,
  award: string,
): ManageShowEntry[] {
  const normalizedAward = award.trim();
  if (!normalizedAward) {
    return entries;
  }

  return entries.map((entry) => {
    if (entry.id !== entryId || entry.awards.includes(normalizedAward)) {
      return entry;
    }

    return {
      ...entry,
      awards: [...entry.awards, normalizedAward],
    };
  });
}

export function removeEntryAward(
  entries: ManageShowEntry[],
  entryId: string,
  index: number,
): ManageShowEntry[] {
  return entries.map((entry) => {
    if (entry.id !== entryId) {
      return entry;
    }

    return {
      ...entry,
      awards: entry.awards.filter((_, currentIndex) => currentIndex !== index),
    };
  });
}
