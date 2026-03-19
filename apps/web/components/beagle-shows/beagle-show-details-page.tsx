import Link from "next/link";
import { useState } from "react";
import type { BeagleShowDetailsResponse } from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import {
  copyShowDetailRowsToClipboard,
  formatAwards,
  formatClassCode,
  formatClassPlacement,
  formatPupn,
  formatQualityGrade,
  formatIsoDateForDisplay,
  formatShowType,
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

function renderDogValue(value: string, dogId: string | null) {
  if (!dogId) {
    return value;
  }

  return (
    <Link href={getDogProfileHref(dogId)} className={beagleTheme.entityLink}>
      {value}
    </Link>
  );
}

export function BeagleShowDetailsPage({
  details,
}: {
  details: BeagleShowDetailsResponse;
}) {
  const { t, locale } = useI18n();
  const reviewOpenLabel = t("shows.details.review.open");
  const reviewModalTitle = t("shows.details.review.modalTitle");
  const [selectedCritique, setSelectedCritique] = useState<{
    registrationNo: string;
    name: string;
    text: string;
  } | null>(null);
  const hasShowType = details.items.some((row) => row.showType != null);
  const hasClassCode = details.items.some((row) => row.classCode != null);
  const hasQualityGrade = details.items.some((row) => row.qualityGrade != null);
  const hasClassPlacement = details.items.some(
    (row) => row.classPlacement != null,
  );
  const hasPupn = details.items.some((row) => row.pupn != null);
  const hasAwards = details.items.some((row) => row.awards.length > 0);
  const hasHeight = details.items.some((row) => row.heightCm != null);
  const hasJudge = details.items.some((row) => row.judge != null);
  const hasReviewText = details.items.some((row) =>
    Boolean(row.critiqueText?.trim()),
  );
  const clipboardLabels = {
    registrationNo: t("shows.details.col.reg"),
    name: t("shows.details.col.name"),
    sex: t("shows.details.col.sex"),
    showType: t("shows.details.col.showType"),
    className: t("shows.details.col.className"),
    qualityGrade: t("shows.details.col.qualityGrade"),
    placement: t("shows.details.col.placement"),
    pupn: t("shows.details.col.pupn"),
    awards: t("shows.details.col.awards"),
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

  const handleCopyAllRows = async () => {
    await copyShowDetailRowsToClipboard({
      rows: details.items,
      labels: clipboardLabels,
      columns: {
        includeShowType: hasShowType,
        includeClassName: hasClassCode,
        includeQualityGrade: hasQualityGrade,
        includeClassPlacement: hasClassPlacement,
        includePupn: hasPupn,
        includeAwards: hasAwards,
        includeHeight: hasHeight,
        includeJudge: hasJudge,
        includeReviewText: hasReviewText,
      },
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
                className={cn("text-xs", beagleTheme.actionLink)}
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
              <table className="w-full min-w-[1320px] border-collapse text-sm">
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
                    {hasShowType ? (
                      <th className="px-2 py-2 font-semibold">
                        {t("shows.details.col.showType")}
                      </th>
                    ) : null}
                    {hasClassCode ? (
                      <th className="px-2 py-2 font-semibold">
                        {t("shows.details.col.className")}
                      </th>
                    ) : null}
                    {hasQualityGrade ? (
                      <th className="px-2 py-2 font-semibold">
                        {t("shows.details.col.qualityGrade")}
                      </th>
                    ) : null}
                    {hasClassPlacement ? (
                      <th className="px-2 py-2 font-semibold">
                        {t("shows.details.col.placement")}
                      </th>
                    ) : null}
                    {hasPupn ? (
                      <th className="px-2 py-2 font-semibold">
                        {t("shows.details.col.pupn")}
                      </th>
                    ) : null}
                    {hasAwards ? (
                      <th className="px-2 py-2 font-semibold">
                        {t("shows.details.col.awards")}
                      </th>
                    ) : null}
                    {hasHeight ? (
                      <th className="px-2 py-2 font-semibold">
                        {t("shows.details.col.height")}
                      </th>
                    ) : null}
                    {hasJudge ? (
                      <th className="px-2 py-2 font-semibold">
                        {t("shows.details.col.judge")}
                      </th>
                    ) : null}
                    {hasReviewText ? (
                      <th className="px-2 py-2 font-semibold">
                        {t("shows.details.col.reviewText")}
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {details.items.map((row) => {
                    const critique = row.critiqueText?.trim();

                    return (
                      <tr
                        key={row.id}
                        className={cn("border-b align-top", beagleTheme.border)}
                      >
                        <td className="px-2 py-2">
                          {renderDogValue(row.registrationNo, row.dogId)}
                        </td>
                        <td className="px-2 py-2">
                          {renderDogValue(row.name, row.dogId)}
                        </td>
                        <td className="px-2 py-2">{mapSexLabel(row.sex, t)}</td>
                        {hasShowType ? (
                          <td className="px-2 py-2">{formatShowType(row)}</td>
                        ) : null}
                        {hasClassCode ? (
                          <td className="px-2 py-2">{formatClassCode(row)}</td>
                        ) : null}
                        {hasQualityGrade ? (
                          <td className="px-2 py-2">
                            {formatQualityGrade(row)}
                          </td>
                        ) : null}
                        {hasClassPlacement ? (
                          <td className="px-2 py-2">
                            {formatClassPlacement(row)}
                          </td>
                        ) : null}
                        {hasPupn ? (
                          <td className="px-2 py-2">{formatPupn(row)}</td>
                        ) : null}
                        {hasAwards ? (
                          <td className="px-2 py-2">{formatAwards(row)}</td>
                        ) : null}
                        {hasHeight ? (
                          <td className="px-2 py-2">
                            {formatHeight(row.heightCm)}
                          </td>
                        ) : null}
                        {hasJudge ? (
                          <td className="px-2 py-2">{row.judge ?? "-"}</td>
                        ) : null}
                        {hasReviewText ? (
                          <td className="px-2 py-2">
                            {critique ? (
                              <button
                                type="button"
                                className={beagleTheme.actionLinkStrong}
                                onClick={() =>
                                  setSelectedCritique({
                                    registrationNo: row.registrationNo,
                                    name: row.name,
                                    text: critique,
                                  })
                                }
                              >
                                {reviewOpenLabel}
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        ) : null}
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
                const critique = row.critiqueText?.trim();

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
                        {renderDogValue(row.registrationNo, row.dogId)}
                      </p>
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("shows.details.col.name")}:
                        </span>
                        {renderDogValue(row.name, row.dogId)}
                      </p>
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("shows.details.col.sex")}:
                        </span>
                        <span>{mapSexLabel(row.sex, t)}</span>
                      </p>
                      {hasShowType ? (
                        <p>
                          <span className={beagleTheme.mutedText}>
                            {t("shows.details.col.showType")}:
                          </span>
                          <span>{formatShowType(row)}</span>
                        </p>
                      ) : null}
                      {hasClassCode ? (
                        <p>
                          <span className={beagleTheme.mutedText}>
                            {t("shows.details.col.className")}:
                          </span>
                          <span>{formatClassCode(row)}</span>
                        </p>
                      ) : null}
                      {hasQualityGrade ? (
                        <p>
                          <span className={beagleTheme.mutedText}>
                            {t("shows.details.col.qualityGrade")}:
                          </span>
                          <span>{formatQualityGrade(row)}</span>
                        </p>
                      ) : null}
                      {hasClassPlacement ? (
                        <p>
                          <span className={beagleTheme.mutedText}>
                            {t("shows.details.col.placement")}:
                          </span>
                          <span>{formatClassPlacement(row)}</span>
                        </p>
                      ) : null}
                      {hasPupn ? (
                        <p>
                          <span className={beagleTheme.mutedText}>
                            {t("shows.details.col.pupn")}:
                          </span>
                          <span>{formatPupn(row)}</span>
                        </p>
                      ) : null}
                      {hasAwards ? (
                        <p className="col-span-2">
                          <span className={beagleTheme.mutedText}>
                            {t("shows.details.col.awards")}:
                          </span>
                          <span>{formatAwards(row)}</span>
                        </p>
                      ) : null}
                      {hasHeight ? (
                        <p>
                          <span className={beagleTheme.mutedText}>
                            {t("shows.details.col.height")}:
                          </span>
                          <span>{formatHeight(row.heightCm)}</span>
                        </p>
                      ) : null}
                      {hasJudge ? (
                        <p>
                          <span className={beagleTheme.mutedText}>
                            {t("shows.details.col.judge")}:
                          </span>
                          <span>{row.judge ?? "-"}</span>
                        </p>
                      ) : null}
                      {hasReviewText ? (
                        <p className="col-span-2">
                          <span className={beagleTheme.mutedText}>
                            {t("shows.details.col.reviewText")}:
                          </span>
                          {critique ? (
                            <button
                              type="button"
                              className={beagleTheme.actionLinkStrong}
                              onClick={() =>
                                setSelectedCritique({
                                  registrationNo: row.registrationNo,
                                  name: row.name,
                                  text: critique,
                                })
                              }
                            >
                              {reviewOpenLabel}
                            </button>
                          ) : (
                            "-"
                          )}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          }
        />
      </ListingSectionShell>
      <Dialog
        open={Boolean(selectedCritique)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCritique(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{reviewModalTitle}</DialogTitle>
          </DialogHeader>
          {selectedCritique ? (
            <div className="space-y-3 text-sm">
              <p className={beagleTheme.mutedText}>
                {selectedCritique.registrationNo} • {selectedCritique.name}
              </p>
              <p className="whitespace-pre-wrap">{selectedCritique.text}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
