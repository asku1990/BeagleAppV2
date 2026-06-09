import Link from "next/link";
import type { AdminDogDiseaseBrowseItem } from "@beagle/contracts";
import { AdminRowActionsMenu } from "@/components/admin";
import {
  formatCounts,
  formatPublicStatus,
  formatParentLine,
  formatRegistrationAndEk,
  formatSex,
  showDash,
} from "./disease-formatters";
import {
  buildDogProfileHref,
  type DiseaseResultsLabels,
} from "./disease-results-labels";

function DiseaseRowContent({
  row,
  labels,
  onDelete,
}: {
  row: AdminDogDiseaseBrowseItem;
  labels: DiseaseResultsLabels;
  onDelete: (row: AdminDogDiseaseBrowseItem) => void;
}) {
  const name = row.dogId ? (
    <Link
      href={buildDogProfileHref(row.dogId)}
      className="underline-offset-2 hover:underline"
    >
      {showDash(row.name)}
    </Link>
  ) : (
    <span>{labels.unknownName}</span>
  );

  return (
    <>
      <td className="px-2 py-2">{showDash(row.diseaseText)}</td>
      <td className="px-2 py-2">
        <div className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {row.evidenceKind === "DOG"
            ? labels.evidenceKind.dog
            : labels.evidenceKind.litter}
        </div>
      </td>
      <td className="px-2 py-2">
        {formatPublicStatus(row.public, labels.public)}
      </td>
      <td className="px-2 py-2">
        {row.dogId ? (
          <Link
            href={buildDogProfileHref(row.dogId)}
            className="underline-offset-2 hover:underline"
          >
            {formatRegistrationAndEk(row.registrationNo, row.ekNo)}
          </Link>
        ) : (
          <span>{formatRegistrationAndEk(row.registrationNo, row.ekNo)}</span>
        )}
      </td>
      <td className="px-2 py-2">{formatSex(row.sex, labels.sex)}</td>
      <td className="px-2 py-2">{name}</td>
      <td className="px-2 py-2">
        {formatCounts(row.trialCount, row.showCount)}
      </td>
      <td className="px-2 py-2 max-w-[22rem] whitespace-pre-wrap break-words">
        <div className="space-y-1">
          <p>
            <span className="text-muted-foreground">
              {labels.cardLabels.litter}:
            </span>{" "}
            {showDash(row.pentue)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {labels.cardLabels.description}:
            </span>{" "}
            {showDash(row.kuvaus)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {labels.cardLabels.source}:
            </span>{" "}
            {showDash(row.tietolahde)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {labels.cardLabels.other}:
            </span>{" "}
            {formatParentLine(row.sire, row.dam, labels.parents)}
          </p>
        </div>
      </td>
      <td className="px-2 py-2">
        <AdminRowActionsMenu
          triggerAriaLabel={labels.actions.more}
          actions={[
            {
              id: "delete",
              label: labels.actions.delete,
              onSelect: () => onDelete(row),
              destructive: true,
            },
          ]}
        />
      </td>
    </>
  );
}

export function DiseaseResultsTable({
  items,
  labels,
  onDelete,
}: {
  items: AdminDogDiseaseBrowseItem[];
  labels: DiseaseResultsLabels;
  onDelete: (row: AdminDogDiseaseBrowseItem) => void;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="px-2 py-2">{labels.tableHeaders.disease}</th>
          <th className="px-2 py-2">{labels.tableHeaders.evidenceKind}</th>
          <th className="px-2 py-2">{labels.tableHeaders.public}</th>
          <th className="px-2 py-2">{labels.tableHeaders.registration}</th>
          <th className="px-2 py-2">{labels.tableHeaders.sex}</th>
          <th className="px-2 py-2">{labels.tableHeaders.name}</th>
          <th className="px-2 py-2">{labels.tableHeaders.counts}</th>
          <th className="px-2 py-2">{labels.tableHeaders.metadata}</th>
          <th className="px-2 py-2">{labels.tableHeaders.actions}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((row) => (
          <tr key={row.id} className="border-b align-top">
            <DiseaseRowContent row={row} labels={labels} onDelete={onDelete} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
