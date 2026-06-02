import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  AdminDogDiseaseBrowseFilterOption,
  CreateAdminDogDiseaseRequest,
} from "@beagle/contracts";
import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LabeledSelect } from "@/components/ui/form-fields/labeled-select";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import {
  createInitialDiseaseFormValues,
  isCreateDiseaseSubmitDisabled,
  toCreateDiseaseRequest,
  type DiseaseCreateLabels,
} from "./create-disease-form-state";

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-1 text-xs">
      <span className={beagleTheme.mutedText}>{label}</span>
      {children}
    </label>
  );
}

export function CreateDiseaseModal({
  open,
  diseaseOptions,
  selectedDiseaseCode,
  labels,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  diseaseOptions: AdminDogDiseaseBrowseFilterOption[];
  selectedDiseaseCode: string | null | undefined;
  labels: DiseaseCreateLabels;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: CreateAdminDogDiseaseRequest) => void | Promise<void>;
}) {
  const initialValues = useMemo(
    () => createInitialDiseaseFormValues(diseaseOptions, selectedDiseaseCode),
    [diseaseOptions, selectedDiseaseCode],
  );
  const [values, setValues] = useState(initialValues);

  const isSubmitDisabled = isCreateDiseaseSubmitDisabled(values, isSubmitting);

  return (
    <AdminFormModalShell
      open={open}
      onClose={onClose}
      contentClassName="max-h-[90vh] max-w-xl overflow-y-auto"
      title={labels.title}
      ariaLabel={labels.aria}
      footer={
        <>
          <Button
            type="button"
            onClick={() => void onSubmit(toCreateDiseaseRequest(values))}
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? labels.saving : labels.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {labels.cancel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>{labels.mode}</span>
          <div className="grid grid-cols-2 gap-2">
            {(["DOG", "LITTER"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                variant={values.evidenceKind === mode ? "default" : "outline"}
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    evidenceKind: mode,
                  }))
                }
                disabled={isSubmitting}
              >
                {mode === "DOG" ? labels.modeDog : labels.modeLitter}
              </Button>
            ))}
          </div>
        </div>

        <LabeledSelect
          label={labels.disease}
          value={values.diseaseCode}
          disabled={isSubmitting || diseaseOptions.length === 0}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              diseaseCode: event.target.value,
            }))
          }
        >
          {diseaseOptions.map((option) => (
            <option key={option.diseaseCode} value={option.diseaseCode}>
              {option.diseaseText}
            </option>
          ))}
        </LabeledSelect>

        <FieldLabel label={labels.registration}>
          <Input
            value={values.registrationNo}
            disabled={isSubmitting}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                registrationNo: event.target.value,
              }))
            }
          />
        </FieldLabel>

        {values.evidenceKind === "LITTER" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label={labels.sire}>
              <Input
                value={values.sireRegistrationNo}
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    sireRegistrationNo: event.target.value,
                  }))
                }
              />
            </FieldLabel>
            <FieldLabel label={labels.dam}>
              <Input
                value={values.damRegistrationNo}
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    damRegistrationNo: event.target.value,
                  }))
                }
              />
            </FieldLabel>
          </div>
        ) : null}

        <FieldLabel label={labels.litter}>
          <Input
            value={values.litter}
            disabled={isSubmitting}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                litter: event.target.value,
              }))
            }
          />
        </FieldLabel>

        <FieldLabel label={labels.description}>
          <textarea
            value={values.description}
            disabled={isSubmitting}
            rows={4}
            className={cn(
              "w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            )}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </FieldLabel>

        <FieldLabel label={labels.source}>
          <Input
            value={values.source}
            disabled={isSubmitting}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                source: event.target.value,
              }))
            }
          />
        </FieldLabel>

        <LabeledSelect
          label={labels.public}
          value={values.public ? "1" : "0"}
          disabled={isSubmitting}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              public: event.target.value === "1",
            }))
          }
        >
          <option value="0">{labels.publicNo}</option>
          <option value="1">{labels.publicYes}</option>
        </LabeledSelect>
      </div>
    </AdminFormModalShell>
  );
}
