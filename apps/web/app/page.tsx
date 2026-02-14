import { AppHeader } from "@/components/sidebar/app-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { MainHeader } from "@/components/home/main-header";
import { StatisticsSection } from "@/components/home/statistics-section";
import { AppShell } from "@/components/layout";

export default function Home() {
  return (
    <AppShell sidebar={<AppSidebar />} header={<AppHeader />}>
      <MainHeader />
      <StatisticsSection />
    </AppShell>
  );
}
