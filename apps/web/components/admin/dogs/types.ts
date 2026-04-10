export type AdminDogSex = "MALE" | "FEMALE" | "UNKNOWN";

export type AdminDogParentPreview = {
  name: string;
  registrationNo: string;
};

export type AdminDogTitleRecord = {
  id: string;
  awardedOn: string | null;
  titleCode: string;
  titleName: string | null;
  sortOrder: number;
};

export type AdminDogRecord = {
  id: string;
  name: string;
  sex: AdminDogSex;
  birthDate: string | null;
  breederNameText: string | null;
  trialCount: number;
  showCount: number;
  titlesText: string | null;
  ownershipPreview: string[];
  ekNo: number | null;
  note: string | null;
  registrationNo: string | null;
  secondaryRegistrationNos: string[];
  sirePreview: AdminDogParentPreview | null;
  damPreview: AdminDogParentPreview | null;
  titles: AdminDogTitleRecord[];
};

export type AdminDogTitleFormValues = {
  awardedOn: string;
  titleCode: string;
  titleName: string;
};

export type AdminDogFormValues = {
  name: string;
  sex: AdminDogSex;
  birthDate: string;
  breederNameText: string;
  ownershipNames: string[];
  ekNo: string;
  note: string;
  registrationNo: string;
  secondaryRegistrationNos: string[];
  sirePreviewName: string;
  sirePreviewRegistrationNo: string;
  damPreviewName: string;
  damPreviewRegistrationNo: string;
  titles: AdminDogTitleFormValues[];
};
