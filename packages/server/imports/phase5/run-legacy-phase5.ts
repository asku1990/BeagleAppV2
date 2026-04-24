import {
  TrialSourceTag,
  createImportRun,
  createImportRunIssue,
  createImportRunIssuesBulk,
  markImportRunFinished,
  markImportRunRunning,
  prisma,
  type AuditContextDb,
  type ImportKind,
  type ImportIssueSeverity,
} from "@beagle/db";
import type { ImportRunResponse } from "@beagle/contracts";
import type { ServiceResult } from "@server/core/result";
import { formatLegacyImportSummary } from "@server/imports/runs/phase-summary";
import { toImportRunResponse } from "@server/imports/runs/transform";
import { resolveTrialRuleWindowId } from "@server/trials/core";
import { parseLegacyDate } from "../core";
import { parseLegacySija } from "./internal/parse-legacy-sija";

type LegacyDetailSourceTable =
  | "bealt"
  | "bealt0"
  | "bealt1"
  | "bealt2"
  | "bealt3";

type LegacyDetailRow = {
  sourceTable: LegacyDetailSourceTable;
  rekno: string;
  tappa: string;
  tappv: string;
  era: number;
  alkoi?: string | null;
  hakumin: number | null;
  ajomin: number | null;
  haku: unknown | null;
  hauk: unknown | null;
  yva: unknown | null;
  hlo: unknown | null;
  alo: unknown | null;
  tja: unknown | null;
  pin: unknown | null;
  rawPayloadJson: string;
  [key: string]: unknown;
};

type ProjectionCounters = {
  eventsProjected: number;
  entriesProjected: number;
  erasProjected: number;
  eraLisatiedotProjected: number;
  skippedOrphanDetails: number;
  skippedNonSelectedDetails: number;
  unresolvedRules: number;
};

function legacyEntryKey(rekno: string, tappa: string, tappv: string): string {
  return `${rekno.trim()}|${tappa.trim()}|${tappv.trim()}`;
}

function eventLookupKey(tappv: string, tappa: string): string {
  return `LEGACY_AKOEALL|EVENT|${tappv}|${tappa}`;
}

function entryLookupKey(tappv: string, tappa: string, rekno: string): string {
  return `LEGACY_AKOEALL|ENTRY|${tappv}|${tappa}|${rekno}`;
}

function detailTableByDate(
  tappv: string,
): Exclude<LegacyDetailSourceTable, "bealt"> | null {
  const parsed = Number.parseInt(tappv, 10);
  if (!Number.isFinite(parsed)) return null;
  if (parsed <= 20020731) return "bealt0";
  if (parsed >= 20020801 && parsed <= 20050731) return "bealt1";
  if (parsed >= 20050801 && parsed <= 20110731) return "bealt2";
  if (parsed >= 20110801) return "bealt3";
  return null;
}

function toDecimalOrNull(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    const maybeDecimal = value as { toNumber?: () => number };
    const numeric = maybeDecimal.toNumber?.();
    return typeof numeric === "number" && Number.isFinite(numeric)
      ? numeric
      : null;
  }
  return null;
}

function toStringOrNull(value: unknown): string | null {
  if (value == null) return null;
  const next = String(value).trim();
  return next.length > 0 ? next : null;
}

function readLisatiedot(detail: LegacyDetailRow): Array<{
  koodi: string;
  arvo: string;
}> {
  const items: Array<{ koodi: string; arvo: string }> = [];
  for (const [key, rawValue] of Object.entries(detail)) {
    const match = key.match(/^lt(\d{2})$/i);
    if (!match) continue;
    const arvo = toStringOrNull(rawValue);
    if (!arvo) continue;
    items.push({ koodi: match[1], arvo });
  }
  return items;
}

async function loadAllLegacyDetails(): Promise<LegacyDetailRow[]> {
  const [bealt, bealt0, bealt1, bealt2, bealt3] = await Promise.all([
    prisma.legacyBealt.findMany(),
    prisma.legacyBealt0.findMany(),
    prisma.legacyBealt1.findMany(),
    prisma.legacyBealt2.findMany(),
    prisma.legacyBealt3.findMany(),
  ]);

  return [
    ...bealt.map((row) => ({ ...row, sourceTable: "bealt" as const })),
    ...bealt0.map((row) => ({ ...row, sourceTable: "bealt0" as const })),
    ...bealt1.map((row) => ({ ...row, sourceTable: "bealt1" as const })),
    ...bealt2.map((row) => ({ ...row, sourceTable: "bealt2" as const })),
    ...bealt3.map((row) => ({ ...row, sourceTable: "bealt3" as const })),
  ];
}

