import { AdminTrialDetailsPageClient } from "@/components/admin/trials";

export default async function AdminTrialDetailsPage({
  params,
}: {
  params: Promise<{ trialId: string }>;
}) {
  const { trialId } = await params;

  return <AdminTrialDetailsPageClient trialId={trialId} />;
}
