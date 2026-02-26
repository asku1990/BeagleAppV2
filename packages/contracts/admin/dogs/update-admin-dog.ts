import type { AdminDogListSex } from "./admin-dogs-list";

export type UpdateAdminDogRequest = {
  id: string;
  name: string;
  sex: AdminDogListSex;
  birthDate?: string | null;
  breederNameText?: string | null;
  ownerNames?: string[];
  ekNo?: number | null;
  note?: string | null;
  registrationNo: string;
  sireRegistrationNo?: string | null;
  damRegistrationNo?: string | null;
};

export type UpdateAdminDogResponse = {
  id: string;
  name: string;
  sex: AdminDogListSex;
  registrationNo: string | null;
};
