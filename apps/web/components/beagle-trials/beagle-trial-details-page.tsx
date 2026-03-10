import Link from "next/link";
import { toast } from "@/components/ui/sonner";
import type { BeagleTrialDetailsResponse } from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import {
  copyTrialDetailRowToClipboard,
  copyTrialDetailRowsToClipboard,
  formatIsoDateForDisplay,
} from "@/lib/public/beagle/trials";
import { getDogProfileHref } from "@/lib/public/beagle/dogs/profile";
import { cn } from "@/lib/utils";

function mapSexLabel(
  value: "U" | "N" | "-",
  t: (
    key:
      | "trials.details.sex.male"
      | "trials.details.sex.female"
      | "trials.details.sex.unknown",
  ) => string,
): string {
  if (value === "U") return t("trials.details.sex.male");
  if (value === "N") return t("trials.details.sex.female");
  return t("trials.details.sex.unknown");
}

function formatPoints(points: number | null): string {
  if (points == null) {
    return "-";
  }
  return points.toLocaleString("fi-FI", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatAward(award: string | null, classCode: string | null): string {
  if (!award) return "-";
  if (!classCode) return award;
  if (/^(Avo|Voi|Beaj)\s/.test(award)) return award;

  if (classCode === "A") return `Avo ${award}`;
  if (classCode === "V") return `Voi ${award}`;
  return `Beaj ${award}`;
}

export function BeagleTrialDetailsPage({
  details,
}: {
  details: BeagleTrialDetailsResponse;
}) {
  const { t, locale } = useI18n();
  const usesLegacyPmiLabel =
    details.trial.eventDate.localeCompare("2005-08-19") < 0;
  const clipboardLabels = {
    no: t("trials.details.col.no"),
    registrationNo: t("trials.details.col.reg"),
    name: t("trials.details.col.name"),
    sex: t("trials.details.col.sex"),
    weather: t("trials.details.col.weather"),
    award: t("trials.details.col.award"),
    rank: t("trials.details.col.rank"),
    points: t("trials.details.copy.col.resultPoints"),
    judge: t("trials.details.col.judge"),
    searchWork: t("trials.details.copy.col.searchWork"),
    barking: t("trials.details.copy.col.barking"),
    generalImpression: t("trials.details.copy.col.generalImpression"),
    searchLoosenessPenalty: t("trials.details.copy.col.searchLoosenessPenalty"),
    chaseLoosenessPenalty: t("trials.details.copy.col.chaseLoosenessPenalty"),
    obstacleWork: t("trials.details.copy.col.obstacleWork"),
    totalPoints: usesLegacyPmiLabel
      ? t("trials.details.copy.col.pmi")
      : t("trials.details.copy.col.mi"),
  };
  const clipboardMessages = {
    success: t("trials.details.copy.success"),
    error: t("trials.details.copy.error"),
    unsupported: t("trials.details.copy.unsupported"),
  };

  const handleCopyRow = async (
    row: BeagleTrialDetailsResponse["items"][number],
    index: number,
  ) => {
    await copyTrialDetailRowToClipboard({
      row,
      index,
      labels: clipboardLabels,
      messages: clipboardMessages,
      clipboard: globalThis.navigator?.clipboard,
      toast,
    });
  };

  const handleCopyAllRows = async () => {
    await copyTrialDetailRowsToClipboard({
      rows: details.items,
      labels: clipboardLabels,
      messages: clipboardMessages,
      clipboard: globalThis.navigator?.clipboard,
      toast,
    });
  };

  return (
    <>
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1
              className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}
            >
              {t("trials.details.title")}
            </h1>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {formatIsoDateForDisplay(details.trial.eventDate, locale)} •{" "}
              {details.trial.eventPlace}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("trials.details.judge")}: {details.trial.judge ?? "-"}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("trials.details.dogCount")}: {details.trial.dogCount}
            </p>
          </div>
        </div>
      </header>

      <ListingSectionShell
        title={t("trials.details.section.title")}
        count={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {t("trials.details.dogCount")}: {details.items.length}
            </span>
            {details.items.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  void handleCopyAllRows();
                }}
                className={cn("text-xs", beagleTheme.actionLink)}
              >
                {t("trials.details.copy.all")}
              </button>
            ) : null}
          </span>
        }
      >
        <ListingResponsiveResults
          desktop={
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className={cn("border-b text-left", beagleTheme.border)}>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.no")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.reg")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.name")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.sex")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.weather")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.award")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.rank")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.points")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.judge")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.copy.button")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details.items.map((row, index) => (
                    <tr
                      key={row.id}
                      className={cn("border-b align-top", beagleTheme.border)}
                    >
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2">
                        <Link
                          href={getDogProfileHref(row.dogId)}
                          className={beagleTheme.entityLink}
                        >
                          {row.registrationNo}
                        </Link>
                      </td>
                      <td className="px-2 py-2">
                        <Link
                          href={getDogProfileHref(row.dogId)}
                          className={beagleTheme.entityLink}
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-2 py-2">{mapSexLabel(row.sex, t)}</td>
                      <td className="px-2 py-2">{row.weather ?? "-"}</td>
                      <td className="px-2 py-2">
                        {formatAward(row.award, row.classCode)}
                      </td>
                      <td className="px-2 py-2">{row.rank ?? "-"}</td>
                      <td className="px-2 py-2">{formatPoints(row.points)}</td>
                      <td className="px-2 py-2">{row.judge ?? "-"}</td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => void handleCopyRow(row, index + 1)}
                          className={beagleTheme.actionLinkStrong}
                        >
                          {t("trials.details.copy.button")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          mobile={
            <div className="space-y-2">
              {details.items.map((row, index) => (
                <article
                  key={row.id}
                  className={cn(
                    "rounded-lg border p-3",
                    beagleTheme.border,
                    beagleTheme.surface,
                  )}
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p className="col-span-2">
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.reg")}:
                      </span>{" "}
                      <Link
                        href={getDogProfileHref(row.dogId)}
                        className={beagleTheme.entityLink}
                      >
                        {row.registrationNo}
                      </Link>
                    </p>
                    <p className="col-span-2">
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.name")}:
                      </span>{" "}
                      <Link
                        href={getDogProfileHref(row.dogId)}
                        className={beagleTheme.entityLink}
                      >
                        {row.name}
                      </Link>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.sex")}:
                      </span>{" "}
                      <span>{mapSexLabel(row.sex, t)}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.weather")}:
                      </span>{" "}
                      <span>{row.weather ?? "-"}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.award")}:
                      </span>{" "}
                      <span>{formatAward(row.award, row.classCode)}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.rank")}:
                      </span>{" "}
                      <span>{row.rank ?? "-"}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.points")}:
                      </span>{" "}
                      <span>{formatPoints(row.points)}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.judge")}:
                      </span>{" "}
                      <span>{row.judge ?? "-"}</span>
                    </p>
                    <p className="col-span-2">
                      <button
                        type="button"
                        onClick={() => void handleCopyRow(row, index + 1)}
                        className={beagleTheme.actionLinkStrong}
                      >
                        {t("trials.details.copy.button")}
                      </button>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          }
        />
      </ListingSectionShell>
    </>
  );
}
