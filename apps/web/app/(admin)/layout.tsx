import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout";
import { AppHeader } from "@/components/sidebar/app-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const adminCheck = await requireAdminLayoutAccess();

  if (!adminCheck.ok) {
    if (adminCheck.status === 401) {
      redirect("/sign-in?returnTo=/admin");
    }

    redirect("/");
  }

  return (
    <AppShell sidebar={<AppSidebar />} header={<AppHeader />}>
      {children}
    </AppShell>
  );
}
