import type { AdminDogListSex } from "./admin-dogs-list";

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

export type AdminBreederLookupResponse = {
  items: AdminBreederLookupOption[];
};

export type AdminOwnerLookupResponse = {
  items: AdminOwnerLookupOption[];
};

export type AdminDogParentLookupResponse = {
  items: AdminDogParentLookupOption[];
};
