import type { DogStatus } from "@contracts/dogs/status";
import type { AdminDogListSex, AdminDogTitleInput } from "./admin-dogs-list";

export type UpdateAdminDogRequest = {
  id: string;
  status: DogStatus;
  name: string;
  sex: AdminDogListSex;
  birthDate?: string | null;
  breederNameText?: string | null;
  ownerNames?: string[];
  ekNo?: number | null;
  /** Calendar date in YYYY-MM-DD format; never a timestamp. */
  ekNoAssignedOn?: string | null;
  colorCode?: number | null;
  note?: string | null;
  registrationNo: string;
  secondaryRegistrationNos?: string[];
  sireRegistrationNo?: string | null;
  damRegistrationNo?: string | null;
  titles?: AdminDogTitleInput[];
};

export type UpdateAdminDogResponse = {
  id: string;
  name: string;
  sex: AdminDogListSex;
  registrationNo: string | null;
};
