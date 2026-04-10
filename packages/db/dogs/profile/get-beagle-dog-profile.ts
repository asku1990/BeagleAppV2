// Loads the base dog profile record from Prisma and assembles
// pedigree plus grouped offspring data for service-level mapping.
import {
  buildLitters,
  buildOffspringSummary,
} from "./internal/offspring-litters";
import { getDogProfileBaseRow } from "./internal/profile-base-query";
import { buildProfilePedigree } from "./internal/profile-pedigree";
import {
  buildSiblings,
  buildSiblingsSummary,
  createSiblingProfileContext,
} from "./internal/profile-siblings";
import { getSiblingCandidates } from "./internal/profile-siblings-query";
import {
  getPrimaryRegistrationNo,
  mapParent,
  toSexCode,
} from "./internal/profile-mappers";
import type { BeagleDogProfileDb } from "./internal/profile-types";
export type {
  BeagleDogProfileDb,
  BeagleDogProfileLitterDb,
  BeagleDogProfileOffspringRowDb,
  BeagleDogProfileOffspringSummaryDb,
  BeagleDogProfileParentDb,
  BeagleDogProfilePedigreeCardDb,
  BeagleDogProfilePedigreeGenerationDb,
  BeagleDogProfileSiblingRowDb,
  BeagleDogProfileSiblingsSummaryDb,
  BeagleDogProfileSexDb,
  BeagleDogProfileTitleDb,
} from "./internal/profile-types";

export async function getBeagleDogProfileDb(
  dogId: string,
): Promise<BeagleDogProfileDb | null> {
  const dog = await getDogProfileBaseRow(dogId);

  if (!dog) {
    return null;
  }

  const pedigree = buildProfilePedigree(dog);

  const sex = toSexCode(dog.sex);
  const litters = buildLitters(
    dog.id,
    sex,
    dog.whelpedPuppies,
    dog.siredPuppies,
  );
  const siblingContext = createSiblingProfileContext({
    id: dog.id,
    birthDate: dog.birthDate,
    sire: dog.sire,
    dam: dog.dam,
  });
  const siblingCandidates = siblingContext
    ? await getSiblingCandidates(siblingContext)
    : [];
  const siblings = buildSiblings(siblingCandidates);

  return {
    id: dog.id,
    name: dog.name,
    title: null,
    registrationNo: getPrimaryRegistrationNo(dog.registrations),
    registrationNos: dog.registrations.map(
      (registration) => registration.registrationNo,
    ),
    birthDate: dog.birthDate,
    sex,
    color: null,
    ekNo: dog.ekNo,
    inbreedingCoefficientPct: null,
    sire: mapParent(dog.sire),
    dam: mapParent(dog.dam),
    pedigree,
    offspringSummary: buildOffspringSummary(litters),
    litters,
    siblingsSummary: buildSiblingsSummary(siblings),
    siblings,
    titles: (dog.titles ?? []).map((title) => ({
      awardedOn: title.awardedOn,
      titleCode: title.titleCode,
      titleName: title.titleName,
    })),
  };
}
