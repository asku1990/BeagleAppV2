import { BeagleTrialPdfPage } from "@/components/beagle-trials";

export default async function BeagleTrialPdfRoute({
  params,
}: {
  params: Promise<{ trialId: string }>;
}) {
  const { trialId } = await params;

  return <BeagleTrialPdfPage trialId={trialId} />;
}
