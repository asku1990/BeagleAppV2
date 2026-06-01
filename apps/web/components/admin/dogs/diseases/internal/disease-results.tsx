import Link from "next/link";
import type { AdminDogDiseaseBrowseItem } from "@beagle/contracts";
import { ListingResponsiveResults } from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCounts,
  formatParentLine,
  formatRegistrationAndEk,
  formatSex,
  showDash,
} from "./disease-formatters";

function buildDogProfileHref(dogId: string): string {
  return `/admin/dogs/${encodeURIComponent(dogId)}/profile`;
}

function DiseaseRowContent({ row }: { row: AdminDogDiseaseBrowseItem }) {
  const name = row.dogId ? (
    <Link
      href={buildDogProfileHref(row.dogId)}
      className="underline-offset-2 hover:underline"
    >
      {showDash(row.name)}
    </Link>
  ) : (
    <span>{row.name}</span>
  );

  const registration = row.dogId ? (
    <Link
      href={buildDogProfileHref(row.dogId)}
      className="underline-offset-2 hover:underline"
    >
      {formatRegistrationAndEk(row.registrationNo, row.ekNo)}
    </Link>
  ) : (
    <span>{formatRegistrationAndEk(row.registrationNo, row.ekNo)}</span>
  );

  return (
    <>
      <td className="px-2 py-2">{showDash(row.diseaseText)}</td>
      <td className="px-2 py-2">{row.public ? "Kyllä" : "Ei"}</td>
      <td className="px-2 py-2">{registration}</td>
      <td className="px-2 py-2">{formatSex(row.sex)}</td>
      <td className="px-2 py-2">{name}</td>
      <td className="px-2 py-2">
        {formatCounts(row.trialCount, row.showCount)}
      </td>
      <td className="px-2 py-2 max-w-[20rem] whitespace-pre-wrap">
        {formatParentLine(row.sire, row.dam)}
      </td>
    </>
  );
}

function DiseaseCard({ row }: { row: AdminDogDiseaseBrowseItem }) {
  const name = row.dogId ? (
    <Link
      href={buildDogProfileHref(row.dogId)}
      className="underline-offset-2 hover:underline"
    >
      {showDash(row.name)}
    </Link>
  ) : (
    <span>{row.name}</span>
  );

  return (
    <Card>
      <CardContent className="space-y-2 pt-4 text-sm">
        <div className="space-y-1">
          <p className="font-medium">{showDash(row.diseaseText)}</p>
          <p className="text-muted-foreground">
            {row.public ? "Julkinen" : "Ei julkinen"}
          </p>
        </div>
        <p>
          <span className="text-muted-foreground">Rekisteri- ja EK-nro:</span>{" "}
          {row.dogId ? (
            <Link
              href={buildDogProfileHref(row.dogId)}
              className="underline-offset-2 hover:underline"
            >
              {formatRegistrationAndEk(row.registrationNo, row.ekNo)}
            </Link>
          ) : (
            formatRegistrationAndEk(row.registrationNo, row.ekNo)
          )}
        </p>
        <p>
          <span className="text-muted-foreground">S:</span> {formatSex(row.sex)}
        </p>
        <p>
          <span className="text-muted-foreground">Nimi:</span> {name}
        </p>
        <p>
          <span className="text-muted-foreground">Ko/Nä:</span>{" "}
          {formatCounts(row.trialCount, row.showCount)}
        </p>
        <p className="whitespace-pre-wrap">
          <span className="text-muted-foreground">Muut tiedot:</span>{" "}
          {formatParentLine(row.sire, row.dam)}
        </p>
      </CardContent>
    </Card>
  );
}

export function DiseaseResults({
  items,
}: {
  items: AdminDogDiseaseBrowseItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ei sairaustietoja valitulla rajauksella.
      </p>
    );
  }

  return (
    <ListingResponsiveResults
      desktopClassName="overflow-x-auto"
      mobileClassName="space-y-3"
      desktop={
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2">Terveystieto</th>
              <th className="px-2 py-2">Julkinen</th>
              <th className="px-2 py-2">Rekisteri- ja EK-nro</th>
              <th className="px-2 py-2">S</th>
              <th className="px-2 py-2">Nimi</th>
              <th className="px-2 py-2">Ko/Nä</th>
              <th className="px-2 py-2">Muut tiedot</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b align-top">
                <DiseaseRowContent row={row} />
              </tr>
            ))}
          </tbody>
        </table>
      }
      mobile={items.map((row) => (
        <DiseaseCard key={row.id} row={row} />
      ))}
    />
  );
}
