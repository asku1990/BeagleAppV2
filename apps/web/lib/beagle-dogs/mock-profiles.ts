import type { DogProfile, DogProfileSeed, DogProfileSex } from "./types";

const dogProfiles: DogProfile[] = [
  {
    id: "dog_1",
    name: "Ajometsän Aada",
    title: "FI KVA",
    registrationNo: "FI-11/24",
    registrationNos: ["FI-11/24", "SE-91/24"],
    birthDate: "2021-03-14",
    sex: "N",
    color: "Kolmivärinen",
    ekNo: 4123,
    inbreedingCoefficientPct: 2.73,
    sire: {
      name: "Metsäpolun Reino",
      registrationNo: "FI-901/18",
    },
    dam: {
      name: "Korpiniityn Helmi",
      registrationNo: "FI-333/19",
    },
    shows: [
      {
        id: "show_1",
        place: "Helsinki KV",
        date: "2024-08-17",
        result: "VAL-ERI SA PN2",
        judge: "Anna Tuominen",
        heightCm: 39,
      },
      {
        id: "show_2",
        place: "Tampere RN",
        date: "2023-05-28",
        result: "AVO-ERI SA PN1 SERT",
        judge: "Matti Virtanen",
        heightCm: 38,
      },
    ],
    trials: [
      {
        id: "trial_1",
        place: "Kuopio BEAJ",
        date: "2025-10-12",
        weather: "P",
        className: "Voi 1",
        rank: "2",
        points: 81.5,
      },
      {
        id: "trial_2",
        place: "Joensuu BEAJ",
        date: "2024-11-03",
        weather: "L",
        className: "Avo 2",
        rank: "5",
        points: 66,
      },
    ],
  },
  {
    id: "dog_2",
    name: "Korpisalon Ukko",
    title: null,
    registrationNo: "FI-77/23",
    registrationNos: ["FI-77/23"],
    birthDate: "2020-12-01",
    sex: "U",
    color: "Musta-valkoinen",
    ekNo: null,
    inbreedingCoefficientPct: 1.12,
    sire: {
      name: "Kallion Reino",
      registrationNo: "FI-120/16",
    },
    dam: {
      name: "Särkiniemen Tyyne",
      registrationNo: "FI-450/17",
    },
    shows: [],
    trials: [
      {
        id: "trial_3",
        place: "Oulu BEAJ",
        date: "2023-09-30",
        weather: "P",
        className: "Beaj 1",
        rank: "1",
        points: 84,
      },
    ],
  },
  {
    id: "dog_3",
    name: "Metsälammen Lyyli",
    title: "FI MVA",
    registrationNo: "SE-501/22",
    registrationNos: ["SE-501/22", "FI-401/23"],
    birthDate: "2019-07-09",
    sex: "N",
    color: null,
    ekNo: 5120,
    inbreedingCoefficientPct: null,
    sire: {
      name: "Granvikens Milo",
      registrationNo: "SE-300/18",
    },
    dam: {
      name: "Metsälammen Tilda",
      registrationNo: "SE-200/17",
    },
    shows: [
      {
        id: "show_3",
        place: "Turku KV",
        date: "2022-06-18",
        result: "VAL-EH",
        judge: "Sofia Lind",
        heightCm: null,
      },
    ],
    trials: [],
  },
];

export function getMockDogProfileById(dogId: string): DogProfile | null {
  const normalized = dogId.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return (
    dogProfiles.find((item) => item.id.trim().toLowerCase() === normalized) ??
    null
  );
}

function parseSex(value: string): DogProfileSex {
  if (value === "U" || value === "N") {
    return value;
  }

  return "-";
}

function parseCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

function createPlaceholderShows(
  dogId: string,
  showCount: number,
): DogProfile["shows"] {
  const safeCount = Math.min(3, parseCount(showCount));

  return Array.from({ length: safeCount }).map((_, index) => ({
    id: `${dogId}-seed-show-${index + 1}`,
    place: `Mock Show ${index + 1}`,
    date: "2024-06-01",
    result: "AVO-EH",
    judge: "Mock Judge",
    heightCm: null,
  }));
}

function createPlaceholderTrials(
  dogId: string,
  trialCount: number,
): DogProfile["trials"] {
  const safeCount = Math.min(3, parseCount(trialCount));

  return Array.from({ length: safeCount }).map((_, index) => ({
    id: `${dogId}-seed-trial-${index + 1}`,
    place: `Mock Trial ${index + 1}`,
    date: "2024-11-01",
    weather: "P",
    className: "Beaj 1",
    rank: `${index + 1}`,
    points: 70 + index,
  }));
}

export function createSeedDogProfile(
  dogId: string,
  seed: Partial<DogProfileSeed>,
): DogProfile | null {
  const name = seed.name?.trim() ?? "";
  const registrationNo = seed.registrationNo?.trim() ?? "";

  if (!name || !registrationNo) {
    return null;
  }

  return {
    id: dogId,
    name,
    title: null,
    registrationNo,
    registrationNos: [registrationNo],
    birthDate: null,
    sex: parseSex(seed.sex ?? "-"),
    color: null,
    ekNo: seed.ekNo ?? null,
    inbreedingCoefficientPct: null,
    sire: null,
    dam: null,
    shows: createPlaceholderShows(dogId, seed.showCount ?? 0),
    trials: createPlaceholderTrials(dogId, seed.trialCount ?? 0),
  };
}
