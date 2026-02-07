import type { ReactNode } from "react";
import { AdminGate } from "@/components/admin-gate";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="mt-4">
        <AdminGate>{children}</AdminGate>
      </div>
    </main>
  );
}
