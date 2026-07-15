import type {
  CalculatePublicVirtualPairingRequest,
  CalculatePublicVirtualPairingResponse,
  VirtualPairingContributionDto,
  VirtualPairingContributionPosition,
} from "@beagle/contracts";
import type { ServiceResult } from "@server/core/result";
import {
  calculateVirtualPairing,
  type VirtualPairingCalculationCoreResult,
} from "./calculate-virtual-pairing";

type CalculateResult = ServiceResult<CalculatePublicVirtualPairingResponse>;

function mapPositions(
  positions: Array<{
    sireGeneration: number;
    sireIndex: number;
    damGeneration: number;
    damIndex: number;
  }>,
): VirtualPairingContributionPosition[] {
  return positions.map((position) => ({
    sireGeneration: position.sireGeneration,
    sireIndex: position.sireIndex,
    damGeneration: position.damGeneration,
    damIndex: position.damIndex,
  }));
}

function mapContribution(
  contribution: VirtualPairingCalculationCoreResult["diagnostics"]["contributions"][number],
  label: string,
): VirtualPairingContributionDto {
  return {
    ancestorId: contribution.id,
    label,
    contributionPct: contribution.adjustedContributionPct,
    rawContributionPct: contribution.rawContributionPct,
    occurrenceCount: contribution.occurrenceCount,
    positions: mapPositions(contribution.includedOccurrences),
  };
}

export async function calculatePublicVirtualPairing(
  input: CalculatePublicVirtualPairingRequest,
): Promise<CalculateResult> {
  const result = await calculateVirtualPairing(input, {
    allowedStatuses: ["NORMAL"],
  });
  if (!result.body.ok) {
    return {
      status: result.status,
      body: result.body,
    };
  }

  const data = result.body.data;

  return {
    status: 200,
    body: {
      ok: true,
      data: {
        generationDepth: data.generationDepth,
        sire: data.sire,
        dam: data.dam,
        inbreedingCoefficientPct: data.inbreedingCoefficientPct,
        rawInbreedingCoefficientPct: data.rawInbreedingCoefficientPct,
        health: {
          epi: data.health.epi,
          risk: data.health.risk,
        },
        summary: {
          sharedAncestorCount: data.diagnostics.sharedAncestorCount,
          sharedOccurrenceCount: data.diagnostics.sharedOccurrenceCount,
          includedOccurrenceCount: data.diagnostics.includedOccurrenceCount,
          includedSirePositionCount: data.diagnostics.includedSirePositionCount,
          includedDamPositionCount: data.diagnostics.includedDamPositionCount,
          includedPositionCount: data.diagnostics.includedPositionCount,
          knownPedigreePct: data.diagnostics.knownPedigreePct,
          contributions: data.diagnostics.contributions.map((contribution) => {
            const detail = data.ancestorDetailsById.get(contribution.id);
            const label = detail
              ? `${detail.name}${detail.ekNo != null ? ` EK:${detail.ekNo}` : ""} ${detail.registrationNo}`.trim()
              : contribution.id;
            return mapContribution(contribution, label);
          }),
        },
      },
    },
  };
}
