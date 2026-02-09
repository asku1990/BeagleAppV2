import {
  ImportKind,
  createImportRunIssue,
  createImportRunIssuesBulk,
  createImportRun,
  fetchLegacyPhase1Rows,
  getImportRunById,
  listImportRunIssues,
  markImportRunFinished,
  markImportRunRunning,
  prisma,
} from "@beagle/db";
import type { ImportIssueSeverity } from "@beagle/db";
import type {
  ImportRunIssuesResponse,
  ImportRunResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../shared/result";
import { upsertEventRows, upsertOwner } from "./persistence";
import {
  mapSex,
  normalizeNullable,
  parseLegacyDate,
  toImportRunIssueResponse,
  toImportRunResponse,
} from "./transform";

function formatImportError(error: unknown): string {
  if (!(error instanceof Error)) return "Import failed.";

  const lines = error.message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return "Import failed.";

  const constraintLine = lines.find((line) =>
    line.toLowerCase().includes("constraint failed"),
  );
  if (constraintLine) return constraintLine;

  const operationLine = lines.find(
    (line) =>
      !line.startsWith("Invalid `prisma.") &&
      !line.startsWith("/") &&
      !/^\d+/.test(line) &&
      !line.startsWith("→"),
  );
  if (operationLine) return operationLine;

  return lines[lines.length - 1] ?? "Import failed.";
}

function isPlaceholderRegistration(value: string | null): boolean {
  return value != null && /^U0+$/i.test(value);
}

export function createImportsService() {
  return {
    async runLegacyPhase1(
      createdByUserId?: string,
      options?: { log?: (message: string) => void },
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
          total > 0
            ? Math.min(100, Math.round((processed / total) * 100))
            : 100;
        log(`[stage:${name}] progress ${processed}/${total} (${percent}%)`);
      };

      const run = await createImportRun({
        kind: ImportKind.LEGACY_PHASE1,
        createdByUserId,
      });
      log(`Created import run ${run.id}`);
      await markImportRunRunning(run.id);
      log("Marked run as RUNNING");

      let dogsUpserted = 0;
      let ownersUpserted = 0;
      let ownershipsUpserted = 0;
      let trialResultsUpserted = 0;
      let showResultsUpserted = 0;
      let errorsCount = 0;
      const issueBuffer: Array<{
        stage: string;
        severity?: ImportIssueSeverity;
        code: string;
        message: string;
        registrationNo?: string | null;
        sourceRowId?: number | null;
        sourceTable?: string | null;
        payloadJson?: string | null;
      }> = [];
      const ISSUE_BUFFER_SIZE = 250;
      const flushIssueBuffer = async () => {
        if (issueBuffer.length === 0) return;
        const next = issueBuffer.splice(0, issueBuffer.length);
        await createImportRunIssuesBulk(run.id, next);
      };
      const recordIssue = async (issue: {
        stage: string;
        severity?: ImportIssueSeverity;
        code: string;
        message: string;
        registrationNo?: string | null;
        sourceRowId?: number | null;
        sourceTable?: string | null;
        payloadJson?: string | null;
      }) => {
        issueBuffer.push(issue);
        if (issueBuffer.length >= ISSUE_BUFFER_SIZE) {
          await flushIssueBuffer();
        }
      };

      try {
        startStage("load");
        const legacy = await fetchLegacyPhase1Rows({
          log: (message) => log(`[stage:load] ${message}`),
        });
        log(
          `Loaded legacy rows: dogs=${legacy.dogs.length}, eks=${legacy.eks.length}, owners=${legacy.owners.length}, trialResults=${legacy.trialResults.length}, showResults=${legacy.showResults.length}`,
        );
        finishStage("load");

        startStage("dogs");
        const totalDogs = legacy.dogs.length;
        let dogsProcessed = 0;
        for (const row of legacy.dogs) {
          dogsProcessed += 1;
          const registrationNo = normalizeNullable(row.registrationNo);
          const name = normalizeNullable(row.name);
          if (!registrationNo || !name) {
            errorsCount += 1;
            await recordIssue({
              stage: "dogs",
              code: "DOG_MISSING_REQUIRED_FIELDS",
              message: "Dog row missing registration number or name.",
              registrationNo,
              sourceTable: "bearek_id",
              payloadJson: JSON.stringify({
                registrationNo: row.registrationNo,
                name: row.name,
              }),
            });
            if (dogsProcessed % 1000 === 0) {
              logProgress("dogs", dogsProcessed, totalDogs);
            }
            continue;
          }

          const breederName = normalizeNullable(row.breederName);
          let breederId: string | undefined;
          if (breederName) {
            const breeder = await prisma.breeder.upsert({
              where: { name: breederName },
              create: { name: breederName },
              update: {},
              select: { id: true },
            });
            breederId = breeder.id;
          }

          await prisma.dog.upsert({
            where: { registrationNo },
            create: {
              registrationNo,
              name,
              sex: mapSex(row.sex),
              birthDate: parseLegacyDate(row.birthDateRaw),
              breederId,
            },
            update: {
              name,
              sex: mapSex(row.sex),
              birthDate: parseLegacyDate(row.birthDateRaw),
              breederId,
            },
          });

          dogsUpserted += 1;
          if (dogsProcessed % 1000 === 0) {
            logProgress("dogs", dogsProcessed, totalDogs);
          }
        }
        logProgress("dogs", dogsProcessed, totalDogs);
        finishStage("dogs", `dogsUpserted=${dogsUpserted}`);

        startStage("ek");
        const totalEks = legacy.eks.length;
        let eksProcessed = 0;
        let eksApplied = 0;
        let eksSkipped = 0;
        for (const row of legacy.eks) {
          eksProcessed += 1;
          const registrationNo = normalizeNullable(row.registrationNo);
          if (!registrationNo || row.ekNo == null) {
            eksSkipped += 1;
            if (!registrationNo) {
              errorsCount += 1;
              await recordIssue({
                stage: "ek",
                code: "EK_MISSING_REGISTRATION",
                message: "EK row missing registration number.",
                sourceTable: "bea_apu",
                payloadJson: JSON.stringify({
                  registrationNo: row.registrationNo,
                  ekNo: row.ekNo,
                }),
              });
            }
            if (eksProcessed % 1000 === 0) {
              logProgress("ek", eksProcessed, totalEks);
            }
            continue;
          }
          const result = await prisma.dog.updateMany({
            where: { registrationNo },
            data: { ekNo: Number(row.ekNo) },
          });
          eksApplied += result.count;
          if (eksProcessed % 1000 === 0) {
            logProgress("ek", eksProcessed, totalEks);
          }
        }
        logProgress("ek", eksProcessed, totalEks);
        finishStage("ek", `applied=${eksApplied}, skipped=${eksSkipped}`);

        startStage("index");
        const dogRows = await prisma.dog.findMany({
          select: { id: true, registrationNo: true },
        });
        const dogIdByRegistration = new Map(
          dogRows.map((row) => [row.registrationNo, row.id]),
        );
        log(`Indexed dogs by registration: ${dogIdByRegistration.size}`);
        finishStage("index");

        startStage("relations");
        const totalRelations = legacy.dogs.length;
        let relationsProcessed = 0;
        let relationsUpdated = 0;
        let relationsSkippedNoRegistration = 0;
        let relationsSkippedDogNotFound = 0;
        let missingSireRefs = 0;
        let missingDamRefs = 0;
        let skippedPlaceholderSireRefs = 0;
        let skippedPlaceholderDamRefs = 0;
        for (const row of legacy.dogs) {
          relationsProcessed += 1;
          const registrationNo = normalizeNullable(row.registrationNo);
          if (!registrationNo) {
            relationsSkippedNoRegistration += 1;
            if (relationsProcessed % 1000 === 0) {
              logProgress("relations", relationsProcessed, totalRelations);
            }
            continue;
          }
          const dogId = dogIdByRegistration.get(registrationNo);
          if (!dogId) {
            relationsSkippedDogNotFound += 1;
            if (relationsProcessed % 1000 === 0) {
              logProgress("relations", relationsProcessed, totalRelations);
            }
            continue;
          }

          const sireRegistrationNo = normalizeNullable(row.sireRegistrationNo);
          const damRegistrationNo = normalizeNullable(row.damRegistrationNo);
          const sireRegistrationForLookup = isPlaceholderRegistration(
            sireRegistrationNo,
          )
            ? null
            : sireRegistrationNo;
          const damRegistrationForLookup = isPlaceholderRegistration(
            damRegistrationNo,
          )
            ? null
            : damRegistrationNo;
          if (sireRegistrationNo && !sireRegistrationForLookup) {
            skippedPlaceholderSireRefs += 1;
          }
          if (damRegistrationNo && !damRegistrationForLookup) {
            skippedPlaceholderDamRefs += 1;
          }
          const sireId = sireRegistrationForLookup
            ? dogIdByRegistration.get(sireRegistrationForLookup)
            : undefined;
          const damId = damRegistrationForLookup
            ? dogIdByRegistration.get(damRegistrationForLookup)
            : undefined;
          if (sireRegistrationForLookup && !sireId) missingSireRefs += 1;
          if (sireRegistrationForLookup && !sireId) {
            errorsCount += 1;
            await recordIssue({
              stage: "relations",
              code: "RELATION_SIRE_NOT_FOUND",
              message:
                "Referenced sire registration was not found among imported dogs.",
              registrationNo,
              sourceTable: "bearek_id",
              payloadJson: JSON.stringify({
                registrationNo,
                sireRegistrationNo: sireRegistrationForLookup,
              }),
            });
          }
          if (damRegistrationForLookup && !damId) missingDamRefs += 1;
          if (damRegistrationForLookup && !damId) {
            errorsCount += 1;
            await recordIssue({
              stage: "relations",
              code: "RELATION_DAM_NOT_FOUND",
              message:
                "Referenced dam registration was not found among imported dogs.",
              registrationNo,
              sourceTable: "bearek_id",
              payloadJson: JSON.stringify({
                registrationNo,
                damRegistrationNo: damRegistrationForLookup,
              }),
            });
          }

          await prisma.dog.update({
            where: { id: dogId },
            data: {
              sireId: sireId ?? null,
              damId: damId ?? null,
            },
          });
          relationsUpdated += 1;
          if (relationsProcessed % 1000 === 0) {
            logProgress("relations", relationsProcessed, totalRelations);
          }
        }
        logProgress("relations", relationsProcessed, totalRelations);
        finishStage(
          "relations",
          `updated=${relationsUpdated}, skippedNoRegistration=${relationsSkippedNoRegistration}, skippedDogNotFound=${relationsSkippedDogNotFound}, missingSireRefs=${missingSireRefs}, missingDamRefs=${missingDamRefs}, skippedPlaceholderSireRefs=${skippedPlaceholderSireRefs}, skippedPlaceholderDamRefs=${skippedPlaceholderDamRefs}`,
        );

        startStage("owners");
        const totalOwners = legacy.owners.length;
        let ownersProcessed = 0;
        for (const row of legacy.owners) {
          ownersProcessed += 1;
          const dogId = dogIdByRegistration.get(row.registrationNo);
          if (!dogId) {
            errorsCount += 1;
            await recordIssue({
              stage: "owners",
              code: "OWNER_DOG_NOT_FOUND",
              message: "Owner row references a dog that was not found.",
              registrationNo: row.registrationNo,
              sourceRowId: row.sourceRowId,
              sourceTable: "beaom",
              payloadJson: JSON.stringify({
                registrationNo: row.registrationNo,
                sourceRowId: row.sourceRowId,
              }),
            });
            if (ownersProcessed % 1000 === 0) {
              logProgress("owners", ownersProcessed, totalOwners);
            }
            continue;
          }

          const ownerId = await upsertOwner(row);
          if (!ownerId) {
            errorsCount += 1;
            await recordIssue({
              stage: "owners",
              code: "OWNER_MISSING_REQUIRED_FIELDS",
              message: "Owner row missing required owner identity fields.",
              registrationNo: row.registrationNo,
              sourceRowId: row.sourceRowId,
              sourceTable: "beaom",
              payloadJson: JSON.stringify({
                ownerName: row.ownerName,
                postalCode: row.postalCode,
                city: row.city,
              }),
            });
            if (ownersProcessed % 1000 === 0) {
              logProgress("owners", ownersProcessed, totalOwners);
            }
            continue;
          }

          ownersUpserted += 1;

          const ownershipDate = parseLegacyDate(row.ownershipDateRaw);
          const existingOwnership = await prisma.dogOwnership.findFirst({
            where: {
              dogId,
              ownerId,
              ownershipDate,
              sourceRowId: row.sourceRowId,
            },
            select: { id: true },
          });
          if (!existingOwnership) {
            await prisma.dogOwnership.create({
              data: {
                dogId,
                ownerId,
                ownershipDate,
                sourceRowId: row.sourceRowId,
              },
            });
            ownershipsUpserted += 1;
          }
          if (ownersProcessed % 1000 === 0) {
            logProgress("owners", ownersProcessed, totalOwners);
          }
        }
        logProgress("owners", ownersProcessed, totalOwners);
        log(
          `Owners processed: ownersUpserted=${ownersUpserted}, ownershipsUpserted=${ownershipsUpserted}`,
        );
        finishStage("owners");

        startStage("trials");
        const trialResult = await upsertEventRows(
          legacy.trialResults,
          "trial",
          dogIdByRegistration,
          {
            onProgress: (processed, total) =>
              logProgress("trials", processed, total),
          },
        );
        trialResultsUpserted = trialResult.upserted;
        errorsCount += trialResult.errors;
        for (const issue of trialResult.issues) {
          await recordIssue({
            stage: "trials",
            code: issue.code,
            message: issue.message,
            registrationNo: issue.registrationNo,
            sourceTable: issue.sourceTable,
            payloadJson: issue.payloadJson,
          });
        }
        log(
          `Trial results upserted=${trialResultsUpserted}, trial errors=${trialResult.errors}`,
        );
        finishStage("trials");

        startStage("shows");
        const showResult = await upsertEventRows(
          legacy.showResults,
          "show",
          dogIdByRegistration,
          {
            onProgress: (processed, total) =>
              logProgress("shows", processed, total),
          },
        );
        showResultsUpserted = showResult.upserted;
        errorsCount += showResult.errors;
        for (const issue of showResult.issues) {
          await recordIssue({
            stage: "shows",
            code: issue.code,
            message: issue.message,
            registrationNo: issue.registrationNo,
            sourceTable: issue.sourceTable,
            payloadJson: issue.payloadJson,
          });
        }
        log(
          `Show results upserted=${showResultsUpserted}, show errors=${showResult.errors}`,
        );
        finishStage("shows");

        await flushIssueBuffer();

        const finished = await markImportRunFinished(run.id, {
          status: "SUCCEEDED",
          dogsUpserted,
          ownersUpserted,
          ownershipsUpserted,
          trialResultsUpserted,
          showResultsUpserted,
          errorsCount,
          errorSummary:
            errorsCount > 0 ? "Import completed with warnings." : null,
        });

        return {
          status: 202,
          body: { ok: true, data: toImportRunResponse(finished) },
        };
      } catch (error) {
        const message = formatImportError(error);
        log(`Import failed: ${message}`);
        await createImportRunIssue(run.id, {
          stage: "run",
          severity: "ERROR",
          code: "UNEXPECTED_EXCEPTION",
          message,
        });
        await flushIssueBuffer();
        const finished = await markImportRunFinished(run.id, {
          status: "FAILED",
          dogsUpserted,
          ownersUpserted,
          ownershipsUpserted,
          trialResultsUpserted,
          showResultsUpserted,
          errorsCount: errorsCount + 1,
          errorSummary: message,
        });

        return {
          status: 200,
          body: { ok: true, data: toImportRunResponse(finished) },
        };
      } finally {
        log("Import run finished");
      }
    },

    async getImportRun(id: string): Promise<ServiceResult<ImportRunResponse>> {
      const run = await getImportRunById(id);
      if (!run) {
        return {
          status: 404,
          body: { ok: false, error: "Import run not found." },
        };
      }

      return {
        status: 200,
        body: { ok: true, data: toImportRunResponse(run) },
      };
    },

    async getImportRunIssues(
      id: string,
      options?: {
        stage?: string;
        code?: string;
        limit?: number;
        cursor?: string;
      },
    ): Promise<ServiceResult<ImportRunIssuesResponse>> {
      const run = await getImportRunById(id);
      if (!run) {
        return {
          status: 404,
          body: { ok: false, error: "Import run not found." },
        };
      }

      const result = await listImportRunIssues(id, options);
      return {
        status: 200,
        body: {
          ok: true,
          data: {
            items: result.items.map(toImportRunIssueResponse),
            nextCursor: result.nextCursor,
          },
        },
      };
    },
  };
}

export const importsService = createImportsService();
