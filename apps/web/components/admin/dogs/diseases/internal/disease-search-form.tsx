import { useState, type FormEvent } from "react";
import type { AdminDogDiseaseGroup } from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import { LabeledSelect } from "@/components/ui/form-fields/labeled-select";
import { Input } from "@/components/ui/input";

export type DiseaseGroupOption = {
  diseaseGroup: AdminDogDiseaseGroup | "all";
  label: string;
};

export type DiseaseSearchLabels = {
  groupFilterLabel: string;
  queryLabel: string;
  queryPlaceholder: string;
  searchButton: string;
  createOpen: string;
};

export function DiseaseSearchForm({
  diseaseGroup,
  query,
  diseaseGroupOptions,
  isPending,
  labels,
  onCreate,
  onSubmit,
}: {
  diseaseGroup: AdminDogDiseaseGroup | null;
  query: string;
  diseaseGroupOptions: DiseaseGroupOption[];
  isPending: boolean;
  labels: DiseaseSearchLabels;
  onCreate: () => void;
  onSubmit: (input: {
    diseaseGroup: AdminDogDiseaseGroup | null;
    query: string;
  }) => void;
}) {
  const [draftDiseaseGroup, setDraftDiseaseGroup] =
    useState<AdminDogDiseaseGroup | null>(diseaseGroup);
  const [draftQuery, setDraftQuery] = useState(query);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      diseaseGroup: draftDiseaseGroup,
      query: draftQuery,
    });
  };

  return (
    <form
      className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
      onSubmit={handleSearchSubmit}
    >
      <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(14rem,20rem)_minmax(16rem,1fr)]">
        <LabeledSelect
          label={labels.groupFilterLabel}
          value={draftDiseaseGroup ?? "all"}
          disabled={isPending}
          onChange={(event) => {
            setDraftDiseaseGroup(
              event.target.value === "all"
                ? null
                : (event.target.value as AdminDogDiseaseGroup),
            );
          }}
        >
          {diseaseGroupOptions.map((option) => (
            <option key={option.diseaseGroup} value={option.diseaseGroup}>
              {option.label}
            </option>
          ))}
        </LabeledSelect>
        <label className="space-y-1 text-sm font-medium">
          <span>{labels.queryLabel}</span>
          <Input
            value={draftQuery}
            disabled={isPending}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder={labels.queryPlaceholder}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {labels.searchButton}
        </Button>
        <Button type="button" onClick={onCreate}>
          {labels.createOpen}
        </Button>
      </div>
    </form>
  );
}
