import type {
  DogColorDb,
  OffspringDogNode,
  ParentDogNode,
  RegistrationNode,
} from "@db/dogs/profile/internal/profile-types";
import { DogSex } from "@prisma/client";

export type AdminDogProfileDiseaseDb = {
  id: string;
  diseaseText: string;
  diseaseGroup: "EPILEPSIA" | "LAFORA" | "PURENTA" | "MLS" | "MUU";
  public: boolean;
  source: string | null;
};

export type AdminDogProfileOwnerDb = {
  name: string;
  postalCode: string;
  city: string;
};

export type AdminDogProfileBreederDb = {
  name: string;
  ownerName: string | null;
  city: string | null;
  detailsSource: string | null;
};

export type AdminDogProfileDb = {
  base: {
    id: string;
    name: string;
    registrationNos: RegistrationNode[];
    birthDate: Date | null;
    sex: DogSex;
    color: DogColorDb | null;
    ekNo: number | null;
    sire: ParentDogNode | null;
    dam: ParentDogNode | null;
    whelpedPuppies: OffspringDogNode[];
    siredPuppies: OffspringDogNode[];
    breederNameText: string | null;
  };
  note: string | null;
  breeder: AdminDogProfileBreederDb | null;
  owners: AdminDogProfileOwnerDb[];
  diseases: AdminDogProfileDiseaseDb[];
};
