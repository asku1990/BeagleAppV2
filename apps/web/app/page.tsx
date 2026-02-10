"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MainHeader } from "@/components/home/main-header";
import { StatisticsSection } from "@/components/home/statistics-section";

const menuItems = [
  "Beagle Search",
  "Owner Search",
  "Trial Results",
  "Field Trials",
  "Shows",
  "EK Dogs",
  "Kennel Names",
  "Virtual Pairing",
  "Best Driver",
];

export default function Home() {
  const showNotImplementedToast = (item: string) => {
    toast(`${item}: not implemented yet`);
  };

  return (
    <main className="beagle-shell min-h-screen px-3 py-4 sm:px-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl justify-end">
        <Link href="/login" className="beagle-signin-link">
          Sign in
        </Link>
      </div>

      <section className="mx-auto mt-5 grid w-full max-w-7xl gap-5 md:grid-cols-[290px_1fr] lg:gap-6">
        <aside className="beagle-panel p-4 md:p-5 lg:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="beagle-title">Main Menu</h2>
              <p className="beagle-subtitle">Beagle Database</p>
            </div>
            <Image
              src="/beagle-legacy-logo.png"
              alt="Legacy Beagle logo"
              width={64}
              height={36}
              className="h-9 w-auto rounded-sm border border-[var(--beagle-border)] bg-white p-1"
            />
          </div>

          <ul className="mt-5 space-y-2.5">
            {menuItems.map((item) => (
              <li key={item}>
                <Button
                  type="button"
                  variant="secondary"
                  className="beagle-menu-item w-full justify-between"
                  aria-label={`${item} is not implemented yet`}
                  onClick={() => showNotImplementedToast(item)}
                >
                  <span>{item}</span>
                  <span className="beagle-badge">Coming soon</span>
                </Button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="space-y-5 lg:space-y-6">
          <MainHeader
            title="Suomen Beaglejärjestö"
            description="New main page design and menu structure are in place. Feature pages will be connected next."
          />
          <StatisticsSection />
        </section>
      </section>
    </main>
  );
}
