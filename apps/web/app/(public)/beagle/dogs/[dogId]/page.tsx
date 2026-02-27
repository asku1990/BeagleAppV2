import { BeagleDogProfilePage } from "@/components/beagle-dog-profile";

export default async function DogProfileRoute({
  params,
}: {
  params: Promise<{ dogId: string }>;
}) {
  const { dogId } = await params;

  return <BeagleDogProfilePage dogId={dogId} />;
}
