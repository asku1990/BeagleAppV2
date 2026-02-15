"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  BEAGLE_ROW_ACTIONS,
  type BeagleSearchQuickAction,
} from "@/lib/beagle-search";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const actionLabelMap: Record<BeagleSearchQuickAction, MessageKey> = {
  pedigree: "search.results.actions.pedigree",
  trials: "search.results.actions.trials",
  siblings: "search.results.actions.siblings",
  offspring: "search.results.actions.offspring",
};

export function BeagleSearchRowActions({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {BEAGLE_ROW_ACTIONS.map((action) => {
        const label = t(actionLabelMap[action]);
        return (
          <Button
            key={action}
            type="button"
            variant="outline"
            size="xs"
            onClick={() => toast(`${label}: ${t("common.notImplementedYet")}`)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
