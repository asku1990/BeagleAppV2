import type {
  DogProfile,
  DogProfilePedigreeCard,
  DogProfilePedigreeGeneration,
  DogProfileSeed,
  DogProfileSex,
} from "./types";

function createPedigreeCard(
  id: string,
  sireName: string,
  sireRegistrationNo: string | null,
  damName: string,
  damRegistrationNo: string | null,
): DogProfilePedigreeCard {
  return {
    id,
    sire: { name: sireName, registrationNo: sireRegistrationNo },
    dam: { name: damName, registrationNo: damRegistrationNo },
  };
}

function createPedigreeGeneration(
  generation: number,
  cards: DogProfilePedigreeCard[],
): DogProfilePedigreeGeneration {
  return { generation, cards };
}

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
    pedigree: [
      createPedigreeGeneration(1, [
        createPedigreeCard(
          "dog_1-g1-c1",
          "Metsäpolun Reino",
          "FI-901/18",
          "Korpiniityn Helmi",
          "FI-333/19",
        ),
      ]),
      createPedigreeGeneration(2, [
        createPedigreeCard(
          "dog_1-g2-c1",
          "Kallion Aatu",
          "FI-550/15",
          "Ajotuvan Heta",
          "FI-441/14",
        ),
        createPedigreeCard(
          "dog_1-g2-c2",
          "Harjuniityn Eetu",
          "FI-260/16",
          "Pihlajamäen Tinja",
          "FI-190/13",
        ),
      ]),
      createPedigreeGeneration(3, [
        createPedigreeCard(
          "dog_1-g3-c1",
          "Ajotuvan Uljas",
          "FI-420/12",
          "Peurarinteen Masi",
          "FI-301/09",
        ),
        createPedigreeCard(
          "dog_1-g3-c2",
          "Koivikon Sini",
          "FI-144/10",
          "Korven Ukko",
          "FI-220/06",
        ),
        createPedigreeCard(
          "dog_1-g3-c3",
          "Rantapellon Mira",
          "FI-101/07",
          "Korpisuon Manta",
          "FI-090/04",
        ),
        createPedigreeCard(
          "dog_1-g3-c4",
          "Metsämaan Roope",
          "FI-180/03",
          "Honkamäen Tara",
          "FI-155/02",
        ),
      ]),
    ],
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
    pedigree: [
      createPedigreeGeneration(1, [
        createPedigreeCard(
          "dog_2-g1-c1",
          "Kallion Reino",
          "FI-120/16",
          "Särkiniemen Tyyne",
          "FI-450/17",
        ),
      ]),
      createPedigreeGeneration(2, [
        createPedigreeCard(
          "dog_2-g2-c1",
          "Sotkamon Veikko",
          "FI-080/13",
          "Ajorinteen Pipsa",
          "FI-071/12",
        ),
        createPedigreeCard(
          "dog_2-g2-c2",
          "Katajaharjun Nelli",
          "FI-300/14",
          "Lammikon Lila",
          "FI-210/11",
        ),
      ]),
      createPedigreeGeneration(3, [
        createPedigreeCard(
          "dog_2-g3-c1",
          "Tuuliharjun Riku",
          "FI-041/07",
          "Puronvarren Topi",
          "FI-032/04",
        ),
        createPedigreeCard(
          "dog_2-g3-c2",
          "Eräpolun Nemo",
          "FI-020/01",
          "Aamukasteen Silja",
          "FI-099/02",
        ),
        createPedigreeCard(
          "dog_2-g3-c3",
          "Metsärannan Viivi",
          "FI-160/08",
          "Koivurannan Tessa",
          "FI-120/05",
        ),
        createPedigreeCard(
          "dog_2-g3-c4",
          "Rinneharjun Kaino",
          "FI-088/03",
          "Ketolammen Muru",
          "FI-066/01",
        ),
      ]),
    ],
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
    pedigree: [
      createPedigreeGeneration(1, [
        createPedigreeCard(
          "dog_3-g1-c1",
          "Granvikens Milo",
          "SE-300/18",
          "Metsälammen Tilda",
          "SE-200/17",
        ),
      ]),
      createPedigreeGeneration(2, [
        createPedigreeCard(
          "dog_3-g2-c1",
          "Granvikens Otto",
          "SE-201/15",
          "Nordjaktens Fia",
          "SE-199/14",
        ),
        createPedigreeCard(
          "dog_3-g2-c2",
          "Metsälammen Tova",
          "SE-140/14",
          "Skogsgläntans Helga",
          "SE-099/11",
        ),
      ]),
      createPedigreeGeneration(3, [
        createPedigreeCard(
          "dog_3-g3-c1",
          "Nordjaktens Dino",
          "SE-150/12",
          "Hagadalens Felix",
          "SE-101/09",
        ),
        createPedigreeCard(
          "dog_3-g3-c2",
          "Skogslyans Karo",
          "SE-077/06",
          "Sundtorps Rambo",
          "SE-050/03",
        ),
        createPedigreeCard(
          "dog_3-g3-c3",
          "Nordlyktans Mira",
          "SE-080/08",
          "Kvarnbackens Sessa",
          "SE-060/05",
        ),
        createPedigreeCard(
          "dog_3-g3-c4",
          "Tallåsens Alma",
          "SE-040/02",
          "Granängens Lova",
          "SE-030/01",
        ),
      ]),
    ],
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

function createPlaceholderPedigree(dogId: string): DogProfile["pedigree"] {
  return [
    createPedigreeGeneration(1, [
      createPedigreeCard(
        `${dogId}-g1-c1`,
        "LASAN LYLY",
        "SF14404/90",
        "SERI",
        "SF19439/90",
      ),
    ]),
    createPedigreeGeneration(2, [
      createPedigreeCard(
        `${dogId}-g2-c1`,
        "VILI",
        "SF13591H/82",
        "VILMA",
        "SF150332/82",
      ),
      createPedigreeCard(
        `${dogId}-g2-c2`,
        "BENNY",
        "SF05993T/85",
        "SABINA",
        "SF01341J/81",
      ),
    ]),
    createPedigreeGeneration(3, [
      createPedigreeCard(
        `${dogId}-g3-c1`,
        "PONTUS",
        "SF10409F/79",
        "TÄPLÄ",
        "SF15102L/75",
      ),
      createPedigreeCard(
        `${dogId}-g3-c2`,
        "DENIS",
        "SF13654H/77",
        "TUPU",
        "SF10159C/74",
      ),
      createPedigreeCard(
        `${dogId}-g3-c3`,
        "PEPE",
        "SF062732/79",
        "RESSU",
        "SF17598R/82",
      ),
      createPedigreeCard(
        `${dogId}-g3-c4`,
        "AKI",
        "SF169665/73",
        "KIPI",
        "SF213414/79",
      ),
    ]),
  ];
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
    pedigree: createPlaceholderPedigree(dogId),
    shows: createPlaceholderShows(dogId, seed.showCount ?? 0),
    trials: createPlaceholderTrials(dogId, seed.trialCount ?? 0),
  };
}
