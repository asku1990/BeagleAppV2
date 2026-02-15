import {
  buildLegacyPattern,
  matchesLegacyLike,
  resolvePrimarySearchMode,
  type BeaglePrimarySearchMode,
} from "./legacy-like-match";

export type BeagleSearchSort =
  | "birth-desc"
  | "name-asc"
  | "reg-desc"
  | "created-desc";

export type BeagleSearchQueryState = {
  ek: string;
  reg: string;
  name: string;
  page: number;
  sort: BeagleSearchSort;
  adv: boolean;
};

export type BeagleSearchQuickAction =
  | "pedigree"
  | "trials"
  | "siblings"
  | "offspring";

export type BeagleSearchResultRow = {
  id: string;
  ekNo: number | null;
  registrationNo: string;
  createdAt: string;
  sex: "U" | "N";
  name: string;
  birthDate: string;
  sire: string;
  dam: string;
  trialCount: number;
  showCount: number;
};

export type BeagleNewestDogItem = Pick<
  BeagleSearchResultRow,
  "id" | "name" | "registrationNo" | "sex" | "birthDate"
>;

export type BeagleSearchComputation = {
  mode: BeaglePrimarySearchMode;
  total: number;
  totalPages: number;
  page: number;
  items: BeagleSearchResultRow[];
};

export const BEAGLE_PAGE_SIZE = 10;

export const BEAGLE_ROW_ACTIONS: BeagleSearchQuickAction[] = [
  "pedigree",
  "trials",
  "siblings",
  "offspring",
];

