import {
  findVirtualPairingAncestorDetailsDb,
  findVirtualPairingDogByRegistrationNoDb,
  loadDogPedigreeAncestryForParentsDb,
  type VirtualPairingAncestorDetailsDb,
} from "@beagle/db";
import { loadDogDiseaseFactsDb } from "@beagle/db/dogs/core/epi-disease-facts";
import type {
  CalculateAdminVirtualPairingRequest,
  CalculateAdminVirtualPairingResponse,
  CurrentUserDto,
  VirtualPairingDogOption,
} from "@beagle/contracts";
import {
  calculateInbreedingCoefficientBreakdownForParentsPct,
  getInbreedingAncestryLoadDepth,
  INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH,
  parseVirtualPairingGenerationDepth,
  calculateDogHealthSummary,
} from "@server/dogs/core";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

// Admin virtual pairing service.
// Loads the selected sire/dam, computes current-data inbreeding, then builds a
// synthetic puppy root so the shared health calculator can evaluate EPI,
// Lafora, risk, and PUR against the paired parents without persisting anything.
type CalculateResult = ServiceResult<CalculateAdminVirtualPairingResponse>;

function normalizeRegistrationNo(value: string): string {
  return value.trim().toUpperCase();
}

function invalidSireRegistrationResponse(): CalculateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Sire registration number was not found.",
      code: "INVALID_SIRE_REGISTRATION",
    },
  };
}

function invalidDamRegistrationResponse(): CalculateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Dam registration number was not found.",
      code: "INVALID_DAM_REGISTRATION",
    },
  };
}

function invalidParentCombinationResponse(): CalculateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Sire and dam must be different dogs.",
      code: "INVALID_PARENT_COMBINATION",
    },
  };
}

function invalidSireSexResponse(): CalculateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Selected sire must be a male dog.",
      code: "INVALID_SIRE_SEX",
    },
  };
}

function invalidDamSexResponse(): CalculateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Selected dam must be a female dog.",
      code: "INVALID_DAM_SEX",
    },
  };
}

function internalErrorResponse(): CalculateResult {
  return {
    status: 500,
    body: {
      ok: false,
      error: "Failed to calculate virtual pairing data.",
      code: "INTERNAL_ERROR",
    },
  };
}

function toDogOption(
  row: NonNullable<
    Awaited<ReturnType<typeof findVirtualPairingDogByRegistrationNoDb>>
  >,
): VirtualPairingDogOption {
  return {
    id: row.id,
    ekNo: row.ekNo,
    registrationNo: row.registrationNo,
    name: row.name,
    sex: row.sex === "MALE" ? "U" : row.sex === "FEMALE" ? "N" : "-",
  };
}

function formatGroupedContributionPct(
  adjustedContributionPct: number,
  rawContributionPct: number,
): string {
  const adjusted = adjustedContributionPct.toFixed(5);
  const raw = rawContributionPct.toFixed(5);
  return adjusted === raw ? `${adjusted} %` : `${adjusted} % (${raw} %)`;
}

function buildPlaceholderSection(label: string) {
  return {
    label,
    value: "Tulossa myöhemmässä vaiheessa",
  };
}

// Virtual pairing uses an in-memory puppy root whose parents are the selected
// sire and dam. This lets the shared health calculator treat the pair like a
// real root dog while keeping the result ephemeral.
function buildVirtualRootAncestry(
  ancestry: Awaited<ReturnType<typeof loadDogPedigreeAncestryForParentsDb>>,
  sireId: string,
  damId: string,
) {
  const rootId = `virtual:${sireId}:${damId}`;

  return {
    rootId,
    nodes: {
      ...ancestry.nodes,
      [rootId]: {
        id: rootId,
        sireId,
        damId,
        siitosasteProsentti: null,
      },
    },
  };
}

