"use client";

import React from "react";

type ShowManagementEntrySummaryProps = {
  classResultText: string;
  qualityText: string;
  pupnText: string;
  awardsText: string;
};

export function ShowManagementEntrySummary({
  classResultText,
  qualityText,
  pupnText,
  awardsText,
}: ShowManagementEntrySummaryProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">Current selection</p>
      <p className="text-xs">
        <span className="text-muted-foreground">Class:</span>{" "}
        <span>{classResultText}</span>
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">Quality:</span>{" "}
        <span>{qualityText}</span>
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">PUPN:</span>{" "}
        <span>{pupnText}</span>
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">Awards:</span>{" "}
        <span>{awardsText}</span>
      </p>
    </div>
  );
}