type BufferedIssue = {
  stage: string;
  severity?: ImportIssueSeverity;
  code: string;
  message: string;
  registrationNo?: string | null;
  sourceTable?: string | null;
  payloadJson?: string | null;
};

async function resetRuntimeProjection() {
  // Phase 5 is a one-shot bootstrap projection for empty runtime trial tables.
  // It intentionally wipes runtime trial rows before rebuilding from frozen
  // legacy mirror tables, and is not intended for mixed/non-empty environments.
  await prisma.$transaction([
    prisma.trialEraLisatieto.deleteMany({}),
    prisma.trialEra.deleteMany({}),
    prisma.trialEntry.deleteMany({}),
    prisma.trialEvent.deleteMany({}),
  ]);
}

// Runs phase 5 legacy trial runtime projection from frozen mirror tables.
// This phase is designed for one-time execution against an empty runtime trial DB.
export async function runLegacyPhase5(
  createdByUserId?: string,
  options?: {
    log?: (message: string) => void;
    auditSource?: AuditContextDb["source"];
  },
): Promise<ServiceResult<ImportRunResponse>> {
  const log = options?.log ?? (() => {});
  const stageStartedAt = new Map<string, number>();
  const startStage = (name: string) => {
    stageStartedAt.set(name, Date.now());
    log(`[stage:${name}] start`);
  };
  const finishStage = (name: string, summary?: string) => {
    const startedAt = stageStartedAt.get(name) ?? Date.now();
    const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
    log(
      `[stage:${name}] done in ${elapsedSeconds}s${summary ? ` ${summary}` : ""}`,
    );
  };
  const logProgress = (name: string, processed: number, total: number) => {
    const percent =
      total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 100;
    log(`[stage:${name}] progress ${processed}/${total} (${percent}%)`);
  };
  const auditContext: AuditContextDb = {
    actorUserId: createdByUserId ?? null,
    source: options?.auditSource ?? "SYSTEM",
  };

  let runId: string | null = null;
  const counters: ProjectionCounters = {
    eventsProjected: 0,
    entriesProjected: 0,
    erasProjected: 0,
    eraLisatiedotProjected: 0,
    skippedOrphanDetails: 0,
    skippedNonSelectedDetails: 0,
    unresolvedRules: 0,
  };
  let errorsCount = 0;
  const issueBuffer: BufferedIssue[] = [];
  const ISSUE_BUFFER_SIZE = 250;
  const flushIssueBuffer = async () => {
    if (!runId || issueBuffer.length === 0) return;
    const next = issueBuffer.splice(0, issueBuffer.length);
    await createImportRunIssuesBulk(runId, next, auditContext);
  };
  const recordIssue = async (issue: BufferedIssue) => {
    issueBuffer.push({ ...issue, severity: issue.severity ?? "WARNING" });
    if (issueBuffer.length >= ISSUE_BUFFER_SIZE) {
      await flushIssueBuffer();
    }
  };

  try {
    const run = await createImportRun({
      kind: "LEGACY_PHASE5" as ImportKind,
      createdByUserId,
      auditContext,
    });
    runId = run.id;
    await markImportRunRunning(run.id, auditContext);
    log(`Created import run ${run.id}`);

    startStage("load");
    const [akoeallRows, detailRows, activeRuleWindows] = await Promise.all([
      prisma.legacyAkoeall.findMany({
        orderBy: [{ tappv: "asc" }, { tappa: "asc" }, { rekno: "asc" }],
      }),
      loadAllLegacyDetails(),
      prisma.trialRuleWindow.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      }),
    ]);
    finishStage(
      "load",
      `akoeall=${akoeallRows.length} details=${detailRows.length} rules=${activeRuleWindows.length}`,
    );

    startStage("reset-runtime");
    await resetRuntimeProjection();
    finishStage("reset-runtime");

    startStage("index-details");
    const akoeallByKey = new Map(
      akoeallRows.map((row) => [
        legacyEntryKey(row.rekno, row.tappa, row.tappv),
        row,
      ]),
    );
    const selectedDetailsByKey = new Map<string, LegacyDetailRow[]>();

    for (const detail of detailRows) {
      const key = legacyEntryKey(detail.rekno, detail.tappa, detail.tappv);
      const parent = akoeallByKey.get(key);
      if (!parent) {
        counters.skippedOrphanDetails += 1;
        continue;
      }

      const expectedSourceTable = detailTableByDate(parent.tappv);
      if (!expectedSourceTable || detail.sourceTable !== expectedSourceTable) {
        counters.skippedNonSelectedDetails += 1;
        continue;
      }

      if (!selectedDetailsByKey.has(key)) {
        selectedDetailsByKey.set(key, []);
      }
      selectedDetailsByKey.get(key)?.push(detail);
    }
    finishStage(
      "index-details",
      `selected=${Array.from(selectedDetailsByKey.values()).reduce((sum, rows) => sum + rows.length, 0)} skippedOrphans=${counters.skippedOrphanDetails} skippedNonSelected=${counters.skippedNonSelectedDetails}`,
    );

    startStage("project-runtime");
    const eventIdByKey = new Map<string, string>();
    const totalRows = akoeallRows.length;
    const BATCH_SIZE = 1000;
    for (
      let batchStart = 0;
      batchStart < akoeallRows.length;
      batchStart += BATCH_SIZE
    ) {
      const batch = akoeallRows.slice(batchStart, batchStart + BATCH_SIZE);

      for (const row of batch) {
        const parsedDate = parseLegacyDate(row.tappv);
        if (!parsedDate) {
          errorsCount += 1;
          await recordIssue({
            stage: "project-runtime",
            severity: "ERROR",
            code: "TRIAL_PHASE5_INVALID_DATE",
            message: "Legacy akoeall row has invalid TAPPV date.",
            registrationNo: row.rekno,
            sourceTable: "legacy_akoeall",
            payloadJson: row.rawPayloadJson,
          });
          continue;
        }

        const trialRuleWindowId = resolveTrialRuleWindowId(
          activeRuleWindows,
          parsedDate,
        );
        if (!trialRuleWindowId) {
          counters.unresolvedRules += 1;
        }

        const eventKey = eventLookupKey(row.tappv, row.tappa);
        let eventId = eventIdByKey.get(eventKey);
        if (!eventId) {
          const event = await prisma.trialEvent.create({
            data: {
              legacyEventKey: eventKey,
              sklKoeId: null,
              koepaiva: parsedDate,
              koekunta: row.tappa,
              jarjestaja: null,
              kennelpiiri: row.kennelpiiri,
              kennelpiirinro: row.kennelpiirinro,
              ylituomariNimi: row.tuom1,
              ylituomariNumero: null,
              trialRuleWindowId,
              ytKertomus: null,
            },
            select: { id: true },
          });
          eventId = event.id;
          eventIdByKey.set(eventKey, event.id);
          counters.eventsProjected += 1;
        }

        const parsedSija = parseLegacySija(row.sija);
        if (parsedSija.unclear) {
          await recordIssue({
            stage: "project-runtime",
            code: "TRIAL_PHASE5_UNCLEAR_SIJA",
            message: `Legacy SIJA value could not be mapped: ${row.sija ?? "<null>"}`,
            registrationNo: row.rekno,
            sourceTable: "legacy_akoeall",
            payloadJson: row.rawPayloadJson,
          });
        }

        const entryKey = entryLookupKey(row.tappv, row.tappa, row.rekno);
        const dogRegistration = await prisma.dogRegistration.findUnique({
          where: { registrationNo: row.rekno },
          select: { dogId: true },
        });
        const entry = await prisma.trialEntry.create({
          data: {
            trialEventId: eventId,
            dogId: dogRegistration?.dogId ?? null,
            yksilointiAvain: entryKey,
            lahde: TrialSourceTag.LEGACY_AKOEALL,
            koemaasto: null,
            rekisterinumeroSnapshot: row.rekno,
            koemuoto: null,
            koiriaLuokassa: parsedSija.koiriaLuokassa,
            koetyyppi: parsedSija.koetyyppi,
            rotukoodi: null,
            ke: row.ke,
            lk: row.lk,
            pa: row.pa,
            piste: toDecimalOrNull(row.piste),
            sija: parsedSija.sija,
            haku: toDecimalOrNull(row.haku),
            hauk: toDecimalOrNull(row.hauk),
            yva: toDecimalOrNull(row.yva),
            hlo: toDecimalOrNull(row.hlo),
            alo: toDecimalOrNull(row.alo),
            tja: toDecimalOrNull(row.tja),
            pin: toDecimalOrNull(row.pin),
            tuom1: row.tuom1,
            vara: row.vara,
            omistajaSnapshot: null,
            omistajanKotikuntaSnapshot: null,
            raakadataJson: row.rawPayloadJson,
          },
          select: { id: true },
        });
        counters.entriesProjected += 1;

        const key = legacyEntryKey(row.rekno, row.tappa, row.tappv);
        const details = selectedDetailsByKey.get(key) ?? [];
        details.sort((a, b) => a.era - b.era);

        const seenEras = new Set<number>();
        for (const detail of details) {
          if (seenEras.has(detail.era)) continue;
          seenEras.add(detail.era);

          const era = await prisma.trialEra.create({
            data: {
              trialEntryId: entry.id,
              era: detail.era,
              alkoi: detail.alkoi,
              hakumin: detail.hakumin,
              ajomin: detail.ajomin,
              haku: toDecimalOrNull(detail.haku),
              hauk: toDecimalOrNull(detail.hauk),
              yva: toDecimalOrNull(detail.yva),
              hlo: toDecimalOrNull(detail.hlo),
              alo: toDecimalOrNull(detail.alo),
              tja: toDecimalOrNull(detail.tja),
              pin: toDecimalOrNull(detail.pin),
              raakadataJson: detail.rawPayloadJson,
            },
            select: { id: true },
          });
          counters.erasProjected += 1;

          const lisatiedot = readLisatiedot(detail);
          if (lisatiedot.length > 0) {
            await prisma.trialEraLisatieto.createMany({
              data: lisatiedot.map((item, index) => ({
                trialEraId: era.id,
                koodi: item.koodi,
                arvo: item.arvo,
                nimi: null,
                jarjestys: index + 1,
              })),
            });
            counters.eraLisatiedotProjected += lisatiedot.length;
          }
        }
      }

      await flushIssueBuffer();
      logProgress(
        "project-runtime",
        Math.min(totalRows, batchStart + batch.length),
        totalRows,
      );
      log(
        `[stage:project-runtime] batch events=${counters.eventsProjected} entries=${counters.entriesProjected} eras=${counters.erasProjected} eraLisatiedot=${counters.eraLisatiedotProjected}`,
      );
    }
    finishStage(
      "project-runtime",
      `events=${counters.eventsProjected} entries=${counters.entriesProjected} eras=${counters.erasProjected} eraLisatiedot=${counters.eraLisatiedotProjected} unresolvedRules=${counters.unresolvedRules}`,
    );

    startStage("finalize");
    await flushIssueBuffer();
    const finished = await markImportRunFinished(
      run.id,
      {
        status: errorsCount > 0 ? "FAILED" : "SUCCEEDED",
        dogsUpserted: 0,
        ownersUpserted: 0,
        ownershipsUpserted: 0,
        trialResultsUpserted: counters.entriesProjected,
        showResultsUpserted: 0,
        errorsCount,
        errorSummary: formatLegacyImportSummary({
          kind: "LEGACY_PHASE5",
          eventsProjected: counters.eventsProjected,
          entriesProjected: counters.entriesProjected,
          erasProjected: counters.erasProjected,
          eraLisatiedotProjected: counters.eraLisatiedotProjected,
          skippedOrphanDetails: counters.skippedOrphanDetails,
          skippedNonSelectedDetails: counters.skippedNonSelectedDetails,
          unresolvedRules: counters.unresolvedRules,
          errorsCount,
        }),
      },
      auditContext,
    );
    finishStage("finalize", `status=${finished.status} errors=${errorsCount}`);

    if (errorsCount > 0) {
      return {
        status: 500,
        body: {
          ok: false,
          code: "IMPORT_VALIDATION_FAILED",
          error: `Legacy phase5 projection failed (runId=${finished.id}).`,
        },
      };
    }

    return {
      status: 202,
      body: { ok: true, data: toImportRunResponse(finished) },
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "Import failed.";

    if (runId) {
      await createImportRunIssue(
        runId,
        {
          stage: "run",
          severity: "ERROR",
          code: "UNEXPECTED_EXCEPTION",
          message,
        },
        auditContext,
      );
      const finished = await markImportRunFinished(
        runId,
        {
          status: "FAILED",
          dogsUpserted: 0,
          ownersUpserted: 0,
          ownershipsUpserted: 0,
          trialResultsUpserted: counters.entriesProjected,
          showResultsUpserted: 0,
          errorsCount: errorsCount + 1,
          errorSummary: message,
        },
        auditContext,
      );
      return {
        status: 500,
        body: {
          ok: false,
          code: "IMPORT_FAILED",
          error: `Import run failed (runId=${finished.id}): ${message}`,
        },
      };
    }

    return {
      status: 500,
      body: {
        ok: false,
        code: "IMPORT_FAILED",
        error: `Import run failed before initialization: ${message}`,
      },
    };
  } finally {
    log("Import run finished");
  }
}