export async function calculateAdminVirtualPairing(
  input: CalculateAdminVirtualPairingRequest,
  currentUser: CurrentUserDto | null,
): Promise<CalculateResult> {
  const startedAt = Date.now();
  const sireRegistrationNo = normalizeRegistrationNo(input.sireRegistrationNo);
  const damRegistrationNo = normalizeRegistrationNo(input.damRegistrationNo);
  const generationDepth = parseVirtualPairingGenerationDepth(
    input.generationDepth,
  );
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.calculateAdminVirtualPairing",
    ...(currentUser?.id ? { actorUserId: currentUser.id } : {}),
  });

  log.info(
    {
      event: "start",
      hasSireRegistrationNo: Boolean(sireRegistrationNo),
      hasDamRegistrationNo: Boolean(damRegistrationNo),
      generationDepth,
    },
    "admin virtual pairing calculation started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin virtual pairing calculation rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  if (!sireRegistrationNo) {
    return invalidSireRegistrationResponse();
  }

  if (!damRegistrationNo) {
    return invalidDamRegistrationResponse();
  }

  try {
    const sireRow =
      await findVirtualPairingDogByRegistrationNoDb(sireRegistrationNo);
    if (!sireRow) {
      return invalidSireRegistrationResponse();
    }

    const damRow =
      await findVirtualPairingDogByRegistrationNoDb(damRegistrationNo);
    if (!damRow) {
      return invalidDamRegistrationResponse();
    }

    if (sireRow.id === damRow.id) {
      return invalidParentCombinationResponse();
    }

    if (sireRow.sex !== "MALE") {
      return invalidSireSexResponse();
    }

    if (damRow.sex !== "FEMALE") {
      return invalidDamSexResponse();
    }

    // v1 uses selected SP for pair occurrence discovery, but multiplies each
    // shared ancestor by a stored 9-generation SIITOSASTE. v2 recalculates
    // that ancestor Fa dynamically, so keep its depth fixed at the same
    // default while still honoring selected SP for the pair matrix.
    const ancestry = await loadDogPedigreeAncestryForParentsDb(
      sireRow.id,
      damRow.id,
      getInbreedingAncestryLoadDepth(
        generationDepth,
        INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH,
      ),
    );
    // Load every disease row referenced by the current ancestry so the shared
    // calculator can score EPI, Lafora, risk, and PUR from the current graph.
    const diseaseFacts = await loadDogDiseaseFactsDb(
      Object.keys(ancestry.nodes),
      ["epi", "lepis", "lepik", "lepit", "pur", "ap", "yp", "rp"],
    );
    const healthAncestry = buildVirtualRootAncestry(
      ancestry,
      sireRow.id,
      damRow.id,
    );
    const breakdown = calculateInbreedingCoefficientBreakdownForParentsPct(
      sireRow.id,
      damRow.id,
      ancestry,
      generationDepth,
      { ancestorInbreedingDepth: INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH },
    );
    const inbreedingCoefficientPct = breakdown.contributionPct;
    const healthSummary = calculateDogHealthSummary(
      healthAncestry.rootId,
      healthAncestry,
      diseaseFacts,
    );
    const ancestorDetails = await findVirtualPairingAncestorDetailsDb(
      breakdown.contributions.map((contribution) => contribution.id),
    );
    const ancestorDetailsById = new Map<
      string,
      VirtualPairingAncestorDetailsDb
    >(ancestorDetails.map((detail) => [detail.id, detail]));

    const sire = toDogOption(sireRow);
    const dam = toDogOption(damRow);

    log.info(
      {
        event: "success",
        sireId: sire.id,
        damId: dam.id,
        generationDepth,
        durationMs: Date.now() - startedAt,
      },
      "admin virtual pairing calculation succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          generationDepth,
          sire,
          dam,
          inbreedingCoefficientPct,
          health: healthSummary,
          diagnostics: {
            sharedAncestorCount: breakdown.sharedAncestorCount,
            sharedOccurrenceCount: breakdown.sharedOccurrenceCount,
            includedOccurrenceCount: breakdown.includedOccurrenceCount,
            includedSirePositionCount: breakdown.includedSirePositionCount,
            includedDamPositionCount: breakdown.includedDamPositionCount,
            includedPositionCount: breakdown.includedPositionCount,
            knownSlotCount: breakdown.knownSlotCount,
            knownPedigreePct: breakdown.knownPedigreePct,
            contributions: breakdown.contributions.map((contribution) => {
              const detail = ancestorDetailsById.get(contribution.id);
              return {
                ancestorId: contribution.id,
                label: detail
                  ? `${detail.name}${detail.ekNo != null ? ` EK:${detail.ekNo}` : ""} ${detail.registrationNo}`.trim()
                  : contribution.id,
                contributionPct: contribution.adjustedContributionPct,
                rawContributionPct: contribution.rawContributionPct,
                occurrenceCount: contribution.occurrenceCount,
                displayPct: formatGroupedContributionPct(
                  contribution.adjustedContributionPct,
                  contribution.rawContributionPct,
                ),
                sireGeneration: contribution.sireGeneration,
                sireIndex: contribution.sireIndex,
                damGeneration: contribution.damGeneration,
                damIndex: contribution.damIndex,
              };
            }),
          },
          placeholders: {
            diagnostics: buildPlaceholderSection(
              "Tulossa myöhemmässä vaiheessa: diagnostiikka",
            ),
            pedigree: buildPlaceholderSection("Siirry sukutauluun"),
          },
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin virtual pairing calculation failed",
    );

    return internalErrorResponse();
  }
}
