import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";
import { AppHeader } from "@/components/sidebar/app-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell sidebar={<AppSidebar />} header={<AppHeader />}>
      {children}
    </AppShell>
  );
}
