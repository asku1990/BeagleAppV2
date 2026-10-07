import type { DogImportField } from "@beagle/contracts";
import type { FinnishWorkbookFact } from "../sources/finnish-kennel-club/parse-finnish-kennel-club-workbook";
import {
  issueFromDogImportFact,
  type DogImportFact,
} from "./dog-import-issues";

const fieldByHeader: Record<string, DogImportField> = {
  Rekisterinumero: "registrationNo",
  Nimi: "name",
  Sukupuoli: "sex",
  Syntymäaika: "birthDate",
  Rekisteröity: "registeredOn",
  Kennel: "breederNameText",
  Alkuperä: "originTypeText",
  Alkuperämaa: "originCountryText",
  Väri: "colorName",
  Häntä: "tailText",
  "Rekisterinumero isä": "sireRegistrationNo",
  "Rekisterinumero emä": "damRegistrationNo",
};

export function issueFromFinnishWorkbookFact(fact: FinnishWorkbookFact) {
  const code =
    fact.code === "INVALID_DATE"
      ? fact.header === "Rekisteröity"
        ? "DOG_REGISTRATION_DATE_INVALID"
        : "DOG_BIRTH_DATE_INVALID"
      : fact.code;
  const adapted: DogImportFact = {
    code,
    field: fact.header ? (fieldByHeader[fact.header] ?? null) : null,
    sourceRowNumber: fact.sourceRowNumber ?? null,
  };
  return issueFromDogImportFact(adapted);
}
