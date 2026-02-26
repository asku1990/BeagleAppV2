import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type { DogProfile } from "@/lib/beagle-dogs";
import type { MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const FALLBACK_VALUE = "-";

function formatBirthDateWithAge(
  birthDate: string | null,
  locale: "fi" | "sv",
  t: (key: MessageKey) => string,
): string {
  if (!birthDate) {
    return FALLBACK_VALUE;
  }

  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) {
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
  sex: DogProfile["sex"],
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

export function DogProfileDetailsCard({ profile }: { profile: DogProfile }) {
  const { t, locale } = useI18n();
  const secondaryRegistrations = profile.registrationNos.filter(
    (registrationNo) => registrationNo !== profile.registrationNo,
  );

  return (
    <ListingSectionShell title={t("dog.profile.card.details.title")}>
      <dl className="space-y-2 text-sm">
        <div className="grid grid-cols-[150px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.name")}
          </dt>
          <dd className={cn("font-medium", beagleTheme.inkStrongText)}>
            {profile.title ? `${profile.title} ${profile.name}` : profile.name}
          </dd>
        </div>
        <div className="grid grid-cols-[150px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.registrationNo")}
          </dt>
          <dd className={cn("font-medium", beagleTheme.inkStrongText)}>
            {profile.registrationNo}
          </dd>
        </div>
        <div className="grid grid-cols-[150px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.additionalRegistrationNos")}
          </dt>
          <dd>
            {secondaryRegistrations.length > 0
              ? secondaryRegistrations.join(", ")
              : FALLBACK_VALUE}
          </dd>
        </div>
        <div className="grid grid-cols-[150px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.birthDate")}
          </dt>
          <dd>{formatBirthDateWithAge(profile.birthDate, locale, t)}</dd>
        </div>
        <div className="grid grid-cols-[150px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.sex")}
          </dt>
          <dd>{mapSexLabel(profile.sex, t)}</dd>
        </div>
        <div className="grid grid-cols-[150px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.color")}
          </dt>
          <dd>{profile.color ?? FALLBACK_VALUE}</dd>
        </div>
        <div className="grid grid-cols-[150px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.ekNo")}
          </dt>
          <dd>{formatEkNo(profile.ekNo)}</dd>
        </div>
        <div className="grid grid-cols-[150px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.inbreeding")}
          </dt>
          <dd>{formatPercent(profile.inbreedingCoefficientPct)}</dd>
        </div>
      </dl>
    </ListingSectionShell>
  );
}
