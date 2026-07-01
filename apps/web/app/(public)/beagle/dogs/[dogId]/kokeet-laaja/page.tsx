import { DogProfileTrialsLaajaPageContainer } from "@/components/beagle-dog-profile";

export default async function DogTrialsLaajaRoute({
  params,
}: {
  params: Promise<{ dogId: string }>;
}) {
  const { dogId } = await params;

  return <DogProfileTrialsLaajaPageContainer dogId={dogId} />;
}
