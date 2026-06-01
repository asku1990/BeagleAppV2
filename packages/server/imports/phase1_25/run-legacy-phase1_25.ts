import {
  type AuditContextDb,
  type ImportIssueSeverity,
  ImportKind,
  createImportRun,
  createImportRunIssue,
  createImportRunIssuesBulk,
  fetchLegacyPhase1_25Rows,
  markImportRunFinished,
  markImportRunRunning,
  prisma,
} from "@beagle/db";
import type { ImportRunResponse } from "@beagle/contracts";
import type { ServiceResult } from "@server/core/result";
import {
  isValidRegistrationNo,
  normalizeNullable,
  normalizeRegistrationNo,
} from "../core";
import { formatLegacyImportSummary } from "../runs/phase-summary";
import { toImportRunResponse } from "../runs/transform";

const SAIRAUS_RYHMA = {
  EPILEPSIA: "EPILEPSIA",
  LAFORA: "LAFORA",
  PURENTA: "PURENTA",
  MLS: "MLS",
  MUU: "MUU",
} as const;

type SairausRyhma = (typeof SAIRAUS_RYHMA)[keyof typeof SAIRAUS_RYHMA];

type RegistrationIndex = {
  dogIdByRegistration: Map<string, string>;
};

type KoiranSairausEvidenceKind = "DOG" | "LITTER";

type KoiranSairausIdentityResolution = {
  registrationNo: string;
  dogId: string | null;
  issue: {
    code:
      | "KOIRAN_SAIRAUS_REGISTRATION_SYNTHETIC_IMPORTED"
      | "KOIRAN_SAIRAUS_REGISTRATION_GENERATED_IMPORTED"
      | "KOIRAN_SAIRAUS_REGISTRATION_UNRESOLVED";
    message: string;
    counter: "fallback" | "unresolved";
  } | null;
};

type SairausDelegate = {
  createMany(args: {
    data: Array<{
      vanhaId: number;
      koodi: string;
      sairausTeksti: string;
      sairausRyhma: SairausRyhma;
    }>;
    skipDuplicates?: boolean;
  }): Promise<{ count: number }>;
  findMany(args: {
    select: { id: true; koodi: true };
  }): Promise<Array<{ id: string; koodi: string }>>;
};

type KoiranSairausDelegate = {
  createMany(args: {
    data: Array<{
      vanhaId: number;
      dogId: string | null;
      evidenceKind: KoiranSairausEvidenceKind;
      isaRekisterinumero: string | null;
      emaRekisterinumero: string | null;
      rekisterinumero: string;
      sairausId: string;
      sairausKoodi: string;
      pentue: string | null;
      kuvaus: string | null;
      julkinen: boolean;
      tietolahde: string | null;
      muokattuLahteessa: Date | null;
    }>;
    skipDuplicates?: boolean;
  }): Promise<{ count: number }>;
};

function getPhase1_25Db() {
  return prisma as unknown as {
    sairaus: SairausDelegate;
    koiranSairaus: KoiranSairausDelegate;
  };
}

function parseLegacyTimestamp(
  value: string | Date | null | undefined,
): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const normalized = normalizeNullable(value);
  if (!normalized || normalized === "0000-00-00 00:00:00") return null;
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?$/,
  );
  if (!match) return null;
  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw, secondRaw] = match;
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);
  const hour = Number.parseInt(hourRaw ?? "0", 10);
  const minute = Number.parseInt(minuteRaw ?? "0", 10);
  const second = Number.parseInt(secondRaw ?? "0", 10);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function mapSairausRyhma(code: string): SairausRyhma {
  switch (code) {
    case "epi":
      return SAIRAUS_RYHMA.EPILEPSIA;
    case "lepis":
    case "lepik":
    case "lepit":
      return SAIRAUS_RYHMA.LAFORA;
    case "ap":
    case "yp":
    case "rp":
    case "pur":
      return SAIRAUS_RYHMA.PURENTA;
    case "mls_s":
    case "mls_k":
    case "mls_t":
      return SAIRAUS_RYHMA.MLS;
    default:
      return SAIRAUS_RYHMA.MUU;
  }
}

function normalizeDiseaseCode(value: string | null | undefined): string | null {
  const normalized = normalizeNullable(value);
  return normalized ? normalized.toLowerCase() : null;
}

function parseLegacyBoolean(
  value: string | number | null | undefined,
): boolean {
  if (typeof value === "number") return value === 1;
  const normalized = normalizeNullable(value)?.toLowerCase();
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "k" ||
    normalized === "kyllä" ||
    normalized === "kylla" ||
    normalized === "j" ||
    normalized === "yes"
  );
}

