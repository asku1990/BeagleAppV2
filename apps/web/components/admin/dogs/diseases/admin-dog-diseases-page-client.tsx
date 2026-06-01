"use client";

import { useMemo } from "react";
import type {
  AdminDogDiseaseBrowseItem,
  AdminDogDiseaseBrowseResponse,
} from "@beagle/contracts";
import {
  ListingSectionShell,
  ListingResponsiveResults,
} from "@/components/listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LabeledSelect } from "@/components/ui/form-fields/labeled-select";
import { useAdminDogDiseasesUiState } from "@/hooks/admin/dogs/diseases";
import { useAdminDogDiseasesQuery } from "@/queries/admin/dogs";
import Link from "next/link";
const UNKNOWN_VALUE = "-";

type Props = {
  initialData?: AdminDogDiseaseBrowseResponse | null;
};

function showDash(value: string | number | null | undefined): string {
  if (value == null) {
    return UNKNOWN_VALUE;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : UNKNOWN_VALUE;
}

function formatSex(sex: AdminDogDiseaseBrowseItem["sex"]): string {
  if (sex === "MALE") {
    return "Uros";
  }

  if (sex === "FEMALE") {
    return "Narttu";
  }

  if (sex === "UNKNOWN") {
    return "Tuntematon";
  }

  return UNKNOWN_VALUE;
}

function formatCounts(
  trialCount: number | null,
  showCount: number | null,
): string {
  return `${showDash(trialCount)} / ${showDash(showCount)}`;
}

function formatRegistrationAndEk(
  registrationNo: string,
  ekNo: number | null,
): string {
  const ekText = ekNo == null ? UNKNOWN_VALUE : `EK ${ekNo}`;
  return `${showDash(registrationNo)} / ${ekText}`;
}

function formatParentLine(
  sire: AdminDogDiseaseBrowseItem["sire"],
  dam: AdminDogDiseaseBrowseItem["dam"],
): string {
  const formatParent = (label: string, parent: typeof sire) => {
    const name = parent.name?.trim() || UNKNOWN_VALUE;
    const registrationNo = showDash(parent.registrationNo);
    return `${label}: ${name} (${registrationNo})`;
  };

  return `${formatParent("I", sire)} | ${formatParent("E", dam)}`;
}

function buildDogProfileHref(dogId: string): string {
  return `/admin/dogs/${encodeURIComponent(dogId)}/profile`;
}

function DiseaseRowContent({ row }: { row: AdminDogDiseaseBrowseItem }) {
  const name = row.dogId ? (
    <Link
      href={buildDogProfileHref(row.dogId)}
      className="underline-offset-2 hover:underline"
    >
      {showDash(row.name)}
    </Link>
  ) : (
    <span>{row.name}</span>
  );

  const registration = row.dogId ? (
    <Link
      href={buildDogProfileHref(row.dogId)}
      className="underline-offset-2 hover:underline"
    >
      {formatRegistrationAndEk(row.registrationNo, row.ekNo)}
    </Link>
  ) : (
    <span>{formatRegistrationAndEk(row.registrationNo, row.ekNo)}</span>
  );

  return (
    <>
      <td className="px-2 py-2">{showDash(row.diseaseText)}</td>
      <td className="px-2 py-2">{row.public ? "Kyllä" : "Ei"}</td>
      <td className="px-2 py-2">{registration}</td>
      <td className="px-2 py-2">{formatSex(row.sex)}</td>
      <td className="px-2 py-2">{name}</td>
      <td className="px-2 py-2">
        {formatCounts(row.trialCount, row.showCount)}
      </td>
      <td className="px-2 py-2 max-w-[20rem] whitespace-pre-wrap">
        {formatParentLine(row.sire, row.dam)}
      </td>
    </>
  );
}

function DiseaseCard({ row }: { row: AdminDogDiseaseBrowseItem }) {
  const name = row.dogId ? (
    <Link
      href={buildDogProfileHref(row.dogId)}
      className="underline-offset-2 hover:underline"
    >
      {showDash(row.name)}
    </Link>
  ) : (
    <span>{row.name}</span>
  );

  return (
    <Card>
      <CardContent className="space-y-2 pt-4 text-sm">
        <div className="space-y-1">
          <p className="font-medium">{showDash(row.diseaseText)}</p>
          <p className="text-muted-foreground">
            {row.public ? "Julkinen" : "Ei julkinen"}
          </p>
        </div>
        <p>
          <span className="text-muted-foreground">Rekisteri- ja EK-nro:</span>{" "}
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
          <span className="text-muted-foreground">S:</span> {formatSex(row.sex)}
        </p>
        <p>
          <span className="text-muted-foreground">Nimi:</span> {name}
        </p>
        <p>
          <span className="text-muted-foreground">Ko/Nä:</span>{" "}
          {formatCounts(row.trialCount, row.showCount)}
        </p>
        <p className="whitespace-pre-wrap">
          <span className="text-muted-foreground">Muut tiedot:</span>{" "}
          {formatParentLine(row.sire, row.dam)}
        </p>
      </CardContent>
    </Card>
  );
}

function DiseaseResults({ items }: { items: AdminDogDiseaseBrowseItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ei sairaustietoja valitulla rajauksella.
      </p>
    );
  }

  return (
    <ListingResponsiveResults
      desktopClassName="overflow-x-auto"
      mobileClassName="space-y-3"
      desktop={
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2">Terveystieto</th>
              <th className="px-2 py-2">Julkinen</th>
              <th className="px-2 py-2">Rekisteri- ja EK-nro</th>
              <th className="px-2 py-2">S</th>
              <th className="px-2 py-2">Nimi</th>
              <th className="px-2 py-2">Ko/Nä</th>
              <th className="px-2 py-2">Muut tiedot</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b align-top">
                <DiseaseRowContent row={row} />
              </tr>
            ))}
          </tbody>
        </table>
      }
      mobile={items.map((row) => (
        <DiseaseCard key={row.id} row={row} />
      ))}
    />
  );
}

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

  const diseaseOptions = useMemo(() => {
    const options = data?.diseaseOptions ?? [];
    return [
      { diseaseCode: "all", diseaseText: "Kaikki", count: total },
      ...options,
    ];
  }, [data?.diseaseOptions, total]);

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sairaustiedot</h1>
        <p className="text-sm text-muted-foreground">
          Haulla löytyi {total} beaglea.
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
                  {option.diseaseCode === "all"
                    ? option.diseaseText
                    : `${option.diseaseText} ${option.count} kpl`}
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
