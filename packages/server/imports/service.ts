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
  isValidRegistrationNo,
  mapSex,
  normalizeNullable,
  normalizeRegistrationNo,
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

function parseRegistrationNo(value: string | null | undefined): {
  registrationNo: string | null;
  isInvalid: boolean;
} {
  const registrationNo = normalizeRegistrationNo(value);
  if (!registrationNo) {
    return { registrationNo: null, isInvalid: false };
  }
  return {
    registrationNo,
    isInvalid: !isValidRegistrationNo(registrationNo),
  };
}

async function loadDogIdByRegistration(): Promise<Map<string, string>> {
  const registrations = await prisma.dogRegistration.findMany({
    select: { registrationNo: true, dogId: true },
  });
  return new Map(
    registrations.map((registration) => [
      registration.registrationNo,
      registration.dogId,
    ]),
  );
}

function mergeNoteValue(existing: string | null, incoming: string): string {
  if (!existing) return incoming;

  const existingParts = existing
    .split(" | ")
    .map((part) => part.trim())
    .filter(Boolean);
  if (existingParts.includes(incoming)) {
    return existing;
  }

  return `${existing} | ${incoming}`;
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
          `Loaded legacy rows: dogs=${legacy.dogs.length}, eks=${legacy.eks.length}, owners=${legacy.owners.length}, trialResults=${legacy.trialResults.length}, showResults=${legacy.showResults.length}, samakoira=${legacy.samakoira.length}`,
        );
        finishStage("load");

        startStage("dogs");
        const totalDogs = legacy.dogs.length;
        let dogsProcessed = 0;
        for (const row of legacy.dogs) {
          dogsProcessed += 1;
          const { registrationNo, isInvalid } = parseRegistrationNo(
            row.registrationNo,
          );
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

          if (isInvalid) {
            errorsCount += 1;
            await recordIssue({
              stage: "dogs",
              code: "REGISTRATION_INVALID_FORMAT",
              message: "Dog row has invalid registration format.",
              registrationNo,
              sourceTable: "bearek_id",
              payloadJson: JSON.stringify({
                registrationNo: row.registrationNo,
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

          const existingRegistration = await prisma.dogRegistration.findUnique({
            where: { registrationNo },
            select: { id: true, dogId: true, source: true },
          });

          if (existingRegistration) {
            await prisma.dog.update({
              where: { id: existingRegistration.dogId },
              data: {
                name,
                sex: mapSex(row.sex),
                birthDate: parseLegacyDate(row.birthDateRaw),
                breederId,
              },
            });

            if (existingRegistration.source !== "CANONICAL") {
              await prisma.dogRegistration.update({
                where: { id: existingRegistration.id },
                data: { source: "CANONICAL" },
              });
            }
          } else {
            await prisma.dog.create({
              data: {
                name,
                sex: mapSex(row.sex),
                birthDate: parseLegacyDate(row.birthDateRaw),
                breederId,
                registrations: {
                  create: {
                    registrationNo,
                    source: "CANONICAL",
                  },
                },
              },
            });
          }

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
          const { registrationNo, isInvalid } = parseRegistrationNo(
            row.registrationNo,
          );

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

          if (isInvalid) {
            errorsCount += 1;
            await recordIssue({
              stage: "ek",
              code: "REGISTRATION_INVALID_FORMAT",
              message: "EK row has invalid registration format.",
              registrationNo,
              sourceTable: "bea_apu",
              payloadJson: JSON.stringify({
                registrationNo: row.registrationNo,
                ekNo: row.ekNo,
              }),
            });
            if (eksProcessed % 1000 === 0) {
              logProgress("ek", eksProcessed, totalEks);
            }
            continue;
          }

          const registration = await prisma.dogRegistration.findUnique({
            where: { registrationNo },
            select: { dogId: true },
          });
          if (!registration) {
            if (eksProcessed % 1000 === 0) {
              logProgress("ek", eksProcessed, totalEks);
            }
            continue;
          }

          await prisma.dog.update({
            where: { id: registration.dogId },
            data: { ekNo: Number(row.ekNo) },
          });
          eksApplied += 1;

          if (eksProcessed % 1000 === 0) {
            logProgress("ek", eksProcessed, totalEks);
          }
        }
        logProgress("ek", eksProcessed, totalEks);
        finishStage("ek", `applied=${eksApplied}, skipped=${eksSkipped}`);

        startStage("samakoira");
        const totalSamakoira = legacy.samakoira.length;
        let samakoiraProcessed = 0;
        let aliasesCreated = 0;
        let aliasConflicts = 0;
        let notesUpdated = 0;
        const dogIdByRegistrationForSamakoira = await loadDogIdByRegistration();
        const noteByDogId = new Map<string, string | null>();
        const getDogNote = async (dogId: string): Promise<string | null> => {
          if (noteByDogId.has(dogId)) {
            return noteByDogId.get(dogId) ?? null;
          }

          const dog = await prisma.dog.findUnique({
            where: { id: dogId },
            select: { note: true },
          });
          const note = dog?.note ?? null;
          noteByDogId.set(dogId, note);
          return note;
        };

        for (const row of legacy.samakoira) {
          samakoiraProcessed += 1;
          const canonical = parseRegistrationNo(row.rek1);
          if (!canonical.registrationNo || canonical.isInvalid) {
            errorsCount += 1;
            await recordIssue({
              stage: "samakoira",
              code: canonical.isInvalid
                ? "REGISTRATION_INVALID_FORMAT"
                : "SAMAKOIRA_CANONICAL_NOT_FOUND",
              message: canonical.isInvalid
                ? "Samakoira canonical registration has invalid format."
                : "Samakoira row is missing canonical REK_1 registration.",
              registrationNo: canonical.registrationNo,
              sourceTable: "samakoira",
              payloadJson: JSON.stringify(row),
            });
            if (samakoiraProcessed % 1000 === 0) {
              logProgress("samakoira", samakoiraProcessed, totalSamakoira);
            }
            continue;
          }

          const canonicalDogId = dogIdByRegistrationForSamakoira.get(
            canonical.registrationNo,
          );
          if (!canonicalDogId) {
            errorsCount += 1;
            await recordIssue({
              stage: "samakoira",
              code: "SAMAKOIRA_CANONICAL_NOT_FOUND",
              message:
                "Samakoira canonical registration was not found among imported dogs.",
              registrationNo: canonical.registrationNo,
              sourceTable: "samakoira",
              payloadJson: JSON.stringify(row),
            });
            if (samakoiraProcessed % 1000 === 0) {
              logProgress("samakoira", samakoiraProcessed, totalSamakoira);
            }
            continue;
          }

          const aliases = [
            { key: "REK_2", value: row.rek2 },
            { key: "REK_3", value: row.rek3 },
          ];
          for (const alias of aliases) {
            const parsedAlias = parseRegistrationNo(alias.value);
            if (!parsedAlias.registrationNo) {
              continue;
            }
            if (parsedAlias.isInvalid) {
              errorsCount += 1;
              await recordIssue({
                stage: "samakoira",
                code: "REGISTRATION_INVALID_FORMAT",
                message: `Samakoira alias ${alias.key} has invalid registration format.`,
                registrationNo: parsedAlias.registrationNo,
                sourceTable: "samakoira",
                payloadJson: JSON.stringify({
                  rek1: row.rek1,
                  [alias.key]: alias.value,
                }),
              });
              continue;
            }
            if (parsedAlias.registrationNo === canonical.registrationNo) {
              continue;
            }

            const existingAlias = await prisma.dogRegistration.findUnique({
              where: { registrationNo: parsedAlias.registrationNo },
              select: { dogId: true },
            });
            if (!existingAlias) {
              await prisma.dogRegistration.create({
                data: {
                  dogId: canonicalDogId,
                  registrationNo: parsedAlias.registrationNo,
                  source: "LEGACY_SAMAKOIRA",
                },
              });
              dogIdByRegistrationForSamakoira.set(
                parsedAlias.registrationNo,
                canonicalDogId,
              );
              aliasesCreated += 1;
              continue;
            }

            if (existingAlias.dogId !== canonicalDogId) {
              errorsCount += 1;
              aliasConflicts += 1;
              await recordIssue({
                stage: "samakoira",
                code: "REGISTRATION_ALIAS_CONFLICT",
                message:
                  "Samakoira alias registration belongs to a different dog.",
                registrationNo: parsedAlias.registrationNo,
                sourceTable: "samakoira",
                payloadJson: JSON.stringify({
                  rek1: canonical.registrationNo,
                  alias: parsedAlias.registrationNo,
                  targetDogId: canonicalDogId,
                  existingDogId: existingAlias.dogId,
                }),
              });
            }
          }

          const rekMuu = parseRegistrationNo(row.rekMuu);
          if (rekMuu.registrationNo && rekMuu.isInvalid) {
            errorsCount += 1;
            await recordIssue({
              stage: "samakoira",
              code: "REGISTRATION_INVALID_FORMAT",
              message: "Samakoira REK_MUU has invalid registration format.",
              registrationNo: rekMuu.registrationNo,
              sourceTable: "samakoira",
              payloadJson: JSON.stringify({
                rek1: canonical.registrationNo,
                rekMuu: row.rekMuu,
              }),
            });
          }

          const vara = normalizeNullable(row.vara);
          if (vara) {
            const existingNote = await getDogNote(canonicalDogId);
            const mergedNote = mergeNoteValue(existingNote, vara);
            if (mergedNote !== existingNote) {
              await prisma.dog.update({
                where: { id: canonicalDogId },
                data: { note: mergedNote },
              });
              noteByDogId.set(canonicalDogId, mergedNote);
              notesUpdated += 1;
            }
          }

          if (samakoiraProcessed % 1000 === 0) {
            logProgress("samakoira", samakoiraProcessed, totalSamakoira);
          }
        }
        logProgress("samakoira", samakoiraProcessed, totalSamakoira);
        finishStage(
          "samakoira",
          `aliasesCreated=${aliasesCreated}, aliasConflicts=${aliasConflicts}, notesUpdated=${notesUpdated}`,
        );

        startStage("index");
        const dogIdByRegistration = await loadDogIdByRegistration();
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
          const registration = parseRegistrationNo(row.registrationNo);
          if (!registration.registrationNo) {
            relationsSkippedNoRegistration += 1;
            if (relationsProcessed % 1000 === 0) {
              logProgress("relations", relationsProcessed, totalRelations);
            }
            continue;
          }

          if (registration.isInvalid) {
            errorsCount += 1;
            await recordIssue({
              stage: "relations",
              code: "REGISTRATION_INVALID_FORMAT",
              message: "Dog row has invalid registration format.",
              registrationNo: registration.registrationNo,
              sourceTable: "bearek_id",
              payloadJson: JSON.stringify({
                registrationNo: row.registrationNo,
              }),
            });
            if (relationsProcessed % 1000 === 0) {
              logProgress("relations", relationsProcessed, totalRelations);
            }
            continue;
          }

          const dogId = dogIdByRegistration.get(registration.registrationNo);
          if (!dogId) {
            relationsSkippedDogNotFound += 1;
            if (relationsProcessed % 1000 === 0) {
              logProgress("relations", relationsProcessed, totalRelations);
            }
            continue;
          }

          const sireRegistration = parseRegistrationNo(row.sireRegistrationNo);
          const damRegistration = parseRegistrationNo(row.damRegistrationNo);

          const sireIsPlaceholder = isPlaceholderRegistration(
            sireRegistration.registrationNo,
          );
          const damIsPlaceholder = isPlaceholderRegistration(
            damRegistration.registrationNo,
          );

          if (sireRegistration.registrationNo && sireIsPlaceholder) {
            skippedPlaceholderSireRefs += 1;
          }
          if (damRegistration.registrationNo && damIsPlaceholder) {
            skippedPlaceholderDamRefs += 1;
          }

          let sireRegistrationForLookup = sireIsPlaceholder
            ? null
            : sireRegistration.registrationNo;
          let damRegistrationForLookup = damIsPlaceholder
            ? null
            : damRegistration.registrationNo;

          if (sireRegistrationForLookup && sireRegistration.isInvalid) {
            errorsCount += 1;
            await recordIssue({
              stage: "relations",
              code: "REGISTRATION_INVALID_FORMAT",
              message: "Sire registration has invalid format.",
              registrationNo: sireRegistrationForLookup,
              sourceTable: "bearek_id",
              payloadJson: JSON.stringify({
                registrationNo: registration.registrationNo,
                sireRegistrationNo: row.sireRegistrationNo,
              }),
            });
            sireRegistrationForLookup = null;
          }

          if (damRegistrationForLookup && damRegistration.isInvalid) {
            errorsCount += 1;
            await recordIssue({
              stage: "relations",
              code: "REGISTRATION_INVALID_FORMAT",
              message: "Dam registration has invalid format.",
              registrationNo: damRegistrationForLookup,
              sourceTable: "bearek_id",
              payloadJson: JSON.stringify({
                registrationNo: registration.registrationNo,
                damRegistrationNo: row.damRegistrationNo,
              }),
            });
            damRegistrationForLookup = null;
          }

          const sireId = sireRegistrationForLookup
            ? dogIdByRegistration.get(sireRegistrationForLookup)
            : undefined;
          const damId = damRegistrationForLookup
            ? dogIdByRegistration.get(damRegistrationForLookup)
            : undefined;

          if (sireRegistrationForLookup && !sireId) {
            missingSireRefs += 1;
            errorsCount += 1;
            await recordIssue({
              stage: "relations",
              code: "RELATION_SIRE_NOT_FOUND",
              message:
                "Referenced sire registration was not found among imported dogs.",
              registrationNo: registration.registrationNo,
              sourceTable: "bearek_id",
              payloadJson: JSON.stringify({
                registrationNo: registration.registrationNo,
                sireRegistrationNo: sireRegistrationForLookup,
              }),
            });
          }

          if (damRegistrationForLookup && !damId) {
            missingDamRefs += 1;
            errorsCount += 1;
            await recordIssue({
              stage: "relations",
              code: "RELATION_DAM_NOT_FOUND",
              message:
                "Referenced dam registration was not found among imported dogs.",
              registrationNo: registration.registrationNo,
              sourceTable: "bearek_id",
              payloadJson: JSON.stringify({
                registrationNo: registration.registrationNo,
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
          const registration = parseRegistrationNo(row.registrationNo);
          if (registration.isInvalid) {
            errorsCount += 1;
            await recordIssue({
              stage: "owners",
              code: "REGISTRATION_INVALID_FORMAT",
              message: "Owner row has invalid registration format.",
              registrationNo: registration.registrationNo,
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

          const dogId = registration.registrationNo
            ? dogIdByRegistration.get(registration.registrationNo)
            : undefined;
          if (!dogId) {
            errorsCount += 1;
            await recordIssue({
              stage: "owners",
              code: "OWNER_DOG_NOT_FOUND",
              message: "Owner row references a dog that was not found.",
              registrationNo: registration.registrationNo,
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
              registrationNo: registration.registrationNo,
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
