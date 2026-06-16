import type {
  CalculateAdminVirtualPairingRequest,
  CalculateAdminVirtualPairingResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import type { VirtualPairingAncestorDetailsDb } from "@beagle/db";
import {
  calculateVirtualPairing,
  type VirtualPairingCalculationCoreResult,
} from "@server/dogs/virtual-pairing/calculate-virtual-pairing";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

// Admin virtual pairing service.
// Authenticates the caller, reuses the shared public-safe calculation core,
// then maps the result to the richer admin DTO with diagnostics placeholders.
type CalculateResult = ServiceResult<CalculateAdminVirtualPairingResponse>;

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

function mapAdminResult(
  result: VirtualPairingCalculationCoreResult,
): CalculateAdminVirtualPairingResponse {
  return {
    generationDepth: result.generationDepth,
    sire: result.sire,
    dam: result.dam,
    inbreedingCoefficientPct: result.inbreedingCoefficientPct,
    health: {
      epi: result.health.epi,
      lafora: result.health.lafora,
      risk: result.health.risk,
      pur: result.health.pur,
    },
    diagnostics: {
      sharedAncestorCount: result.diagnostics.sharedAncestorCount,
      sharedOccurrenceCount: result.diagnostics.sharedOccurrenceCount,
      includedOccurrenceCount: result.diagnostics.includedOccurrenceCount,
      includedSirePositionCount: result.diagnostics.includedSirePositionCount,
      includedDamPositionCount: result.diagnostics.includedDamPositionCount,
      includedPositionCount: result.diagnostics.includedPositionCount,
      knownSlotCount: result.diagnostics.knownSlotCount,
      knownPedigreePct: result.diagnostics.knownPedigreePct,
      contributions: result.diagnostics.contributions.map((contribution) => {
        const detail: VirtualPairingAncestorDetailsDb | undefined =
          result.ancestorDetailsById.get(contribution.id);
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
  };
}

export async function calculateAdminVirtualPairing(
  input: CalculateAdminVirtualPairingRequest,
  currentUser: CurrentUserDto | null,
): Promise<CalculateResult> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.calculateAdminVirtualPairing",
    ...(currentUser?.id ? { actorUserId: currentUser.id } : {}),
  });

  log.info(
    {
      event: "start",
      hasSireRegistrationNo: Boolean(input.sireRegistrationNo?.trim()),
      hasDamRegistrationNo: Boolean(input.damRegistrationNo?.trim()),
      generationDepth: input.generationDepth ?? 9,
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

  try {
    const result = await calculateVirtualPairing(input);
    if (!result.body.ok) {
      return {
        status: result.status,
        body: result.body,
      };
    }

    log.info(
      {
        event: "success",
        sireId: result.body.data.sire.id,
        damId: result.body.data.dam.id,
        generationDepth: result.body.data.generationDepth,
        durationMs: Date.now() - startedAt,
      },
      "admin virtual pairing calculation succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: mapAdminResult(result.body.data),
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