const MOCK_BEAGLE_ROWS_BASE: Omit<BeagleSearchResultRow, "createdAt">[] = [
  {
    id: "dog-001",
    ekNo: 120,
    registrationNo: "FI12345/24",
    sex: "U",
    name: "AJO-HAUKUN SAKU",
    birthDate: "2024-05-14",
    sire: "FI99881/20 JÄNISVUOREN VIKI",
    dam: "FI77652/21 METSÄPOLUN MINTTU",
    trialCount: 2,
    showCount: 1,
  },
  {
    id: "dog-002",
    ekNo: 1200,
    registrationNo: "FI22331/24",
    sex: "N",
    name: "ANLEE SAKU",
    birthDate: "2024-04-02",
    sire: "FI99881/20 JÄNISVUOREN VIKI",
    dam: "FI11112/21 HAVUKORVEN HELMI",
    trialCount: 0,
    showCount: 2,
  },
  {
    id: "dog-003",
    ekNo: null,
    registrationNo: "FI30110/24",
    sex: "U",
    name: "HAKU",
    birthDate: "2024-03-01",
    sire: "FI88221/19 KALLION RIKI",
    dam: "FI77881/20 SORJON SIRU",
    trialCount: 1,
    showCount: 0,
  },
  {
    id: "dog-004",
    ekNo: 1201,
    registrationNo: "FI14320/23",
    sex: "N",
    name: "SAKU",
    birthDate: "2023-11-23",
    sire: "FI55331/18 HIRVIKANGAS JERI",
    dam: "FI90112/19 VILLIKON VILMA",
    trialCount: 3,
    showCount: 1,
  },
  {
    id: "dog-005",
    ekNo: 141,
    registrationNo: "FI55110/23",
    sex: "U",
    name: "KORVEN KALLE",
    birthDate: "2023-10-15",
    sire: "FI11009/18 KAJON RANE",
    dam: "FI22331/19 KULKURIN KERTTU",
    trialCount: 4,
    showCount: 0,
  },
  {
    id: "dog-006",
    ekNo: 305,
    registrationNo: "FI88100/23",
    sex: "N",
    name: "METSÄPOLUN MINTTU",
    birthDate: "2023-09-09",
    sire: "FI33098/17 AJOMESTARIN JOJO",
    dam: "FI90870/18 OJANIITYN HELGA",
    trialCount: 2,
    showCount: 4,
  },
  {
    id: "dog-007",
    ekNo: 307,
    registrationNo: "FI10110/23",
    sex: "U",
    name: "AJOMESTARIN ARVO",
    birthDate: "2023-08-29",
    sire: "FI78787/16 PUSKAN PEIKKO",
    dam: "FI56565/17 AJOMESTARIN ELLA",
    trialCount: 1,
    showCount: 1,
  },
  {
    id: "dog-008",
    ekNo: null,
    registrationNo: "FI23232/23",
    sex: "N",
    name: "MÄNTYRINTEEN MAIJA",
    birthDate: "2023-08-01",
    sire: "FI77881/17 SYDÄNMETSÄN SULO",
    dam: "FI98989/18 MÄNTYRINTEEN MALLA",
    trialCount: 0,
    showCount: 1,
  },
  {
    id: "dog-009",
    ekNo: 512,
    registrationNo: "FI44440/23",
    sex: "U",
    name: "JÄNISPOLUN JUSSI",
    birthDate: "2023-07-20",
    sire: "FI45454/16 TASSUKALLION TANE",
    dam: "FI56566/18 JÄNISPOLUN JULIA",
    trialCount: 5,
    showCount: 2,
  },
  {
    id: "dog-010",
    ekNo: 513,
    registrationNo: "FI44441/23",
    sex: "N",
    name: "JÄNISPOLUN JULIA",
    birthDate: "2023-07-20",
    sire: "FI45454/16 TASSUKALLION TANE",
    dam: "FI56566/18 JÄNISPOLUN JULIA",
    trialCount: 2,
    showCount: 3,
  },
  {
    id: "dog-011",
    ekNo: 730,
    registrationNo: "FI91919/22",
    sex: "U",
    name: "HAVUKORVEN HARRY",
    birthDate: "2022-12-12",
    sire: "FI99191/15 HAVUKORVEN HURMA",
    dam: "FI71717/16 HAVUKORVEN HILLA",
    trialCount: 7,
    showCount: 2,
  },
  {
    id: "dog-012",
    ekNo: 731,
    registrationNo: "FI92929/22",
    sex: "N",
    name: "HAVUKORVEN HILLA",
    birthDate: "2022-10-30",
    sire: "FI10101/15 KORPIMETSÄN KIPU",
    dam: "FI20202/16 HAVUKORVEN HELI",
    trialCount: 1,
    showCount: 5,
  },
  {
    id: "dog-013",
    ekNo: null,
    registrationNo: "FI12121/22",
    sex: "U",
    name: "METSÄMÄEN MANU",
    birthDate: "2022-09-01",
    sire: "FI31313/14 RASTIN RALLI",
    dam: "FI41414/15 METSÄMÄEN MILLA",
    trialCount: 3,
    showCount: 1,
  },
  {
    id: "dog-014",
    ekNo: 880,
    registrationNo: "FI78780/22",
    sex: "N",
    name: "SUVANNON SIRU",
    birthDate: "2022-06-14",
    sire: "FI51515/14 SUVANNON SULO",
    dam: "FI61616/15 SUVANNON SEIJA",
    trialCount: 0,
    showCount: 4,
  },
  {
    id: "dog-015",
    ekNo: 990,
    registrationNo: "FI30303/21",
    sex: "U",
    name: "RIIHIKANKAAN RALLI",
    birthDate: "2021-11-22",
    sire: "FI70707/13 RIIHIKANKAAN RONI",
    dam: "FI80808/14 RIIHIKANKAAN RUUSA",
    trialCount: 8,
    showCount: 1,
  },
  {
    id: "dog-016",
    ekNo: 991,
    registrationNo: "FI40404/21",
    sex: "N",
    name: "RIIHIKANKAAN RUUSA",
    birthDate: "2021-10-01",
    sire: "FI70707/13 RIIHIKANKAAN RONI",
    dam: "FI90909/14 RIIHIKANKAAN RITA",
    trialCount: 2,
    showCount: 6,
  },
  {
    id: "dog-017",
    ekNo: 1002,
    registrationNo: "FI50505/21",
    sex: "U",
    name: "KALLIOPOLUN KASPER",
    birthDate: "2021-09-11",
    sire: "FI11111/13 KALLIOPOLUN KARI",
    dam: "FI22222/14 KALLIOPOLUN KANELI",
    trialCount: 4,
    showCount: 0,
  },
  {
    id: "dog-018",
    ekNo: null,
    registrationNo: "FI60606/21",
    sex: "N",
    name: "KALLIOPOLUN KANELI",
    birthDate: "2021-08-09",
    sire: "FI33333/13 SALON SALAMA",
    dam: "FI44444/14 KALLIOPOLUN KERTTU",
    trialCount: 1,
    showCount: 3,
  },
  {
    id: "dog-019",
    ekNo: 1101,
    registrationNo: "FI70770/20",
    sex: "U",
    name: "METSÄN ÄSSÄ",
    birthDate: "2020-12-24",
    sire: "FI12111/12 METSÄN MIES",
    dam: "FI34333/13 METSÄN MANTA",
    trialCount: 9,
    showCount: 1,
  },
  {
    id: "dog-020",
    ekNo: 1102,
    registrationNo: "FI71771/20",
    sex: "N",
    name: "METSÄN MANTA",
    birthDate: "2020-11-19",
    sire: "FI12111/12 METSÄN MIES",
    dam: "FI45444/13 METSÄN MINNA",
    trialCount: 2,
    showCount: 4,
  },
  {
    id: "dog-021",
    ekNo: 1202,
    registrationNo: "FI88880/19",
    sex: "U",
    name: "KOSKIKORVEN KIPU",
    birthDate: "2019-09-03",
    sire: "FI56555/11 KOSKIKORVEN KALLE",
    dam: "FI67666/12 KOSKIKORVEN KATJA",
    trialCount: 6,
    showCount: 2,
  },
  {
    id: "dog-022",
    ekNo: null,
    registrationNo: "FI89881/19",
    sex: "N",
    name: "KOSKIKORVEN KATJA",
    birthDate: "2019-07-18",
    sire: "FI56555/11 KOSKIKORVEN KALLE",
    dam: "FI78777/12 KOSKIKORVEN KIRSI",
    trialCount: 3,
    showCount: 2,
  },
  {
    id: "dog-023",
    ekNo: 1300,
    registrationNo: "FI99990/18",
    sex: "U",
    name: "PÄIVÄRINTEEN PEKKA",
    birthDate: "2018-05-05",
    sire: "FI98998/10 PÄIVÄRINTEEN PASI",
    dam: "FI87887/11 PÄIVÄRINTEEN PINJA",
    trialCount: 10,
    showCount: 0,
  },
  {
    id: "dog-024",
    ekNo: 1301,
    registrationNo: "FI99991/18",
    sex: "N",
    name: "PÄIVÄRINTEEN PINJA",
    birthDate: "2018-05-05",
    sire: "FI98998/10 PÄIVÄRINTEEN PASI",
    dam: "FI87887/11 PÄIVÄRINTEEN PIA",
    trialCount: 1,
    showCount: 6,
  },
];

