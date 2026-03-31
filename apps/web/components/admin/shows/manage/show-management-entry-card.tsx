"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ManageShowEntry } from "./show-management-types";
import {
  CLASS_CODE_OPTIONS,
  QUALITY_GRADE_OPTIONS,
} from "./show-management-result-options";

type ShowManagementEntryCardProps = {
  entry: ManageShowEntry;
  onChange: (
    entryId: string,
    patch: Partial<Omit<ManageShowEntry, "id">>,
  ) => void;
  onRemove: (entry: ManageShowEntry) => void;
};

export function ShowManagementEntryCard({
  entry,
  onChange,
  onRemove,
}: ShowManagementEntryCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium">{entry.dogName}</p>
            <p className="text-sm text-muted-foreground">
              {entry.registrationNo}
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onRemove(entry)}
          >
            Remove dog
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Judge</span>
            <Input
              value={entry.judge}
              onChange={(event) =>
                onChange(entry.id, { judge: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Height</span>
            <Input
              type="number"
              inputMode="numeric"
              value={entry.heightCm}
              onChange={(event) =>
                onChange(entry.id, { heightCm: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Critique</span>
            <textarea
              value={entry.critiqueText}
              onChange={(event) =>
                onChange(entry.id, { critiqueText: event.target.value })
              }
              className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Show type</span>
            <Input
              value={entry.showType}
              onChange={(event) =>
                onChange(entry.id, { showType: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Class</span>
            {/* Definition-backed values stay local for now; swap to DB-driven options later. */}
            <select
              value={entry.classCode}
              onChange={(event) =>
                onChange(entry.id, { classCode: event.target.value })
              }
              className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {CLASS_CODE_OPTIONS.map((option) => (
                <option key={option.value || "empty"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>Quality</span>
            {/* Definition-backed values stay local for now; swap to DB-driven options later. */}
            <select
              value={entry.qualityGrade}
              onChange={(event) =>
                onChange(entry.id, { qualityGrade: event.target.value })
              }
              className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {QUALITY_GRADE_OPTIONS.map((option) => (
                <option key={option.value || "empty"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>Placement</span>
            <Input
              type="number"
              inputMode="numeric"
              value={entry.classPlacement}
              onChange={(event) =>
                onChange(entry.id, { classPlacement: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>PUPN</span>
            <Input
              value={entry.pupn}
              onChange={(event) =>
                onChange(entry.id, { pupn: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Awards</span>
            <Input
              value={entry.awards.join(", ")}
              onChange={(event) =>
                onChange(entry.id, {
                  awards: event.target.value
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
