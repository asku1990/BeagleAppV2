import type { AdminDogListSex } from "../manage/admin-dogs-list";
import type { DogColorDto } from "@contracts/dogs/colors";

export type AdminDogLookupRequest = {
  query?: string;
  limit?: number;
};

export type AdminBreederLookupOption = {
  id: string;
  name: string;
};

export type AdminOwnerLookupOption = {
  id: string;
  name: string;
};

export type AdminDogParentLookupOption = {
  id: string;
  name: string;
  sex: AdminDogListSex;
  registrationNo: string | null;
};

export type AdminDogColorLookupOption = DogColorDto;

export type AdminBreederLookupResponse = {
  items: AdminBreederLookupOption[];
};

export type AdminOwnerLookupResponse = {
  items: AdminOwnerLookupOption[];
};

export type AdminDogParentLookupResponse = {
  items: AdminDogParentLookupOption[];
};

export type AdminDogColorLookupResponse = {
  items: AdminDogColorLookupOption[];
};
