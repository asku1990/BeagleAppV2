import { Suspense } from "react";
import { BeagleBestDriverPage } from "@/components/beagle-best-driver";

export default function BestDriverRoute() {
  return (
    <Suspense>
      <BeagleBestDriverPage />
    </Suspense>
  );
}
