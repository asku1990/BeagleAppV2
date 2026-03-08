// Shared dog profile DB mappers for registration, parent, and pedigree shaping.
import { DogSex } from "@prisma/client";
import { getFirstInsertedRegistrationNo } from "../../core/registration";
import type {
  BeagleDogProfileParentDb,
  BeagleDogProfilePedigreeCardDb,
  BeagleDogProfileSexDb,
  ParentDogNode,
  PedigreeDogNode,
  RegistrationNode,
} from "./profile-types";

export function toSexCode(value: DogSex): BeagleDogProfileSexDb {
  if (value === DogSex.MALE) return "U";
  if (value === DogSex.FEMALE) return "N";
  return "-";
}

export function getPrimaryRegistrationNo(
  registrations: RegistrationNode[],
): string {
  if (registrations.length === 0) return "-";
  return getFirstInsertedRegistrationNo(registrations) ?? "-";
}

function getParentRegistrationNo(
  registrations: RegistrationNode[],
): string | null {
  if (registrations.length === 0) {
    return null;
  }

  return getPrimaryRegistrationNo(registrations);
}

export function mapParent(
  dog: ParentDogNode | null,
): BeagleDogProfileParentDb | null {
  if (!dog) return null;
  return {
    id: dog.id,
    name: dog.name,
    registrationNo: getParentRegistrationNo(dog.registrations),
    ekNo: dog.ekNo ?? null,
  };
}

export function createPedigreeCard(
  dogId: string,
  generation: number,
  index: number,
  parent: PedigreeDogNode | null | undefined,
): BeagleDogProfilePedigreeCardDb {
  return {
    id: `${dogId}-g${String(generation)}-c${String(index + 1)}`,
    sire: mapParent(parent?.sire ?? null),
    dam: mapParent(parent?.dam ?? null),
  };
}
