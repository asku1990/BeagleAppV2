import type { AdminDogDiseaseBrowseItem } from "@beagle/contracts";
import { ListingResponsiveResults } from "@/components/listing";
import { DiseaseCard } from "./disease-results-card";
import { DiseaseResultsTable } from "./disease-results-table";
import type { DiseaseResultsLabels } from "./disease-results-labels";

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
        <DiseaseResultsTable
          items={items}
          labels={labels}
          onDelete={onDelete}
        />
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
