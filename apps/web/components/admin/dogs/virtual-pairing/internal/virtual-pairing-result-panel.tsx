import type { CalculateAdminVirtualPairingResponse } from "@beagle/contracts";
import type { TranslateFn } from "../admin-virtual-pairing-page-client";

type Props = {
  t: TranslateFn;
  result: CalculateAdminVirtualPairingResponse | null;
};

function formatCoefficient(value: number | null): string {
  if (value == null) return "-";
  return `${value.toFixed(4)} %`;
}

function formatSummaryPct(value: number): string {
  return `${value.toFixed(2)} %`;
}

function formatPlaceholderLabel(value: string): string {
  return `${value}:`;
}

function formatAncestorLabel(item: { label: string; displayPct: string }) {
  return `${item.label} => ${item.displayPct}`;
}

// Result card for the admin virtual-pairing workflow.
export function AdminVirtualPairingResultPanel({ t, result }: Props) {
  if (!result) {
    return (
      <div className="text-sm text-muted-foreground">
        {t("admin.virtualPairing.result.empty")}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">
          {t("admin.virtualPairing.result.inbreedingLabel")}
        </div>
        <div className="text-2xl font-semibold">
          {formatCoefficient(result.inbreedingCoefficientPct)}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {result.sire.name} / {result.dam.name}
        </div>
        <div className="text-sm text-muted-foreground">
          SP {result.generationDepth}
        </div>
      </div>

      <div className="rounded-lg border p-4 font-mono text-sm leading-6">
        <div>
          {t("admin.virtualPairing.result.summary.sharedAncestors")}{" "}
          {result.diagnostics.includedOccurrenceCount} kpl (
          {result.diagnostics.sharedOccurrenceCount} kpl)
        </div>
        <div>
          {t("admin.virtualPairing.result.summary.occurrences")}{" "}
          {result.diagnostics.includedPositionCount} kpl (I=
          {result.diagnostics.includedSirePositionCount} kpl, E=
          {result.diagnostics.includedDamPositionCount} kpl)
        </div>
        <div>
          {result.generationDepth}-
          {t("admin.virtualPairing.result.summary.knownPedigree")}{" "}
          {formatSummaryPct(result.diagnostics.knownPedigreePct)}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-semibold tracking-wide">
          {t("admin.virtualPairing.result.basisTitle")}
        </div>
        <ol className="mt-3 space-y-1 font-mono text-xs leading-5">
          {result.diagnostics.contributions.slice(0, 37).map((item, index) => (
            <li key={`${item.ancestorId}-${index}`}>
              {String(index + 1).padStart(2, " ")}. {formatAncestorLabel(item)}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-3">
        {Object.values(result.placeholders).map((item) => (
          <div key={item.label} className="rounded-lg border p-4">
            <div className="text-sm font-medium">
              {formatPlaceholderLabel(item.label)}
            </div>
            <div className="text-sm text-muted-foreground">{item.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}
