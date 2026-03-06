import { BeagleShowDetailsPageContainer } from "@/components/beagle-shows";

export default async function BeagleShowDetailsRoute({
  params,
}: {
  params: Promise<{ showId: string }>;
}) {
  const { showId } = await params;

  return <BeagleShowDetailsPageContainer showId={showId} />;
}
