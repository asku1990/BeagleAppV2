"use client";

import React from "react";
import type {
  AdminShowWorkbookImportIssue,
  AdminShowWorkbookImportPreviewEvent,
} from "@beagle/contracts";
import { ListingResponsiveResults } from "@/components/listing";
import type { PreviewTranslator } from "./show-workbook-preview-results-internal";
import { ShowWorkbookPreviewResultsDesktop } from "./show-workbook-preview-results-desktop";
import { ShowWorkbookPreviewResultsMobile } from "./show-workbook-preview-results-mobile";

export function ShowWorkbookPreviewResults({
  event,
  issues,
  t,
}: {
  event: AdminShowWorkbookImportPreviewEvent;
  issues: AdminShowWorkbookImportIssue[];
  t: PreviewTranslator;
}) {
  return (
    <ListingResponsiveResults
      desktop={
        <ShowWorkbookPreviewResultsDesktop
          event={event}
          issues={issues}
          t={t}
        />
      }
      mobile={
        <ShowWorkbookPreviewResultsMobile event={event} issues={issues} t={t} />
      }
    />
  );
}
