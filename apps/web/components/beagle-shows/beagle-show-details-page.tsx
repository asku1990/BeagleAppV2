import Link from "next/link";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import type { BeagleShowDetailsResponse } from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import {
  copyShowDetailRowToClipboard,
  copyShowDetailRowsToClipboard,
  formatIsoDateForDisplay,
} from "@/lib/public/beagle/shows";
import { getDogProfileHref } from "@/lib/public/beagle/dogs/profile";
import { cn } from "@/lib/utils";

function mapSexLabel(
  value: "U" | "N" | "-",
  t: (
    key:
      | "shows.details.sex.male"
      | "shows.details.sex.female"
      | "shows.details.sex.unknown",
  ) => string,
): string {
  if (value === "U") return t("shows.details.sex.male");
  if (value === "N") return t("shows.details.sex.female");
  return t("shows.details.sex.unknown");
}

function formatHeight(heightCm: number | null): string {
  if (heightCm == null) {
    return "-";
  }
  return `${heightCm} cm`;
}

type ShowDetailsRowWithOptionalReview =
  BeagleShowDetailsResponse["items"][number] & {
    reviewText?: string | null;
  };

function getReviewTextValue(
  row: ShowDetailsRowWithOptionalReview,
  pendingLabel: string,
): { text: string; canCollapse: boolean } {
  const value = row.reviewText?.trim();
  const collapseThreshold = 100;
  if (!value) {
    return {
      text: pendingLabel,
      canCollapse: pendingLabel.length > collapseThreshold,
    };
  }
  return { text: value, canCollapse: value.length > collapseThreshold };
}

