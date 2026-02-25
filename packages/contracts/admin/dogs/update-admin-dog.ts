import type { AdminDogListSex } from "./admin-dogs-list";

export type UpdateAdminDogRequest = {
  id: string;
  name: string;
  sex: AdminDogListSex;
  birthDate?: string;
  breederNameText?: string;
  ownerNames?: string[];
  ekNo?: number;
  note?: string;
  registrationNo?: string;
  sireRegistrationNo?: string;
  damRegistrationNo?: string;
};

export type UpdateAdminDogResponse = {
  id: string;
  name: string;
  sex: AdminDogListSex;
  registrationNo: string | null;
};
