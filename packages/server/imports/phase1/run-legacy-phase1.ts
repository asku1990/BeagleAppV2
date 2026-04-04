import { randomUUID } from "node:crypto";
import {
  type AuditContextDb,
  type ImportIssueSeverity,
  ImportKind,
  createImportRunIssue,
  createImportRunIssuesBulk,
  createImportRun,
  fetchLegacyPhase1Rows,
  markImportRunFinished,
  markImportRunRunning,
  prisma,
} from "@beagle/db";
import type { ImportRunResponse } from "@beagle/contracts";
import type { ServiceResult } from "../../core/result";
import {
  isValidRegistrationNo,
  mapSex,
  normalizeBreederKey,
  normalizeNullable,
  normalizeRegistrationNo,
  parseLegacyDate,
} from "../core";
import { toOwnershipDateKey, upsertOwner } from "../internal";
import { toImportRunResponse } from "../runs/transform";

const FINNISH_REGISTRATION_PREFIXES = new Set(["FI", "SF"]);

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

function extractRegistrationPrefix(registrationNo: string): string | null {
  const match = registrationNo
    .trim()
    .toUpperCase()
    .match(/^[A-Z]+/);
  return match?.[0] ?? null;
}

function isFinnishRegistration(registrationNo: string): boolean {
  const prefix = extractRegistrationPrefix(registrationNo);
  return FINNISH_REGISTRATION_PREFIXES.has(prefix ?? "");
}

function resolvePreferredFinnishRegistration(
  canonicalRegistrationNo: string,
  attachedAliases: string[],
): string | null {
  const candidates = [canonicalRegistrationNo, ...attachedAliases];
  return candidates.find((value) => isFinnishRegistration(value)) ?? null;
}

type BreederDetailsInput = {
  name: string | null;
  shortCode: string | null;
  grantedAtRaw: string | null;
  ownerName: string | null;
  city: string | null;
  legacyFlag: string | null;
  source: "kennel";
};

type BreederDetails = {
  name: string;
  shortCode: string | null;
  grantedAtRaw: string | null;
  ownerName: string | null;
  city: string | null;
  legacyFlag: string | null;
  source: "kennel";
};

function normalizeBreederDetails(
  input: BreederDetailsInput,
): BreederDetails | null {
  const name = normalizeNullable(input.name);
  if (!name) return null;

  return {
    name,
    shortCode: normalizeNullable(input.shortCode),
    grantedAtRaw: normalizeNullable(input.grantedAtRaw),
    ownerName: normalizeNullable(input.ownerName),
    city: normalizeNullable(input.city),
    legacyFlag: normalizeNullable(input.legacyFlag),
    source: input.source,
  };
}

