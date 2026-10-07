import {
  getBeagleTrialAwardSummaryDb,
  getBeagleTrialSearchSummaryDb,
  searchBeagleTrialsDb,
  type BeagleTrialSearchSortDb,
} from "@beagle/db";
import type {
  BeagleTrialSearchRequest,
  BeagleTrialSearchMode,
  BeagleTrialSearchResponse,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "../core/logger";
import type { ServiceResult } from "../core/result";
import {
  getTrialDateOnlyUtcRange,
  formatTrialDateOnly,
} from "./core/date-only";
import {
  formatTrialSeason,
  getTrialSeasonUtcRange,
  parseTrialSeason,
  toTrialSeason,
} from "./core/trial-season";
import { parseIsoDateOnly } from "./internal/iso-date";
import { mapBeagleTrialAwardSummary } from "./internal/map-beagle-trial-award-summary";
import { mapBeagleTrialSearchSummary } from "./internal/map-beagle-trial-search-summary";
import { canRenderTrialDogPdf } from "./pdf";
import type { TrialsServiceLogContext } from "./types";

const ALLOWED_SORTS: ReadonlySet<BeagleTrialSearchSortDb> = new Set([
  "date-desc",
  "date-asc",
]);

function parseSort(
  value: string | undefined,
): { ok: true; value: BeagleTrialSearchSortDb } | { ok: false } {
  if (!value) return { ok: true, value: "date-desc" };
  if (ALLOWED_SORTS.has(value as BeagleTrialSearchSortDb)) {
    return { ok: true, value: value as BeagleTrialSearchSortDb };
  }
  return { ok: false };
}

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(100, Math.max(1, Math.floor(value ?? 10)));
}

function collectAvailableSeasons(availableEventDates: Date[]): string[] {
  return Array.from(
    new Set(
      availableEventDates.map((value) =>
        formatTrialSeason(toTrialSeason(value)),
      ),
    ),
  ).sort((left, right) => right.localeCompare(left));
}

