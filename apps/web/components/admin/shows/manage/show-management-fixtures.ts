import type {
  EntryPatch,
  ManageShowEntry,
  ManageShowEvent,
} from "./show-management-types";

// Demo show data for the shell only.
// Replace this with admin show search/details API results once the backend exists.
export const INITIAL_EVENTS: ManageShowEvent[] = [
  {
    id: "show-2026-03-15-kouvola",
    eventDate: "2026-03-15",
    eventPlace: "Kouvola",
    eventCity: "Kouvola",
    eventName: "Kevätnäyttely",
    eventType: "NAYTTELY",
    organizer: "Kouvolan Kennelkerho",
    judge: "Anna Judge",
    entries: [
      {
        id: "entry-1",
        registrationNo: "FI12345/21",
        dogName: "Metsapolun Kide",
        judge: "Anna Judge",
        critiqueText: "Erittäin tasapainoinen esiintyminen.",
        heightCm: "38",
        showType: "SERT",
        classCode: "AVO",
        qualityGrade: "ERI",
        classPlacement: "1",
        pupn: "PU1",
        awards: ["SERT", "VSP"],
      },
      {
        id: "entry-2",
        registrationNo: "FI67890/22",
        dogName: "Korven Sisu",
        judge: "Anna Judge",
        critiqueText: "Hyvä rakenne, tarvitsee lisää massaa.",
        heightCm: "41",
        showType: "VSP",
        classCode: "VAL",
        qualityGrade: "EH",
        classPlacement: "2",
        pupn: "",
        awards: ["PU2"],
      },
    ],
  },
  {
    id: "show-2026-04-02-turku",
    eventDate: "2026-04-02",
    eventPlace: "Turku",
    eventCity: "Turku",
    eventName: "Kevätkarnevaali",
    eventType: "NAYTTELY",
    organizer: "Turun Beagle-yhdistys",
    judge: "Mikko Reviewer",
    entries: [
      {
        id: "entry-3",
        registrationNo: "FI88888/20",
        dogName: "Havupolun Helmi",
        judge: "Mikko Reviewer",
        critiqueText: "Rauhallinen ja varma esiintyminen.",
        heightCm: "36",
        showType: "",
        classCode: "JUN",
        qualityGrade: "ERI",
        classPlacement: "1",
        pupn: "PN1",
        awards: ["SERT", "CACIB"],
      },
    ],
  },
  {
    id: "show-2026-05-11-oulu",
    eventDate: "2026-05-11",
    eventPlace: "Oulu",
    eventCity: "Oulu",
    eventName: "Kevään mestaruus",
    eventType: "NAYTTELY",
    organizer: "Pohjoisen Beaglet",
    judge: "Sari Ring",
    entries: [
      {
        id: "entry-4",
        registrationNo: "FI55555/19",
        dogName: "Rinteen Taisto",
        judge: "Sari Ring",
        critiqueText: "Vahva liike, hyvä keskittyminen.",
        heightCm: "40",
        showType: "SERT",
        classCode: "NUO",
        qualityGrade: "ERI",
        classPlacement: "1",
        pupn: "",
        awards: ["ROP"],
      },
    ],
  },
];

export function includesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function formatAwards(awards: string[]): string {
  return awards.join(", ");
}

export function splitAwards(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function updateEntry(
  entries: ManageShowEntry[],
  entryId: string,
  patch: EntryPatch,
): ManageShowEntry[] {
  return entries.map((entry) =>
    entry.id === entryId ? { ...entry, ...patch } : entry,
  );
}

export function updateSelectedEvent(
  events: ManageShowEvent[],
  eventId: string,
  updater: (event: ManageShowEvent) => ManageShowEvent,
): ManageShowEvent[] {
  return events.map((event) => (event.id === eventId ? updater(event) : event));
}
