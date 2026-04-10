import {
  type AuditContextDb,
  type ImportIssueSeverity,
  ImportKind,
  createImportRun,
  createImportRunIssue,
  createImportRunIssuesBulk,
  fetchLegacyPhase1_5Rows,
  markImportRunFinished,
  markImportRunRunning,
  prisma,
} from "@beagle/db";
import type { ImportRunResponse } from "@beagle/contracts";
import type { ServiceResult } from "../../core/result";
import {
  isValidRegistrationNo,
  normalizeNullable,
  normalizeRegistrationNo,
} from "../core";
import { toImportRunResponse } from "../runs/transform";

type TitleCandidate = {
  registrationNo: string;
  rawTitleCode: string;
  normalizedTitleCode: string;
};

function normalizeTitleCodeForComparison(value: string): string {
  return value.replace(/\s+/g, " ").toUpperCase();
}

function sortUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function pickTitleCode(
  candidates: TitleCandidate[],
  canonicalRegistrationNo: string | null,
): string {
  const canonicalCandidates =
    canonicalRegistrationNo == null
      ? []
      : candidates.filter(
          (candidate) => candidate.registrationNo === canonicalRegistrationNo,
        );
  const scoped =
    canonicalCandidates.length > 0 ? canonicalCandidates : candidates;
  const sorted = [...scoped].sort((left, right) => {
    const rawCompare = left.rawTitleCode.localeCompare(right.rawTitleCode);
    if (rawCompare !== 0) return rawCompare;
    return left.registrationNo.localeCompare(right.registrationNo);
  });
  return sorted[0]?.rawTitleCode ?? candidates[0]?.rawTitleCode ?? "";
}

