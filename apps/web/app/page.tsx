import { AppHeader } from "@/components/sidebar/app-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { MainHeader } from "@/components/home/main-header";
import { StatisticsSection } from "@/components/home/statistics-section";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="beagle-shell flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="min-h-screen">
          <AppHeader />
          <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <section className="mx-auto w-full max-w-screen-2xl space-y-5 lg:space-y-6">
              <MainHeader />
              <StatisticsSection />
            </section>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
