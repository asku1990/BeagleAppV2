import Link from "next/link";
import type { AdminDogDiseaseBrowseItem } from "@beagle/contracts";
import { AdminRowActionsMenu } from "@/components/admin";
import { Card, CardContent } from "@/components/ui/card";
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

export function DiseaseCard({
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
        <p className="whitespace-pre-wrap wrap-break-word">
          <span className="text-muted-foreground">
            {labels.cardLabels.litter}:
          </span>{" "}
          {showDash(row.pentue)}
        </p>
        <p className="whitespace-pre-wrap wrap-break-word">
          <span className="text-muted-foreground">
            {labels.cardLabels.description}:
          </span>{" "}
          {showDash(row.kuvaus)}
        </p>
        <p className="whitespace-pre-wrap wrap-break-word">
          <span className="text-muted-foreground">
            {labels.cardLabels.source}:
          </span>{" "}
          {showDash(row.tietolahde)}
        </p>
        <p className="whitespace-pre-wrap wrap-break-word">
          <span className="text-muted-foreground">
            {labels.cardLabels.other}:
          </span>{" "}
          {formatParentLine(row.sire, row.dam, labels.parents)}
        </p>
      </CardContent>
    </Card>
  );
}
