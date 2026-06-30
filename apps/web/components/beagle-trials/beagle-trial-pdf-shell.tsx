import React from "react";
import { BeagleTrialPdfCanvasStack } from "./beagle-trial-pdf-canvas-stack";

type BeagleTrialPdfShellItem = {
  trialEntryId: string;
};

type BeagleTrialPdfShellProps = {
  items: BeagleTrialPdfShellItem[];
};

export function BeagleTrialPdfShell({ items }: BeagleTrialPdfShellProps) {
  if (items.length === 0) {
    return <div className="fixed inset-0 z-50 bg-background" />;
  }

  return <BeagleTrialPdfCanvasStack items={items} />;
}
