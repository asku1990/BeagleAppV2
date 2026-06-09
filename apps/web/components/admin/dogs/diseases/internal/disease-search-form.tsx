import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { LabeledSelect } from "@/components/ui/form-fields/labeled-select";
import { Input } from "@/components/ui/input";

export type DiseaseCodeOption = {
  diseaseCode: string | "all";
  label: string;
};

export type DiseaseSearchLabels = {
  filterLabel: string;
  queryLabel: string;
  queryPlaceholder: string;
  searchButton: string;
  createOpen: string;
};

export function DiseaseSearchForm({
  diseaseCode,
  query,
  diseaseCodeOptions,
  isPending,
  labels,
  onCreate,
  onSubmit,
}: {
  diseaseCode: string | null;
  query: string;
  diseaseCodeOptions: DiseaseCodeOption[];
  isPending: boolean;
  labels: DiseaseSearchLabels;
  onCreate: () => void;
  onSubmit: (input: { diseaseCode: string | null; query: string }) => void;
}) {
  const [draftDiseaseCode, setDraftDiseaseCode] = useState<string | null>(
    diseaseCode,
  );
  const [draftQuery, setDraftQuery] = useState(query);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      diseaseCode: draftDiseaseCode,
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
          label={labels.filterLabel}
          value={draftDiseaseCode ?? "all"}
          disabled={isPending}
          onChange={(event) => {
            setDraftDiseaseCode(
              event.target.value === "all" ? null : event.target.value,
            );
          }}
        >
          {diseaseCodeOptions.map((option) => (
            <option key={option.diseaseCode} value={option.diseaseCode}>
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
