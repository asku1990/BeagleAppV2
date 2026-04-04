import type { AdminShowResultOption } from "@beagle/contracts";

export type ManageShowAward = {
  id: string;
  code: string;
};

export type ManageShowEntry = {
  id: string;
  dogId?: string | null;
  registrationNo: string;
  dogName: string;
  judge: string;
  critiqueText: string;
  heightCm: string;
  classCode: string;
  qualityGrade: string;
  classPlacement: string;
  pupn: string;
  awards: ManageShowAward[];
  classDisplay: string;
  qualityDisplay: string;
  pupnDisplay: string;
  awardsDisplay: string[];
};

export type ManageShowEditOptions = {
  classOptions: AdminShowResultOption[];
  qualityOptions: AdminShowResultOption[];
  awardOptions: AdminShowResultOption[];
  pupnOptions: AdminShowResultOption[];
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
