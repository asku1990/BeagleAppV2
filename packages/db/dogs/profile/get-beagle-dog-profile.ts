import { DogSex } from "@prisma/client";
import { prisma } from "../../core/prisma";

export type BeagleDogProfileSexDb = "U" | "N" | "-";

export type BeagleDogProfileParentDb = {
  id: string;
  name: string;
  registrationNo: string | null;
};

export type BeagleDogProfilePedigreeCardDb = {
  id: string;
  sire: BeagleDogProfileParentDb | null;
  dam: BeagleDogProfileParentDb | null;
};

export type BeagleDogProfilePedigreeGenerationDb = {
  generation: number;
  cards: BeagleDogProfilePedigreeCardDb[];
};

export type BeagleDogProfileTrialRowDb = {
  id: string;
  place: string;
  date: Date;
  weather: string | null;
  className: string | null;
  classCode: string | null;
  rank: string | null;
  points: number | null;
  award: string | null;
};

export type BeagleDogProfileShowRowDb = {
  id: string;
  place: string;
  date: Date;
  result: string | null;
  judge: string | null;
  heightCm: number | null;
};

export type BeagleDogProfileDb = {
  id: string;
  name: string;
  title: string | null;
  registrationNo: string;
  registrationNos: string[];
  birthDate: Date | null;
  sex: BeagleDogProfileSexDb;
  color: string | null;
  ekNo: number | null;
  inbreedingCoefficientPct: number | null;
  sire: BeagleDogProfileParentDb | null;
  dam: BeagleDogProfileParentDb | null;
  pedigree: BeagleDogProfilePedigreeGenerationDb[];
  shows: BeagleDogProfileShowRowDb[];
  trials: BeagleDogProfileTrialRowDb[];
};

function toSexCode(value: DogSex): BeagleDogProfileSexDb {
  if (value === DogSex.MALE) return "U";
  if (value === DogSex.FEMALE) return "N";
  return "-";
}

function getPrimaryRegistrationNo(
  registrations: { registrationNo: string; createdAt: Date }[],
): string {
  if (registrations.length === 0) return "-";
  return (
    [...registrations].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0]?.registrationNo ?? "-"
  );
}

function mapParent(
  dog: {
    id: string;
    name: string;
    registrations: { registrationNo: string; createdAt: Date }[];
  } | null,
): BeagleDogProfileParentDb | null {
  if (!dog) return null;
  const registrationNo =
    dog.registrations.length > 0
      ? getPrimaryRegistrationNo(dog.registrations)
      : null;
  return {
    id: dog.id,
    name: dog.name,
    registrationNo,
  };
}

function parseHeightCm(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function getBeagleDogProfileDb(
  dogId: string,
): Promise<BeagleDogProfileDb | null> {
  const dog = await prisma.dog.findUnique({
    where: { id: dogId },
    include: {
      registrations: true,
      trialResults: {
        orderBy: { eventDate: "desc" },
      },
      showResults: {
        orderBy: { eventDate: "desc" },
      },
      sire: {
        include: {
          registrations: true,
          sire: {
            include: {
              registrations: true,
              sire: { include: { registrations: true } },
              dam: { include: { registrations: true } },
            },
          },
          dam: {
            include: {
              registrations: true,
              sire: { include: { registrations: true } },
              dam: { include: { registrations: true } },
            },
          },
        },
      },
      dam: {
        include: {
          registrations: true,
          sire: {
            include: {
              registrations: true,
              sire: { include: { registrations: true } },
              dam: { include: { registrations: true } },
            },
          },
          dam: {
            include: {
              registrations: true,
              sire: { include: { registrations: true } },
              dam: { include: { registrations: true } },
            },
          },
        },
      },
    },
  });

  if (!dog) {
    return null;
  }

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

  const g2Cards: BeagleDogProfilePedigreeCardDb[] = [];
  if (dog.sire) {
    g2Cards.push({
      id: `${dog.id}-g2-c1`,
      sire: mapParent(dog.sire.sire),
      dam: mapParent(dog.sire.dam),
    });
  }
  if (dog.dam) {
    g2Cards.push({
      id: `${dog.id}-g2-c2`,
      sire: mapParent(dog.dam.sire),
      dam: mapParent(dog.dam.dam),
    });
  }
  if (g2Cards.length > 0) {
    pedigree.push({ generation: 2, cards: g2Cards });
  }

  const g3Cards: BeagleDogProfilePedigreeCardDb[] = [];
  if (dog.sire?.sire) {
    g3Cards.push({
      id: `${dog.id}-g3-c1`,
      sire: mapParent(dog.sire.sire.sire),
      dam: mapParent(dog.sire.sire.dam),
    });
  }
  if (dog.sire?.dam) {
    g3Cards.push({
      id: `${dog.id}-g3-c2`,
      sire: mapParent(dog.sire.dam.sire),
      dam: mapParent(dog.sire.dam.dam),
    });
  }
  if (dog.dam?.sire) {
    g3Cards.push({
      id: `${dog.id}-g3-c3`,
      sire: mapParent(dog.dam.sire.sire),
      dam: mapParent(dog.dam.sire.dam),
    });
  }
  if (dog.dam?.dam) {
    g3Cards.push({
      id: `${dog.id}-g3-c4`,
      sire: mapParent(dog.dam.dam.sire),
      dam: mapParent(dog.dam.dam.dam),
    });
  }
  if (g3Cards.length > 0) {
    pedigree.push({ generation: 3, cards: g3Cards });
  }

  return {
    id: dog.id,
    name: dog.name,
    title: null,
    registrationNo: getPrimaryRegistrationNo(dog.registrations),
    registrationNos: dog.registrations.map(
      (registration) => registration.registrationNo,
    ),
    birthDate: dog.birthDate,
    sex: toSexCode(dog.sex),
    color: null,
    ekNo: dog.ekNo,
    inbreedingCoefficientPct: null,
    sire: mapParent(dog.sire),
    dam: mapParent(dog.dam),
    pedigree,
    shows: dog.showResults.map((show) => ({
      id: show.id,
      place: show.eventPlace,
      date: show.eventDate,
      result: show.resultText,
      judge: show.judge,
      heightCm: parseHeightCm(show.heightText),
    })),
    trials: dog.trialResults.map((trial) => ({
      id: trial.id,
      place: trial.eventPlace,
      date: trial.eventDate,
      weather: trial.ke,
      className: trial.eventName,
      classCode: trial.lk,
      rank: trial.sija,
      points: trial.piste ? trial.piste.toNumber() : null,
      award: trial.pa,
    })),
  };
}
