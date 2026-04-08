"use client";

export function ShowManagementStatusFooter({
  statusText,
}: {
  statusText: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {statusText || "No unsaved changes."}
      </p>
    </div>
  );
}
