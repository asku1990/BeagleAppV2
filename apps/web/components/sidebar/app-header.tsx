"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--beagle-border)] bg-white/95 backdrop-blur">
      <div className="flex h-12 w-full items-center justify-between gap-3 px-3 sm:px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <SidebarTrigger className="text-[var(--beagle-ink)]" />
          <p className="truncate text-sm text-[var(--beagle-muted)]">
            New main page design and menu structure are in place.
          </p>
        </div>
        <div aria-hidden="true" className="w-6 shrink-0" />
      </div>
    </header>
  );
}
