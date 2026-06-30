import React from "react";
import { BeagleTrialPdfShell } from "./beagle-trial-pdf-shell";

type BeagleTrialPdfCollectionPageProps = {
  trialEntryIds: string[];
};

export function BeagleTrialPdfCollectionPage({
  trialEntryIds,
}: BeagleTrialPdfCollectionPageProps) {
  return (
    <BeagleTrialPdfShell
      items={trialEntryIds.map((trialEntryId) => ({
        trialEntryId,
      }))}
    />
  );
}
