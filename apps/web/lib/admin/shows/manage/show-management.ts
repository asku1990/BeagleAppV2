import type {
  EntryPatch,
  ManageShowAward,
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
    current.awards.map((award) => award.code).join("|") ===
      applied.awards.map((award) => award.code).join("|")
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

export function updateEntryById(
  entries: ManageShowEntry[],
  entryId: string,
  updater: (entry: ManageShowEntry) => ManageShowEntry,
): ManageShowEntry[] {
  return entries.map((entry) =>
    entry.id === entryId ? updater(entry) : entry,
  );
}

export function updateEntry(
  entries: ManageShowEntry[],
  entryId: string,
  patch: EntryPatch,
): ManageShowEntry[] {
  return updateEntryById(entries, entryId, (entry) => ({ ...entry, ...patch }));
}

export function addEntryAward(
  entries: ManageShowEntry[],
  entryId: string,
  award: ManageShowAward,
): ManageShowEntry[] {
  const normalizedAwardCode = award.code.trim();
  if (!normalizedAwardCode) {
    return entries;
  }

  return updateEntryById(entries, entryId, (entry) => {
    if (
      entry.awards.some(
        (currentAward) => currentAward.code === normalizedAwardCode,
      )
    ) {
      return entry;
    }

    return {
      ...entry,
      awards: [
        ...entry.awards,
        {
          ...award,
          code: normalizedAwardCode,
        },
      ],
    };
  });
}

export function removeEntryAward(
  entries: ManageShowEntry[],
  entryId: string,
  awardId: string,
): ManageShowEntry[] {
  return updateEntryById(entries, entryId, (entry) => ({
    ...entry,
    awards: entry.awards.filter((award) => award.id !== awardId),
  }));
}

export function createManageShowAward(
  id: string,
  code: string,
): ManageShowAward {
  return {
    id,
    code: code.trim(),
  };
}
