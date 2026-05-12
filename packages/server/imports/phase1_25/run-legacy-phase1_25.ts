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
import type { ServiceResult } from "../../core/result";
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
      isaDogId: string | null;
      emaDogId: string | null;
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

type KoiranEpiLukuDelegate = {
  createMany(args: {
    data: Array<{
      vanhaId: number;
      dogId: string | null;
      isaDogId: string | null;
      emaDogId: string | null;
      rekisterinumero: string;
      epiLuku: string | null;
      epiTeksti: string | null;
      vara: string | null;
      muokattuLahteessa: Date | null;
    }>;
    skipDuplicates?: boolean;
  }): Promise<{ count: number }>;
};

function getPhase1_25Db() {
  return prisma as unknown as {
    sairaus: SairausDelegate;
    koiranSairaus: KoiranSairausDelegate;
    koiranEpiLuku: KoiranEpiLukuDelegate;
  };
}

function parseLegacyDecimal(
  value: string | number | null | undefined,
): string | null {
  if (value == null) return null;
  const normalized =
    typeof value === "number" ? String(value) : value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? normalized : null;
}

function parseSiitosastePercent(
  value: string | number | null | undefined,
): string | null {
  const parsed = parseLegacyDecimal(value);
  if (parsed == null || Number.parseFloat(parsed) === 0) return null;
  return parsed;
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

function isUnknownLegacyParentRegistration(value: string): boolean {
  return value === "-" || value === "0" || /^U0+$/u.test(value);
}

function buildDuplicateLegacyEpiIdGroups(
  rows: Array<{
    legacyId: number;
    registrationNo: string | null;
    sireRegistrationNo: string | null;
    damRegistrationNo: string | null;
    epiValueRaw: string | number | null;
    epiText: string | null;
    modifiedRaw: string | Date | null;
    flag: string | null;
  }>,
) {
  const rowsByLegacyId = new Map<number, typeof rows>();
  for (const row of rows) {
    const existing = rowsByLegacyId.get(row.legacyId);
    if (existing) {
      existing.push(row);
    } else {
      rowsByLegacyId.set(row.legacyId, [row]);
    }
  }

  return Array.from(rowsByLegacyId.entries()).filter(
    ([, legacyRows]) => legacyRows.length > 1,
  );
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
      `inbreeding=${legacy.inbreeding.length}, sairaudet=${legacy.sairaudet.length}, koiranSairaudet=${legacy.koiranSairaudet.length}, epiLuvut=${legacy.epiLuvut.length}`,
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

    startStage("siitosaste");
    let siitosasteUpdated = 0;
    let siitosasteSkippedMissingRegistration = 0;
    let siitosasteSkippedUnresolved = 0;
    let siitosasteProcessed = 0;
    for (const row of legacy.inbreeding) {
      siitosasteProcessed += 1;
      const registrationNo = normalizeRegistrationNo(row.registrationNo);
      if (!registrationNo || !isValidRegistrationNo(registrationNo)) {
        siitosasteSkippedMissingRegistration += 1;
        if (siitosasteProcessed % 1000 === 0) {
          logProgress(
            "siitosaste",
            siitosasteProcessed,
            legacy.inbreeding.length,
          );
        }
        continue;
      }
      const dogId = registrationIndex.dogIdByRegistration.get(registrationNo);
      if (!dogId) {
        siitosasteSkippedUnresolved += 1;
        if (siitosasteProcessed % 1000 === 0) {
          logProgress(
            "siitosaste",
            siitosasteProcessed,
            legacy.inbreeding.length,
          );
        }
        continue;
      }
      await prisma.dog.update({
        where: { id: dogId },
        data: {
          siitosasteProsentti: parseSiitosastePercent(row.siitosasteRaw),
        } as unknown as Parameters<typeof prisma.dog.update>[0]["data"],
      });
      siitosasteUpdated += 1;
      if (siitosasteProcessed % 1000 === 0) {
        logProgress(
          "siitosaste",
          siitosasteProcessed,
          legacy.inbreeding.length,
        );
      }
    }
    logProgress("siitosaste", siitosasteProcessed, legacy.inbreeding.length);
    finishStage(
      "siitosaste",
      `updated=${siitosasteUpdated}, skippedMissingRegistration=${siitosasteSkippedMissingRegistration}, skippedUnresolved=${siitosasteSkippedUnresolved}`,
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
    let koiranSairaudetProcessed = 0;
    let koiranSairaudetParentInvalid = 0;
    let koiranSairaudetParentUnresolved = 0;
    for (const row of legacy.koiranSairaudet) {
      koiranSairaudetProcessed += 1;
      const dog = resolveRegistration(registrationIndex, row.registrationNo);
      const isa = resolveRegistration(
        registrationIndex,
        row.sireRegistrationNo,
      );
      const ema = resolveRegistration(registrationIndex, row.damRegistrationNo);
      const sairausKoodi = normalizeDiseaseCode(row.diseaseCode);
      if (!dog.registrationNo || !isValidRegistrationNo(dog.registrationNo)) {
        koiranSairaudetSkipped += 1;
        errorsCount += 1;
        await recordIssue({
          stage: "koiran-sairaudet",
          code: "KOIRAN_SAIRAUS_REGISTRATION_INVALID",
          message: "beasairaat row is missing a valid REKNO.",
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
      koiranSairaudetData.push({
        vanhaId: row.legacyId,
        dogId: dog.dogId,
        isaDogId: isa.dogId,
        emaDogId: ema.dogId,
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
      `source=${legacy.koiranSairaudet.length}, inserted=${koiranSairaudetInserted}, skipped=${koiranSairaudetSkipped}, parentInvalid=${koiranSairaudetParentInvalid}, parentUnresolved=${koiranSairaudetParentUnresolved}`,
    );

    startStage("epi-luvut");
    const epiLuvutData: Parameters<
      KoiranEpiLukuDelegate["createMany"]
    >[0]["data"] = [];
    let epiLuvutSkipped = 0;
    let epiLuvutProcessed = 0;
    let epiLuvutParentInvalid = 0;
    let epiLuvutParentUnresolved = 0;
    for (const row of legacy.epiLuvut) {
      epiLuvutProcessed += 1;
      const dog = resolveRegistration(registrationIndex, row.registrationNo);
      const isa = resolveRegistration(
        registrationIndex,
        row.sireRegistrationNo,
      );
      const ema = resolveRegistration(registrationIndex, row.damRegistrationNo);
      if (!dog.registrationNo || !isValidRegistrationNo(dog.registrationNo)) {
        epiLuvutSkipped += 1;
        errorsCount += 1;
        await recordIssue({
          stage: "epi-luvut",
          code: "EPI_LUKU_REGISTRATION_INVALID",
          message: "beaepi row is missing a valid REKNO.",
          sourceRowId: row.legacyId,
          sourceTable: "beaepi",
          payloadJson: JSON.stringify(row),
        });
        if (epiLuvutProcessed % 1000 === 0) {
          logProgress("epi-luvut", epiLuvutProcessed, legacy.epiLuvut.length);
        }
        continue;
      }
      for (const [role, parent] of [
        ["sire", isa],
        ["dam", ema],
      ] as const) {
        const result = await recordParentResolutionIssue({
          stage: "epi-luvut",
          sourceTable: "beaepi",
          sourceRowId: row.legacyId,
          rowRegistrationNo: dog.registrationNo,
          role,
          parentRegistrationNo: parent.registrationNo,
          parentDogId: parent.dogId,
          payloadJson: JSON.stringify(row),
        });
        if (result === "invalid") epiLuvutParentInvalid += 1;
        if (result === "unresolved") epiLuvutParentUnresolved += 1;
      }
      epiLuvutData.push({
        vanhaId: row.legacyId,
        dogId: dog.dogId,
        isaDogId: isa.dogId,
        emaDogId: ema.dogId,
        rekisterinumero: dog.registrationNo,
        epiLuku: parseLegacyDecimal(row.epiValueRaw),
        epiTeksti: normalizeNullable(row.epiText),
        vara: normalizeNullable(row.flag),
        muokattuLahteessa: parseLegacyTimestamp(row.modifiedRaw),
      });
      if (epiLuvutProcessed % 1000 === 0) {
        logProgress("epi-luvut", epiLuvutProcessed, legacy.epiLuvut.length);
      }
    }
    logProgress("epi-luvut", epiLuvutProcessed, legacy.epiLuvut.length);

    const duplicateLegacyEpiIdGroups = buildDuplicateLegacyEpiIdGroups(
      legacy.epiLuvut,
    );
    for (const [legacyId, duplicateRows] of duplicateLegacyEpiIdGroups) {
      await recordIssue({
        stage: "epi-luvut",
        severity: "WARNING",
        code: "EPI_LUKU_LEGACY_ID_DUPLICATE",
        message:
          "beaepi.ID appears on multiple REKNO rows; imported all rows using ID + REKNO identity.",
        sourceRowId: legacyId,
        sourceTable: "beaepi",
        payloadJson: JSON.stringify({
          legacyId,
          rows: duplicateRows.map((row) => ({
            registrationNo: normalizeRegistrationNo(row.registrationNo),
            sireRegistrationNo: normalizeRegistrationNo(row.sireRegistrationNo),
            damRegistrationNo: normalizeRegistrationNo(row.damRegistrationNo),
            epiLuku: parseLegacyDecimal(row.epiValueRaw),
            epiTeksti: normalizeNullable(row.epiText),
            modifiedRaw: row.modifiedRaw,
            flag: normalizeNullable(row.flag),
          })),
        }),
      });
    }

    const epiLuvutInserted =
      epiLuvutData.length > 0
        ? (
            await phaseDb.koiranEpiLuku.createMany({
              data: epiLuvutData,
              skipDuplicates: true,
            })
          ).count
        : 0;
    finishStage(
      "epi-luvut",
      `source=${legacy.epiLuvut.length}, inserted=${epiLuvutInserted}, skipped=${epiLuvutSkipped}, parentInvalid=${epiLuvutParentInvalid}, parentUnresolved=${epiLuvutParentUnresolved}, duplicateLegacyIds=${duplicateLegacyEpiIdGroups.length}`,
    );

    await flushIssueBuffer();

    const finished = await markImportRunFinished(
      run.id,
      {
        status: "SUCCEEDED",
        dogsUpserted: siitosasteUpdated,
        ownersUpserted: 0,
        ownershipsUpserted: 0,
        trialResultsUpserted: 0,
        showResultsUpserted: 0,
        errorsCount,
        errorSummary: formatLegacyImportSummary({
          kind: "LEGACY_PHASE1_25",
          siitosasteUpdated,
          sairaudetInserted,
          koiranSairaudetInserted,
          epiLuvutInserted,
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
