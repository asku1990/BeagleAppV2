import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type AppShellProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="beagle-shell flex min-h-screen w-full">
        {sidebar}
        <SidebarInset className="min-h-screen">
          {header}
          <main className="flex-1 overflow-auto bg-[url('/legacy-v1-assets/v1-kuvat-be_leima.jpg')] bg-repeat bg-[length:198px_108px] px-4 py-5 md:px-6 md:py-6 lg:px-8">
            <section className="mx-auto w-full max-w-screen-2xl space-y-6">
              {children}
            </section>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
