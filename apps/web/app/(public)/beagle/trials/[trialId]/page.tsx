import { BeagleTrialDetailsPageContainer } from "@/components/beagle-trials";

export default async function BeagleTrialDetailsRoute({
  params,
}: {
  params: Promise<{ trialId: string }>;
}) {
  const { trialId } = await params;

  return <BeagleTrialDetailsPageContainer trialId={trialId} />;
}
