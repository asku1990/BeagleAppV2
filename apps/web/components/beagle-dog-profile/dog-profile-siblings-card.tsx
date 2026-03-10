import Link from "next/link";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type { MessageKey } from "@/lib/i18n";
import { getDogProfileHref } from "@/lib/public/beagle/dogs/profile";
import { cn } from "@/lib/utils";
import type {
  BeagleDogProfileDto,
  BeagleDogProfileSex,
  BeagleDogProfileSiblingRowDto,
} from "@beagle/contracts";

const FALLBACK_VALUE = "-";

function mapSexLabel(
  sex: BeagleDogProfileSex,
  t: (key: MessageKey) => string,
): string {
  if (sex === "U") {
    return t("dog.profile.litters.sex.male");
  }

  if (sex === "N") {
    return t("dog.profile.litters.sex.female");
  }

  return FALLBACK_VALUE;
}

function formatEkNo(value: number | null): string {
  return value == null ? FALLBACK_VALUE : String(value);
}

function formatColorPlaceholder(t: (key: MessageKey) => string): string {
  return `${FALLBACK_VALUE} ${t("dog.profile.field.comingSoon")}`;
}

function SiblingsDesktopTable({
  siblings,
  t,
}: {
  siblings: BeagleDogProfileSiblingRowDto[];
  t: (key: MessageKey) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.litters.col.registrationNo")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.litters.col.name")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.litters.col.sex")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.litters.col.color")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.litters.col.trials")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.litters.col.shows")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.litters.col.litters")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.litters.col.ekNo")}
            </th>
          </tr>
        </thead>
        <tbody>
          {siblings.map((sibling) => (
            <tr
              key={sibling.id}
              className={cn("border-b align-top", beagleTheme.border)}
            >
              <td className="px-2 py-2">
                <Link
                  href={getDogProfileHref(sibling.dogId)}
                  className={beagleTheme.entityLink}
                >
                  {sibling.registrationNo}
                </Link>
              </td>
              <td className="px-2 py-2">
                <Link
                  href={getDogProfileHref(sibling.dogId)}
                  className={beagleTheme.entityLink}
                >
                  {sibling.name}
                </Link>
              </td>
              <td className="px-2 py-2">{mapSexLabel(sibling.sex, t)}</td>
              <td className="px-2 py-2">{formatColorPlaceholder(t)}</td>
              <td className="px-2 py-2">{sibling.trialCount}</td>
              <td className="px-2 py-2">{sibling.showCount}</td>
              <td className="px-2 py-2">{sibling.litterCount}</td>
              <td className="px-2 py-2">{formatEkNo(sibling.ekNo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SiblingsMobileCards({
  siblings,
  t,
}: {
  siblings: BeagleDogProfileSiblingRowDto[];
  t: (key: MessageKey) => string;
}) {
  return (
    <div className="space-y-2">
      {siblings.map((sibling) => (
        <article
          key={sibling.id}
          className={cn(
            "rounded-lg border p-3",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.registrationNo")}:{" "}
              </span>
              <Link
                href={getDogProfileHref(sibling.dogId)}
                className={beagleTheme.entityLink}
              >
                {sibling.registrationNo}
              </Link>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.name")}:{" "}
              </span>
              <Link
                href={getDogProfileHref(sibling.dogId)}
                className={beagleTheme.entityLink}
              >
                {sibling.name}
              </Link>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.sex")}:{" "}
              </span>
              <span>{mapSexLabel(sibling.sex, t)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.trials")}:{" "}
              </span>
              <span>{sibling.trialCount}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.shows")}:{" "}
              </span>
              <span>{sibling.showCount}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.litters")}:{" "}
              </span>
              <span>{sibling.litterCount}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.ekNo")}:{" "}
              </span>
              <span>{formatEkNo(sibling.ekNo)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.color")}:{" "}
              </span>
              <span>{formatColorPlaceholder(t)}</span>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function DogProfileSiblingsCard({
  profile,
}: {
  profile: BeagleDogProfileDto;
}) {
  const { t } = useI18n();

  return (
    <ListingSectionShell
      title={t("dog.profile.card.siblings.title")}
      count={`${profile.siblingsSummary.siblingCount} ${t("dog.profile.siblings.count.siblings")}`}
    >
      {profile.siblings.length === 0 ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-8 text-center text-sm",
            beagleTheme.border,
            beagleTheme.mutedText,
          )}
        >
          {t("dog.profile.empty.siblings")}
        </div>
      ) : (
        <ListingResponsiveResults
          desktop={<SiblingsDesktopTable siblings={profile.siblings} t={t} />}
          mobile={<SiblingsMobileCards siblings={profile.siblings} t={t} />}
        />
      )}
    </ListingSectionShell>
  );
}
