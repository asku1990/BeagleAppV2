import Link from "next/link";
import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import {
  getDogProfileHref,
  parseLocalIsoDate,
} from "@/lib/public/beagle/dogs/profile";
import type { MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type {
  BeagleDogProfileDto,
  BeagleDogProfileParentDto,
  BeagleDogProfileSex,
} from "@beagle/contracts";
import type { ReactNode } from "react";

const FALLBACK_VALUE = "-";

function formatBirthDateWithAge(
  birthDate: string | null,
  locale: "fi" | "sv",
  t: (key: MessageKey) => string,
): string {
  if (!birthDate) {
    return FALLBACK_VALUE;
  }

  const parsed = parseLocalIsoDate(birthDate);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return FALLBACK_VALUE;
  }

  const now = new Date();
  let totalMonths =
    (now.getFullYear() - parsed.getFullYear()) * 12 +
    (now.getMonth() - parsed.getMonth());

  if (now.getDate() < parsed.getDate()) {
    totalMonths -= 1;
  }

  if (totalMonths < 0) {
    totalMonths = 0;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  const formattedDate = new Intl.DateTimeFormat(localeTag).format(parsed);

  return `${formattedDate} (${years} ${t("dog.profile.age.yearShort")} ${months} ${t("dog.profile.age.monthShort")})`;
}

function mapSexLabel(
  sex: BeagleDogProfileSex,
  t: (key: MessageKey) => string,
): string {
  if (sex === "U") {
    return t("dog.profile.sex.male");
  }

  if (sex === "N") {
    return t("dog.profile.sex.female");
  }

  return t("dog.profile.sex.unknown");
}

function formatPercent(value: number | null): string {
  if (value == null) {
    return FALLBACK_VALUE;
  }

  return `${value.toFixed(2)} %`;
}

function formatEkNo(value: number | null): string {
  if (value == null) {
    return FALLBACK_VALUE;
  }

  return String(value);
}

function formatParentLabel(parent: BeagleDogProfileParentDto | null): string {
  if (!parent) {
    return FALLBACK_VALUE;
  }

  if (!parent.registrationNo) {
    return parent.name;
  }

  return `${parent.registrationNo} ${parent.name}`;
}

function renderParentValue(
  parent: BeagleDogProfileParentDto | null,
): ReactNode {
  const label = formatParentLabel(parent);

  if (!parent?.id) {
    return label;
  }

  return (
    <Link
      href={getDogProfileHref(parent.id)}
      className={cn("underline underline-offset-2", beagleTheme.inkStrongText)}
    >
      {label}
    </Link>
  );
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

export function DogProfileDetailsCard({
  profile,
}: {
  profile: BeagleDogProfileDto;
}) {
  const { t, locale } = useI18n();
  const hasBirthDate =
    profile.birthDate != null && profile.birthDate.trim().length > 0;
  const secondaryRegistrations = profile.registrationNos.filter(
    (registrationNo: string) => registrationNo !== profile.registrationNo,
  );

  return (
    <ListingSectionShell title={t("dog.profile.card.details.title")}>
      <dl className="space-y-1 text-sm">
        <DetailRow
          label={t("dog.profile.field.name")}
          value={
            profile.title ? `${profile.title} ${profile.name}` : profile.name
          }
          emphasized
        />
        <DetailRow
          label={t("dog.profile.field.registrationNo")}
          value={profile.registrationNo}
          emphasized
        />
        {secondaryRegistrations.length > 0 && (
          <DetailRow
            label={t("dog.profile.field.additionalRegistrationNos")}
            value={secondaryRegistrations.join(", ")}
          />
        )}
        {hasBirthDate && (
          <DetailRow
            label={t("dog.profile.field.birthDate")}
            value={formatBirthDateWithAge(profile.birthDate, locale, t)}
          />
        )}
        <DetailRow
          label={t("dog.profile.field.sex")}
          value={mapSexLabel(profile.sex, t)}
        />
        <DetailRow
          label={t("dog.profile.field.color")}
          value={
            profile.color ??
            `${FALLBACK_VALUE} ${t("dog.profile.field.comingSoon")}`
          }
        />
        {profile.ekNo != null && (
          <DetailRow
            label={t("dog.profile.field.ekNo")}
            value={formatEkNo(profile.ekNo)}
            numeric
          />
        )}
        <DetailRow
          label={t("dog.profile.field.sire")}
          value={renderParentValue(profile.sire)}
        />
        <DetailRow
          label={t("dog.profile.field.dam")}
          value={renderParentValue(profile.dam)}
        />
        <DetailRow
          label={t("dog.profile.field.inbreeding")}
          value={
            profile.inbreedingCoefficientPct != null
              ? formatPercent(profile.inbreedingCoefficientPct)
              : `${FALLBACK_VALUE} ${t("dog.profile.field.comingSoon")}`
          }
          numeric
        />
      </dl>
    </ListingSectionShell>
  );
}
