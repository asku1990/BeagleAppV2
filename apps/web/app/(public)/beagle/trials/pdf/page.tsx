import React from "react";

import { BeagleTrialPdfCollectionPage } from "@/components/beagle-trials";

export default async function BeagleTrialPdfCollectionRoute({
  searchParams,
}: {
  searchParams: Promise<{ trialEntryId?: string | string[] }>;
}) {
  const { trialEntryId } = await searchParams;
  const trialEntryIds = Array.isArray(trialEntryId)
    ? trialEntryId
    : trialEntryId
      ? [trialEntryId]
      : [];

  return <BeagleTrialPdfCollectionPage trialEntryIds={trialEntryIds} />;
}
