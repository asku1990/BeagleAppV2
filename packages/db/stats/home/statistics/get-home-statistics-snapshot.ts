import { prisma } from "../../../core/prisma";

export type HomeStatisticsSnapshot = {
  registrations: {
    registeredDogs: number;
    youngestRegisteredBirthDate: Date | null;
  };
  trials: {
    resultsPeriodStart: Date | null;
    resultsPeriodEnd: Date | null;
    totalEntries: number;
    performedByDogs: number;
  };
  shows: {
    resultsPeriodStart: Date | null;
    resultsPeriodEnd: Date | null;
    totalEntries: number;
    performedByDogs: number;
  };
  generatedAt: Date;
};

export async function getHomeStatisticsSnapshot(): Promise<HomeStatisticsSnapshot> {
  const [
    registeredDogs,
    youngestBirthDate,
    trialTotalEntries,
    trialPerformedByDogs,
    trialDateRange,
    showTotalEntries,
    showPerformedByDogs,
    showDateRange,
  ] = await Promise.all([
    prisma.dog.count({
      where: {
        registrations: {
          some: {},
        },
      },
    }),
    prisma.dog.aggregate({
      where: {
        registrations: {
          some: {},
        },
      },
      _max: { birthDate: true },
    }),
    prisma.trialResult.count(),
    prisma.dog.count({
      where: {
        trialResults: {
          some: {},
        },
      },
    }),
    prisma.trialResult.aggregate({
      _min: { eventDate: true },
      _max: { eventDate: true },
    }),
    prisma.showResult.count(),
    prisma.dog.count({
      where: {
        showResults: {
          some: {},
        },
      },
    }),
    prisma.showResult.aggregate({
      _min: { eventDate: true },
      _max: { eventDate: true },
    }),
  ]);

  return {
    registrations: {
      registeredDogs,
      youngestRegisteredBirthDate: youngestBirthDate._max.birthDate,
    },
    trials: {
      resultsPeriodStart: trialDateRange._min.eventDate,
      resultsPeriodEnd: trialDateRange._max.eventDate,
      totalEntries: trialTotalEntries,
      performedByDogs: trialPerformedByDogs,
    },
    shows: {
      resultsPeriodStart: showDateRange._min.eventDate,
      resultsPeriodEnd: showDateRange._max.eventDate,
      totalEntries: showTotalEntries,
      performedByDogs: showPerformedByDogs,
    },
    generatedAt: new Date(),
  };
}