// Imports raw legacy title rows as one DogTitle per dog, with alias conflict issues.
export async function runLegacyPhase1_5(
  createdByUserId?: string,
  options?: {
    log?: (message: string) => void;
    auditSource?: AuditContextDb["source"];
  },
): Promise<ServiceResult<ImportRunResponse>> {
  const log = options?.log ?? (() => {});
  const auditContext: AuditContextDb = {
    actorUserId: createdByUserId ?? null,
    source: options?.auditSource ?? "SYSTEM",
  };
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

  let runId: string | null = null;
  let errorsCount = 0;
  const issueBuffer: Array<{
    stage: string;
    severity?: ImportIssueSeverity;
    code: string;
    message: string;
    registrationNo?: string | null;
    sourceTable?: string | null;
    payloadJson?: string | null;
  }> = [];
  const ISSUE_BUFFER_SIZE = 250;
  const flushIssueBuffer = async () => {
    if (!runId || issueBuffer.length === 0) return;
    const next = issueBuffer.splice(0, issueBuffer.length);
    await createImportRunIssuesBulk(runId, next, auditContext);
  };
  const recordIssue = async (issue: {
    stage: string;
    severity?: ImportIssueSeverity;
    code: string;
    message: string;
    registrationNo?: string | null;
    sourceTable?: string | null;
    payloadJson?: string | null;
  }) => {
    issueBuffer.push({ ...issue, severity: issue.severity ?? "WARNING" });
    if (issueBuffer.length >= ISSUE_BUFFER_SIZE) {
      await flushIssueBuffer();
    }
  };

  try {
    const run = await createImportRun({
      kind: ImportKind.LEGACY_PHASE1_5,
      createdByUserId,
      auditContext,
    });
    runId = run.id;
    log(`Created import run ${run.id}`);
    await markImportRunRunning(run.id, auditContext);
    log("Marked run as RUNNING");

    startStage("load");
    const titleRows = await fetchLegacyPhase1_5Rows({
      log: (message) => log(`[stage:load] ${message}`),
    });
    log(`Loaded legacy title rows: rows=${titleRows.length}`);
    finishStage("load");

    startStage("index");
    const registrationRows = await prisma.dogRegistration.findMany({
      select: {
        registrationNo: true,
        dogId: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    const dogIdByRegistration = new Map<string, string>();
    const canonicalRegistrationByDogId = new Map<string, string>();
    for (const row of registrationRows) {
      dogIdByRegistration.set(row.registrationNo, row.dogId);
      if (!canonicalRegistrationByDogId.has(row.dogId)) {
        canonicalRegistrationByDogId.set(row.dogId, row.registrationNo);
      }
    }
    log(
      `Indexed registrations=${dogIdByRegistration.size}, dogs=${canonicalRegistrationByDogId.size}`,
    );
    finishStage("index");

    startStage("titles");
    let processed = 0;
    let skippedBlank = 0;
    const candidatesByDogId = new Map<string, TitleCandidate[]>();
    for (const row of titleRows) {
      processed += 1;

      const rawTitleCode = normalizeNullable(row.titleCodeRaw);
      if (!rawTitleCode) {
        skippedBlank += 1;
        if (processed % 1000 === 0) {
          logProgress("titles", processed, titleRows.length);
        }
        continue;
      }

      const registrationNo = normalizeRegistrationNo(row.registrationNo);
      if (!registrationNo) {
        errorsCount += 1;
        await recordIssue({
          stage: "titles",
          code: "TITLE_REGISTRATION_MISSING",
          message:
            "Title row is missing registration number; row skipped before dog resolution.",
          sourceTable: "bea_apu",
          payloadJson: JSON.stringify(row),
        });
        if (processed % 1000 === 0) {
          logProgress("titles", processed, titleRows.length);
        }
        continue;
      }

      if (!isValidRegistrationNo(registrationNo)) {
        errorsCount += 1;
        await recordIssue({
          stage: "titles",
          code: "TITLE_REGISTRATION_INVALID_FORMAT",
          message: "Title row has invalid registration format.",
          registrationNo,
          sourceTable: "bea_apu",
          payloadJson: JSON.stringify(row),
        });
        if (processed % 1000 === 0) {
          logProgress("titles", processed, titleRows.length);
        }
        continue;
      }

      const dogId = dogIdByRegistration.get(registrationNo);
      if (!dogId) {
        errorsCount += 1;
        await recordIssue({
          stage: "titles",
          code: "TITLE_DOG_NOT_FOUND",
          message:
            "Title row registration did not resolve to a dog in canonical registrations.",
          registrationNo,
          sourceTable: "bea_apu",
          payloadJson: JSON.stringify(row),
        });
        if (processed % 1000 === 0) {
          logProgress("titles", processed, titleRows.length);
        }
        continue;
      }

      const candidates = candidatesByDogId.get(dogId) ?? [];
      candidates.push({
        registrationNo,
        rawTitleCode,
        normalizedTitleCode: normalizeTitleCodeForComparison(rawTitleCode),
      });
      candidatesByDogId.set(dogId, candidates);

      if (processed % 1000 === 0) {
        logProgress("titles", processed, titleRows.length);
      }
    }
    logProgress("titles", processed, titleRows.length);

    const titlesToCreate: Array<{
      dogId: string;
      titleCode: string;
    }> = [];
    let conflicts = 0;

    for (const [dogId, candidates] of candidatesByDogId.entries()) {
      if (candidates.length === 0) continue;
      const canonicalRegistrationNo =
        canonicalRegistrationByDogId.get(dogId) ?? null;
      const candidatesByNormalizedCode = new Map<string, TitleCandidate[]>();
      for (const candidate of candidates) {
        const values =
          candidatesByNormalizedCode.get(candidate.normalizedTitleCode) ?? [];
        values.push(candidate);
        candidatesByNormalizedCode.set(candidate.normalizedTitleCode, values);
      }

      const distinctValues = sortUnique(candidatesByNormalizedCode.keys());
      const canonicalDistinctValues = canonicalRegistrationNo
        ? sortUnique(
            candidates
              .filter(
                (candidate) =>
                  candidate.registrationNo === canonicalRegistrationNo,
              )
              .map((candidate) => candidate.normalizedTitleCode),
          )
        : [];

      if (distinctValues.length > 1) {
        conflicts += 1;
        errorsCount += 1;
        await recordIssue({
          stage: "titles",
          code: "TITLE_ALIAS_VALUE_CONFLICT",
          message:
            "Conflicting alias title values detected: the same dog resolved from multiple registrations with distinct non-empty normalized VALIO values.",
          registrationNo: canonicalRegistrationNo,
          sourceTable: "bea_apu",
          payloadJson: JSON.stringify({
            dogId,
            canonicalRegistrationNo,
            distinctNormalizedValues: distinctValues,
            sourceRegistrations: sortUnique(
              candidates.map((candidate) => candidate.registrationNo),
            ),
            canonicalNormalizedValues: canonicalDistinctValues,
            sourceRows: [...candidates]
              .map((candidate) => ({
                registrationNo: candidate.registrationNo,
                titleCodeRaw: candidate.rawTitleCode,
                normalizedTitleCode: candidate.normalizedTitleCode,
                isCanonicalRegistration:
                  candidate.registrationNo === canonicalRegistrationNo,
              }))
              .sort((left, right) => {
                const leftKey = `${left.registrationNo}|${left.normalizedTitleCode}|${left.titleCodeRaw}`;
                const rightKey = `${right.registrationNo}|${right.normalizedTitleCode}|${right.titleCodeRaw}`;
                return leftKey.localeCompare(rightKey);
              }),
          }),
        });
      }

      const preferredNormalizedValue =
        canonicalDistinctValues[0] ?? distinctValues[0];
      if (!preferredNormalizedValue) {
        continue;
      }
      const valueCandidates =
        candidatesByNormalizedCode.get(preferredNormalizedValue) ?? [];
      if (valueCandidates.length === 0) {
        continue;
      }

      const titleCode = pickTitleCode(valueCandidates, canonicalRegistrationNo);
      titlesToCreate.push({
        dogId,
        titleCode,
      });
    }

    titlesToCreate.sort((left, right) => left.dogId.localeCompare(right.dogId));
    const CREATE_MANY_CHUNK_SIZE = 1000;
    let titlesInserted = 0;
    for (
      let start = 0;
      start < titlesToCreate.length;
      start += CREATE_MANY_CHUNK_SIZE
    ) {
      const chunk = titlesToCreate.slice(start, start + CREATE_MANY_CHUNK_SIZE);
      if (chunk.length === 0) continue;
      // Phase1.5 is part of the one-shot legacy bootstrap flow where DogTitle
      // rows are expected to be empty before import. No replay/reconciliation
      // behavior is required in this migration step.
      await prisma.dogTitle.createMany({
        data: chunk.map((title) => ({
          dogId: title.dogId,
          titleCode: title.titleCode,
          titleName: null,
          awardedOn: null,
          sortOrder: 0,
        })),
      });
      titlesInserted += chunk.length;
    }

    finishStage(
      "titles",
      `rows=${titleRows.length}, dogsWithImportedTitle=${titlesInserted}, skippedBlank=${skippedBlank}, conflicts=${conflicts}`,
    );

    await flushIssueBuffer();

    const finished = await markImportRunFinished(
      run.id,
      {
        status: "SUCCEEDED",
        dogsUpserted: 0,
        ownersUpserted: 0,
        ownershipsUpserted: 0,
        trialResultsUpserted: 0,
        showResultsUpserted: 0,
        errorsCount,
        errorSummary:
          errorsCount > 0 ? "Import completed with warnings." : null,
      },
      auditContext,
    );

    return {
      status: 202,
      body: { ok: true, data: toImportRunResponse(finished) },
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "Import failed.";
    log(`Import failed: ${message}`);
    if (!runId) {
      return {
        status: 500,
        body: {
          ok: false,
          code: "IMPORT_FAILED",
          error: `Import run failed before initialization: ${message}`,
        },
      };
    }

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
    await flushIssueBuffer();
    const finished = await markImportRunFinished(
      runId,
      {
        status: "FAILED",
        dogsUpserted: 0,
        ownersUpserted: 0,
        ownershipsUpserted: 0,
        trialResultsUpserted: 0,
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
  } finally {
    log("Import run finished");
  }
}
