import { AdminTrialEntryCreatePageClient } from "@/components/admin/trials/admin-trial-entry-create-page-client";

export default async function AdminTrialEntryCreatePage({
  params,
}: {
  params: Promise<{ trialEventId: string }>;
}) {
  const { trialEventId } = await params;
  return <AdminTrialEntryCreatePageClient trialEventId={trialEventId} />;
}
