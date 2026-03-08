import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type { MessageKey } from "@/lib/i18n";
import {
  getDogProfileHref,
  parseLocalIsoDate,
} from "@/lib/public/beagle/dogs/profile";
import { cn } from "@/lib/utils";
import type {
  BeagleDogProfileDto,
  BeagleDogProfileLitterDto,
  BeagleDogProfileParentDto,
} from "@beagle/contracts";
import Link from "next/link";

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

function formatParentLabel(parent: BeagleDogProfileParentDto | null): string {
  if (!parent) {
    return FALLBACK_VALUE;
  }

  if (!parent.registrationNo) {
    return parent.name;
  }

  return `${parent.registrationNo} ${parent.name}`;
}

function renderParentLink(parent: BeagleDogProfileParentDto | null) {
  if (!parent?.id) {
    return <span>{formatParentLabel(parent)}</span>;
  }

  return (
    <Link
      href={getDogProfileHref(parent.id)}
      className={cn("underline underline-offset-2", beagleTheme.inkStrongText)}
    >
      {formatParentLabel(parent)}
    </Link>
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
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3
              className={cn("text-sm font-semibold", beagleTheme.inkStrongText)}
            >
              {formatDate(litter.birthDate, locale)}
            </h3>
            <span className={cn("text-xs", beagleTheme.mutedText)}>
              {t("dog.profile.litters.count.puppies")}: {litter.puppyCount}
            </span>
          </div>
          <p className="text-sm">
            <span className={cn("font-semibold", beagleTheme.mutedText)}>
              {t("dog.profile.litters.field.otherParent")}:
            </span>{" "}
            {renderParentLink(litter.otherParent)}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {litter.puppies.map((puppy) => (
          <li
            key={puppy.id}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              beagleTheme.border,
            )}
          >
            <Link
              href={getDogProfileHref(puppy.dogId)}
              className={cn(
                "font-medium underline underline-offset-2",
                beagleTheme.inkStrongText,
              )}
            >
              {`${puppy.registrationNo} ${puppy.name}`}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function DogProfileLittersCard({
  profile,
}: {
  profile: BeagleDogProfileDto;
}) {
  const { t, locale } = useI18n();

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
          {profile.litters.map((litter) => (
            <LitterBlock
              key={litter.id}
              litter={litter}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      )}
    </ListingSectionShell>
  );
}