function resolveRegistration(
  index: RegistrationIndex,
  value: string | null | undefined,
): { registrationNo: string | null; dogId: string | null } {
  const registrationNo = normalizeRegistrationNo(value);
  if (!registrationNo) return { registrationNo: null, dogId: null };
  return {
    registrationNo,
    dogId: index.dogIdByRegistration.get(registrationNo) ?? null,
  };
}

function resolveKoiranSairausIdentity(
  index: RegistrationIndex,
  row: { legacyId: number; registrationNo: string | null },
): KoiranSairausIdentityResolution {
  const normalizedRegistrationNo = normalizeRegistrationNo(row.registrationNo);
  if (!normalizedRegistrationNo) {
    return {
      registrationNo: `LEGACY_BEASAIRAAT_${row.legacyId}`,
      dogId: null,
      issue: {
        code: "KOIRAN_SAIRAUS_REGISTRATION_GENERATED_IMPORTED",
        message:
          "beasairaat row is missing REKNO, so a legacy fallback registration number was generated.",
        counter: "fallback",
      },
    };
  }

  if (!isValidRegistrationNo(normalizedRegistrationNo)) {
    return {
      registrationNo: normalizedRegistrationNo,
      dogId: null,
      issue: {
        code: "KOIRAN_SAIRAUS_REGISTRATION_SYNTHETIC_IMPORTED",
        message:
          "beasairaat row has a synthetic or invalid REKNO that was preserved as imported identity.",
        counter: "fallback",
      },
    };
  }

  const dogId = index.dogIdByRegistration.get(normalizedRegistrationNo) ?? null;
  if (!dogId) {
    return {
      registrationNo: normalizedRegistrationNo,
      dogId: null,
      issue: {
        code: "KOIRAN_SAIRAUS_REGISTRATION_UNRESOLVED",
        message:
          "beasairaat row has a valid REKNO that did not resolve to DogRegistration.",
        counter: "unresolved",
      },
    };
  }

  return {
    registrationNo: normalizedRegistrationNo,
    dogId,
    issue: null,
  };
}

function isUnknownLegacyParentRegistration(value: string): boolean {
  return value === "-" || value === "0" || /^U0+$/u.test(value);
}

function classifyKoiranSairausEvidence(input: {
  dog: KoiranSairausIdentityResolution;
  isaDogId: string | null;
  emaDogId: string | null;
}): KoiranSairausEvidenceKind | null {
  if (input.dog.dogId) {
    return "DOG";
  }
  if (
    input.dog.issue?.counter === "fallback" &&
    input.isaDogId &&
    input.emaDogId
  ) {
    return "LITTER";
  }
  return null;
}

