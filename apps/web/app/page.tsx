import Link from "next/link";
import { Button } from "@beagle/ui";
import { ImportStatus } from "@/components/import-status";
import { AuthStatus } from "@/components/auth-status";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-4xl font-semibold">Beagle v2</h1>
      <p className="text-zinc-700">Monorepo foundation with auth, server actions, Prisma, and test automation.</p>
      <AuthStatus />
      <ImportStatus />
      <div className="flex gap-3">
        <Link href="/login"><Button>Login</Button></Link>
        <Link href="/register"><Button variant="secondary">Register</Button></Link>
      </div>
    </main>
  );
}
