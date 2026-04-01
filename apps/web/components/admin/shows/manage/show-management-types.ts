export type ManageShowEntry = {
  id: string;
  registrationNo: string;
  dogName: string;
  judge: string;
  critiqueText: string;
  heightCm: string;
  classCode: string;
  qualityGrade: string;
  classPlacement: string;
  pupn: string;
  awards: string[];
};

export type ManageShowEvent = {
  id: string;
  eventDate: string;
  eventPlace: string;
  eventCity: string;
  eventName: string;
  eventType: string;
  organizer: string;
  judge: string;
  entries: ManageShowEntry[];
};

export type EntryPatch = Partial<Omit<ManageShowEntry, "id">>;

export type PendingRemovalEntry = {
  eventId: string;
  entryId: string;
  dogName: string;
} | null;
