import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type { MessageKey } from "@/lib/i18n";
import {
  getDogProfileHref,
  parseLocalIsoDate,
  renderRegistrationNameText,
} from "@/lib/public/beagle/dogs/profile";
import { cn } from "@/lib/utils";
import type {
  BeagleDogProfileDto,
  BeagleDogProfileLitterDto,
  BeagleDogProfileParentDto,
  BeagleDogProfileSex,
} from "@beagle/contracts";

const FALLBACK_VALUE = "-";

function formatDate(value: string | null, locale: "fi" | "sv"): string {
  if (!value) {
    return FALLBACK_VALUE;
  }

  const parsed = parseLocalIsoDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return FALLBACK_VALUE;
  }

  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  return new Intl.DateTimeFormat(localeTag).format(parsed);
}

function renderParentLabel(
  parent: BeagleDogProfileParentDto | null,
): ReactNode {
  return renderRegistrationNameText({
    registrationNo: parent?.registrationNo ?? null,
    name: parent?.name ?? null,
    unknownLabel: FALLBACK_VALUE,
    missingRegistrationPrefix: "",
  });
}

function renderParentLink(parent: BeagleDogProfileParentDto | null) {
  const label = renderParentLabel(parent);

  if (!parent?.id) {
    return <span>{label}</span>;
  }

  return (
    <Link href={getDogProfileHref(parent.id)} className={beagleTheme.textLink}>
      {label}
    </Link>
  );
}

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

function LitterDesktopTable({
  litter,
  t,
}: {
  litter: BeagleDogProfileLitterDto;
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
          {litter.puppies.map((puppy) => (
            <tr
              key={puppy.id}
              className={cn("border-b align-top", beagleTheme.border)}
            >
              <td className="px-2 py-2">
                <Link
                  href={getDogProfileHref(puppy.dogId)}
                  className={beagleTheme.entityLink}
                >
                  {puppy.registrationNo}
                </Link>
              </td>
              <td className="px-2 py-2">
                <Link
                  href={getDogProfileHref(puppy.dogId)}
                  className={beagleTheme.entityLink}
                >
                  {puppy.name}
                </Link>
              </td>
              <td className="px-2 py-2">{mapSexLabel(puppy.sex, t)}</td>
              <td className="px-2 py-2">{formatColorPlaceholder(t)}</td>
              <td className="px-2 py-2">{puppy.trialCount}</td>
              <td className="px-2 py-2">{puppy.showCount}</td>
              <td className="px-2 py-2">{puppy.litterCount}</td>
              <td className="px-2 py-2">{formatEkNo(puppy.ekNo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LitterMobileCards({
  litter,
  t,
}: {
  litter: BeagleDogProfileLitterDto;
  t: (key: MessageKey) => string;
}) {
  return (
    <div className="space-y-2">
      {litter.puppies.map((puppy) => (
        <article
          key={puppy.id}
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
                href={getDogProfileHref(puppy.dogId)}
                className={beagleTheme.entityLink}
              >
                {puppy.registrationNo}
              </Link>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.name")}:{" "}
              </span>
              <Link
                href={getDogProfileHref(puppy.dogId)}
                className={beagleTheme.entityLink}
              >
                {puppy.name}
              </Link>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.sex")}:{" "}
              </span>
              <span>{mapSexLabel(puppy.sex, t)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.trials")}:{" "}
              </span>
              <span>{puppy.trialCount}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.shows")}:{" "}
              </span>
              <span>{puppy.showCount}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.litters")}:{" "}
              </span>
              <span>{puppy.litterCount}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.litters.col.ekNo")}:{" "}
              </span>
              <span>{formatEkNo(puppy.ekNo)}</span>
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

function LitterBlock({
  litter,
  locale,
  t,
}: {
  litter: BeagleDogProfileLitterDto;
  locale: "fi" | "sv";
  t: (key: MessageKey) => string;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border p-4 md:p-5",
        beagleTheme.border,
        beagleTheme.surface,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
        <div className="space-y-1">
          <p className={cn("text-sm font-semibold", beagleTheme.inkStrongText)}>
            {t("dog.profile.litters.meta.birthDate")}:{" "}
            {formatDate(litter.birthDate, locale)}
          </p>
          <p className="text-sm">
            <span className={cn("font-semibold", beagleTheme.mutedText)}>
              {t("dog.profile.litters.field.otherParent")}:
            </span>{" "}
            {renderParentLink(litter.otherParent)}
          </p>
        </div>
        <p className={cn("text-sm", beagleTheme.mutedText)}>
          {t("dog.profile.litters.count.puppies")}: {litter.puppyCount}
        </p>
      </div>

      <div className="pt-4">
        <ListingResponsiveResults
          desktop={<LitterDesktopTable litter={litter} t={t} />}
          mobile={<LitterMobileCards litter={litter} t={t} />}
        />
      </div>
    </article>
  );
}

export function DogProfileLittersCard({
  profile,
}: {
  profile: BeagleDogProfileDto;
}) {
  const { t, locale } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const canReveal = profile.litters.length > 5;
  const visibleLitters = isExpanded
    ? profile.litters
    : profile.litters.slice(0, 5);

  return (
    <ListingSectionShell
      title={t("dog.profile.card.litters.title")}
      count={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            {t("dog.profile.litters.count.litters")}:{" "}
            {profile.offspringSummary.litterCount}
          </span>
          <span>
            {t("dog.profile.litters.count.puppies")}:{" "}
            {profile.offspringSummary.puppyCount}
          </span>
        </span>
      }
    >
      {profile.litters.length === 0 ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-8 text-center text-sm",
            beagleTheme.border,
            beagleTheme.mutedText,
          )}
        >
          {t("dog.profile.empty.litters")}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleLitters.map((litter) => (
            <LitterBlock
              key={litter.id}
              litter={litter}
              locale={locale}
              t={t}
            />
          ))}
          {canReveal ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <p className={cn("text-xs", beagleTheme.mutedText)}>
                {t("dog.profile.section.showing")} {visibleLitters.length} /{" "}
                {profile.litters.length}
              </p>
              <button
                type="button"
                className={cn(
                  "cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium",
                  beagleTheme.border,
                  beagleTheme.surface,
                  beagleTheme.inkStrongText,
                  beagleTheme.interactive,
                )}
                onClick={() => setIsExpanded((value) => !value)}
              >
                {isExpanded
                  ? t("dog.profile.section.showLess")
                  : t("dog.profile.section.showMore")}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </ListingSectionShell>
  );
}
