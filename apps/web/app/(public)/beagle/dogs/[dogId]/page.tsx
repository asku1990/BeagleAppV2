import { BeagleDogProfilePage } from "@/components/beagle-dog-profile";

type DogProfileRouteProps = {
  params: Promise<{
    dogId: string;
  }>;
  searchParams: Promise<{
    name?: string | string[];
    reg?: string | string[];
    sex?: string | string[];
    ek?: string | string[];
    shows?: string | string[];
    trials?: string | string[];
  }>;
};

function takeFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function toInteger(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export default async function DogProfileRoute({
  params,
  searchParams,
}: DogProfileRouteProps) {
  const { dogId } = await params;
  const query = await searchParams;

  return (
    <BeagleDogProfilePage
      dogId={dogId}
      seed={{
        name: takeFirst(query.name),
        registrationNo: takeFirst(query.reg),
        sex: takeFirst(query.sex),
        ekNo: toInteger(takeFirst(query.ek)),
        showCount: toInteger(takeFirst(query.shows)),
        trialCount: toInteger(takeFirst(query.trials)),
      }}
    />
  );
}
