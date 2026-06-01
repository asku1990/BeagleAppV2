import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { TranslateFn } from "../admin-virtual-pairing-page-client";
import type { VirtualPairingDogOption } from "@beagle/contracts";

type Props = {
  t: TranslateFn;
  selectedSire: VirtualPairingDogOption | null;
  selectedDam: VirtualPairingDogOption | null;
  generationDepth: string;
  isCalculating: boolean;
  canCalculate: boolean;
  selectionMessage: string | null;
  calculationMessage: string | null;
  onGenerationDepthChange: (value: string) => void;
  onClearSire: () => void;
  onClearDam: () => void;
  onCalculate: () => void;
};

// Selected-parent and calculation controls for the admin virtual-pairing workflow.
export function AdminVirtualPairingSelectionPanel({
  t,
  selectedSire,
  selectedDam,
  generationDepth,
  isCalculating,
  canCalculate,
  selectionMessage,
  calculationMessage,
  onGenerationDepthChange,
  onClearSire,
  onClearDam,
  onCalculate,
}: Props) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="mb-2 text-sm font-medium">
            {t("admin.virtualPairing.selected.sire")}
          </div>
          {selectedSire ? (
            <div className="space-y-2 text-sm">
              <div className="font-medium">{selectedSire.name}</div>
              <div className="text-muted-foreground">
                {selectedSire.registrationNo}
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onClearSire}
              >
                {t("admin.virtualPairing.selected.clear")}
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("admin.virtualPairing.selected.none")}
            </div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-2 text-sm font-medium">
            {t("admin.virtualPairing.selected.dam")}
          </div>
          {selectedDam ? (
            <div className="space-y-2 text-sm">
              <div className="font-medium">{selectedDam.name}</div>
              <div className="text-muted-foreground">
                {selectedDam.registrationNo}
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onClearDam}
              >
                {t("admin.virtualPairing.selected.clear")}
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("admin.virtualPairing.selected.none")}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <div className="text-sm font-medium">
            {t("admin.virtualPairing.generationDepth.label")}
          </div>
          <select
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            value={generationDepth}
            onChange={(event) => onGenerationDepthChange(event.target.value)}
          >
            {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((depth) => (
              <option key={depth} value={depth}>
                {depth}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={onCalculate} disabled={!canCalculate}>
          {isCalculating
            ? t("admin.virtualPairing.calculate.pending")
            : t("admin.virtualPairing.calculate.button")}
        </Button>
      </div>

      {selectionMessage ? (
        <p className="text-sm text-destructive">{selectionMessage}</p>
      ) : null}
      {calculationMessage ? (
        <p className="text-sm text-destructive">{calculationMessage}</p>
      ) : null}
    </>
  );
}
