"use client";

import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AdminDogProfileDto } from "@beagle/contracts";
import { type ReactNode } from "react";
import { EpiLukuWithFlag } from "@web/components/admin/dogs/shared/epi-flag";

const FALLBACK_VALUE = "-";

function showDash(value: string | number | null | undefined): string {
  if (value == null) {
    return FALLBACK_VALUE;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : FALLBACK_VALUE;
}

function formatSex(sex: AdminDogProfileDto["sex"]): string {
  if (sex === "MALE") {
    return "Uros";
  }

  if (sex === "FEMALE") {
    return "Narttu";
  }

  return "Tuntematon";
}

function formatBirthDateWithAge(value: string | null): string {
  if (!value) {
    return FALLBACK_VALUE;
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const now = new Date();
  let years = now.getFullYear() - parsed.getFullYear();
  let months = now.getMonth() - parsed.getMonth();
  let days = now.getDate() - parsed.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonthLastDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
    ).getDate();
    days += previousMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const formattedDate = new Intl.DateTimeFormat("fi-FI").format(parsed);
  return `${formattedDate} - ${years} v ${months} kk ${days} pv`;
}

function formatPercent(value: number | null): string {
  if (value == null) {
    return FALLBACK_VALUE;
  }

  return `${value.toFixed(4)} %`;
}

function formatRegistrationNo(
  registrationNo: string,
  registrationNos: string[],
): string {
  const secondary = registrationNos.filter((value) => value !== registrationNo);
  return `${registrationNo} (${secondary.join(", ")})`;
}

function formatOwners(owners: AdminDogProfileDto["owners"]): string {
  if (owners.length === 0) {
    return FALLBACK_VALUE;
  }

  return owners.map((owner) => owner.name).join(", ");
}

function formatOwnerAddress(owners: AdminDogProfileDto["owners"]): string {
  if (owners.length === 0) {
    return FALLBACK_VALUE;
  }

  const primary = owners[0];
  return `${primary.postalCode} ${primary.city}`.trim();
}

function DetailRow({
  label,
  value,
  emphasized = false,
  numeric = false,
}: {
  label: string;
  value: ReactNode;
  emphasized?: boolean;
  numeric?: boolean;
}) {
  return (
    <div className="grid gap-1.5 py-1.5 sm:grid-cols-[170px_1fr] sm:gap-3">
      <dt className={cn("text-xs font-semibold", beagleTheme.mutedText)}>
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm",
          beagleTheme.inkStrongText,
          emphasized ? "font-semibold" : "font-medium",
          numeric ? "tabular-nums" : "",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function AdminDogProfileBasicsSection({ dog }: { dog: AdminDogProfileDto }) {
  return (
    <ListingSectionShell title="PERUSTIEDOT">
      <dl className="space-y-1 text-sm">
        <DetailRow label="Koirannimi" value={dog.name} emphasized />
        <DetailRow
          label="Rekisterinumero"
          value={formatRegistrationNo(dog.registrationNo, dog.registrationNos)}
          emphasized
        />
        <DetailRow
          label="Syntynyt - ikä"
          value={formatBirthDateWithAge(dog.birthDate)}
        />
        <DetailRow label="Sukupuoli" value={formatSex(dog.sex)} />
        <DetailRow label="Väri" value="Tulossa" />
        <DetailRow label="EK-numero" value={showDash(dog.ekNo)} />
        <DetailRow
          label="Jälkeläisiä(EK)[2p]"
          value={`${dog.offspringCount} (${dog.offspringLitterCount}) kpl`}
        />
        <DetailRow
          label="Sukusiitosaste (9 sp)"
          value={formatPercent(dog.inbreedingCoefficientPct)}
          numeric
        />
        <DetailRow
          label="EPI-luku (5 sp)"
          value={
            <EpiLukuWithFlag epiLuku={dog.epiLuku} epiTeksti={dog.epiTeksti} />
          }
          numeric
        />
        <DetailRow
          label="Lafora-luku(-1..7)"
          value={showDash(dog.laforaLuku)}
        />
        <DetailRow
          label="EPI-riskiluku(1-8)"
          value={showDash(dog.epiRiskLuku)}
        />
        <DetailRow
          label="Vanhemmat"
          value={`Isä: ${dog.sire ? `${dog.sire.name} ${dog.sire.registrationNo ?? FALLBACK_VALUE}` : FALLBACK_VALUE} - Emä: ${dog.dam ? `${dog.dam.name} ${dog.dam.registrationNo ?? FALLBACK_VALUE}` : FALLBACK_VALUE}`}
        />
        <DetailRow label="Omistaja" value={formatOwners(dog.owners)} />
        <DetailRow
          label="Omistajan Osoite"
          value={formatOwnerAddress(dog.owners)}
        />
        <DetailRow label="Muut tiedot" value={showDash(dog.note)} />
      </dl>
    </ListingSectionShell>
  );
}

function AdminDogProfileHealthSection({ dog }: { dog: AdminDogProfileDto }) {
  return (
    <ListingSectionShell title="TERVEYSTIEDOT">
      <dl className="space-y-1 text-sm">
        <DetailRow label="Terveystiedot" value={showDash(dog.healthSummary)} />
        {dog.diseases.map((disease) => (
          <DetailRow
            key={disease.id}
            label={disease.diseaseText}
            value={`${disease.public ? "Julkinen" : "Ei julkinen"} · ${disease.source ?? FALLBACK_VALUE}`}
          />
        ))}
      </dl>
    </ListingSectionShell>
  );
}

export function AdminDogProfilePage({ dog }: { dog: AdminDogProfileDto }) {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
          <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
            {dog.name}
          </h1>
          <p className={cn("mt-1 text-sm md:text-base", beagleTheme.mutedText)}>
            {dog.registrationNo}
          </p>
        </header>

        <AdminDogProfileBasicsSection dog={dog} />
        <AdminDogProfileHealthSection dog={dog} />
      </div>
    </TooltipProvider>
  );
}
