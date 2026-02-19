import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout";
import { AppHeader } from "@/components/sidebar/app-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionCurrentUser();
  if (!user) {
    redirect("/sign-in?returnTo=/account/profile");
  }

  return (
    <AppShell sidebar={<AppSidebar />} header={<AppHeader />}>
      {children}
    </AppShell>
  );
}