const MOCK_BEAGLE_ROWS: BeagleSearchResultRow[] = MOCK_BEAGLE_ROWS_BASE.map(
  (row, index) => ({
    ...row,
    // Mock insertion timestamp for "newest additions" ordering.
    createdAt: new Date(
      Date.UTC(2026, 0, 1) - index * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }),
);

const DEFAULT_SORT: BeagleSearchSort = "name-asc";

function compareByBirthDesc(
  left: BeagleSearchResultRow,
  right: BeagleSearchResultRow,
): number {
  const dateComparison =
    new Date(right.birthDate).getTime() - new Date(left.birthDate).getTime();

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return left.registrationNo.localeCompare(right.registrationNo, "fi");
}

function compareByNameAsc(
  left: BeagleSearchResultRow,
  right: BeagleSearchResultRow,
): number {
  const nameComparison = left.name.localeCompare(right.name, "fi");
  if (nameComparison !== 0) {
    return nameComparison;
  }

  return left.registrationNo.localeCompare(right.registrationNo, "fi");
}

function parseRegistrationOrder(registrationNo: string): {
  year: number;
  sequence: number;
} {
  const match = registrationNo.match(/^[A-Z]{2}(\d+)\/(\d{2})$/i);
  if (!match) {
    return { year: 0, sequence: 0 };
  }

  return {
    year: 2000 + Number.parseInt(match[2], 10),
    sequence: Number.parseInt(match[1], 10),
  };
}

function compareByRegistrationDesc(
  left: BeagleSearchResultRow,
  right: BeagleSearchResultRow,
): number {
  const leftOrder = parseRegistrationOrder(left.registrationNo);
  const rightOrder = parseRegistrationOrder(right.registrationNo);

  if (rightOrder.year !== leftOrder.year) {
    return rightOrder.year - leftOrder.year;
  }

  if (rightOrder.sequence !== leftOrder.sequence) {
    return rightOrder.sequence - leftOrder.sequence;
  }

  return left.registrationNo.localeCompare(right.registrationNo, "fi");
}

function compareByCreatedAtDesc(
  left: BeagleSearchResultRow,
  right: BeagleSearchResultRow,
): number {
  const dateComparison =
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

  if (dateComparison !== 0) {
    return dateComparison;
  }

  const registrationComparison = compareByRegistrationDesc(left, right);
  if (registrationComparison !== 0) {
    return registrationComparison;
  }

  return compareByBirthDesc(left, right);
}

function sortRows(
  rows: BeagleSearchResultRow[],
  sort: BeagleSearchSort,
): BeagleSearchResultRow[] {
  const sortable = [...rows];
  if (sort === "created-desc") {
    return sortable.sort(compareByCreatedAtDesc);
  }
  if (sort === "reg-desc") {
    return sortable.sort(compareByRegistrationDesc);
  }
  if (sort === "name-asc") {
    return sortable.sort(compareByNameAsc);
  }

  return sortable.sort(compareByBirthDesc);
}

export function getNewestDogs(limit = 10): BeagleNewestDogItem[] {
  return sortRows(MOCK_BEAGLE_ROWS, "birth-desc")
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      name: row.name,
      registrationNo: row.registrationNo,
      sex: row.sex,
      birthDate: row.birthDate,
    }));
}