export async function runLegacyPhase1(
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
  const stageReasonCounts = new Map<string, Map<string, number>>();
  const addStageReason = (
    stage: string,
    severity: ImportIssueSeverity,
    code: string,
  ) => {
    const stageCounts = stageReasonCounts.get(stage) ?? new Map();
    const key = `${severity}|${code}`;
    stageCounts.set(key, (stageCounts.get(key) ?? 0) + 1);
    stageReasonCounts.set(stage, stageCounts);
  };
  const formatStageReasons = (stage: string): string | null => {
    const stageCounts = stageReasonCounts.get(stage);
    if (!stageCounts || stageCounts.size === 0) {
      return null;
    }

    const entries = [...stageCounts.entries()].map(([key, count]) => {
      const [severity, code] = key.split("|");
      return {
        severity,
        code,
        count,
      };
    });
    entries.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (a.severity !== b.severity) {
        return a.severity.localeCompare(b.severity);
      }
      return a.code.localeCompare(b.code);
    });

    return entries
      .map((entry) => `${entry.code}(${entry.severity}):${entry.count}`)
      .join(", ");
  };
  const startStage = (name: string) => {
    stageStartedAt.set(name, Date.now());
    log(`[stage:${name}] start`);
  };
  const finishStage = (name: string, summary?: string) => {
    const startedAt = stageStartedAt.get(name) ?? Date.now();
    const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
    const reasonSummary = formatStageReasons(name);
    const details = [summary, reasonSummary ? `reasons=${reasonSummary}` : ""]
      .filter(Boolean)
      .join(" ");
    log(
      `[stage:${name}] done in ${elapsedSeconds}s${details ? ` ${details}` : ""}`,
    );
  };
  const logProgress = (name: string, processed: number, total: number) => {
    const percent =
      total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 100;
    log(`[stage:${name}] progress ${processed}/${total} (${percent}%)`);
  };
  let runId: string | null = null;

  let dogsUpserted = 0;
  let ownersUpserted = 0;
  let ownershipsUpserted = 0;
  const trialResultsUpserted = 0;
  const showResultsUpserted = 0;
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
    const severity = issue.severity ?? "WARNING";
    addStageReason(issue.stage, severity, issue.code);
    issueBuffer.push({ ...issue, severity });
    if (issueBuffer.length >= ISSUE_BUFFER_SIZE) {
      await flushIssueBuffer();
    }
  };

  try {
    const run = await createImportRun({
      kind: ImportKind.LEGACY_PHASE1,
      createdByUserId,
      auditContext,
    });
    runId = run.id;
    log(`Created import run ${run.id}`);
    await markImportRunRunning(run.id, auditContext);
    log("Marked run as RUNNING");

    startStage("load");
    const legacy = await fetchLegacyPhase1Rows({
      log: (message) => log(`[stage:load] ${message}`),
    });
    log(
      `Loaded legacy rows: dogs=${legacy.dogs.length}, breeders=${legacy.breeders.length}, eks=${legacy.eks.length}, owners=${legacy.owners.length}, samakoira=${legacy.samakoira.length}`,
    );
    finishStage("load");

    startStage("breeders");
    let breederRowsProcessed = 0;
    let breederRowsUpserted = 0;
    const breederRowsUpdated = 0;
    let breederRowsSkipped = 0;
    const totalBreederRows = legacy.breeders.length;

    for (const row of legacy.breeders) {
      breederRowsProcessed += 1;
      const breeder = normalizeBreederDetails({
        name: row.name,
        shortCode: row.shortCode,
        grantedAtRaw: row.grantedAtRaw,
        ownerName: row.ownerName,
        city: row.city,
        legacyFlag: row.legacyFlag,
        source: "kennel",
      });

      if (!breeder) {
        breederRowsSkipped += 1;
        errorsCount += 1;
        await recordIssue({
          stage: "breeders",
          code: "BREEDER_MISSING_NAME",
          message: "Breeder row is missing kennel name.",
          sourceTable: "kennel",
          payloadJson: JSON.stringify(row),
        });
        if (breederRowsProcessed % 1000 === 0) {
          logProgress("breeders", breederRowsProcessed, totalBreederRows);
        }
        continue;
      }

      const result = await prisma.breeder.upsert({
        where: { name: breeder.name },
        create: {
          name: breeder.name,
          shortCode: breeder.shortCode,
          grantedAtRaw: breeder.grantedAtRaw,
          ownerName: breeder.ownerName,
          city: breeder.city,
          legacyFlag: breeder.legacyFlag,
          detailsSource: breeder.source,
        },
        update: {
          shortCode: breeder.shortCode,
          grantedAtRaw: breeder.grantedAtRaw,
          ownerName: breeder.ownerName,
          city: breeder.city,
          legacyFlag: breeder.legacyFlag,
          detailsSource: breeder.source,
        },
        select: { id: true },
      });
      if (result.id) {
        breederRowsUpserted += 1;
      }

      if (breederRowsProcessed % 1000 === 0) {
        logProgress("breeders", breederRowsProcessed, totalBreederRows);
      }
    }
    logProgress("breeders", breederRowsProcessed, totalBreederRows);
    finishStage(
      "breeders",
      `upserted=${breederRowsUpserted}, updated=${breederRowsUpdated}, skipped=${breederRowsSkipped}`,
    );

    const breederIdByNameKey = new Map<string, string>();
    const breederNameKeyCounts = new Map<string, number>();
    const breederNameKeyNames = new Map<string, Set<string>>();
    const firstBreederIdByNameKey = new Map<string, string>();
    const ambiguousBreederNameKeys = new Set<string>();
    let duplicateBreederNameKeys = 0;
    const kennelBreeders = await prisma.breeder.findMany({
      where: { detailsSource: "kennel" },
      select: { id: true, name: true },
    });
    for (const breeder of kennelBreeders) {
      const nameKey = normalizeBreederKey(breeder.name);
      if (!nameKey) continue;
      breederNameKeyCounts.set(
        nameKey,
        (breederNameKeyCounts.get(nameKey) ?? 0) + 1,
      );
      if (!firstBreederIdByNameKey.has(nameKey)) {
        firstBreederIdByNameKey.set(nameKey, breeder.id);
      }
      const names = breederNameKeyNames.get(nameKey) ?? new Set<string>();
      names.add(breeder.name);
      breederNameKeyNames.set(nameKey, names);
    }
    for (const [nameKey, count] of breederNameKeyCounts.entries()) {
      if (count === 1) {
        const breederId = firstBreederIdByNameKey.get(nameKey);
        if (breederId) {
          breederIdByNameKey.set(nameKey, breederId);
        }
        continue;
      }

      duplicateBreederNameKeys += count - 1;
      ambiguousBreederNameKeys.add(nameKey);

      errorsCount += 1;
      await recordIssue({
        stage: "breeders",
        code: "BREEDER_NAME_KEY_AMBIGUOUS",
        message:
          "Breeder name key is ambiguous after normalization; dogs with this breeder text will not be linked.",
        sourceTable: "kennel",
        payloadJson: JSON.stringify({
          breederNameKey: nameKey,
          count,
          names: [...(breederNameKeyNames.get(nameKey) ?? new Set<string>())],
        }),
      });
    }
    log(
      `[stage:breeders] index breederNameKeys=${breederIdByNameKey.size}, duplicateKeys=${duplicateBreederNameKeys}, ambiguousKeys=${ambiguousBreederNameKeys.size}`,
    );

    startStage("dogs");
    const totalDogs = legacy.dogs.length;
    let dogsProcessed = 0;
    let dogsWithBreederText = 0;
    let dogsLinkedToBreeder = 0;
    let dogsWithUnlinkedBreederText = 0;
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

      const breederNameText = normalizeNullable(row.breederName);
      if (breederNameText) {
        dogsWithBreederText += 1;
      }
      const breederNameKey = normalizeBreederKey(breederNameText);
      const breederId = breederNameKey
        ? (breederIdByNameKey.get(breederNameKey) ?? null)
        : null;
      if (breederNameText && breederId) {
        dogsLinkedToBreeder += 1;
      } else if (breederNameText) {
        dogsWithUnlinkedBreederText += 1;

        if (breederNameKey && ambiguousBreederNameKeys.has(breederNameKey)) {
          errorsCount += 1;
          await recordIssue({
            stage: "dogs",
            code: "DOG_BREEDER_LINK_AMBIGUOUS",
            message:
              "Dog breeder text matches an ambiguous breeder name key; breeder link skipped.",
            registrationNo,
            sourceTable: "bearek_id",
            payloadJson: JSON.stringify({
              registrationNo: row.registrationNo,
              breederNameText,
              breederNameKey,
            }),
          });
        }
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
            breederNameText,
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
            breederNameText,
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
    finishStage(
      "dogs",
      `dogsUpserted=${dogsUpserted}, breederTextSet=${dogsWithBreederText}, breederLinked=${dogsLinkedToBreeder}, breederUnlinkedText=${dogsWithUnlinkedBreederText}`,
    );

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

      if (!registrationNo) {
        eksSkipped += 1;
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
        if (eksProcessed % 1000 === 0) {
          logProgress("ek", eksProcessed, totalEks);
        }
        continue;
      }

      if (row.ekNo == null) {
        eksSkipped += 1;
        await recordIssue({
          stage: "ek",
          severity: "INFO",
          code: "EK_MISSING_EKNO",
          message: "EK row missing EK number.",
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

      if (isInvalid) {
        eksSkipped += 1;
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
        eksSkipped += 1;
        errorsCount += 1;
        await recordIssue({
          stage: "ek",
          code: "EK_DOG_NOT_FOUND",
          message: "EK row references a dog that was not found.",
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
    let finnishCanonicalPromotions = 0;
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
      const attachedAliases: string[] = [];
      for (const alias of aliases) {
        const parsedAlias = parseRegistrationNo(alias.value);
        if (!parsedAlias.registrationNo) {
          await recordIssue({
            stage: "samakoira",
            severity: "INFO",
            code: "SAMAKOIRA_ALIAS_EMPTY",
            message: `Samakoira alias ${alias.key} is empty.`,
            registrationNo: canonical.registrationNo,
            sourceTable: "samakoira",
            payloadJson: JSON.stringify({
              rek1: canonical.registrationNo,
              [alias.key]: alias.value,
            }),
          });
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
          await recordIssue({
            stage: "samakoira",
            severity: "INFO",
            code: "SAMAKOIRA_ALIAS_EQUALS_CANONICAL",
            message: `Samakoira alias ${alias.key} matches canonical registration.`,
            registrationNo: canonical.registrationNo,
            sourceTable: "samakoira",
            payloadJson: JSON.stringify({
              rek1: canonical.registrationNo,
              [alias.key]: alias.value,
            }),
          });
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
          attachedAliases.push(parsedAlias.registrationNo);
          aliasesCreated += 1;
          continue;
        }

        if (existingAlias.dogId === canonicalDogId) {
          attachedAliases.push(parsedAlias.registrationNo);
          continue;
        }

        if (existingAlias.dogId !== canonicalDogId) {
          errorsCount += 1;
          aliasConflicts += 1;
          await recordIssue({
            stage: "samakoira",
            code: "REGISTRATION_ALIAS_CONFLICT",
            message: "Samakoira alias registration belongs to a different dog.",
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

      const preferredFinnishRegistration = resolvePreferredFinnishRegistration(
        canonical.registrationNo,
        attachedAliases,
      );
      if (preferredFinnishRegistration) {
        const firstRegistrationRow = await prisma.dogRegistration.findFirst({
          where: { dogId: canonicalDogId },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: { id: true, registrationNo: true },
        });
        const finnishRow = await prisma.dogRegistration.findUnique({
          where: { registrationNo: preferredFinnishRegistration },
          select: { id: true, dogId: true },
        });

        if (
          firstRegistrationRow &&
          firstRegistrationRow.registrationNo !==
            preferredFinnishRegistration &&
          finnishRow &&
          finnishRow.dogId === canonicalDogId
        ) {
          const temporaryRegistrationNo = `TMP-${randomUUID()}`;
          const previousFirstRegistrationNo =
            firstRegistrationRow.registrationNo;
          const firstRegistrationRowId = firstRegistrationRow.id;
          const finnishRowId = finnishRow.id;
          await prisma.$transaction(async (tx) => {
            await tx.dogRegistration.update({
              where: { id: finnishRowId },
              data: { registrationNo: temporaryRegistrationNo },
            });
            await tx.dogRegistration.update({
              where: { id: firstRegistrationRowId },
              data: { registrationNo: preferredFinnishRegistration },
            });
            await tx.dogRegistration.update({
              where: { id: finnishRowId },
              data: { registrationNo: previousFirstRegistrationNo },
            });
          });

          dogIdByRegistrationForSamakoira.set(
            preferredFinnishRegistration,
            canonicalDogId,
          );
          dogIdByRegistrationForSamakoira.set(
            previousFirstRegistrationNo,
            canonicalDogId,
          );
          finnishCanonicalPromotions += 1;
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
      `aliasesCreated=${aliasesCreated}, aliasConflicts=${aliasConflicts}, finnishCanonicalPromotions=${finnishCanonicalPromotions}, notesUpdated=${notesUpdated}`,
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
        await recordIssue({
          stage: "relations",
          severity: "INFO",
          code: "RELATION_ROW_MISSING_REGISTRATION",
          message: "Relations row missing canonical registration number.",
          sourceTable: "bearek_id",
          payloadJson: JSON.stringify({
            registrationNo: row.registrationNo,
            sireRegistrationNo: row.sireRegistrationNo,
            damRegistrationNo: row.damRegistrationNo,
          }),
        });
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
        errorsCount += 1;
        await recordIssue({
          stage: "relations",
          code: "RELATION_DOG_NOT_FOUND",
          message:
            "Relations row references a dog that was not found among imported dogs.",
          registrationNo: registration.registrationNo,
          sourceTable: "bearek_id",
          payloadJson: JSON.stringify({
            registrationNo: row.registrationNo,
            sireRegistrationNo: row.sireRegistrationNo,
            damRegistrationNo: row.damRegistrationNo,
          }),
        });
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
        await recordIssue({
          stage: "relations",
          severity: "INFO",
          code: "RELATION_SIRE_PLACEHOLDER",
          message:
            "Sire registration is a placeholder and was treated as unknown.",
          registrationNo: registration.registrationNo,
          sourceTable: "bearek_id",
          payloadJson: JSON.stringify({
            registrationNo: registration.registrationNo,
            sireRegistrationNo: row.sireRegistrationNo,
          }),
        });
      }
      if (damRegistration.registrationNo && damIsPlaceholder) {
        skippedPlaceholderDamRefs += 1;
        await recordIssue({
          stage: "relations",
          severity: "INFO",
          code: "RELATION_DAM_PLACEHOLDER",
          message:
            "Dam registration is a placeholder and was treated as unknown.",
          registrationNo: registration.registrationNo,
          sourceTable: "bearek_id",
          payloadJson: JSON.stringify({
            registrationNo: registration.registrationNo,
            damRegistrationNo: row.damRegistrationNo,
          }),
        });
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
          sourceTable: "beaom",
          payloadJson: JSON.stringify({
            registrationNo: row.registrationNo,
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
          sourceTable: "beaom",
          payloadJson: JSON.stringify({
            registrationNo: row.registrationNo,
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
      const ownershipDateKey = toOwnershipDateKey(ownershipDate);
      const ownershipCreateResult = await prisma.dogOwnership.createMany({
        data: [
          {
            dogId,
            ownerId,
            ownershipDate,
            ownershipDateKey,
          },
        ],
        skipDuplicates: true,
      });
      ownershipsUpserted += ownershipCreateResult.count;

      if (ownersProcessed % 1000 === 0) {
        logProgress("owners", ownersProcessed, totalOwners);
      }
    }
    logProgress("owners", ownersProcessed, totalOwners);
    log(
      `Owners processed: ownersUpserted=${ownersUpserted}, ownershipsUpserted=${ownershipsUpserted}`,
    );
    finishStage("owners");

    await flushIssueBuffer();

    const finished = await markImportRunFinished(
      run.id,
      {
        status: "SUCCEEDED",
        dogsUpserted,
        ownersUpserted,
        ownershipsUpserted,
        trialResultsUpserted,
        showResultsUpserted,
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
    const message = formatImportError(error);
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
        dogsUpserted,
        ownersUpserted,
        ownershipsUpserted,
        trialResultsUpserted,
        showResultsUpserted,
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
