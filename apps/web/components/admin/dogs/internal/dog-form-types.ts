import type { AdminDogFormValues } from "../types";

export type DogParentOption = {
  registrationNo: string;
  name: string;
};

export type NamedEntityOption = {
  id: string;
  name: string;
};

export type DogFormValuesChange = (values: AdminDogFormValues) => void;
