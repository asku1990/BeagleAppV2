import type { BeagleSearchRow } from "@beagle/contracts";

type ClipboardLabels = {
  ek: string;
  registration: string;
  registrationAll: string;
  name: string;
  sex: string;
  birthDate: string;
  sire: string;
  dam: string;
  trials: string;
  shows: string;
  sexMale: string;
  sexFemale: string;
};

function sanitizeCell(value: string): string {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function formatSexLabel(row: BeagleSearchRow, labels: ClipboardLabels): string {
  if (row.sex === "U") return labels.sexMale;
  if (row.sex === "N") return labels.sexFemale;
  return row.sex;
}

export function formatBeagleRowsForClipboard(
  rows: BeagleSearchRow[],
  labels: ClipboardLabels,
): string {
  const header = [
    labels.registration,
    labels.registrationAll,
    labels.ek,
    labels.sex,
    labels.name,
    labels.birthDate,
    labels.sire,
    labels.dam,
    labels.trials,
    labels.shows,
  ];

  const body = rows.map((row) => {
    const additionalRegistrationNos = row.registrationNos.filter(
      (registrationNo) => registrationNo !== row.registrationNo,
    );

    return [
      row.registrationNo,
      additionalRegistrationNos.length > 0
        ? additionalRegistrationNos.join(", ")
        : "-",
      row.ekNo == null ? "-" : String(row.ekNo),
      formatSexLabel(row, labels),
      sanitizeCell(row.name),
      row.birthDate ? row.birthDate.slice(0, 10) : "-",
      sanitizeCell(row.sire),
      sanitizeCell(row.dam),
      String(row.trialCount),
      String(row.showCount),
    ];
  });

  return [header, ...body]
    .map((cells) => cells.map(sanitizeCell).join("\t"))
    .join("\n");
}
