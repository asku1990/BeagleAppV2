import Link from "next/link";
import type { AdminDogDiseaseBrowseItem } from "@beagle/contracts";
import { AdminRowActionsMenu } from "@/components/admin";
import { ListingResponsiveResults } from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCounts,
  formatPublicStatus,
  formatParentLine,
  formatRegistrationAndEk,
  formatSex,
  showDash,
} from "./disease-formatters";

type DiseaseResultsLabels = {
  empty: string;
  public: {
    yes: string;
    no: string;
  };
  evidenceKind: {
    dog: string;
    litter: string;
  };
  unknownName: string;
  sex: {
    male: string;
    female: string;
    unknown: string;
  };
  parents: {
    sire: string;
    dam: string;
  };
  tableHeaders: {
    disease: string;
    evidenceKind: string;
    public: string;
    registration: string;
    sex: string;
    name: string;
    counts: string;
    other: string;
    actions: string;
  };
  cardLabels: {
    public: string;
    registration: string;
    sex: string;
    name: string;
    counts: string;
    litter: string;
    description: string;
    source: string;
    other: string;
  };
  actions: {
    more: string;
    delete: string;
  };
};

function buildDogProfileHref(dogId: string): string {
  return `/admin/dogs/${encodeURIComponent(dogId)}/profile`;
}

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

function DiseaseCard({
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
    <Card>
      <CardContent className="space-y-2 pt-4 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-medium">{showDash(row.diseaseText)}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex rounded-full bg-muted px-2 py-0.5 font-medium">
                {row.evidenceKind === "DOG"
                  ? labels.evidenceKind.dog
                  : labels.evidenceKind.litter}
              </span>
              <span className="text-muted-foreground">
                {formatPublicStatus(row.public, labels.public)}
              </span>
            </div>
          </div>
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
        </div>
        <p>
          <span className="text-muted-foreground">
            {labels.cardLabels.registration}:
          </span>{" "}
          {row.dogId ? (
            <Link
              href={buildDogProfileHref(row.dogId)}
              className="underline-offset-2 hover:underline"
            >
              {formatRegistrationAndEk(row.registrationNo, row.ekNo)}
            </Link>
          ) : (
            formatRegistrationAndEk(row.registrationNo, row.ekNo)
          )}
        </p>
        <p>
          <span className="text-muted-foreground">
            {labels.cardLabels.sex}:
          </span>{" "}
          {formatSex(row.sex, labels.sex)}
        </p>
        <p>
          <span className="text-muted-foreground">
            {labels.cardLabels.name}:
          </span>{" "}
          {name}
        </p>
        <p>
          <span className="text-muted-foreground">
            {labels.cardLabels.counts}:
          </span>{" "}
          {formatCounts(row.trialCount, row.showCount)}
        </p>
        <p className="whitespace-pre-wrap break-words">
          <span className="text-muted-foreground">
            {labels.cardLabels.litter}:
          </span>{" "}
          {showDash(row.pentue)}
        </p>
        <p className="whitespace-pre-wrap break-words">
          <span className="text-muted-foreground">
            {labels.cardLabels.description}:
          </span>{" "}
          {showDash(row.kuvaus)}
        </p>
        <p className="whitespace-pre-wrap break-words">
          <span className="text-muted-foreground">
            {labels.cardLabels.source}:
          </span>{" "}
          {showDash(row.tietolahde)}
        </p>
        <p className="whitespace-pre-wrap break-words">
          <span className="text-muted-foreground">
            {labels.cardLabels.other}:
          </span>{" "}
          {formatParentLine(row.sire, row.dam, labels.parents)}
        </p>
      </CardContent>
    </Card>
  );
}

export function DiseaseResults({
  items,
  labels,
  onDelete,
}: {
  items: AdminDogDiseaseBrowseItem[];
  labels: DiseaseResultsLabels;
  onDelete: (row: AdminDogDiseaseBrowseItem) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{labels.empty}</p>;
  }

  return (
    <ListingResponsiveResults
      desktopClassName="overflow-x-auto"
      mobileClassName="space-y-3"
      desktop={
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
              <th className="px-2 py-2">{labels.tableHeaders.other}</th>
              <th className="px-2 py-2">{labels.tableHeaders.actions}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b align-top">
                <DiseaseRowContent
                  row={row}
                  labels={labels}
                  onDelete={onDelete}
                />
              </tr>
            ))}
          </tbody>
        </table>
      }
      mobile={items.map((row) => (
        <DiseaseCard
          key={row.id}
          row={row}
          labels={labels}
          onDelete={onDelete}
        />
      ))}
    />
  );
}