function CollapsibleReviewText({
  text,
  canCollapse,
  showMoreLabel,
  showLessLabel,
}: {
  text: string;
  canCollapse: boolean;
  showMoreLabel: string;
  showLessLabel: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-[40ch] break-words">
      <p className={cn(!isExpanded && canCollapse && "line-clamp-2")}>{text}</p>
      {canCollapse ? (
        <button
          type="button"
          className={cn(
            "mt-1 text-xs font-medium underline underline-offset-2",
            beagleTheme.inkStrongText,
          )}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </div>
  );
}

export function BeagleShowDetailsPage({
  details,
}: {
  details: BeagleShowDetailsResponse;
}) {
  const { t, locale } = useI18n();
  const reviewPendingLabel = t("shows.details.reviewText.pending");
  const reviewShowMoreLabel = t("shows.details.reviewText.showMore");
  const reviewShowLessLabel = t("shows.details.reviewText.showLess");
  const clipboardLabels = {
    registrationNo: t("shows.details.col.reg"),
    name: t("shows.details.col.name"),
    sex: t("shows.details.col.sex"),
    result: t("shows.details.col.result"),
    reviewText: t("shows.details.col.reviewText"),
    height: t("shows.details.col.height"),
    judge: t("shows.details.col.judge"),
    sexMale: t("shows.details.sex.male"),
    sexFemale: t("shows.details.sex.female"),
    sexUnknown: t("shows.details.sex.unknown"),
  };
  const clipboardMessages = {
    success: t("shows.details.copy.success"),
    error: t("shows.details.copy.error"),
    unsupported: t("shows.details.copy.unsupported"),
  };

  const handleCopyRow = async (
    row: ShowDetailsRowWithOptionalReview,
    reviewText: string,
  ) => {
    await copyShowDetailRowToClipboard({
      row: { ...row, reviewText },
      labels: clipboardLabels,
      messages: clipboardMessages,
      clipboard: globalThis.navigator?.clipboard,
      toast,
    });
  };

  const handleCopyAllRows = async () => {
    await copyShowDetailRowsToClipboard({
      rows: details.items.map((row) => ({
        ...row,
        reviewText: getReviewTextValue(row, reviewPendingLabel).text,
      })),
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
              {t("shows.details.title")}
            </h1>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {formatIsoDateForDisplay(details.show.eventDate, locale)} •{" "}
              {details.show.eventPlace}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("shows.details.judge")}: {details.show.judge ?? "-"}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("shows.details.dogCount")}: {details.show.dogCount}
            </p>
          </div>
        </div>
      </header>

      <ListingSectionShell
        title={t("shows.details.section.title")}
        count={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {t("shows.details.dogCount")}: {details.items.length}
            </span>
            {details.items.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  void handleCopyAllRows();
                }}
                className={cn(
                  "cursor-pointer text-xs underline underline-offset-2",
                  beagleTheme.inkStrongText,
                )}
              >
                {t("shows.details.copy.all")}
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
                      {t("shows.details.col.reg")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.name")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.sex")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.result")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.reviewText")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.height")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.judge")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.copy.button")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details.items.map((row) => {
                    const review = getReviewTextValue(row, reviewPendingLabel);

                    return (
                      <tr
                        key={row.id}
                        className={cn("border-b align-top", beagleTheme.border)}
                      >
                        <td className="px-2 py-2">
                          <Link
                            href={getDogProfileHref(row.dogId)}
                            className={cn(
                              "font-medium underline underline-offset-2",
                              beagleTheme.inkStrongText,
                            )}
                          >
                            {row.registrationNo}
                          </Link>
                        </td>
                        <td className="px-2 py-2">
                          <Link
                            href={getDogProfileHref(row.dogId)}
                            className={cn(
                              "font-medium underline underline-offset-2",
                              beagleTheme.inkStrongText,
                            )}
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="px-2 py-2">{mapSexLabel(row.sex, t)}</td>
                        <td className="px-2 py-2">{row.result ?? "-"}</td>
                        <td className="px-2 py-2">
                          <CollapsibleReviewText
                            text={review.text}
                            canCollapse={review.canCollapse}
                            showMoreLabel={reviewShowMoreLabel}
                            showLessLabel={reviewShowLessLabel}
                          />
                        </td>
                        <td className="px-2 py-2">
                          {formatHeight(row.heightCm)}
                        </td>
                        <td className="px-2 py-2">{row.judge ?? "-"}</td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => void handleCopyRow(row, review.text)}
                            className={cn(
                              "cursor-pointer font-medium underline underline-offset-2",
                              beagleTheme.inkStrongText,
                            )}
                          >
                            {t("shows.details.copy.button")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          }
          mobile={
            <div className="space-y-2">
              {details.items.map((row) => {
                const review = getReviewTextValue(row, reviewPendingLabel);

                return (
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
                          {t("shows.details.col.reg")}:
                        </span>
                        <Link
                          href={getDogProfileHref(row.dogId)}
                          className={cn(
                            "font-medium underline underline-offset-2",
                            beagleTheme.inkStrongText,
                          )}
                        >
                          {row.registrationNo}
                        </Link>
                      </p>
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("shows.details.col.name")}:
                        </span>
                        <Link
                          href={getDogProfileHref(row.dogId)}
                          className={cn(
                            "font-medium underline underline-offset-2",
                            beagleTheme.inkStrongText,
                          )}
                        >
                          {row.name}
                        </Link>
                      </p>
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("shows.details.col.sex")}:
                        </span>
                        <span>{mapSexLabel(row.sex, t)}</span>
                      </p>
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("shows.details.col.result")}:
                        </span>
                        <span>{row.result ?? "-"}</span>
                      </p>
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("shows.details.col.height")}:
                        </span>
                        <span>{formatHeight(row.heightCm)}</span>
                      </p>
                      <div className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("shows.details.col.reviewText")}:
                        </span>
                        <CollapsibleReviewText
                          text={review.text}
                          canCollapse={review.canCollapse}
                          showMoreLabel={reviewShowMoreLabel}
                          showLessLabel={reviewShowLessLabel}
                        />
                      </div>
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("shows.details.col.judge")}:
                        </span>
                        <span>{row.judge ?? "-"}</span>
                      </p>
                      <p className="col-span-2">
                        <button
                          type="button"
                          onClick={() => void handleCopyRow(row, review.text)}
                          className={cn(
                            "cursor-pointer font-medium underline underline-offset-2",
                            beagleTheme.inkStrongText,
                          )}
                        >
                          {t("shows.details.copy.button")}
                        </button>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          }
        />
      </ListingSectionShell>
    </>
  );
}
