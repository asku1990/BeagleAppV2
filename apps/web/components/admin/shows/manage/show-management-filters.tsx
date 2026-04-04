"use client";

import { Input } from "@/components/ui/input";

export function ShowManagementFilters({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <Input
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      placeholder="Search by place, dog, registration number, or judge"
      aria-label="Search shows"
    />
  );
}