export async function searchBeagleTrialsService(
  input: BeagleTrialSearchRequest,
  context?: TrialsServiceLogContext,
): Promise<ServiceResult<BeagleTrialSearchResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "trials.searchBeagleTrials",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const sortResult = parseSort(input.sort);
  if (!sortResult.ok) {
    log.warn(
      {
        event: "invalid_sort",
        sort: input.sort,
        durationMs: Date.now() - startedAt,
      },
      "trials search rejected because sort is invalid",
    );
    return {
      status: 400,
      body: { ok: false, error: "Invalid sort value." },
    };
  }

  const season = parseTrialSeason(input.season);
  const hasSeasonInput =
    input.season != null &&
    (typeof input.season !== "string" || input.season.trim() !== "");
  if (hasSeasonInput && season == null) {
    log.warn(
      {
        event: "invalid_season",
        season:
          typeof input.season === "string" ? input.season.trim() : input.season,
        durationMs: Date.now() - startedAt,
      },
      "trials search rejected because season is invalid",
    );
    return {
      status: 400,
      body: { ok: false, error: "Invalid season value." },
    };
  }

  const dateFromIso = parseIsoDateOnly(input.dateFrom);
  const dateToIso = parseIsoDateOnly(input.dateTo);
  const hasDateFromInput = Boolean(input.dateFrom?.trim());
  const hasDateToInput = Boolean(input.dateTo?.trim());
  const hasRangeInput = hasDateFromInput || hasDateToInput;

  if ((hasDateFromInput && !dateFromIso) || (hasDateToInput && !dateToIso)) {
    log.warn(
      {
        event: "invalid_date_range",
        dateFrom: input.dateFrom?.trim() || undefined,
        dateTo: input.dateTo?.trim() || undefined,
        durationMs: Date.now() - startedAt,
      },
      "trials search rejected because date range is invalid",
    );
    return {
      status: 400,
      body: { ok: false, error: "Invalid date range value." },
    };
  }

  if (season != null && hasRangeInput) {
    log.warn(
      {
        event: "mixed_filters",
        season: formatTrialSeason(season),
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        durationMs: Date.now() - startedAt,
      },
      "trials search rejected because season and range filters are mixed",
    );
    return {
      status: 400,
      body: { ok: false, error: "Use either season or date range filter." },
    };
  }

  if (hasRangeInput && (!dateFromIso || !dateToIso)) {
    log.warn(
      {
        event: "incomplete_range",
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        durationMs: Date.now() - startedAt,
      },
      "trials search rejected because date range is incomplete",
    );
    return {
      status: 400,
      body: { ok: false, error: "Both dateFrom and dateTo are required." },
    };
  }

  if (dateFromIso && dateToIso && dateFromIso > dateToIso) {
    log.warn(
      {
        event: "invalid_range_order",
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        durationMs: Date.now() - startedAt,
      },
      "trials search rejected because dateFrom is after dateTo",
    );
    return {
      status: 400,
      body: { ok: false, error: "dateFrom must be before or equal to dateTo." },
    };
  }

  const normalizedPage = parsePage(input.page);
  const normalizedPageSize = parsePageSize(input.pageSize);

  log.info(
    {
      event: "start",
      season: season ? formatTrialSeason(season) : undefined,
      dateFrom: dateFromIso,
      dateTo: dateToIso,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      sort: sortResult.value,
    },
    "trials search started",
  );

  try {
    const rangeFromDate = dateFromIso
      ? getTrialDateOnlyUtcRange(new Date(`${dateFromIso}T00:00:00.000Z`)).start
      : null;
    const rangeToExclusive = dateToIso
      ? getTrialDateOnlyUtcRange(new Date(`${dateToIso}T00:00:00.000Z`))
          .endExclusive
      : null;

    const resolvedMode =
      season != null ? "season" : hasRangeInput ? "range" : null;

    let filterMode: BeagleTrialSearchMode = "season";
    let filterSeason: string | null = null;
    let filterDateFrom: string | null = null;
    let filterDateTo: string | null = null;
    let summaryDateFrom: Date | undefined;
    let summaryDateTo: Date | undefined;
    let result: Awaited<ReturnType<typeof searchBeagleTrialsDb>>;

    if (resolvedMode === "season") {
      const seasonRange = getTrialSeasonUtcRange(
        season as NonNullable<typeof season>,
      );
      result = await searchBeagleTrialsDb({
        dateFrom: seasonRange.start,
        dateTo: seasonRange.endExclusive,
        page: normalizedPage,
        pageSize: normalizedPageSize,
        sort: sortResult.value,
      });
      filterSeason = formatTrialSeason(season as NonNullable<typeof season>);
      summaryDateFrom = seasonRange.start;
      summaryDateTo = seasonRange.endExclusive;
    } else if (resolvedMode === "range") {
      result = await searchBeagleTrialsDb({
        dateFrom: rangeFromDate ?? undefined,
        dateTo: rangeToExclusive ?? undefined,
        page: normalizedPage,
        pageSize: normalizedPageSize,
        sort: sortResult.value,
      });
      filterMode = "range";
      filterDateFrom = dateFromIso;
      filterDateTo = dateToIso;
      summaryDateFrom = rangeFromDate ?? undefined;
      summaryDateTo = rangeToExclusive ?? undefined;
    } else {
      const available = await searchBeagleTrialsDb({
        page: 1,
        pageSize: 1,
        sort: sortResult.value,
      });
      const availableSeasons = collectAvailableSeasons(
        available.availableEventDates,
      );
      const latestSeason = availableSeasons[0];
      if (!latestSeason) {
        result = available;
      } else {
        const latest = parseTrialSeason(latestSeason);
        if (!latest) throw new Error("Failed to build trial season range.");
        const seasonRange = getTrialSeasonUtcRange(latest);
        result = await searchBeagleTrialsDb({
          dateFrom: seasonRange.start,
          dateTo: seasonRange.endExclusive,
          page: normalizedPage,
          pageSize: normalizedPageSize,
          sort: sortResult.value,
        });
        filterSeason = latestSeason;
        summaryDateFrom = seasonRange.start;
        summaryDateTo = seasonRange.endExclusive;
      }
    }

    const availableSeasons = collectAvailableSeasons(
      result.availableEventDates,
    );
    const [awardSummaryRows, searchSummarySource] = await Promise.all([
      getBeagleTrialAwardSummaryDb(),
      getBeagleTrialSearchSummaryDb({
        dateFrom: summaryDateFrom,
        dateTo: summaryDateTo,
      }),
    ]);

    const data: BeagleTrialSearchResponse = {
      filters: {
        mode: filterMode,
        season: filterSeason,
        dateFrom: filterDateFrom,
        dateTo: filterDateTo,
      },
      availableSeasons,
      total: result.total,
      totalPages: result.totalPages,
      page: result.page,
      items: result.items.map((item) => ({
        trialId: item.trialEventId,
        pdfTrialEntryIds: canRenderTrialDogPdf(item.trialRuleWindowId)
          ? item.trialEntryIds
          : [],
        eventDate: formatTrialDateOnly(item.eventDate),
        eventPlace: item.eventPlace,
        judge: item.judge,
        dogCount: item.dogCount,
        weather: item.weather,
        average: item.average,
      })),
      awardSummary: mapBeagleTrialAwardSummary(awardSummaryRows),
      searchSummary: mapBeagleTrialSearchSummary(searchSummarySource),
    };

    log.info(
      {
        event: "success",
        mode: data.filters.mode,
        total: data.total,
        itemCount: data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "trials search succeeded",
    );

    return { status: 200, body: { ok: true, data } };
  } catch (error) {
    log.error(
      {
        event: "exception",
        season:
          typeof input.season === "string"
            ? input.season.trim() || undefined
            : input.season,
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "trials search failed",
    );
    return {
      status: 500,
      body: { ok: false, error: "Failed to load beagle trials." },
    };
  }
}