export function getNewestDogRows(limit = 10): BeagleSearchResultRow[] {
  return [...MOCK_BEAGLE_ROWS].sort(compareByCreatedAtDesc).slice(0, limit);
}

function resolveSearchFieldValue(
  row: BeagleSearchResultRow,
  mode: Exclude<BeaglePrimarySearchMode, "none" | "invalid">,
): string {
  if (mode === "ek") {
    return row.ekNo == null ? "" : String(row.ekNo);
  }

  if (mode === "reg") {
    return row.registrationNo;
  }

  return row.name;
}

function filterRowsByQuery(
  rows: BeagleSearchResultRow[],
  state: BeagleSearchQueryState,
): BeagleSearchResultRow[] {
  const activeFields: Array<{
    field: Exclude<BeaglePrimarySearchMode, "none" | "invalid" | "combined">;
    pattern: string;
  }> = (["ek", "reg", "name"] as const)
    .map((field) => ({
      field,
      pattern: buildLegacyPattern(field, state[field]),
    }))
    .filter((entry) => entry.pattern.length > 0);

  return rows.filter((row) =>
    activeFields.every(({ field, pattern }) =>
      matchesLegacyLike(resolveSearchFieldValue(row, field), pattern),
    ),
  );
}

export function computeBeagleSearchResults(
  state: BeagleSearchQueryState,
): BeagleSearchComputation {
  const mode = resolvePrimarySearchMode({
    ek: state.ek,
    reg: state.reg,
    name: state.name,
  });

  if (mode === "none") {
    return {
      mode,
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    };
  }

  const filteredRows = sortRows(
    filterRowsByQuery(MOCK_BEAGLE_ROWS, state),
    state.sort || DEFAULT_SORT,
  );

  const total = filteredRows.length;
  const totalPages = Math.ceil(total / BEAGLE_PAGE_SIZE);
  const page =
    totalPages === 0
      ? 1
      : Math.min(Math.max(1, state.page || 1), Math.max(totalPages, 1));
  const start = (page - 1) * BEAGLE_PAGE_SIZE;

  return {
    mode,
    total,
    totalPages,
    page,
    items: filteredRows.slice(start, start + BEAGLE_PAGE_SIZE),
  };
}
