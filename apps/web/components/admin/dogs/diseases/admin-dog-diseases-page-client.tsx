"use client";

import { useMemo } from "react";
import type { AdminDogDiseaseBrowseResponse } from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LabeledSelect } from "@/components/ui/form-fields/labeled-select";
import { useAdminDogDiseasesUiState } from "@/hooks/admin/dogs/diseases";
import { useAdminDogDiseasesQuery } from "@/queries/admin/dogs";
import { DiseaseResults } from "./internal/disease-results";

type Props = {
  initialData?: AdminDogDiseaseBrowseResponse | null;
};

export function AdminDogDiseasesPageClient({ initialData }: Props) {
  const initialDiseaseCode = initialData
    ? initialData.selectedDiseaseCode
    : "epi";
  const { diseaseCode, page, isPending, setDiseaseCode, setPage } =
    useAdminDogDiseasesUiState({
      initialDiseaseCode,
    });

  const queryInitialData = useMemo(() => {
    if (!initialData) {
      return undefined;
    }

    if (initialData.selectedDiseaseCode !== diseaseCode) {
      return undefined;
    }

    if (initialData.page !== page) {
      return undefined;
    }

    return initialData;
  }, [diseaseCode, initialData, page]);

  const query = useAdminDogDiseasesQuery({
    diseaseCode,
    page,
    initialData: queryInitialData,
  });

  const data = query.data ?? queryInitialData ?? null;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? page;
  const allDiseaseCount = useMemo(() => {
    return (
      data?.diseaseOptions.reduce((sum, option) => sum + option.count, 0) ?? 0
    );
  }, [data?.diseaseOptions]);

  const diseaseOptions = useMemo(() => {
    const options = data?.diseaseOptions ?? [];
    return [
      { diseaseCode: "all", diseaseText: "Kaikki", count: allDiseaseCount },
      ...options,
    ];
  }, [allDiseaseCount, data?.diseaseOptions]);

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sairaustiedot</h1>
        <p className="text-sm text-muted-foreground">
          Haulla löytyi {total} sairausriviä.
        </p>
      </div>

      <ListingSectionShell title="Sairaustiedot">
        <div className="space-y-4">
          <div className="max-w-sm">
            <LabeledSelect
              label="Rajaus"
              value={diseaseCode ?? "all"}
              disabled={isPending}
              onChange={(event) => {
                setDiseaseCode(
                  event.target.value === "all" ? null : event.target.value,
                );
              }}
            >
              {diseaseOptions.map((option) => (
                <option key={option.diseaseCode} value={option.diseaseCode}>
                  {`${option.diseaseText} ${option.count} kpl`}
                </option>
              ))}
            </LabeledSelect>
          </div>

          {query.isLoading ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                Ladataan sairaustietoja...
              </CardContent>
            </Card>
          ) : null}

          {query.isError ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive">
                {query.error instanceof Error
                  ? query.error.message
                  : "Sairaustietojen lataaminen epäonnistui."}
              </CardContent>
            </Card>
          ) : null}

          {!query.isLoading && !query.isError ? (
            <DiseaseResults items={items} />
          ) : null}

          {totalPages > 1 && !query.isLoading && !query.isError ? (
            <div className="flex items-center gap-2 text-sm">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isPending}
                onClick={() => setPage(currentPage - 1)}
              >
                Edellinen
              </Button>
              <span>
                Sivu {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => setPage(currentPage + 1)}
              >
                Seuraava
              </Button>
            </div>
          ) : null}
        </div>
      </ListingSectionShell>
    </div>
  );
}
