import { AdminTrialEventWorkspacePageClient } from "@/components/admin/trials";

export default async function AdminTrialEventWorkspacePage({
  params,
}: {
  params: Promise<{ trialEventId: string }>;
}) {
  const { trialEventId } = await params;

  return <AdminTrialEventWorkspacePageClient trialEventId={trialEventId} />;
}