// Imports v1 virtual pairing support tables after phase1 has created dogs and registrations.
export async function runLegacyPhase1_25(
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
    sourceRowId?: number | null;
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
    sourceRowId?: number | null;
    sourceTable?: string | null;
    payloadJson?: string | null;
  }) => {
    issueBuffer.push({ ...issue, severity: issue.severity ?? "WARNING" });
    if (issueBuffer.length >= ISSUE_BUFFER_SIZE) {
      await flushIssueBuffer();
    }
  };
  const recordParentResolutionIssue = async (input: {
    stage: string;
    sourceTable: "beasairaat" | "beaepi";
    sourceRowId: number;
    rowRegistrationNo: string;
    role: "sire" | "dam";
    parentRegistrationNo: string | null;
    parentDogId: string | null;
    payloadJson: string;
  }): Promise<"invalid" | "unresolved" | null> => {
    const { parentRegistrationNo } = input;
    if (
      !parentRegistrationNo ||
      isUnknownLegacyParentRegistration(parentRegistrationNo)
    ) {
      return null;
    }
    const roleLabel = input.role === "sire" ? "sire" : "dam";
    if (!isValidRegistrationNo(parentRegistrationNo)) {
      await recordIssue({
        stage: input.stage,
        severity: "WARNING",
        code:
          input.sourceTable === "beasairaat"
            ? `KOIRAN_SAIRAUS_${input.role.toUpperCase()}_REGISTRATION_INVALID`
            : `EPI_LUKU_${input.role.toUpperCase()}_REGISTRATION_INVALID`,
        message: `${input.sourceTable} ${roleLabel} registration is not syntactically valid.`,
        registrationNo: input.rowRegistrationNo,
        sourceRowId: input.sourceRowId,
        sourceTable: input.sourceTable,
        payloadJson: input.payloadJson,
      });
      return "invalid";
    }
    if (!input.parentDogId) {
      await recordIssue({
        stage: input.stage,
        severity: "WARNING",
        code:
          input.sourceTable === "beasairaat"
            ? `KOIRAN_SAIRAUS_${input.role.toUpperCase()}_UNRESOLVED`
            : `EPI_LUKU_${input.role.toUpperCase()}_UNRESOLVED`,
        message: `${input.sourceTable} ${roleLabel} registration did not resolve to DogRegistration.`,
        registrationNo: input.rowRegistrationNo,
        sourceRowId: input.sourceRowId,
        sourceTable: input.sourceTable,
        payloadJson: input.payloadJson,
      });
      return "unresolved";
    }
    return null;
  };

  try {
    const run = await createImportRun({
      kind: "LEGACY_PHASE1_25" as ImportKind,
      createdByUserId,
      auditContext,
    });
    runId = run.id;
    log(`Created import run ${run.id}`);
    await markImportRunRunning(run.id, auditContext);
    log("Marked run as RUNNING");

    startStage("load");
    const legacy = await fetchLegacyPhase1_25Rows({
      log: (message) => log(`[stage:load] ${message}`),
    });
    finishStage(
      "load",
      `sairaudet=${legacy.sairaudet.length}, koiranSairaudet=${legacy.koiranSairaudet.length}`,
    );

    startStage("index");
    const registrationRows = await prisma.dogRegistration.findMany({
      select: {
        registrationNo: true,
        dogId: true,
      },
    });
    const registrationIndex: RegistrationIndex = {
      dogIdByRegistration: new Map(
        registrationRows.map((row) => [row.registrationNo, row.dogId]),
      ),
    };
    finishStage(
      "index",
      `registrations=${registrationIndex.dogIdByRegistration.size}`,
    );

    const phaseDb = getPhase1_25Db();

    startStage("sairaudet");
    const sairaudetData: Array<{
      vanhaId: number;
      koodi: string;
      sairausTeksti: string;
      sairausRyhma: SairausRyhma;
    }> = [];
    let sairaudetProcessed = 0;
    for (const row of legacy.sairaudet) {
      sairaudetProcessed += 1;
      const koodi = normalizeDiseaseCode(row.code);
      const sairausTeksti = normalizeNullable(row.text);
      if (!koodi || !sairausTeksti) {
        errorsCount += 1;
        await recordIssue({
          stage: "sairaudet",
          code: "SAIRAUS_DEFINITION_INVALID",
          message: "beasairaudet row is missing SAIRAUS or SAIRAUS_TEKSTI.",
          sourceRowId: row.legacyId,
          sourceTable: "beasairaudet",
          payloadJson: JSON.stringify(row),
        });
        continue;
      }
      sairaudetData.push({
        vanhaId: row.legacyId,
        koodi,
        sairausTeksti,
        sairausRyhma: mapSairausRyhma(koodi),
      });
    }
    logProgress("sairaudet", sairaudetProcessed, legacy.sairaudet.length);
    const sairaudetInserted =
      sairaudetData.length > 0
        ? (
            await phaseDb.sairaus.createMany({
              data: sairaudetData,
              skipDuplicates: true,
            })
          ).count
        : 0;
    await flushIssueBuffer();
    const sairausRows = await phaseDb.sairaus.findMany({
      select: { id: true, koodi: true },
    });
    const sairausIdByKoodi = new Map(
      sairausRows.map((row) => [row.koodi, row.id]),
    );
    finishStage(
      "sairaudet",
      `source=${legacy.sairaudet.length}, inserted=${sairaudetInserted}, indexed=${sairausIdByKoodi.size}`,
    );

    startStage("koiran-sairaudet");
    const koiranSairaudetData: Parameters<
      KoiranSairausDelegate["createMany"]
    >[0]["data"] = [];
    let koiranSairaudetSkipped = 0;
    let koiranSairaudetFallbackIdentityIssues = 0;
    let koiranSairaudetUnresolvedDogSkipped = 0;
    let koiranSairaudetProcessed = 0;
    let koiranSairaudetParentInvalid = 0;
    let koiranSairaudetParentUnresolved = 0;
    for (const row of legacy.koiranSairaudet) {
      koiranSairaudetProcessed += 1;
      const dog = resolveKoiranSairausIdentity(registrationIndex, row);
      const isa = resolveRegistration(
        registrationIndex,
        row.sireRegistrationNo,
      );
      const ema = resolveRegistration(registrationIndex, row.damRegistrationNo);
      const evidenceKind = classifyKoiranSairausEvidence({
        dog,
        isaDogId: isa.dogId,
        emaDogId: ema.dogId,
      });
      const sairausKoodi = normalizeDiseaseCode(row.diseaseCode);
      if (dog.issue) {
        if (dog.issue.counter === "fallback") {
          koiranSairaudetFallbackIdentityIssues += 1;
        } else {
          koiranSairaudetUnresolvedDogSkipped += 1;
        }
        await recordIssue({
          stage: "koiran-sairaudet",
          code: dog.issue.code,
          message: dog.issue.message,
          registrationNo: dog.registrationNo,
          sourceRowId: row.legacyId,
          sourceTable: "beasairaat",
          payloadJson: JSON.stringify(row),
        });
      }
      if (evidenceKind !== "DOG") {
        for (const [role, parent] of [
          ["sire", isa],
          ["dam", ema],
        ] as const) {
          const result = await recordParentResolutionIssue({
            stage: "koiran-sairaudet",
            sourceTable: "beasairaat",
            sourceRowId: row.legacyId,
            rowRegistrationNo: dog.registrationNo,
            role,
            parentRegistrationNo: parent.registrationNo,
            parentDogId: parent.dogId,
            payloadJson: JSON.stringify(row),
          });
          if (result === "invalid") koiranSairaudetParentInvalid += 1;
          if (result === "unresolved") koiranSairaudetParentUnresolved += 1;
        }
      }
      if (!sairausKoodi) {
        koiranSairaudetSkipped += 1;
        errorsCount += 1;
        await recordIssue({
          stage: "koiran-sairaudet",
          code: "KOIRAN_SAIRAUS_CODE_MISSING",
          message: "beasairaat row is missing SAIRAUS.",
          registrationNo: dog.registrationNo,
          sourceRowId: row.legacyId,
          sourceTable: "beasairaat",
          payloadJson: JSON.stringify(row),
        });
        if (koiranSairaudetProcessed % 1000 === 0) {
          logProgress(
            "koiran-sairaudet",
            koiranSairaudetProcessed,
            legacy.koiranSairaudet.length,
          );
        }
        continue;
      }
      const sairausId = sairausIdByKoodi.get(sairausKoodi);
      if (!sairausId) {
        koiranSairaudetSkipped += 1;
        errorsCount += 1;
        await recordIssue({
          stage: "koiran-sairaudet",
          code: "KOIRAN_SAIRAUS_DEFINITION_NOT_FOUND",
          message: "beasairaat SAIRAUS value did not resolve to beasairaudet.",
          registrationNo: dog.registrationNo,
          sourceRowId: row.legacyId,
          sourceTable: "beasairaat",
          payloadJson: JSON.stringify(row),
        });
        if (koiranSairaudetProcessed % 1000 === 0) {
          logProgress(
            "koiran-sairaudet",
            koiranSairaudetProcessed,
            legacy.koiranSairaudet.length,
          );
        }
        continue;
      }
      if (!evidenceKind) {
        koiranSairaudetSkipped += 1;
        if (koiranSairaudetProcessed % 1000 === 0) {
          logProgress(
            "koiran-sairaudet",
            koiranSairaudetProcessed,
            legacy.koiranSairaudet.length,
          );
        }
        continue;
      }
      koiranSairaudetData.push({
        vanhaId: row.legacyId,
        dogId: dog.dogId,
        evidenceKind,
        isaRekisterinumero: isa.registrationNo,
        emaRekisterinumero: ema.registrationNo,
        rekisterinumero: dog.registrationNo,
        sairausId,
        sairausKoodi,
        pentue: normalizeNullable(row.litterRaw),
        kuvaus: normalizeNullable(row.description),
        julkinen: parseLegacyBoolean(row.publicRaw),
        tietolahde: normalizeNullable(row.source),
        muokattuLahteessa: parseLegacyTimestamp(row.modifiedRaw),
      });
      if (koiranSairaudetProcessed % 1000 === 0) {
        logProgress(
          "koiran-sairaudet",
          koiranSairaudetProcessed,
          legacy.koiranSairaudet.length,
        );
      }
    }
    logProgress(
      "koiran-sairaudet",
      koiranSairaudetProcessed,
      legacy.koiranSairaudet.length,
    );
    const koiranSairaudetInserted =
      koiranSairaudetData.length > 0
        ? (
            await phaseDb.koiranSairaus.createMany({
              data: koiranSairaudetData,
              skipDuplicates: true,
            })
          ).count
        : 0;
    finishStage(
      "koiran-sairaudet",
      `source=${legacy.koiranSairaudet.length}, inserted=${koiranSairaudetInserted}, skipped=${koiranSairaudetSkipped}, fallbackIdentityIssues=${koiranSairaudetFallbackIdentityIssues}, unresolvedDogSkipped=${koiranSairaudetUnresolvedDogSkipped}, parentInvalid=${koiranSairaudetParentInvalid}, parentUnresolved=${koiranSairaudetParentUnresolved}`,
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
        errorSummary: formatLegacyImportSummary({
          kind: "LEGACY_PHASE1_25",
          sairaudetInserted,
          koiranSairaudetInserted,
          koiranSairaudetFallbackIdentityIssues,
          koiranSairaudetUnresolvedDogSkipped,
          epiLuvutInserted: 0,
          errorsCount,
        }),
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
