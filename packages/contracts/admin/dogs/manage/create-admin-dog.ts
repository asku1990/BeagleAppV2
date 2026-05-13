import type { AdminDogListSex, AdminDogTitleInput } from "./admin-dogs-list";

export type CreateAdminDogRequest = {
  name: string;
  sex: AdminDogListSex;
  birthDate?: string;
  breederNameText?: string;
  ownerNames?: string[];
  ekNo?: number;
  note?: string;
  registrationNo: string;
  secondaryRegistrationNos?: string[];
  sireRegistrationNo?: string;
  damRegistrationNo?: string;
  titles?: AdminDogTitleInput[];
};

export type CreateAdminDogResponse = {
  id: string;
  name: string;
  sex: AdminDogListSex;
  registrationNo: string | null;
};
