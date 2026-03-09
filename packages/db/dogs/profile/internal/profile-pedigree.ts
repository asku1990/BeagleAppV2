// Builds 3 pedigree generations for the dog profile DB output.
import { createPedigreeCard, mapParent } from "./profile-mappers";
import type { DogProfileBaseRow } from "./profile-base-query";
import type {
  BeagleDogProfilePedigreeGenerationDb,
  PedigreeDogNode,
} from "./profile-types";

export function buildProfilePedigree(
  dog: Pick<DogProfileBaseRow, "id" | "sire" | "dam">,
): BeagleDogProfilePedigreeGenerationDb[] {
  const pedigree: BeagleDogProfilePedigreeGenerationDb[] = [];

  pedigree.push({
    generation: 1,
    cards: [
      {
        id: `${dog.id}-g1-c1`,
        sire: mapParent(dog.sire),
        dam: mapParent(dog.dam),
      },
    ],
  });

  const g2Parents: Array<PedigreeDogNode | null | undefined> = [
    dog.sire,
    dog.dam,
  ];
  const g2Cards = g2Parents.map((parent, index) =>
    createPedigreeCard(dog.id, 2, index, parent),
  );
  pedigree.push({ generation: 2, cards: g2Cards });

  const g3Parents: Array<PedigreeDogNode | null | undefined> = [
    dog.sire?.sire,
    dog.sire?.dam,
    dog.dam?.sire,
    dog.dam?.dam,
  ];
  const g3Cards = g3Parents.map((parent, index) =>
    createPedigreeCard(dog.id, 3, index, parent),
  );
  pedigree.push({ generation: 3, cards: g3Cards });

  return pedigree;
}
