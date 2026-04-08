export type UpdateAdminShowEntryRequest = {
  showId: string;
  entryId: string;
  judge: string;
  critiqueText: string;
  heightCm: string;
  classCode: string;
  qualityGrade: string;
  classPlacement: string;
  pupn: string;
  awards: string[];
};

export type UpdateAdminShowEntryResponse = {
  entryId: string;
};
